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
    const match = await prisma.match.findUnique({ where: { id: id } });
    if (!match)
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (match.status !== "UPCOMING")
      return NextResponse.json(
        { error: "Match already started" },
        { status: 400 },
      );

    const updated = await prisma.match.update({
      where: { id: id },
      data: { status: "LIVE", startedAt: new Date(), currentQuarter: 1 },
      include: { homeTeam: true, awayTeam: true, quarters: true },
    });
    // Create initial quarter records
    for (let q = 1; q <= 4; q++) {
      await prisma.quarterScore.upsert({
        where: { matchId_quarter: { matchId: id, quarter: q } },
        create: { matchId: id, quarter: q, homeScore: 0, awayScore: 0 },
        update: {},
      });
    }
    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
