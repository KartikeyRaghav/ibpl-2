// prisma/seed.ts
import { PrismaClient, Position, MatchStatus, EventType } from "@prisma/client";
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

  // ─── Teams ────────────────────────────────────────────────────────────────
  const thunderBallers = await prisma.team.create({
    data: {
      name: "Thunder Ballers",
      shortName: "TB",
      color: "#E94560",
      coach: "Prof. Rajiv Mehta",
    },
  });

  const hoopHeroes = await prisma.team.create({
    data: {
      name: "Hoop Heroes",
      shortName: "HH",
      color: "#185FA5",
      coach: "Prof. Suresh Iyer",
    },
  });

  const slamDunkers = await prisma.team.create({
    data: {
      name: "Slam Dunkers",
      shortName: "SD",
      color: "#1D9E75",
      coach: "Prof. Kiran Joshi",
    },
  });

  const netNinjas = await prisma.team.create({
    data: {
      name: "Net Ninjas",
      shortName: "NN",
      color: "#854F0B",
      coach: "Prof. Anita Verma",
    },
  });

  // ─── Players — Thunder Ballers (11 players) ───────────────────────────────
  const tbPlayers = await Promise.all([
    prisma.player.create({
      data: {
        name: "Arjun Kumar",
        jerseyNumber: 7,
        position: Position.PG,
        teamId: thunderBallers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Nikhil Gupta",
        jerseyNumber: 11,
        position: Position.SG,
        teamId: thunderBallers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Dev Malhotra",
        jerseyNumber: 5,
        position: Position.C,
        teamId: thunderBallers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Karan Bose",
        jerseyNumber: 21,
        position: Position.PF,
        teamId: thunderBallers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Mohit Sharma",
        jerseyNumber: 14,
        position: Position.SF,
        teamId: thunderBallers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Rohan Tiwari",
        jerseyNumber: 3,
        position: Position.PG,
        teamId: thunderBallers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Varun Chopra",
        jerseyNumber: 9,
        position: Position.SG,
        teamId: thunderBallers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Sahil Agarwal",
        jerseyNumber: 18,
        position: Position.C,
        teamId: thunderBallers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Pranav Yadav",
        jerseyNumber: 24,
        position: Position.SF,
        teamId: thunderBallers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Harsh Pandey",
        jerseyNumber: 33,
        position: Position.PF,
        teamId: thunderBallers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Ankit Mishra",
        jerseyNumber: 2,
        position: Position.SG,
        teamId: thunderBallers.id,
      },
    }),
  ]);

  // Set captain
  await prisma.team.update({
    where: { id: thunderBallers.id },
    data: { captainId: tbPlayers[0].id },
  });

  // ─── Players — Hoop Heroes (11 players) ──────────────────────────────────
  const hhPlayers = await Promise.all([
    prisma.player.create({
      data: {
        name: "Rahul Sharma",
        jerseyNumber: 3,
        position: Position.PG,
        teamId: hoopHeroes.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Aditya Rao",
        jerseyNumber: 14,
        position: Position.SF,
        teamId: hoopHeroes.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Siddharth Menon",
        jerseyNumber: 9,
        position: Position.C,
        teamId: hoopHeroes.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Priya Nair",
        jerseyNumber: 22,
        position: Position.SG,
        teamId: hoopHeroes.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Aryan Kapoor",
        jerseyNumber: 1,
        position: Position.PG,
        teamId: hoopHeroes.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Deepak Negi",
        jerseyNumber: 15,
        position: Position.PF,
        teamId: hoopHeroes.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Tushar Sinha",
        jerseyNumber: 8,
        position: Position.C,
        teamId: hoopHeroes.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Gaurav Pillai",
        jerseyNumber: 23,
        position: Position.SF,
        teamId: hoopHeroes.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Ravi Kulkarni",
        jerseyNumber: 10,
        position: Position.SG,
        teamId: hoopHeroes.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Sameer Ghosh",
        jerseyNumber: 17,
        position: Position.PF,
        teamId: hoopHeroes.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Tanmay Jain",
        jerseyNumber: 31,
        position: Position.C,
        teamId: hoopHeroes.id,
      },
    }),
  ]);

  await prisma.team.update({
    where: { id: hoopHeroes.id },
    data: { captainId: hhPlayers[0].id },
  });

  // ─── Players — Slam Dunkers (10 players) ─────────────────────────────────
  const sdPlayers = await Promise.all([
    prisma.player.create({
      data: {
        name: "Vikram Patel",
        jerseyNumber: 23,
        position: Position.SF,
        teamId: slamDunkers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Rohan Desai",
        jerseyNumber: 8,
        position: Position.PG,
        teamId: slamDunkers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Amit Tiwari",
        jerseyNumber: 16,
        position: Position.SG,
        teamId: slamDunkers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Suresh Babu",
        jerseyNumber: 4,
        position: Position.C,
        teamId: slamDunkers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Aman Shukla",
        jerseyNumber: 12,
        position: Position.PF,
        teamId: slamDunkers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Ritesh Bansal",
        jerseyNumber: 19,
        position: Position.SG,
        teamId: slamDunkers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Sumit Saxena",
        jerseyNumber: 6,
        position: Position.PG,
        teamId: slamDunkers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Devraj Singh",
        jerseyNumber: 25,
        position: Position.C,
        teamId: slamDunkers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Neeraj Chauhan",
        jerseyNumber: 30,
        position: Position.SF,
        teamId: slamDunkers.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Hemant Rawat",
        jerseyNumber: 13,
        position: Position.PF,
        teamId: slamDunkers.id,
      },
    }),
  ]);

  await prisma.team.update({
    where: { id: slamDunkers.id },
    data: { captainId: sdPlayers[0].id },
  });

  // ─── Players — Net Ninjas (10 players) ───────────────────────────────────
  const nnPlayers = await Promise.all([
    prisma.player.create({
      data: {
        name: "Sanjay Singh",
        jerseyNumber: 1,
        position: Position.PG,
        teamId: netNinjas.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Vijay Kumar",
        jerseyNumber: 19,
        position: Position.C,
        teamId: netNinjas.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Lokesh Jain",
        jerseyNumber: 33,
        position: Position.PF,
        teamId: netNinjas.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Pankaj Tripathi",
        jerseyNumber: 7,
        position: Position.SG,
        teamId: netNinjas.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Akash Dixit",
        jerseyNumber: 20,
        position: Position.SF,
        teamId: netNinjas.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Manish Soni",
        jerseyNumber: 11,
        position: Position.PG,
        teamId: netNinjas.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Aakash Wagh",
        jerseyNumber: 15,
        position: Position.SG,
        teamId: netNinjas.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Shubham Lal",
        jerseyNumber: 28,
        position: Position.C,
        teamId: netNinjas.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Yash Patil",
        jerseyNumber: 6,
        position: Position.SF,
        teamId: netNinjas.id,
      },
    }),
    prisma.player.create({
      data: {
        name: "Kartik Reddy",
        jerseyNumber: 34,
        position: Position.PF,
        teamId: netNinjas.id,
      },
    }),
  ]);

  await prisma.team.update({
    where: { id: netNinjas.id },
    data: { captainId: nnPlayers[0].id },
  });

  // ─── Matches (Double Round Robin: 12 total, 6 completed, 1 live, 5 upcoming) ──
  const now = new Date();

  // MATCH 1 — TB vs HH (Leg 1) — Finished
  const m1 = await prisma.match.create({
    data: {
      matchNumber: 1,
      homeTeamId: thunderBallers.id,
      awayTeamId: hoopHeroes.id,
      homeScore: 81,
      awayScore: 74,
      status: MatchStatus.FINISHED,
      venue: "IIT Indore Main Gym",
      scheduledAt: new Date(now.getTime() - 18 * 86400000),
      startedAt: new Date(now.getTime() - 18 * 86400000),
      endedAt: new Date(now.getTime() - 18 * 86400000),
      currentQuarter: 4,
      leg: 1,
      mvpPlayerId: tbPlayers[0].id,
    },
  });
  await prisma.quarterScore.createMany({
    data: [
      { matchId: m1.id, quarter: 1, homeScore: 22, awayScore: 18 },
      { matchId: m1.id, quarter: 2, homeScore: 19, awayScore: 21 },
      { matchId: m1.id, quarter: 3, homeScore: 20, awayScore: 17 },
      { matchId: m1.id, quarter: 4, homeScore: 20, awayScore: 18 },
    ],
  });
  await prisma.playerMatchStat.createMany({
    data: [
      {
        playerId: tbPlayers[0].id,
        matchId: m1.id,
        teamId: thunderBallers.id,
        points: 28,
        twoPointers: 8,
        threePointers: 3,
        freeThrows: 1,
        fouls: 2,
      },
      {
        playerId: tbPlayers[1].id,
        matchId: m1.id,
        teamId: thunderBallers.id,
        points: 22,
        twoPointers: 6,
        threePointers: 2,
        freeThrows: 2,
        fouls: 3,
      },
      {
        playerId: tbPlayers[2].id,
        matchId: m1.id,
        teamId: thunderBallers.id,
        points: 18,
        twoPointers: 7,
        threePointers: 0,
        freeThrows: 4,
        fouls: 1,
      },
      {
        playerId: tbPlayers[3].id,
        matchId: m1.id,
        teamId: thunderBallers.id,
        points: 13,
        twoPointers: 4,
        threePointers: 1,
        freeThrows: 2,
        fouls: 2,
      },
      {
        playerId: hhPlayers[0].id,
        matchId: m1.id,
        teamId: hoopHeroes.id,
        points: 24,
        twoPointers: 7,
        threePointers: 2,
        freeThrows: 2,
        fouls: 3,
      },
      {
        playerId: hhPlayers[1].id,
        matchId: m1.id,
        teamId: hoopHeroes.id,
        points: 20,
        twoPointers: 6,
        threePointers: 2,
        freeThrows: 0,
        fouls: 1,
      },
      {
        playerId: hhPlayers[2].id,
        matchId: m1.id,
        teamId: hoopHeroes.id,
        points: 18,
        twoPointers: 6,
        threePointers: 0,
        freeThrows: 6,
        fouls: 4,
      },
      {
        playerId: hhPlayers[3].id,
        matchId: m1.id,
        teamId: hoopHeroes.id,
        points: 12,
        twoPointers: 4,
        threePointers: 0,
        freeThrows: 4,
        fouls: 2,
      },
    ],
  });

  // MATCHES 7-12 — Upcoming
  await prisma.match.createMany({
    data: [
      {
        matchNumber: 7,
        homeTeamId: hoopHeroes.id,
        awayTeamId: thunderBallers.id,
        status: MatchStatus.UPCOMING,
        venue: "IIT Indore Sports Complex",
        scheduledAt: new Date(now.getTime() + 2 * 86400000),
        leg: 2,
      },
      {
        matchNumber: 8,
        homeTeamId: netNinjas.id,
        awayTeamId: slamDunkers.id,
        status: MatchStatus.UPCOMING,
        venue: "IIT Indore Main Gym",
        scheduledAt: new Date(now.getTime() + 4 * 86400000),
        leg: 2,
      },
      {
        matchNumber: 9,
        homeTeamId: slamDunkers.id,
        awayTeamId: hoopHeroes.id,
        status: MatchStatus.UPCOMING,
        venue: "IIT Indore Sports Complex",
        scheduledAt: new Date(now.getTime() + 7 * 86400000),
        leg: 2,
      },
      {
        matchNumber: 10,
        homeTeamId: netNinjas.id,
        awayTeamId: thunderBallers.id,
        status: MatchStatus.UPCOMING,
        venue: "IIT Indore Main Gym",
        scheduledAt: new Date(now.getTime() + 9 * 86400000),
        leg: 2,
      },
      {
        matchNumber: 11,
        homeTeamId: slamDunkers.id,
        awayTeamId: thunderBallers.id,
        status: MatchStatus.UPCOMING,
        venue: "IIT Indore Sports Complex",
        scheduledAt: new Date(now.getTime() + 11 * 86400000),
        leg: 2,
      },
      {
        matchNumber: 12,
        homeTeamId: netNinjas.id,
        awayTeamId: hoopHeroes.id,
        status: MatchStatus.UPCOMING,
        venue: "IIT Indore Main Gym",
        scheduledAt: new Date(now.getTime() + 13 * 86400000),
        leg: 2,
      },
    ],
  });

  // ─── Compute and upsert standings ─────────────────────────────────────────
  const teams = [thunderBallers, hoopHeroes, slamDunkers, netNinjas];

  for (const team of teams) {
    const homeWins = await prisma.match.count({
      where: {
        homeTeamId: team.id,
        status: MatchStatus.FINISHED,
        homeScore: { gt: prisma.match.fields.awayScore } as any,
      },
    });
    // Simple approach: fetch finished matches and compute manually
    const finishedMatches = await prisma.match.findMany({
      where: {
        status: MatchStatus.FINISHED,
        OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
      },
    });

    let wins = 0,
      losses = 0,
      pointsFor = 0,
      pointsAgainst = 0;
    for (const m of finishedMatches) {
      const isHome = m.homeTeamId === team.id;
      const teamScore = isHome ? m.homeScore : m.awayScore;
      const oppScore = isHome ? m.awayScore : m.homeScore;
      pointsFor += teamScore;
      pointsAgainst += oppScore;
      if (teamScore > oppScore) wins++;
      else losses++;
    }

    await prisma.teamStanding.upsert({
      where: { teamId: team.id },
      create: {
        teamId: team.id,
        matchesPlayed: finishedMatches.length,
        wins,
        losses,
        points: wins * 2,
        pointsFor,
        pointsAgainst,
        pointDiff: pointsFor - pointsAgainst,
      },
      update: {
        matchesPlayed: finishedMatches.length,
        wins,
        losses,
        points: wins * 2,
        pointsFor,
        pointsAgainst,
        pointDiff: pointsFor - pointsAgainst,
      },
    });
  }

  // Assign ranks
  const standings = await prisma.teamStanding.findMany({
    orderBy: [{ points: "desc" }, { pointDiff: "desc" }],
  });
  for (let i = 0; i < standings.length; i++) {
    await prisma.teamStanding.update({
      where: { id: standings[i].id },
      data: { rank: i + 1 },
    });
  }

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
