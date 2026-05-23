import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { recalculateStandings } from "@/lib/standings";
import { z } from "zod";

const liveUpdateSchema = z.object({
  matchId: z.string(),
  teamSide: z.enum(["home", "away"]),
  eventType: z.enum([
    "TWO_POINTER",
    "THREE_POINTER",
    "FREE_THROW",
    "FOUL",
    "TECHNICAL_FOUL",
    "TIMEOUT",
    "QUARTER_END",
  ]),
  playerId: z.string().optional(),
  quarter: z.number().int().min(1).max(4),
  minute: z.number().min(0).max(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = liveUpdateSchema.parse(body);

    const match = await prisma.match.findUnique({
      where: { id: Number(data.matchId) },
    });
    if (!match)
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (match.status !== "LIVE")
      return NextResponse.json({ error: "Match is not live" }, { status: 400 });

    const isHome = data.teamSide === "home";
    const teamId = isHome ? match.homeTeamId : match.awayTeamId;

    // Points value for each event type
    const pointsMap: Record<string, number> = {
      TWO_POINTER: 2,
      THREE_POINTER: 3,
      FREE_THROW: 1,
      FOUL: 0,
      TECHNICAL_FOUL: 0,
      TIMEOUT: 0,
      QUARTER_END: 0,
    };
    const pts = pointsMap[data.eventType] ?? 0;

    // Update match score
    const updatedMatch = await prisma.match.update({
      where: { id: Number(data.matchId) },
      data: {
        homeScore: isHome ? match.homeScore + pts : match.homeScore,
        awayScore: !isHome ? match.awayScore + pts : match.awayScore,
        ...(data.eventType === "QUARTER_END"
          ? { currentQuarter: Math.min(match.currentQuarter + 1, 4) }
          : {}),
      },
    });

    // Update quarter score
    if (pts > 0) {
      const existing = await prisma.quarterScore.findUnique({
        where: {
          matchId_quarter: {
            matchId: Number(data.matchId),
            quarter: data.quarter,
          },
        },
      });
      if (existing) {
        await prisma.quarterScore.update({
          where: { id: Number(existing.id) },
          data: {
            homeScore: isHome ? existing.homeScore + pts : existing.homeScore,
            awayScore: !isHome ? existing.awayScore + pts : existing.awayScore,
          },
        });
      } else {
        await prisma.quarterScore.create({
          data: {
            matchId: Number(data.matchId),
            quarter: data.quarter,
            homeScore: isHome ? pts : 0,
            awayScore: !isHome ? pts : 0,
          },
        });
      }
    }

    // Update player stat if player selected and event is scoring or foul
    if (data.playerId) {
      const isFoul =
        data.eventType === "FOUL" || data.eventType === "TECHNICAL_FOUL";
      const statData = {
        ...(pts > 0 ? { points: { increment: pts } } : {}),
        ...(data.eventType === "TWO_POINTER"
          ? { twoPointers: { increment: 1 } }
          : {}),
        ...(data.eventType === "THREE_POINTER"
          ? { threePointers: { increment: 1 } }
          : {}),
        ...(data.eventType === "FREE_THROW"
          ? { freeThrows: { increment: 1 } }
          : {}),
        ...(data.eventType === "FOUL" ? { fouls: { increment: 1 } } : {}),
        ...(data.eventType === "TECHNICAL_FOUL"
          ? { technicalFouls: { increment: 1 } }
          : {}),
      };

      await prisma.playerMatchStat.upsert({
        where: {
          playerId_matchId: {
            playerId: Number(data.playerId),
            matchId: Number(data.matchId),
          },
        },
        create: {
          playerId: Number(data.playerId),
          matchId: Number(data.matchId),
          teamId,
          points: pts,
          twoPointers: data.eventType === "TWO_POINTER" ? 1 : 0,
          threePointers: data.eventType === "THREE_POINTER" ? 1 : 0,
          freeThrows: data.eventType === "FREE_THROW" ? 1 : 0,
          fouls: data.eventType === "FOUL" ? 1 : 0,
          technicalFouls: data.eventType === "TECHNICAL_FOUL" ? 1 : 0,
        },
        update: statData,
      });

      // Auto-disqualify on 5 fouls
      if (isFoul) {
        const pStat = await prisma.playerMatchStat.findUnique({
          where: {
            playerId_matchId: {
              playerId: Number(data.playerId),
              matchId: Number(data.matchId),
            },
          },
        });
        if (pStat && pStat.fouls + pStat.technicalFouls >= 5) {
          await prisma.playerMatchStat.update({
            where: { id: Number(pStat.id) },
            data: { isDisqualified: true },
          });
        }
      }
    }

    // Log match event
    await prisma.matchEvent.create({
      data: {
        matchId: Number(data.matchId),
        quarter: data.quarter,
        minute: data.minute,
        type: data.eventType as any,
        teamId,
        playerId: Number(data.playerId),
        value: pts > 0 ? pts : null,
      },
    });

    // Handle quarter end / finish
    if (data.eventType === "QUARTER_END" && match.currentQuarter === 4) {
      await prisma.match.update({
        where: { id: Number(data.matchId) },
        data: { status: "FINISHED", endedAt: new Date() },
      });
      await recalculateStandings();
    }

    // Push real-time update via Pusher
    await pusherServer.trigger(
      CHANNELS.match(Number(data.matchId)),
      EVENTS.scoreUpdate,
      {
        matchId: Number(data.matchId),
        homeScore: updatedMatch.homeScore,
        awayScore: updatedMatch.awayScore,
        currentQuarter: updatedMatch.currentQuarter,
        eventType: data.eventType,
        teamId,
        value: pts,
      },
    );

    // Also push to global channel for live ticker
    await pusherServer.trigger(CHANNELS.global, EVENTS.scoreUpdate, {
      matchId: Number(data.matchId),
      homeScore: updatedMatch.homeScore,
      awayScore: updatedMatch.awayScore,
    });

    return NextResponse.json({
      data: {
        homeScore: updatedMatch.homeScore,
        awayScore: updatedMatch.awayScore,
        currentQuarter: updatedMatch.currentQuarter,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return NextResponse.json({ error: err }, { status: 400 });
    if (err instanceof Error && err.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[LIVE UPDATE]", err);
    return NextResponse.json(
      { error: "Failed to update score" },
      { status: 500 },
    );
  }
}
