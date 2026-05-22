import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/fixtures/MatchCard";
import { FixturesFilter } from "@/components/fixtures/FixturesFilter";

export const dynamic = "force-dynamic";

export default async function FixturesPage({
  searchParams,
}: {
  searchParams: { status?: string; teamId?: string };
}) {
  const status = (searchParams.status as any) || undefined;
  const teamId = searchParams.teamId || undefined;

  const [matches, teams] = await Promise.all([
    prisma.match.findMany({
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
    }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serialized = (d: any) => JSON.parse(JSON.stringify(d));

  const live = matches.filter((m) => m.status === "LIVE");
  const upcoming = matches.filter((m) => m.status === "UPCOMING");
  const finished = matches.filter((m) => m.status === "FINISHED");

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-5">
        <h1 className="font-black text-2xl sm:text-3xl text-white">
          Fixtures &amp; Results
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Double Round Robin · 12 Matches Total
        </p>
      </div>

      {/* Suspense required because FixturesFilter uses useSearchParams() */}
      {/* <Suspense fallback={<FilterSkeleton />}>
        <FixturesFilter
          teams={serialized(teams)}
          currentStatus={status}
          currentTeamId={teamId}
        />
      </Suspense> */}

      <div className="space-y-8 mt-6">
        {live.length > 0 && (
          <section>
            <SectionLabel color="text-red-400" dot animate>
              Live Now
            </SectionLabel>
            <div className="space-y-3">
              {live.map((m) => (
                <MatchCard key={m.id} match={serialized(m)} />
              ))}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section>
            <SectionLabel color="text-orange-400">Upcoming</SectionLabel>
            <div className="space-y-3">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={serialized(m)} />
              ))}
            </div>
          </section>
        )}

        {finished.length > 0 && (
          <section>
            <SectionLabel color="text-gray-500">Completed</SectionLabel>
            <div className="space-y-3">
              {finished.map((m) => (
                <MatchCard key={m.id} match={serialized(m)} />
              ))}
            </div>
          </section>
        )}

        {matches.length === 0 && (
          <div className="text-gray-600 text-center py-16 border border-gray-800 rounded-xl text-sm">
            No matches found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({
  children,
  color,
  dot,
  animate,
}: {
  children: React.ReactNode;
  color: string;
  dot?: boolean;
  animate?: boolean;
}) {
  return (
    <h2
      className={`${color} text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2`}
    >
      {dot && <span className={animate ? "animate-pulse" : ""}>●</span>}
      {children}
    </h2>
  );
}

function FilterSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex gap-2 flex-wrap">
        {[80, 60, 80, 80].map((w, i) => (
          <div
            key={i}
            className="h-7 bg-gray-800 rounded-full"
            style={{ width: w }}
          />
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {[70, 90, 90, 90, 90].map((w, i) => (
          <div
            key={i}
            className="h-7 bg-gray-800 rounded-full"
            style={{ width: w }}
          />
        ))}
      </div>
    </div>
  );
}
