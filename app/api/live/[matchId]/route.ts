import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── GET: Fetch live match state (used for polling) ───────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const { matchId } = await params;
    const match = await prisma.match.findUnique({
      where: { id: Number(matchId) },
      include: {
        homeTeam: {
          select: { id: true, name: true, shortName: true, color: true },
        },
        awayTeam: {
          select: { id: true, name: true, shortName: true, color: true },
        },
        quarters: { orderBy: { quarter: "asc" } },
        playerStats: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                jerseyNumber: true,
                position: true,
                teamId: true,
              },
            },
          },
          orderBy: { points: "desc" },
        },
        events: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!match)
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    return NextResponse.json({ data: match });
  } catch (err) {
    console.error("[LIVE GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─── POST: Add a scoring event ────────────────────────────────────────────────
const scoreEventSchema = z.object({
  action: z.enum(["score", "foul", "quarter_end", "undo_last"]),
  teamId: z.string().optional(),
  playerId: z.string().optional(),
  type: z
    .enum([
      "TWO_POINTER",
      "THREE_POINTER",
      "FREE_THROW",
      "FOUL",
      "TECHNICAL_FOUL",
      "UNSPORTSMANLIKE_FOUL",
      "QUARTER_END",
    ])
    .optional(),
  quarter: z.number().int().min(1).max(4),
  minute: z.number().min(0).max(10).default(0),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const body = await req.json();
    const payload = scoreEventSchema.parse(body);
    const { matchId } = await params;

    const match = await prisma.match.findUnique({
      where: { id: Number(matchId) },
      include: { quarters: true },
    });

    if (!match)
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (match.status !== "LIVE")
      return NextResponse.json({ error: "Match is not live" }, { status: 400 });

    const pointsMap: Record<string, number> = {
      TWO_POINTER: 2,
      THREE_POINTER: 3,
      FREE_THROW: 1,
    };

    if (
      payload.action === "score" &&
      payload.type &&
      payload.teamId &&
      payload.playerId
    ) {
      const pts = pointsMap[payload.type] ?? 0;
      const isHome = String(match.homeTeamId) === payload.teamId;

      // Update match total score
      await prisma.match.update({
        where: { id: Number(matchId) },
        data: isHome
          ? { homeScore: { increment: pts } }
          : { awayScore: { increment: pts } },
      });

      // Update or create quarter score
      const existingQ = match.quarters.find(
        (q) => q.quarter === payload.quarter,
      );
      if (existingQ) {
        await prisma.quarterScore.update({
          where: { id: Number(existingQ.id) },
          data: isHome
            ? { homeScore: { increment: pts } }
            : { awayScore: { increment: pts } },
        });
      } else {
        await prisma.quarterScore.create({
          data: {
            matchId: Number(matchId),
            quarter: payload.quarter,
            homeScore: isHome ? pts : 0,
            awayScore: isHome ? 0 : pts,
          },
        });
      }

      // Update player stats
      await prisma.playerMatchStat.upsert({
        where: {
          playerId_matchId: {
            playerId: Number(payload.playerId),
            matchId: Number(matchId),
          },
        },
        create: {
          playerId: Number(payload.playerId),
          matchId: Number(matchId),
          teamId: Number(payload.teamId),
          points: pts,
          twoPointers: payload.type === "TWO_POINTER" ? 1 : 0,
          threePointers: payload.type === "THREE_POINTER" ? 1 : 0,
          freeThrows: payload.type === "FREE_THROW" ? 1 : 0,
        },
        update: {
          points: { increment: pts },
          twoPointers:
            payload.type === "TWO_POINTER" ? { increment: 1 } : undefined,
          threePointers:
            payload.type === "THREE_POINTER" ? { increment: 1 } : undefined,
          freeThrows:
            payload.type === "FREE_THROW" ? { increment: 1 } : undefined,
        },
      });

      // Log event
      await prisma.matchEvent.create({
        data: {
          matchId: Number(matchId),
          quarter: payload.quarter,
          minute: payload.minute,
          type: payload.type as any,
          teamId: Number(payload.teamId),
          playerId: Number(payload.playerId),
          value: pts,
        },
      });
    }

    if (
      payload.action === "foul" &&
      payload.type &&
      payload.teamId &&
      payload.playerId
    ) {
      // Update player foul count
      const stat = await prisma.playerMatchStat.upsert({
        where: {
          playerId_matchId: {
            playerId: Number(payload.playerId),
            matchId: Number(matchId),
          },
        },
        create: {
          playerId: Number(payload.playerId),
          matchId: Number(matchId),
          teamId: Number(payload.teamId),
          fouls: payload.type === "FOUL" ? 1 : 0,
          technicalFouls: payload.type === "TECHNICAL_FOUL" ? 1 : 0,
        },
        update: {
          fouls: payload.type === "FOUL" ? { increment: 1 } : undefined,
          technicalFouls:
            payload.type === "TECHNICAL_FOUL" ? { increment: 1 } : undefined,
        },
      });

      // Check 5-foul disqualification
      const settings = await prisma.tournamentSettings.findFirst();
      const foulLimit = settings?.foulLimit ?? 5;
      if (stat.fouls >= foulLimit) {
        await prisma.playerMatchStat.update({
          where: { id: Number(stat.id) },
          data: { isDisqualified: true },
        });
      }

      await prisma.matchEvent.create({
        data: {
          matchId: Number(matchId),
          quarter: payload.quarter,
          minute: payload.minute,
          type: payload.type as any,
          teamId: Number(payload.teamId),
          playerId: Number(payload.playerId),
        },
      });
    }

    if (payload.action === "quarter_end") {
      const nextQuarter = match.currentQuarter + 1;
      if (nextQuarter > 4) {
        // End of game
        await prisma.match.update({
          where: { id: Number(matchId) },
          data: { status: "FINISHED", endedAt: new Date(), currentQuarter: 4 },
        });
        const { recalculateStandings } = await import("@/lib/standings");
        await recalculateStandings();
      } else {
        await prisma.match.update({
          where: { id: Number(matchId) },
          data: { currentQuarter: nextQuarter },
        });
        await prisma.matchEvent.create({
          data: {
            matchId: Number(matchId),
            quarter: payload.quarter,
            minute: 0,
            type: "QUARTER_END",
          },
        });
      }
    }

    // Return fresh match state
    const updated = await prisma.match.findUnique({
      where: { id: Number(matchId) },
      include: {
        homeTeam: {
          select: { id: true, name: true, shortName: true, color: true },
        },
        awayTeam: {
          select: { id: true, name: true, shortName: true, color: true },
        },
        quarters: { orderBy: { quarter: "asc" } },
        playerStats: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                jerseyNumber: true,
                position: true,
                teamId: true,
              },
            },
          },
          orderBy: { points: "desc" },
        },
        events: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof z.ZodError)
      return NextResponse.json({ error: err }, { status: 400 });
    console.error("[LIVE POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
