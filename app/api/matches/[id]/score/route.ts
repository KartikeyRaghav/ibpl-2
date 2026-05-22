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

async function fetchFullMatch(id: string) {
  return prisma.match.findUnique({
    where: { id: Number(id) },
    include: {
      homeTeam: {
        include: {
          players: {
            where: { isActive: true },
            orderBy: { jerseyNumber: "asc" },
          },
        },
      },
      awayTeam: {
        include: {
          players: {
            where: { isActive: true },
            orderBy: { jerseyNumber: "asc" },
          },
        },
      },
      quarters: { orderBy: { quarter: "asc" } },
      playerStats: { include: { player: true } },
      events: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });
}

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
      const parsed = foulSchema.parse(body);
      const teamId = Number(
        parsed.teamSide === "home" ? match.homeTeamId : match.awayTeamId,
      );

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
          teamId,
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

      // Auto-disqualify at foulLimit (5)
      if (stat.fouls >= 5) {
        await prisma.playerMatchStat.update({
          where: { id: Number(stat.id) },
          data: { isDisqualified: true },
        });
      }

      await prisma.matchEvent.create({
        data: {
          matchId: Number(id),
          quarter: parsed.quarter,
          minute: parsed.minute,
          type: parsed.eventType as any,
          teamId,
          playerId: Number(parsed.playerId),
        },
      });
    } else {
      // Scoring event
      const parsed = scoreSchema.parse(body);
      const isHome = parsed.teamSide === "home";
      const teamId = Number(isHome ? match.homeTeamId : match.awayTeamId);

      await prisma.match.update({
        where: { id: Number(id) },
        data: {
          homeScore: isHome ? { increment: parsed.points } : undefined,
          awayScore: !isHome ? { increment: parsed.points } : undefined,
        },
      });

      // Upsert quarter score
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

      // Upsert player stat if player selected
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
            teamId,
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
          teamId,
          playerId: Number(parsed.playerId) ?? null,
          value: parsed.points,
        },
      });
    }

    // Always return full match with team rosters
    const updated = await fetchFullMatch(id);
    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

/** PATCH — advance to next quarter */
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

    const next = Math.min(match.currentQuarter + 1, 4);
    await prisma.match.update({
      where: { id: Number(id) },
      data: { currentQuarter: next },
    });

    const updated = await fetchFullMatch(id);
    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
