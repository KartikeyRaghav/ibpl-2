import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const standings = await prisma.teamStanding.findMany({
      include: { team: true },
      orderBy: [{ points: "desc" }, { pointDiff: "desc" }],
    });
    return NextResponse.json({ data: standings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
