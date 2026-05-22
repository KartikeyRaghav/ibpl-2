import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const player = await prisma.player.findUnique({
      where: { id: Number(id) },
      include: {
        team: true,
        matchStats: {
          include: {
            match: {
              include: { homeTeam: true, awayTeam: true, quarters: true },
            },
          },
          orderBy: { match: { scheduledAt: "asc" } },
        },
      },
    });
    if (!player)
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    const totalPoints = player.matchStats.reduce((s, m) => s + m.points, 0);
    return NextResponse.json({
      data: {
        ...player,
        totalPoints,
        totalFouls: player.matchStats.reduce((s, m) => s + m.fouls, 0),
        matchesPlayed: player.matchStats.length,
        ppg: player.matchStats.length
          ? totalPoints / player.matchStats.length
          : 0,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const player = await prisma.player.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        jerseyNumber: Number(body.jerseyNumber),
        position: body.position,
        teamId: Number(body.teamId),
        photoUrl: body.photoUrl,
        isActive: body.isActive,
      },
    });
    return NextResponse.json({ data: player });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.player.update({
      where: { id: Number(id) },
      data: { isActive: false },
    });
    return NextResponse.json({ data: { success: true } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
