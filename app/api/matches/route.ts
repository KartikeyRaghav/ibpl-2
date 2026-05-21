import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const teamId = searchParams.get("teamId");

    const matches = await prisma.match.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(teamId
          ? { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] }
          : {}),
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        quarters: { orderBy: { quarter: "asc" } },
        playerStats: { include: { player: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json({ data: matches });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const match = await prisma.match.create({
      data: {
        matchNumber: body.matchNumber,
        homeTeamId: body.homeTeamId,
        awayTeamId: body.awayTeamId,
        venue: body.venue || "IIT Indore Sports Complex",
        scheduledAt: new Date(body.scheduledAt),
        leg: body.leg || 1,
      },
      include: { homeTeam: true, awayTeam: true },
    });
    return NextResponse.json({ data: match }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
