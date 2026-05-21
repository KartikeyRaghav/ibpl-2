import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@/types";

const JWT_SECRET =
  process.env.JWT_SECRET || "ibpl-super-secret-key-change-in-production";
const JWT_EXPIRES = "7d";

export function signToken(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  );
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
