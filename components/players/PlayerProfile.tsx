import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { PositionBadge } from "@/components/ui/Badge";
import { getInitials, formatDate, POSITION_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PlayerProfile({ player }: { player: any }) {
  const maxPts = Math.max(
    ...(player.matchStats || []).map((s: any) => s.points),
    1,
  );

  return (
    <div className="space-y-5">
      {/* Player header */}
      <div className="bg-linear-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-5 mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl text-white"
            style={{ backgroundColor: player.team?.color }}
          >
            {getInitials(player.name)}
          </div>
          <div>
            <h1 className="font-black text-3xl text-white">{player.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-gray-500 text-sm">
                #{player.jerseyNumber}
              </span>
              <PositionBadge position={player.position} />
              <Link
                href={`/teams/${player.teamId}`}
                className="text-sm font-semibold hover:text-orange-400 transition-colors"
                style={{ color: player.team?.color }}
              >
                {player.team?.name}
              </Link>
            </div>
            <div className="text-gray-600 text-xs mt-1">
              {POSITION_LABELS[player.position]}
            </div>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            {
              label: "Total PTS",
              value: player.totalPoints,
              color: "text-orange-400",
            },
            {
              label: "PPG",
              value: player.ppg.toFixed(1),
              color: "text-orange-400",
            },
            {
              label: "Games",
              value: player.matchesPlayed,
              color: "text-white",
            },
            {
              label: "2PT",
              value: player.totalTwoPointers,
              color: "text-green-400",
            },
            {
              label: "3PT",
              value: player.totalThreePointers,
              color: "text-blue-400",
            },
            { label: "Fouls", value: player.totalFouls, color: "text-red-400" },
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
      </div>

      {/* Match-wise performance */}
      {player.matchStats && player.matchStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Match Performance</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {player.matchStats.map((s: any) => {
              const match = s.match;
              const isHome = match?.homeTeamId === player.teamId;
              const opponent = isHome ? match?.awayTeam : match?.homeTeam;
              const barPct = Math.round((s.points / maxPts) * 100);

              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <Link
                        href={`/fixtures/${match?.id}`}
                        className="text-white font-semibold hover:text-orange-400 transition-colors"
                      >
                        {isHome ? "vs" : "@"} {opponent?.name}
                      </Link>
                      <span className="text-gray-600 text-xs ml-2">
                        {match?.scheduledAt
                          ? formatDate(match.scheduledAt)
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>2PT: {s.twoPointers}</span>
                      <span>3PT: {s.threePointers}</span>
                      <span>FT: {s.freeThrows}</span>
                      {s.fouls > 0 && (
                        <span className="text-red-400">{s.fouls}F</span>
                      )}
                      {s.isDisqualified && (
                        <span className="text-red-500 font-bold">DQ</span>
                      )}
                      <span className="font-black text-orange-400 text-base w-8 text-right">
                        {s.points}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${barPct}%`,
                        backgroundColor: player.team?.color || "#F47B20",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}

      {player.matchStats?.length === 0 && (
        <Card>
          <CardBody className="text-center py-8 text-gray-600">
            No match stats yet.
          </CardBody>
        </Card>
      )}
    </div>
  );
}
