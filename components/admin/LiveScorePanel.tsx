"use client";
import { useState } from "react";
import { Match } from "@/types";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { TeamDot } from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface Props {
  match: Match;
  onUpdate: (m: Match) => void;
}

type ScoringEvent = "TWO_POINTER" | "THREE_POINTER" | "FREE_THROW";
type FoulEvent = "FOUL" | "TECHNICAL_FOUL";

export function LiveScorePanel({ match, onUpdate }: Props) {
  const { token } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedHome, setSelectedHome] = useState("");
  const [selectedAway, setSelectedAway] = useState("");
  const [minute, setMinute] = useState(0);

  // Safe player lists — filter out nulls
  const homePlayers = (match.playerStats ?? [])
    .filter(
      (s) => s.teamId === match.homeTeamId && !s.isDisqualified && s.player,
    )
    .map((s) => s.player!);

  const awayPlayers = (match.playerStats ?? [])
    .filter(
      (s) => s.teamId === match.awayTeamId && !s.isDisqualified && s.player,
    )
    .map((s) => s.player!);

  const homeFouls = (match.playerStats ?? [])
    .filter((s) => s.teamId === match.homeTeamId)
    .reduce((a, s) => a + s.fouls, 0);

  const awayFouls = (match.playerStats ?? [])
    .filter((s) => s.teamId === match.awayTeamId)
    .reduce((a, s) => a + s.fouls, 0);

  const score = async (
    side: "home" | "away",
    pts: number,
    type: ScoringEvent,
  ) => {
    const playerId = side === "home" ? selectedHome : selectedAway;
    const key = `${side}-${type}`;
    setBusy(key);
    try {
      const updated: Match = await api.addScore(
        match.id,
        {
          teamSide: side,
          points: pts,
          eventType: type,
          playerId: playerId || undefined,
          quarter: match.currentQuarter,
          minute,
        },
        token!,
      );
      onUpdate(updated);
      toast.success(
        `+${pts} — ${side === "home" ? match.homeTeam.shortName : match.awayTeam.shortName}`,
      );
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update score");
    } finally {
      setBusy(null);
    }
  };

  const foul = async (side: "home" | "away", type: FoulEvent) => {
    const playerId = side === "home" ? selectedHome : selectedAway;
    if (!playerId) {
      toast.error("Select a player for the foul");
      return;
    }
    setBusy(`${side}-foul`);
    try {
      const updated: Match = await api.addScore(
        match.id,
        {
          teamSide: side,
          eventType: type,
          playerId,
          quarter: match.currentQuarter,
          minute,
        },
        token!,
      );
      onUpdate(updated);
      toast.success("Foul recorded");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to record foul");
    } finally {
      setBusy(null);
    }
  };

  const nextQuarter = async () => {
    if (match.currentQuarter >= 4) {
      toast.error("Already in Q4 — use Finish Match to end.");
      return;
    }
    try {
      const updated: Match = await api.nextQuarter(match.id, token!);
      onUpdate(updated);
      setMinute(0);
      toast.success(`Advanced to Q${updated.currentQuarter}`);
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* Live scoreboard */}
      <div className="bg-linear-to-br from-gray-950 to-gray-900 border border-red-800/40 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 bg-red-400 rounded-full" />
            LIVE
          </span>
          <span className="text-gray-500 text-xs">
            Quarter {match.currentQuarter} of 4
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <TeamDot
              color={match.homeTeam.color}
              shortName={match.homeTeam.shortName}
            />
            <div className="mt-1 text-white font-bold text-sm">
              {match.homeTeam.name}
            </div>
            <div className="text-gray-500 text-xs">{homeFouls} team fouls</div>
          </div>

          <div className="text-center px-4">
            <div className="font-black text-4xl text-red-400">
              {match.homeScore} — {match.awayScore}
            </div>
            <div className="flex justify-center gap-1.5 mt-2">
              {[1, 2, 3, 4].map((q) => (
                <div
                  key={q}
                  className={`w-5 h-1.5 rounded-full ${
                    q < match.currentQuarter
                      ? "bg-orange-500"
                      : q === match.currentQuarter
                        ? "bg-red-400 animate-pulse"
                        : "bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="text-center flex-1">
            <TeamDot
              color={match.awayTeam.color}
              shortName={match.awayTeam.shortName}
            />
            <div className="mt-1 text-white font-bold text-sm">
              {match.awayTeam.name}
            </div>
            <div className="text-gray-500 text-xs">{awayFouls} team fouls</div>
          </div>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
        <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
          Q{match.currentQuarter} Minute:
        </label>
        <input
          type="number"
          min={0}
          max={10}
          value={minute}
          onChange={(e) => setMinute(Number(e.target.value))}
          className="w-16 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm text-center"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={nextQuarter}
          disabled={match.currentQuarter >= 4}
          className="ml-auto"
        >
          Next Quarter →
        </Button>
      </div>

      {/* Side-by-side score entry */}
      <div className="grid grid-cols-2 gap-3">
        <ScoreSide
          label={match.homeTeam.name}
          color={match.homeTeam.color}
          players={homePlayers}
          selected={selectedHome}
          onSelect={setSelectedHome}
          onScore={(pts, type) => score("home", pts, type)}
          onFoul={(type) => foul("home", type)}
          busy={busy}
          prefix="home"
        />
        <ScoreSide
          label={match.awayTeam.name}
          color={match.awayTeam.color}
          players={awayPlayers}
          selected={selectedAway}
          onSelect={setSelectedAway}
          onScore={(pts, type) => score("away", pts, type)}
          onFoul={(type) => foul("away", type)}
          busy={busy}
          prefix="away"
        />
      </div>
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

interface ScoreSideProps {
  label: string;
  color: string;
  players: any[];
  selected: string;
  onSelect: (id: string) => void;
  onScore: (pts: number, type: ScoringEvent) => void;
  onFoul: (type: FoulEvent) => void;
  busy: string | null;
  prefix: string;
}

function ScoreSide({
  label,
  color,
  players,
  selected,
  onSelect,
  onScore,
  onFoul,
  busy,
  prefix,
}: ScoreSideProps) {
  const disabled = !!busy;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2">
      {/* Team name */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="font-bold text-white text-xs truncate">{label}</span>
      </div>

      {/* Player select */}
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs"
      >
        <option value="">— Select player —</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            #{p.jerseyNumber} {p.name}
          </option>
        ))}
      </select>

      {/* Score buttons */}
      <div className="space-y-1">
        {(
          [
            { label: "Free Throw", pts: 1, type: "FREE_THROW" as ScoringEvent },
            { label: "2-Pointer", pts: 2, type: "TWO_POINTER" as ScoringEvent },
            {
              label: "3-Pointer",
              pts: 3,
              type: "THREE_POINTER" as ScoringEvent,
            },
          ] as const
        ).map(({ label: btnLabel, pts, type }) => (
          <button
            key={type}
            onClick={() => onScore(pts, type)}
            disabled={disabled}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-orange-500/20 hover:border-orange-500/50 border border-gray-700 rounded-lg text-xs font-medium text-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{btnLabel}</span>
            <span className="font-black text-orange-400">+{pts}</span>
          </button>
        ))}

        {/* Foul buttons */}
        {(
          [
            { label: "Personal Foul", icon: "⚠", type: "FOUL" as FoulEvent },
            {
              label: "Technical Foul",
              icon: "⛔",
              type: "TECHNICAL_FOUL" as FoulEvent,
            },
          ] as const
        ).map(({ label: btnLabel, icon, type }) => (
          <button
            key={type}
            onClick={() => onFoul(type)}
            disabled={disabled || !selected}
            title={!selected ? "Select a player first" : undefined}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-red-500/20 hover:border-red-500/50 border border-gray-700 rounded-lg text-xs font-medium text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{btnLabel}</span>
            <span>{icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
