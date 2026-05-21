import { prisma } from "@/lib/prisma";
import { PlayersClient } from "@/components/players/PlayersClient";

export const revalidate = 30;

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    where: { isActive: true },
    include: {
      team: true,
      matchStats: true,
    },
    orderBy: { name: "asc" },
  });

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  const withStats = players.map((p) => ({
    ...p,
    totalPoints: p.matchStats.reduce((s, m) => s + m.points, 0),
    totalFouls: p.matchStats.reduce((s, m) => s + m.fouls, 0),
    totalTwoPointers: p.matchStats.reduce((s, m) => s + m.twoPointers, 0),
    totalThreePointers: p.matchStats.reduce((s, m) => s + m.threePointers, 0),
    totalFreeThrows: p.matchStats.reduce((s, m) => s + m.freeThrows, 0),
    matchesPlayed: p.matchStats.length,
    ppg:
      p.matchStats.length > 0
        ? p.matchStats.reduce((s, m) => s + m.points, 0) / p.matchStats.length
        : 0,
  }));

  const serialized = (d: any) => JSON.parse(JSON.stringify(d));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-black text-3xl text-white">Players</h1>
        <p className="text-gray-500 text-sm mt-1">
          {players.length} active players across all teams
        </p>
      </div>
      <PlayersClient
        players={serialized(withStats)}
        teams={serialized(teams)}
      />
    </div>
  );
}
