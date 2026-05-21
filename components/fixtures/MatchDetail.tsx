"use client";
import { useEffect, useState } from "react";
import { Match } from "@/types";
import { api } from "@/lib/api-client";
import { StatusBadge, TeamDot } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDateTime, getInitials } from "@/lib/utils";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export function MatchDetail({ matchId }: { matchId: string }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatch = async () => {
    try {
      const data = await api.getMatch(matchId);
      setMatch(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
    // Poll if live
    const interval = setInterval(() => {
      if (match?.status === "LIVE") fetchMatch();
    }, 5000);
    return () => clearInterval(interval);
  }, [matchId, match?.status]);

  if (loading) return <LoadingSpinner text="Loading match..." />;
  if (!match)
    return (
      <div className="text-center py-20 text-gray-500">Match not found</div>
    );

  const homeStats =
    match.playerStats?.filter((s) => s.teamId === match.homeTeamId) || [];
  const awayStats =
    match.playerStats?.filter((s) => s.teamId === match.awayTeamId) || [];
  const mvp = match.playerStats?.find((s) => s.playerId === match.mvpPlayerId);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
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
            <div className="flex-1 text-center">
              <TeamDot
                color={match.homeTeam.color}
                shortName={match.homeTeam.shortName}
              />
              <div className="mt-2 font-black text-white text-lg">
                {match.homeTeam.name}
              </div>
              <div className="text-gray-500 text-xs">Home</div>
            </div>
            <div className="text-center">
              <div
                className={`font-black text-5xl md:text-6xl ${match.status === "LIVE" ? "text-red-400" : "text-white"}`}
              >
                {match.homeScore}
                <span className="text-gray-600 mx-3">–</span>
                {match.awayScore}
              </div>
              {match.status === "LIVE" && (
                <div className="text-red-400 text-sm font-bold mt-1 animate-pulse">
                  ● Q{match.currentQuarter} Live
                </div>
              )}
              {match.status === "FINISHED" && (
                <div className="text-gray-500 text-xs mt-1">
                  {match.endedAt ? formatDateTime(match.endedAt) : "Final"}
                </div>
              )}
            </div>
            <div className="flex-1 text-center">
              <TeamDot
                color={match.awayTeam.color}
                shortName={match.awayTeam.shortName}
              />
              <div className="mt-2 font-black text-white text-lg">
                {match.awayTeam.name}
              </div>
              <div className="text-gray-500 text-xs">Away</div>
            </div>
          </div>
        </div>

        {/* Quarter scores */}
        {match.quarters && match.quarters.length > 0 && (
          <div className="border-t border-gray-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="px-4 py-2 text-left text-gray-500 font-semibold text-xs uppercase">
                    Team
                  </th>
                  {match.quarters.map((q) => (
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
                <tr className="border-t border-gray-800">
                  <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: match.homeTeam.color }}
                    />
                    {match.homeTeam.shortName}
                  </td>
                  {match.quarters.map((q) => (
                    <td
                      key={q.quarter}
                      className="px-3 py-3 text-center text-gray-300"
                    >
                      {q.homeScore}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-black text-orange-400 text-lg">
                    {match.homeScore}
                  </td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: match.awayTeam.color }}
                    />
                    {match.awayTeam.shortName}
                  </td>
                  {match.quarters.map((q) => (
                    <td
                      key={q.quarter}
                      className="px-3 py-3 text-center text-gray-300"
                    >
                      {q.awayScore}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-black text-orange-400 text-lg">
                    {match.awayScore}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MVP */}
      {mvp && mvp.player && (
        <Card>
          <CardHeader>
            <CardTitle>⭐ Match MVP</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white"
                style={{ backgroundColor: mvp.player.team?.color }}
              >
                {getInitials(mvp.player.name)}
              </div>
              <div>
                <div className="font-bold text-white">{mvp.player.name}</div>
                <div className="text-gray-500 text-xs">
                  #{mvp.player.jerseyNumber} · {mvp.player.position}
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="font-black text-2xl text-orange-400">
                  {mvp.points}
                </div>
                <div className="text-gray-500 text-xs">Points</div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Player stats */}
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
                  <th className="px-4 py-2 text-left text-gray-500 font-semibold text-xs uppercase">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-gray-500 font-semibold text-xs uppercase">
                    Player
                  </th>
                  <th className="px-3 py-2 text-center text-gray-500 font-semibold text-xs">
                    PTS
                  </th>
                  <th className="px-3 py-2 text-center text-gray-500 font-semibold text-xs">
                    2PT
                  </th>
                  <th className="px-3 py-2 text-center text-gray-500 font-semibold text-xs">
                    3PT
                  </th>
                  <th className="px-3 py-2 text-center text-gray-500 font-semibold text-xs">
                    FT
                  </th>
                  <th className="px-3 py-2 text-center text-gray-500 font-semibold text-xs">
                    FOULS
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats
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
                        {s.player?.name}
                        {s.isDisqualified && (
                          <span className="ml-2 text-red-400 text-xs">DQ</span>
                        )}
                        {s.playerId === match.mvpPlayerId && (
                          <span className="ml-2 text-yellow-400 text-xs">
                            ⭐
                          </span>
                        )}
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
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      {/* Event log */}
      {match.events && match.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Match Events</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 max-h-64 overflow-y-auto">
            {match.events
              .slice()
              .reverse()
              .map((e) => (
                <div key={e.id} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600 text-xs w-16 shrink-0">
                    Q{e.quarter} {e.minute.toFixed(0)}′
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      e.type.includes("FOUL")
                        ? "bg-red-500/20 text-red-400"
                        : e.type === "THREE_POINTER"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {e.type.replace(/_/g, " ")}
                    {e.value ? ` +${e.value}` : ""}
                  </span>
                </div>
              ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
