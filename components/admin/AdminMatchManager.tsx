"use client";
import { useState, useCallback } from "react";
import { Match } from "@/types";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { StatusBadge, TeamDot } from "@/components/ui/Badge";
import { LiveScorePanel } from "./LiveScorePanel";
import { formatDateTime } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

export function AdminMatchManager({
  initialMatches,
}: {
  initialMatches: Match[];
}) {
  const { token } = useAuth();
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const updateMatch = useCallback((updated: Match) => {
    setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }, []);

  const toggle = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  const startMatch = async (matchId: string) => {
    setBusy(matchId);
    try {
      const updated: Match = await api.startMatch(matchId, token!);
      updateMatch(updated);
      setExpanded(matchId);
      toast.success("Match started — live scoring enabled");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to start match");
    } finally {
      setBusy(null);
    }
  };

  const finishMatch = async (match: Match) => {
    if (
      !confirm(
        `Finish match: ${match.homeTeam.name} vs ${match.awayTeam.name}?`,
      )
    )
      return;
    // Auto-MVP = top scorer
    const topScorer = (match.playerStats ?? [])
      .slice()
      .sort((a, b) => b.points - a.points)[0];
    setBusy(match.id);
    try {
      const updated: Match = await api.finishMatch(
        match.id,
        { mvpPlayerId: topScorer?.playerId ?? null },
        token!,
      );
      updateMatch(updated);
      setExpanded(null);
      toast.success("Match finished — standings updated");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to finish match");
    } finally {
      setBusy(null);
    }
  };

  const groups: Record<string, Match[]> = {
    LIVE: matches.filter((m) => m.status === "LIVE"),
    UPCOMING: matches.filter((m) => m.status === "UPCOMING"),
    FINISHED: matches.filter((m) => m.status === "FINISHED"),
  };

  return (
    <div className="space-y-8">
      {(["LIVE", "UPCOMING", "FINISHED"] as const).map((status) => (
        <section key={status}>
          <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            <StatusBadge status={status} />
            {groups[status].length} match
            {groups[status].length !== 1 ? "es" : ""}
          </h3>

          <div className="space-y-3">
            {groups[status].map((match) => (
              <div
                key={match.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
              >
                {/* Match row */}
                <div className="flex items-center gap-3 p-4">
                  {/* Home team */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <TeamDot
                      color={match.homeTeam.color}
                      shortName={match.homeTeam.shortName}
                    />
                    <span className="font-bold text-white text-sm truncate">
                      {match.homeTeam.name}
                    </span>
                  </div>

                  {/* Centre info */}
                  <div className="text-center px-2 shrink-0">
                    {match.status !== "UPCOMING" ? (
                      <div
                        className={`font-black text-xl ${
                          match.status === "LIVE"
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {match.homeScore} – {match.awayScore}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs leading-tight">
                        {formatDateTime(match.scheduledAt)}
                      </div>
                    )}
                    <div className="text-gray-600 text-xs">
                      M{match.matchNumber} · Leg {match.leg}
                    </div>
                  </div>

                  {/* Away team */}
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

                {/* Action bar */}
                <div className="flex items-center gap-2 px-4 pb-4 flex-wrap">
                  {match.status === "UPCOMING" && (
                    <Button
                      size="sm"
                      onClick={() => startMatch(match.id)}
                      disabled={busy === match.id}
                    >
                      {busy === match.id ? "Starting…" : "▶ Start Match"}
                    </Button>
                  )}

                  {match.status === "LIVE" && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggle(match.id)}
                      >
                        {expanded === match.id ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" /> Hide Scorer
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" /> Live Score
                            Entry
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => finishMatch(match)}
                        disabled={busy === match.id}
                      >
                        {busy === match.id ? "Finishing…" : "🏁 Finish Match"}
                      </Button>
                    </>
                  )}

                  {match.status === "FINISHED" && (
                    <span className="text-gray-600 text-xs">
                      Ended{" "}
                      {match.endedAt ? formatDateTime(match.endedAt) : "—"}
                      {match.mvpPlayerId && " · MVP awarded ⭐"}
                    </span>
                  )}
                </div>

                {/* Live score panel (collapsible) */}
                {expanded === match.id && match.status === "LIVE" && (
                  <div className="border-t border-gray-800 p-4">
                    <LiveScorePanel match={match} onUpdate={updateMatch} />
                  </div>
                )}
              </div>
            ))}

            {groups[status].length === 0 && (
              <div className="text-gray-700 text-sm py-6 text-center border border-gray-800 rounded-xl">
                No {status.toLowerCase()} matches
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
