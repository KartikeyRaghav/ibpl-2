import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { z } from "zod";

const scoreSchema = z.object({
  teamSide: z.enum(["home", "away"]),
  points: z.number().min(1).max(3),
  playerId: z.int().optional(),
  eventType: z.enum(["TWO_POINTER", "THREE_POINTER", "FREE_THROW"]),
  quarter: z.number().min(1).max(4),
  minute: z.number().min(0).max(10),
});

const foulSchema = z.object({
  teamSide: z.enum(["home", "away"]),
  playerId: z.int(),
  eventType: z.enum(["FOUL", "TECHNICAL_FOUL", "UNSPORTSMANLIKE_FOUL"]),
  quarter: z.number().min(1).max(4),
  minute: z.number().min(0).max(10),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = verifyToken(
    getTokenFromHeader(req.headers.get("authorization")) || "",
  );
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await req.json();
    const match = await prisma.match.findUnique({
      where: { id: Number(id) },
      include: { quarters: true },
    });
    if (!match)
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (match.status !== "LIVE")
      return NextResponse.json({ error: "Match is not live" }, { status: 400 });

    const isFoul = ["FOUL", "TECHNICAL_FOUL", "UNSPORTSMANLIKE_FOUL"].includes(
      body.eventType,
    );

    if (isFoul) {
      // Handle foul
      const parsed = foulSchema.parse(body);
      if (parsed.playerId) {
        const stat = await prisma.playerMatchStat.upsert({
          where: {
            playerId_matchId: {
              playerId: Number(parsed.playerId),
              matchId: Number(id),
            },
          },
          create: {
            playerId: Number(parsed.playerId),
            matchId: Number(id),
            teamId: Number(
              parsed.teamSide === "home" ? match.homeTeamId : match.awayTeamId,
            ),
            fouls: 1,
            technicalFouls: parsed.eventType === "TECHNICAL_FOUL" ? 1 : 0,
          },
          update: {
            fouls: { increment: 1 },
            technicalFouls:
              parsed.eventType === "TECHNICAL_FOUL"
                ? { increment: 1 }
                : undefined,
          },
        });
        // Auto-disqualify at 5 fouls
        if (stat.fouls >= 5) {
          await prisma.playerMatchStat.update({
            where: { id: Number(stat.id) },
            data: { isDisqualified: true },
          });
        }
      }
      await prisma.matchEvent.create({
        data: {
          matchId: Number(id),
          quarter: parsed.quarter,
          minute: parsed.minute,
          type: parsed.eventType as any,
          teamId: Number(
            parsed.teamSide === "home" ? match.homeTeamId : match.awayTeamId,
          ),
          playerId: Number(parsed.playerId || null),
        },
      });
    } else {
      // Handle scoring
      const parsed = scoreSchema.parse(body);
      const isHome = parsed.teamSide === "home";
      const newHomeScore = isHome
        ? match.homeScore + parsed.points
        : match.homeScore;
      const newAwayScore = !isHome
        ? match.awayScore + parsed.points
        : match.awayScore;

      await prisma.match.update({
        where: { id: Number(id) },
        data: { homeScore: newHomeScore, awayScore: newAwayScore },
      });

      // Update quarter score
      await prisma.quarterScore.upsert({
        where: {
          matchId_quarter: { matchId: Number(id), quarter: parsed.quarter },
        },
        create: {
          matchId: Number(id),
          quarter: parsed.quarter,
          homeScore: isHome ? parsed.points : 0,
          awayScore: !isHome ? parsed.points : 0,
        },
        update: isHome
          ? { homeScore: { increment: parsed.points } }
          : { awayScore: { increment: parsed.points } },
      });

      // Update player stat
      if (parsed.playerId) {
        await prisma.playerMatchStat.upsert({
          where: {
            playerId_matchId: {
              playerId: Number(parsed.playerId),
              matchId: Number(id),
            },
          },
          create: {
            playerId: Number(parsed.playerId),
            matchId: Number(id),
            teamId: Number(isHome ? match.homeTeamId : match.awayTeamId),
            points: parsed.points,
            twoPointers: parsed.eventType === "TWO_POINTER" ? 1 : 0,
            threePointers: parsed.eventType === "THREE_POINTER" ? 1 : 0,
            freeThrows: parsed.eventType === "FREE_THROW" ? 1 : 0,
          },
          update: {
            points: { increment: parsed.points },
            twoPointers:
              parsed.eventType === "TWO_POINTER" ? { increment: 1 } : undefined,
            threePointers:
              parsed.eventType === "THREE_POINTER"
                ? { increment: 1 }
                : undefined,
            freeThrows:
              parsed.eventType === "FREE_THROW" ? { increment: 1 } : undefined,
          },
        });
      }

      await prisma.matchEvent.create({
        data: {
          matchId: Number(id),
          quarter: parsed.quarter,
          minute: parsed.minute,
          type: parsed.eventType as any,
          teamId: Number(isHome ? match.homeTeamId : match.awayTeamId),
          playerId: Number(parsed.playerId || null),
          value: parsed.points,
        },
      });
    }

    // Return updated match
    const updated = await prisma.match.findUnique({
      where: { id: Number(id) },
      include: {
        homeTeam: true,
        awayTeam: true,
        quarters: { orderBy: { quarter: "asc" } },
        playerStats: { include: { player: true } },
        events: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// Advance quarter
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = verifyToken(
    getTokenFromHeader(req.headers.get("authorization")) || "",
  );
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const { id } = await params;
    const match = await prisma.match.findUnique({ where: { id: Number(id) } });
    if (!match || match.status !== "LIVE")
      return NextResponse.json({ error: "Match not live" }, { status: 400 });
    const nextQ = match.currentQuarter + 1;
    const updated = await prisma.match.update({
      where: { id: Number(id) },
      data: { currentQuarter: Math.min(nextQ, 4) },
      include: {
        homeTeam: true,
        awayTeam: true,
        quarters: { orderBy: { quarter: "asc" } },
      },
    });
    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
