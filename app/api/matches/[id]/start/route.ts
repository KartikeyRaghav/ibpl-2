import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

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
    const existing = await prisma.match.findUnique({
      where: { id: Number(id) },
    });
    if (!existing)
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (existing.status !== "UPCOMING")
      return NextResponse.json(
        { error: "Match already started" },
        { status: 400 },
      );

    // Update match to LIVE
    await prisma.match.update({
      where: { id: Number(id) },
      data: { status: "LIVE", startedAt: new Date(), currentQuarter: 1 },
    });

    // Initialise all 4 quarter score rows
    for (let q = 1; q <= 4; q++) {
      await prisma.quarterScore.upsert({
        where: { matchId_quarter: { matchId: Number(id), quarter: q } },
        create: { matchId: Number(id), quarter: q, homeScore: 0, awayScore: 0 },
        update: {},
      });
    }

    const updated = await prisma.match.findUnique({
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

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
