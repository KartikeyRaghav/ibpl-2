// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding IBPL database...");

  // ─── Clean existing data ──────────────────────────────────────────────────
  await prisma.matchEvent.deleteMany();
  await prisma.playerMatchStat.deleteMany();
  await prisma.quarterScore.deleteMany();
  await prisma.match.deleteMany();
  await prisma.teamStanding.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tournamentSettings.deleteMany();

  // ─── Tournament Settings ──────────────────────────────────────────────────
  await prisma.tournamentSettings.create({
    data: {
      name: "IBPL Season 1 — 2026",
      season: 1,
      quartersPerGame: 4,
      quarterDuration: 10,
      shotClock: 24,
      foulLimit: 5,
      teamFoulReset: 4,
      isActive: true,
    },
  });

  // ─── Admin User ───────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("ibpl@admin2026", 10);
  await prisma.user.create({
    data: {
      email: "admin@ibpl.iiti.ac.in",
      password: hashedPassword,
      name: "IBPL Administrator",
      role: "ADMIN",
    },
  });

  console.log("✅ Seeding complete!");
  console.log("   Admin email: admin@ibpl.iiti.ac.in");
  console.log("   Admin password: ibpl@admin2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
