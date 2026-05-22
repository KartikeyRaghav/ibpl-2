import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const search = searchParams.get("search");

    const players = await prisma.player.findMany({
      where: {
        isActive: true,
        ...(teamId ? { teamId: Number(teamId) } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      include: {
        team: true,
        matchStats: {
          include: { match: { include: { homeTeam: true, awayTeam: true } } },
        },
      },
      orderBy: { name: "asc" },
    });

    // Compute aggregates
    const withStats = players.map((p) => ({
      ...p,
      totalPoints: p.matchStats.reduce((s, m) => s + m.points, 0),
      totalFouls: p.matchStats.reduce((s, m) => s + m.fouls, 0),
      totalTwoPointers: p.matchStats.reduce((s, m) => s + m.twoPointers, 0),
      totalThreePointers: p.matchStats.reduce((s, m) => s + m.threePointers, 0),
      totalFreeThrows: p.matchStats.reduce((s, m) => s + m.freeThrows, 0),
      matchesPlayed: p.matchStats.length,
      ppg:
        p.matchStats.length > 0
          ? p.matchStats.reduce((s, m) => s + m.points, 0) / p.matchStats.length
          : 0,
    }));

    return NextResponse.json({ data: withStats });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const player = await prisma.player.create({
      data: {
        name: body.name,
        jerseyNumber: Number(body.jerseyNumber),
        position: body.position,
        teamId: Number(body.teamId),
        photoUrl: body.photoUrl || null,
      },
      include: { team: true },
    });
    return NextResponse.json({ data: player }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
