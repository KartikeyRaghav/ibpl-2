import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });
  const user = verifyToken(token);
  if (!user)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  return NextResponse.json({ user });
}
