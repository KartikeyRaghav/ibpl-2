import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        players: {
          where: { isActive: true },
          orderBy: { jerseyNumber: "asc" },
        },
        standing: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: teams });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const team = await prisma.team.create({
      data: {
        name: body.name,
        shortName: body.shortName,
        color: body.color || "#F47B20",
        coach: body.coach || null,
        logoUrl: body.logoUrl || null,
      },
    });
    // Initialize standing
    await prisma.teamStanding.create({ data: { teamId: Number(team.id) } });
    return NextResponse.json({ data: team }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
