"use client";
import { useState } from "react";
import { Match } from "@/types";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { StatusBadge, TeamDot } from "@/components/ui/Badge";
import { LiveScorePanel } from "./LiveScorePanel";
import { formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

export function AdminMatchManager({
  initialMatches,
}: {
  initialMatches: Match[];
}) {
  const { token } = useAuth();
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const updateMatch = (updated: Match) => {
    setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const startMatch = async (matchId: string) => {
    setLoading(matchId);
    try {
      const updated = await api.startMatch(matchId, token!);
      updateMatch(updated);
      setExpandedMatch(matchId);
      toast.success("Match started! Live scoring enabled.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(null);
    }
  };

  const finishMatch = async (match: Match) => {
    // Find top scorer as MVP
    const topScorer = match.playerStats?.sort((a, b) => b.points - a.points)[0];
    setLoading(match.id);
    try {
      const updated = await api.finishMatch(
        match.id,
        { mvpPlayerId: topScorer?.playerId },
        token!,
      );
      updateMatch(updated);
      setExpandedMatch(null);
      toast.success("Match finished! Standings updated.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(null);
    }
  };

  const grouped = {
    LIVE: matches.filter((m) => m.status === "LIVE"),
    UPCOMING: matches.filter((m) => m.status === "UPCOMING"),
    FINISHED: matches.filter((m) => m.status === "FINISHED"),
  };

  return (
    <div className="space-y-6">
      {(["LIVE", "UPCOMING", "FINISHED"] as const).map((status) => (
        <div key={status}>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <StatusBadge status={status} />
            {grouped[status].length} matches
          </h3>
          <div className="space-y-3">
            {grouped[status].map((match) => (
              <div
                key={match.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
              >
                {/* Match header */}
                <div className="flex items-center gap-3 p-4">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <TeamDot
                      color={match.homeTeam.color}
                      shortName={match.homeTeam.shortName}
                    />
                    <span className="font-bold text-white text-sm truncate">
                      {match.homeTeam.name}
                    </span>
                  </div>
                  <div className="text-center px-2 shrink-0">
                    {match.status !== "UPCOMING" ? (
                      <div className="font-black text-xl text-white">
                        {match.homeScore} – {match.awayScore}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs">
                        {formatDateTime(match.scheduledAt)}
                      </div>
                    )}
                    <div className="text-gray-500 text-xs">
                      M{match.matchNumber} · Leg {match.leg}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="font-bold text-white text-sm truncate">
                      {match.awayTeam.name}
                    </span>
                    <TeamDot
                      color={match.awayTeam.color}
                      shortName={match.awayTeam.shortName}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 px-4 pb-4">
                  {match.status === "UPCOMING" && (
                    <Button
                      size="sm"
                      onClick={() => startMatch(match.id)}
                      disabled={loading === match.id}
                    >
                      {loading === match.id ? "Starting..." : "▶ Start Match"}
                    </Button>
                  )}
                  {match.status === "LIVE" && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setExpandedMatch(
                            expandedMatch === match.id ? null : match.id,
                          )
                        }
                      >
                        {expandedMatch === match.id
                          ? "Hide Scorer"
                          : "📊 Live Score Entry"}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => finishMatch(match)}
                        disabled={loading === match.id}
                      >
                        {loading === match.id
                          ? "Finishing..."
                          : "🏁 Finish Match"}
                      </Button>
                    </>
                  )}
                  {match.status === "FINISHED" && (
                    <span className="text-gray-600 text-xs">
                      {match.endedAt
                        ? `Ended ${formatDateTime(match.endedAt)}`
                        : "Completed"}
                      {match.mvpPlayerId && " · MVP awarded"}
                    </span>
                  )}
                </div>

                {/* Live scoring panel */}
                {expandedMatch === match.id && match.status === "LIVE" && (
                  <div className="border-t border-gray-800 p-4">
                    <LiveScorePanel
                      match={match}
                      onUpdate={(updated) => {
                        updateMatch(updated);
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
            {grouped[status].length === 0 && (
              <div className="text-gray-600 text-sm py-4 text-center border border-gray-800 rounded-xl">
                No {status.toLowerCase()} matches
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
