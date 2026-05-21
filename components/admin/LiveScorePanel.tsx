"use client";
import { useState, useEffect } from "react";
import { Match } from "@/types";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { TeamDot } from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface LiveScorePanelProps {
  match: Match;
  onUpdate: (m: Match) => void;
}

type EventType =
  | "TWO_POINTER"
  | "THREE_POINTER"
  | "FREE_THROW"
  | "FOUL"
  | "TECHNICAL_FOUL";

export function LiveScorePanel({ match, onUpdate }: LiveScorePanelProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedPlayerHome, setSelectedPlayerHome] = useState<string>("");
  const [selectedPlayerAway, setSelectedPlayerAway] = useState<string>("");
  const [currentMinute, setCurrentMinute] = useState(0);

  const homePlayers =
    match.playerStats
      ?.filter((s) => s.teamId === match.homeTeamId && !s.isDisqualified)
      .map((s) => s.player)
      .filter(Boolean) || [];

  const awayPlayers =
    match.playerStats
      ?.filter((s) => s.teamId === match.awayTeamId && !s.isDisqualified)
      .map((s) => s.player)
      .filter(Boolean) || [];

  const addScore = async (
    teamSide: "home" | "away",
    points: number,
    eventType: EventType,
  ) => {
    const playerId =
      teamSide === "home" ? selectedPlayerHome : selectedPlayerAway;
    const key = `${teamSide}-${eventType}`;
    setLoading(key);
    try {
      const updated = await api.addScore(
        match.id,
        {
          teamSide,
          points,
          eventType,
          playerId: playerId || undefined,
          quarter: match.currentQuarter,
          minute: currentMinute,
        },
        token!,
      );
      onUpdate(updated);
      toast.success(
        `+${points} for ${teamSide === "home" ? match.homeTeam.shortName : match.awayTeam.shortName}`,
      );
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(null);
    }
  };

  const addFoul = async (teamSide: "home" | "away", eventType: EventType) => {
    const playerId =
      teamSide === "home" ? selectedPlayerHome : selectedPlayerAway;
    if (!playerId) {
      toast.error("Select a player for the foul");
      return;
    }
    const key = `${teamSide}-foul`;
    setLoading(key);
    try {
      const updated = await api.addScore(
        match.id,
        {
          teamSide,
          eventType,
          playerId,
          quarter: match.currentQuarter,
          minute: currentMinute,
        },
        token!,
      );
      onUpdate(updated);
      toast.success(`Foul recorded`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(null);
    }
  };

  const nextQuarter = async () => {
    if (match.currentQuarter >= 4) {
      toast.error("Already in Q4. Use 'Finish Match' to end.");
      return;
    }
    try {
      const updated = await api.nextQuarter(match.id, token!);
      onUpdate(updated);
      setCurrentMinute(0);
      toast.success(`Advanced to Q${updated.currentQuarter}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Scoreboard */}
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
          </div>
          <div className="text-center px-4">
            <div className="font-black text-4xl text-red-400">
              {match.homeScore} — {match.awayScore}
            </div>
            {/* Quarter dots */}
            <div className="flex justify-center gap-1.5 mt-2">
              {[1, 2, 3, 4].map((q) => (
                <div
                  key={q}
                  className={`w-4 h-1.5 rounded-full ${q <= match.currentQuarter ? "bg-orange-500" : "bg-gray-700"}`}
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
          </div>
        </div>
      </div>

      {/* Minute tracker */}
      <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
        <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
          Q{match.currentQuarter} Minute:
        </label>
        <input
          type="number"
          min={0}
          max={10}
          value={currentMinute}
          onChange={(e) => setCurrentMinute(Number(e.target.value))}
          className="w-16 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm text-center"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={nextQuarter}
          className="ml-auto"
        >
          Next Quarter →
        </Button>
      </div>

      {/* Score entry panels */}
      <div className="grid grid-cols-2 gap-3">
        {/* HOME */}
        <ScoreSide
          label={match.homeTeam.name}
          color={match.homeTeam.color}
          players={homePlayers}
          selectedPlayer={selectedPlayerHome}
          onSelectPlayer={setSelectedPlayerHome}
          onScore={(pts: number, type: any) => addScore("home", pts, type)}
          onFoul={(type: any) => addFoul("home", type)}
          loading={loading}
          side="home"
          fouls={
            match.playerStats
              ?.filter((s) => s.teamId === match.homeTeamId)
              .reduce((a, s) => a + s.fouls, 0) || 0
          }
        />
        {/* AWAY */}
        <ScoreSide
          label={match.awayTeam.name}
          color={match.awayTeam.color}
          players={awayPlayers}
          selectedPlayer={selectedPlayerAway}
          onSelectPlayer={setSelectedPlayerAway}
          onScore={(pts: number, type: any) => addScore("away", pts, type)}
          onFoul={(type: any) => addFoul("away", type)}
          loading={loading}
          side="away"
          fouls={
            match.playerStats
              ?.filter((s) => s.teamId === match.awayTeamId)
              .reduce((a, s) => a + s.fouls, 0) || 0
          }
        />
      </div>
    </div>
  );
}

function ScoreSide({
  label,
  color,
  players,
  selectedPlayer,
  onSelectPlayer,
  onScore,
  onFoul,
  loading,
  side,
  fouls,
}: any) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="font-bold text-white text-xs truncate">{label}</span>
        <span className="ml-auto text-gray-500 text-xs">{fouls} fouls</span>
      </div>

      {/* Player select */}
      <select
        value={selectedPlayer}
        onChange={(e) => onSelectPlayer(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-xs"
      >
        <option value="">— Select Player —</option>
        {players.map(
          (p: any) =>
            p && (
              <option key={p.id} value={p.id}>
                #{p.jerseyNumber} {p.name}
              </option>
            ),
        )}
      </select>

      {/* Score buttons */}
      <div className="space-y-1">
        {[
          { label: "Free Throw", pts: 1, type: "FREE_THROW" },
          { label: "2-Pointer", pts: 2, type: "TWO_POINTER" },
          { label: "3-Pointer", pts: 3, type: "THREE_POINTER" },
        ].map(({ label: btnLabel, pts, type }) => (
          <button
            key={type}
            onClick={() => onScore(pts, type)}
            disabled={!!loading}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-orange-500/20 hover:border-orange-500/50 border border-gray-700 rounded-lg text-xs font-medium text-gray-200 transition-colors disabled:opacity-50"
          >
            <span>{btnLabel}</span>
            <span className="font-black text-orange-400">+{pts}</span>
          </button>
        ))}
        <button
          onClick={() => onFoul("FOUL")}
          disabled={!!loading || !selectedPlayer}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-red-500/20 hover:border-red-500/50 border border-gray-700 rounded-lg text-xs font-medium text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Personal Foul</span>
          <span>⚠</span>
        </button>
        <button
          onClick={() => onFoul("TECHNICAL_FOUL")}
          disabled={!!loading || !selectedPlayer}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-red-500/20 hover:border-red-500/50 border border-gray-700 rounded-lg text-xs font-medium text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Technical Foul</span>
          <span>⛔</span>
        </button>
      </div>
    </div>
  );
}
