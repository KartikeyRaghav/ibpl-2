import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const match = await prisma.match.findUnique({
      where: { id: id },
      include: {
        homeTeam: true,
        awayTeam: true,
        quarters: { orderBy: { quarter: "asc" } },
        playerStats: { include: { player: { include: { team: true } } } },
        events: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!match)
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    return NextResponse.json({ data: match });
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
    const match = await prisma.match.update({
      where: { id: id },
      data: {
        venue: body.venue,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        mvpPlayerId: body.mvpPlayerId,
      },
      include: { homeTeam: true, awayTeam: true },
    });
    return NextResponse.json({ data: match });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
