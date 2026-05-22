import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: number }> },
) {
  try {
    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id: Number(id) },
      include: {
        players: {
          where: { isActive: true },
          orderBy: { jerseyNumber: "asc" },
          include: { matchStats: true },
        },
        standing: true,
        homeMatches: {
          include: { homeTeam: true, awayTeam: true, quarters: true },
          orderBy: { scheduledAt: "asc" },
        },
        awayMatches: {
          include: { homeTeam: true, awayTeam: true, quarters: true },
          orderBy: { scheduledAt: "asc" },
        },
      },
    });
    if (!team)
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    return NextResponse.json({ data: team });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> },
) {
  try {
    const body = await req.json();
    const { id } = await params;
    const team = await prisma.team.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        shortName: body.shortName,
        color: body.color,
        coach: body.coach,
        captainId: Number(body.captainId),
        logoUrl: body.logoUrl,
      },
    });
    return NextResponse.json({ data: team });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: number }> },
) {
  try {
    const { id } = await params;
    await prisma.team.delete({ where: { id: Number(id) } });
    return NextResponse.json({ data: { success: true } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
