import Link from "next/link";
import { TeamStanding } from "@/types";
import { cn } from "@/lib/utils";

const RANK_COLORS = [
  "text-yellow-400",
  "text-gray-400",
  "text-amber-700",
  "text-gray-600",
];

export function StandingsTable({ standings }: { standings: TeamStanding[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Desktop header */}
      <div className="hidden sm:grid grid-cols-[28px_1fr_36px_36px_36px_60px_52px_52px] gap-2 px-4 py-3 bg-gray-800/60 text-gray-500 text-xs font-semibold uppercase tracking-wide border-b border-gray-800">
        <span>#</span>
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">L</span>
        <span className="text-center">PTS For</span>
        <span className="text-center">PD</span>
        <span className="text-center">Pts</span>
      </div>

      {/* Mobile header */}
      <div className="sm:hidden grid grid-cols-[20px_1fr_28px_40px] gap-2 px-3 py-2 bg-gray-800/60 text-gray-500 text-xs font-semibold uppercase tracking-wide border-b border-gray-800">
        <span>#</span>
        <span>Team</span>
        <span className="text-center">W-L</span>
        <span className="text-center">Pts</span>
      </div>

      {standings.map((s, i) => (
        <Link
          key={s.id}
          href={`/teams/${s.teamId}`}
          className={cn(
            "flex sm:grid sm:grid-cols-[28px_1fr_36px_36px_36px_60px_52px_52px] gap-2 px-3 sm:px-4 py-3 sm:py-3.5 items-center border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors last:border-0",
            i === 0 && "bg-yellow-500/5",
          )}
        >
          {/* Rank */}
          <span
            className={cn(
              "font-black text-sm w-5 sm:w-auto shrink-0",
              RANK_COLORS[i] ?? "text-gray-600",
            )}
          >
            {i + 1}
          </span>

          {/* Team name */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full shrink-0 border-2 border-gray-700"
              style={{ backgroundColor: s.team?.color }}
            />
            <span className="font-bold text-white truncate text-xs sm:text-sm">
              {/* Show short name on mobile */}
              <span className="sm:hidden">{s.team?.name?.split(" ")[0]}</span>
              <span className="hidden sm:inline">{s.team?.name}</span>
            </span>
          </div>

          {/* Mobile: W-L combined */}
          <span className="sm:hidden text-center text-xs text-gray-400">
            {s.wins}–{s.losses}
          </span>

          {/* Desktop: P W L PtsFor PD */}
          <span className="hidden sm:block text-center text-gray-400 text-sm">
            {s.matchesPlayed}
          </span>
          <span className="hidden sm:block text-center text-green-400 font-medium text-sm">
            {s.wins}
          </span>
          <span className="hidden sm:block text-center text-red-400 font-medium text-sm">
            {s.losses}
          </span>
          <span className="hidden sm:block text-center text-gray-300 text-sm">
            {s.pointsFor}
          </span>
          <span
            className={cn(
              "hidden sm:block text-center font-semibold text-xs",
              s.pointDiff >= 0 ? "text-green-400" : "text-red-400",
            )}
          >
            {s.pointDiff > 0 ? "+" : ""}
            {s.pointDiff}
          </span>

          {/* Table points — always visible */}
          <div className="flex justify-end sm:justify-center shrink-0">
            <span className="bg-orange-500/20 text-orange-400 font-black px-2 py-0.5 rounded text-xs sm:text-sm">
              {s.points}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
