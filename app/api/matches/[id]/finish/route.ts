import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { recalculateStandings } from "@/lib/standings";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = verifyToken(
    getTokenFromHeader(req.headers.get("authorization")) || "",
  );
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = await req.json();
    const match = await prisma.match.findUnique({ where: { id: Number(id) } });
    if (!match || match.status !== "LIVE")
      return NextResponse.json({ error: "Match not live" }, { status: 400 });

    const updated = await prisma.match.update({
      where: { id: Number(id) },
      data: {
        status: "FINISHED",
        endedAt: new Date(),
        mvpPlayerId: Number(body.mvpPlayerId) || null,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        quarters: { orderBy: { quarter: "asc" } },
        playerStats: { include: { player: true } },
      },
    });

    await recalculateStandings();
    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
