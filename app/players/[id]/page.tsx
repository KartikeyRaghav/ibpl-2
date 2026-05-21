import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PlayerProfile } from "@/components/players/PlayerProfile";
import Link from "next/link";

export const revalidate = 30;

export default async function PlayerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      team: true,
      matchStats: {
        include: {
          match: {
            include: { homeTeam: true, awayTeam: true },
          },
        },
        orderBy: { match: { scheduledAt: "asc" } },
      },
    },
  });

  if (!player || !player.isActive) notFound();

  const totalPoints = player.matchStats.reduce((s, m) => s + m.points, 0);
  const enriched = {
    ...player,
    totalPoints,
    totalFouls: player.matchStats.reduce((s, m) => s + m.fouls, 0),
    totalTwoPointers: player.matchStats.reduce((s, m) => s + m.twoPointers, 0),
    totalThreePointers: player.matchStats.reduce(
      (s, m) => s + m.threePointers,
      0,
    ),
    totalFreeThrows: player.matchStats.reduce((s, m) => s + m.freeThrows, 0),
    matchesPlayed: player.matchStats.length,
    ppg:
      player.matchStats.length > 0 ? totalPoints / player.matchStats.length : 0,
  };

  const serialized = (d: any) => JSON.parse(JSON.stringify(d));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          href="/players"
          className="text-orange-400 text-sm hover:text-orange-300"
        >
          ← Back to Players
        </Link>
      </div>
      <PlayerProfile player={serialized(enriched)} />
    </div>
  );
}
