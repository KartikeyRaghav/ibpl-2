import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const fullMatchInclude = {
  homeTeam: {
    include: {
      players: { where: { isActive: true }, orderBy: { jerseyNumber: "asc" } },
    },
  },
  awayTeam: {
    include: {
      players: { where: { isActive: true }, orderBy: { jerseyNumber: "asc" } },
    },
  },
  quarters: { orderBy: { quarter: "asc" as const } },
  playerStats: { include: { player: { include: { team: true } } } },
  events: { orderBy: { createdAt: "asc" as const } },
} as const;

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const match = await prisma.match.findUnique({
      where: { id: Number(id) },
      include: fullMatchInclude,
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
      where: { id: Number(id) },
      data: {
        venue: body.venue,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        mvpPlayerId: Number(body.mvpPlayerId),
      },
      include: fullMatchInclude,
    });
    return NextResponse.json({ data: match });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
