import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeamDetail } from "@/components/teams/TeamDetail";
import Link from "next/link";

export const revalidate = 30;

export default async function TeamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: {
      players: {
        where: { isActive: true },
        orderBy: { jerseyNumber: "asc" },
        include: { matchStats: true },
      },
      standing: true,
      homeMatches: {
        include: {
          homeTeam: true,
          awayTeam: true,
          quarters: { orderBy: { quarter: "asc" } },
        },
        orderBy: { scheduledAt: "asc" },
      },
      awayMatches: {
        include: {
          homeTeam: true,
          awayTeam: true,
          quarters: { orderBy: { quarter: "asc" } },
        },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });

  if (!team) notFound();
  const serialized = (d: any) => JSON.parse(JSON.stringify(d));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          href="/teams"
          className="text-orange-400 text-sm hover:text-orange-300"
        >
          ← Back to Teams
        </Link>
      </div>
      <TeamDetail team={serialized(team)} />
    </div>
  );
}
