import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/home/HeroSection";
import { LiveMatchBanner } from "@/components/home/LiveMatchBanner";
import { MiniStandings } from "@/components/home/MiniStandings";
import { TopScorers } from "@/components/home/TopScorers";
import { MatchCard } from "@/components/fixtures/MatchCard";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export const revalidate = 30;

export default async function HomePage() {
  const [
    settings,
    liveMatches,
    recentMatches,
    upcomingMatches,
    standings,
    players,
  ] = await Promise.all([
    prisma.tournamentSettings.findFirst(),
    prisma.match.findMany({
      where: { status: "LIVE" },
      include: {
        homeTeam: true,
        awayTeam: true,
        quarters: { orderBy: { quarter: "asc" } },
        playerStats: { include: { player: true } },
      },
      take: 3,
    }),
    prisma.match.findMany({
      where: { status: "FINISHED" },
      include: {
        homeTeam: true,
        awayTeam: true,
        quarters: { orderBy: { quarter: "asc" } },
        playerStats: { include: { player: true } },
      },
      orderBy: { endedAt: "desc" },
      take: 3,
    }),
    prisma.match.findMany({
      where: { status: "UPCOMING" },
      include: {
        homeTeam: true,
        awayTeam: true,
        quarters: { orderBy: { quarter: "asc" } },
        playerStats: { include: { player: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 3,
    }),
    prisma.teamStanding.findMany({
      include: { team: true },
      orderBy: [{ points: "desc" }, { pointDiff: "desc" }],
    }),
    prisma.player.findMany({
      where: { isActive: true },
      include: { team: true, matchStats: true },
    }),
  ]);

  const playersWithStats = players
    .map((p) => ({
      ...p,
      totalPoints: p.matchStats.reduce((s, m) => s + m.points, 0),
      matchesPlayed: p.matchStats.length,
      ppg:
        p.matchStats.length > 0
          ? p.matchStats.reduce((s, m) => s + m.points, 0) / p.matchStats.length
          : 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const s = (data: any) => JSON.parse(JSON.stringify(data));

  return (
    <div>
      <HeroSection settings={s(settings)} />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Live matches */}
        {liveMatches.length > 0 && (
          <section>
            <h2 className="font-black text-white text-base sm:text-lg uppercase tracking-wide flex items-center gap-2 mb-3 before:block before:w-1 before:h-5 before:bg-red-500 before:rounded">
              Live Now
            </h2>
            <div className="space-y-3">
              {liveMatches.map((m) => (
                <LiveMatchBanner key={m.id} match={s(m)} />
              ))}
            </div>
          </section>
        )}

        {/* Main grid — stacks on mobile, side-by-side on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Left: matches */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-white text-base sm:text-lg uppercase tracking-wide flex items-center gap-2 before:block before:w-1 before:h-5 before:bg-orange-500 before:rounded">
                  Recent Results
                </h2>
                <Link
                  href="/fixtures?status=FINISHED"
                  className="text-orange-400 text-sm hover:text-orange-300"
                >
                  All →
                </Link>
              </div>
              <div className="space-y-3">
                {recentMatches.length > 0 ? (
                  recentMatches.map((m) => (
                    <MatchCard key={m.id} match={s(m)} />
                  ))
                ) : (
                  <div className="text-gray-600 text-sm py-8 text-center border border-gray-800 rounded-xl">
                    No matches completed yet
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-white text-base sm:text-lg uppercase tracking-wide flex items-center gap-2 before:block before:w-1 before:h-5 before:bg-blue-500 before:rounded">
                  Upcoming
                </h2>
                <Link
                  href="/fixtures?status=UPCOMING"
                  className="text-orange-400 text-sm hover:text-orange-300"
                >
                  Full schedule →
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingMatches.length > 0 ? (
                  upcomingMatches.map((m) => (
                    <MatchCard key={m.id} match={s(m)} />
                  ))
                ) : (
                  <div className="text-gray-600 text-sm py-8 text-center border border-gray-800 rounded-xl">
                    No upcoming matches
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right: standings + top scorers */}
          <div className="space-y-5 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Points Table</CardTitle>
                <Link
                  href="/standings"
                  className="text-orange-400 text-xs hover:text-orange-300"
                >
                  Full →
                </Link>
              </CardHeader>
              <MiniStandings standings={s(standings)} />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Scorers</CardTitle>
                <Link
                  href="/players"
                  className="text-orange-400 text-xs hover:text-orange-300"
                >
                  All players →
                </Link>
              </CardHeader>
              <CardBody className="p-2">
                <TopScorers players={s(playersWithStats)} />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
