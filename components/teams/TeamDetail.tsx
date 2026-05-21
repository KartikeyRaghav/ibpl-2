import Link from "next/link";
import { Team, Match } from "@/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge, PositionBadge } from "@/components/ui/Badge";
import { getInitials, formatDate, POSITION_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function TeamDetail({ team }: { team: any }) {
  const standing = team.standing;
  const allMatches: Match[] = [
    ...(team.homeMatches || []),
    ...(team.awayMatches || []),
  ].sort(
    (a: any, b: any) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  // Player stats aggregation
  const playersWithStats = (team.players || [])
    .map((p: any) => ({
      ...p,
      totalPoints: (p.matchStats || []).reduce(
        (s: number, m: any) => s + m.points,
        0,
      ),
      totalFouls: (p.matchStats || []).reduce(
        (s: number, m: any) => s + m.fouls,
        0,
      ),
      matchesPlayed: (p.matchStats || []).length,
      ppg:
        (p.matchStats || []).length > 0
          ? (p.matchStats || []).reduce(
              (s: number, m: any) => s + m.points,
              0,
            ) / (p.matchStats || []).length
          : 0,
    }))
    .sort((a: any, b: any) => b.totalPoints - a.totalPoints);

  const captain = team.players?.find((p: any) => p.id === team.captainId);

  return (
    <div className="space-y-6">
      {/* Team header */}
      <div className="bg-linear-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-5 mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl text-white border-2 border-gray-700"
            style={{ backgroundColor: team.color }}
          >
            {getInitials(team.name)}
          </div>
          <div>
            <h1 className="font-black text-3xl text-white">{team.name}</h1>
            <div className="text-gray-500 text-sm mt-1">
              {team.coach && <span>Coach: {team.coach}</span>}
              {captain && <span className="ml-3">Captain: {captain.name}</span>}
            </div>
          </div>
        </div>

        {standing && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              {
                label: "Rank",
                value: `#${standing.rank}`,
                color: "text-yellow-400",
              },
              {
                label: "W / L",
                value: `${standing.wins} / ${standing.losses}`,
                color: "text-white",
              },
              {
                label: "Points",
                value: standing.points,
                color: "text-orange-400",
              },
              {
                label: "Pts For",
                value: standing.pointsFor,
                color: "text-green-400",
              },
              {
                label: "Pt Diff",
                value:
                  standing.pointDiff > 0
                    ? `+${standing.pointDiff}`
                    : standing.pointDiff,
                color:
                  standing.pointDiff >= 0 ? "text-green-400" : "text-red-400",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
              >
                <div className={cn("font-black text-2xl", color)}>{value}</div>
                <div className="text-gray-500 text-xs uppercase tracking-wide mt-0.5">
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Roster */}
      <Card>
        <CardHeader>
          <CardTitle>Roster — {team.players?.length || 0} Players</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-4 py-2 text-left text-gray-500 font-semibold text-xs uppercase">
                  #
                </th>
                <th className="px-4 py-2 text-left text-gray-500 font-semibold text-xs uppercase">
                  Player
                </th>
                <th className="px-3 py-2 text-left text-gray-500 font-semibold text-xs uppercase">
                  Position
                </th>
                <th className="px-3 py-2 text-center text-gray-500 font-semibold text-xs uppercase">
                  GP
                </th>
                <th className="px-3 py-2 text-center text-gray-500 font-semibold text-xs uppercase">
                  PTS
                </th>
                <th className="px-3 py-2 text-center text-gray-500 font-semibold text-xs uppercase">
                  PPG
                </th>
                <th className="px-3 py-2 text-center text-gray-500 font-semibold text-xs uppercase">
                  Fouls
                </th>
              </tr>
            </thead>
            <tbody>
              {playersWithStats.map((p: any) => (
                <tr
                  key={p.id}
                  className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-gray-400">
                    {p.jerseyNumber}
                    {p.id === team.captainId && (
                      <span className="ml-1 text-yellow-400 text-xs">©</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/players/${p.id}`}
                      className="font-semibold text-white hover:text-orange-400 transition-colors flex items-center gap-2"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black"
                        style={{ backgroundColor: team.color }}
                      >
                        {getInitials(p.name)}
                      </div>
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <PositionBadge position={p.position} />
                  </td>
                  <td className="px-3 py-3 text-center text-gray-400">
                    {p.matchesPlayed}
                  </td>
                  <td className="px-3 py-3 text-center font-black text-orange-400">
                    {p.totalPoints}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-300">
                    {p.ppg.toFixed(1)}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-400">
                    {p.totalFouls}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Match history */}
      <Card>
        <CardHeader>
          <CardTitle>Match History</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2">
          {allMatches.length === 0 && (
            <div className="text-gray-600 text-sm text-center py-4">
              No matches yet
            </div>
          )}
          {allMatches.map((m: any) => {
            const isHome = m.homeTeamId === team.id;
            const opponent = isHome ? m.awayTeam : m.homeTeam;
            const teamScore = isHome ? m.homeScore : m.awayScore;
            const oppScore = isHome ? m.awayScore : m.homeScore;
            const won = m.status === "FINISHED" && teamScore > oppScore;
            const lost = m.status === "FINISHED" && teamScore < oppScore;

            return (
              <Link
                key={m.id}
                href={`/fixtures/${m.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:border-orange-500/40 transition-colors"
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black",
                    won
                      ? "bg-green-500/20 text-green-400"
                      : lost
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-800 text-gray-500",
                  )}
                >
                  {won ? "W" : lost ? "L" : "—"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold">
                    {isHome ? "vs" : "@"} {opponent.name}
                    <span className="text-gray-600 text-xs ml-2">
                      Leg {m.leg}
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {formatDate(m.scheduledAt)} · {m.venue}
                  </div>
                </div>
                <div className="text-right">
                  {m.status !== "UPCOMING" ? (
                    <div className="font-black text-white">
                      {teamScore} – {oppScore}
                    </div>
                  ) : (
                    <StatusBadge status={m.status} />
                  )}
                </div>
              </Link>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
