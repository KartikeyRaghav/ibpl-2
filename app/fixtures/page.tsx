import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/fixtures/MatchCard";
import { FixturesFilter } from "@/components/fixtures/FixturesFilter";

export const revalidate = 15;

export default async function FixturesPage({
  searchParams,
}: {
  searchParams: { status?: string; teamId?: number };
}) {
  const status = searchParams.status as any;
  const teamId = searchParams.teamId;

  const matches = await prisma.match.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(teamId
        ? {
            OR: [
              { homeTeamId: Number(teamId) },
              { awayTeamId: Number(teamId) },
            ],
          }
        : {}),
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      quarters: { orderBy: { quarter: "asc" } },
      playerStats: { include: { player: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const serialized = (d: any) => JSON.parse(JSON.stringify(d));

  const grouped = {
    LIVE: matches.filter((m) => m.status === "LIVE"),
    UPCOMING: matches.filter((m) => m.status === "UPCOMING"),
    FINISHED: matches.filter((m) => m.status === "FINISHED"),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-black text-3xl text-white">Fixtures & Results</h1>
        <p className="text-gray-500 text-sm mt-1">
          Double Round Robin · 12 Matches Total
        </p>
      </div>

      <FixturesFilter
        teams={serialized(teams)}
        currentStatus={status}
        currentTeamId={teamId}
      />

      <div className="space-y-8 mt-6">
        {grouped.LIVE.length > 0 && (
          <section>
            <h2 className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="animate-pulse">●</span> Live Now
            </h2>
            <div className="space-y-3">
              {grouped.LIVE.map((m) => (
                <MatchCard key={m.id} match={serialized(m)} />
              ))}
            </div>
          </section>
        )}
        {grouped.UPCOMING.length > 0 && (
          <section>
            <h2 className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">
              Upcoming
            </h2>
            <div className="space-y-3">
              {grouped.UPCOMING.map((m) => (
                <MatchCard key={m.id} match={serialized(m)} />
              ))}
            </div>
          </section>
        )}
        {grouped.FINISHED.length > 0 && (
          <section>
            <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">
              Completed
            </h2>
            <div className="space-y-3">
              {grouped.FINISHED.map((m) => (
                <MatchCard key={m.id} match={serialized(m)} />
              ))}
            </div>
          </section>
        )}
        {matches.length === 0 && (
          <div className="text-gray-600 text-center py-16 border border-gray-800 rounded-xl">
            No matches found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
