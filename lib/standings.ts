import { prisma } from "./prisma";

export async function recalculateStandings(): Promise<void> {
  const teams = await prisma.team.findMany();
  for (const team of teams) {
    const finishedMatches = await prisma.match.findMany({
      where: {
        status: "FINISHED",
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
  // Re-rank
  const standings = await prisma.teamStanding.findMany({
    orderBy: [{ points: "desc" }, { pointDiff: "desc" }],
  });
  for (let i = 0; i < standings.length; i++) {
    await prisma.teamStanding.update({
      where: { id: standings[i].id },
      data: { rank: i + 1 },
    });
  }
}
