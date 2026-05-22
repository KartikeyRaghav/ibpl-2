"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Match } from "@/types";
import { api } from "@/lib/api-client";
import { StatusBadge, TeamDot } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDateTime, getInitials } from "@/lib/utils";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export function MatchDetail({ matchId }: { matchId: number }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const statusRef = useRef<string | null>(null);

  const fetchMatch = useCallback(async () => {
    try {
      const data: Match = await api.getMatch(Number(matchId));
      setMatch(data);
      statusRef.current = data.status;
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatch();
    // Poll every 5 s only while live
    const interval = setInterval(() => {
      if (statusRef.current === "LIVE") fetchMatch();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchMatch]);

  if (loading) return <LoadingSpinner text="Loading match…" />;
  if (!match)
    return (
      <div className="text-center py-20 text-gray-500">Match not found.</div>
    );

  const homeStats = (match.playerStats ?? []).filter(
    (s) => s.teamId === match.homeTeamId,
  );
  const awayStats = (match.playerStats ?? []).filter(
    (s) => s.teamId === match.awayTeamId,
  );
  const mvpStat = (match.playerStats ?? []).find(
    (s) => s.playerId === match.mvpPlayerId,
  );

  return (
    <div className="space-y-4">
      {/* Scoreboard */}
      <div className="bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <StatusBadge status={match.status} />
            <div className="text-gray-500 text-xs">
              Match #{match.matchNumber} · Leg {match.leg}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Home */}
            <div className="flex-1 text-center space-y-2">
              <TeamDot
                color={match.homeTeam.color}
                shortName={match.homeTeam.shortName}
              />
              <div className="font-black text-white text-lg">
                {match.homeTeam.name}
              </div>
              <div className="text-gray-500 text-xs">Home</div>
            </div>

            {/* Score */}
            <div className="text-center px-4">
              <div
                className={`font-black text-5xl md:text-6xl ${
                  match.status === "LIVE" ? "text-red-400" : "text-white"
                }`}
              >
                {match.homeScore}
                <span className="text-gray-600 mx-3">–</span>
                {match.awayScore}
              </div>
              {match.status === "LIVE" && (
                <div className="text-red-400 text-sm font-bold mt-2 animate-pulse">
                  ● Q{match.currentQuarter} Live
                </div>
              )}
              {match.status === "FINISHED" && match.endedAt && (
                <div className="text-gray-500 text-xs mt-2">
                  {formatDateTime(match.endedAt)}
                </div>
              )}
              {match.status === "UPCOMING" && (
                <div className="text-gray-500 text-xs mt-2">
                  {formatDateTime(match.scheduledAt)}
                </div>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 text-center space-y-2">
              <TeamDot
                color={match.awayTeam.color}
                shortName={match.awayTeam.shortName}
              />
              <div className="font-black text-white text-lg">
                {match.awayTeam.name}
              </div>
              <div className="text-gray-500 text-xs">Away</div>
            </div>
          </div>
        </div>

        {/* Quarter scores */}
        {(match.quarters ?? []).length > 0 && (
          <div className="border-t border-gray-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="px-4 py-2 text-left text-gray-500 font-semibold text-xs uppercase">
                    Team
                  </th>
                  {(match.quarters ?? []).map((q) => (
                    <th
                      key={q.quarter}
                      className="px-3 py-2 text-center text-gray-500 font-semibold text-xs"
                    >
                      Q{q.quarter}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-center text-gray-500 font-semibold text-xs uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    team: match.homeTeam,
                    total: match.homeScore,
                    side: "home" as const,
                  },
                  {
                    team: match.awayTeam,
                    total: match.awayScore,
                    side: "away" as const,
                  },
                ].map(({ team, total, side }) => (
                  <tr key={team.id} className="border-t border-gray-800">
                    <td className="px-4 py-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        {team.shortName}
                      </div>
                    </td>
                    {(match.quarters ?? []).map((q) => (
                      <td
                        key={q.quarter}
                        className="px-3 py-3 text-center text-gray-300"
                      >
                        {side === "home" ? q.homeScore : q.awayScore}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-black text-orange-400 text-lg">
                      {total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MVP */}
      {mvpStat?.player && (
        <Card>
          <CardHeader>
            <CardTitle>⭐ Match MVP</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white"
                style={{
                  backgroundColor: mvpStat.player.team?.color ?? "#F47B20",
                }}
              >
                {getInitials(mvpStat.player.name)}
              </div>
              <div>
                <div className="font-bold text-white">
                  {mvpStat.player.name}
                </div>
                <div className="text-gray-500 text-xs">
                  #{mvpStat.player.jerseyNumber} · {mvpStat.player.position}
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="font-black text-2xl text-orange-400">
                  {mvpStat.points}
                </div>
                <div className="text-gray-500 text-xs">Points</div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Player stats tables */}
      {[
        { team: match.homeTeam, stats: homeStats },
        { team: match.awayTeam, stats: awayStats },
      ].map(({ team, stats }) => (
        <Card key={team.id}>
          <CardHeader>
            <CardTitle>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: team.color }}
              />
              {team.name} — Player Stats
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/50">
                  {["#", "Player", "PTS", "2PT", "3PT", "FT", "Fouls"].map(
                    (h) => (
                      <th
                        key={h}
                        className={[
                          "px-3 py-2 text-gray-500 font-semibold text-xs uppercase",
                          h === "#" || h === "Player"
                            ? "text-left px-4"
                            : "text-center",
                        ].join(" ")}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {stats
                  .slice()
                  .sort((a, b) => b.points - a.points)
                  .map((s) => (
                    <tr
                      key={s.id}
                      className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-gray-500 text-xs">
                        #{s.player?.jerseyNumber}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-white">
                        <div className="flex items-center gap-1.5">
                          {s.player?.name ?? "Unknown"}
                          {s.isDisqualified && (
                            <span className="text-red-400 text-xs font-bold">
                              DQ
                            </span>
                          )}
                          {s.playerId === match.mvpPlayerId && (
                            <span className="text-yellow-400 text-xs">⭐</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center font-black text-orange-400">
                        {s.points}
                      </td>
                      <td className="px-3 py-2.5 text-center text-gray-300">
                        {s.twoPointers}
                      </td>
                      <td className="px-3 py-2.5 text-center text-gray-300">
                        {s.threePointers}
                      </td>
                      <td className="px-3 py-2.5 text-center text-gray-300">
                        {s.freeThrows}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={
                            s.fouls >= 5
                              ? "text-red-400 font-bold"
                              : "text-gray-300"
                          }
                        >
                          {s.fouls}
                        </span>
                      </td>
                    </tr>
                  ))}
                {stats.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-gray-600 text-sm"
                    >
                      No stats recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      {/* Event log */}
      {(match.events ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Match Events</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 max-h-64 overflow-y-auto">
            {(match.events ?? [])
              .slice()
              .reverse()
              .map((e) => (
                <div key={e.id} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600 text-xs w-16 shrink-0">
                    Q{e.quarter} {Math.floor(e.minute)}′
                  </span>
                  <span
                    className={[
                      "text-xs px-2 py-0.5 rounded font-medium",
                      e.type.includes("FOUL")
                        ? "bg-red-500/20 text-red-400"
                        : e.type === "THREE_POINTER"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-gray-700 text-gray-300",
                    ].join(" ")}
                  >
                    {e.type.replace(/_/g, " ")}
                    {e.value != null ? ` +${e.value}` : ""}
                  </span>
                </div>
              ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
