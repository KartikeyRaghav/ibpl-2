import Link from "next/link";
import { TeamStanding } from "@/types";
import { cn } from "@/lib/utils";

const RANK_STYLES = [
  "text-yellow-400 after:content-['🥇']",
  "text-gray-400 after:content-['🥈']",
  "text-amber-700 after:content-['🥉']",
  "text-gray-600",
];

export function StandingsTable({ standings }: { standings: TeamStanding[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[28px_1fr_36px_36px_36px_60px_52px_52px] gap-2 px-4 py-3 bg-gray-800/60 text-gray-500 text-xs font-semibold uppercase tracking-wide border-b border-gray-800">
        <span>#</span>
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">L</span>
        <span className="text-center">PTS For</span>
        <span className="text-center">PD</span>
        <span className="text-center">Pts</span>
      </div>

      {standings.map((s, i) => (
        <Link
          key={s.id}
          href={`/teams/${s.teamId}`}
          className={cn(
            "grid grid-cols-[28px_1fr_36px_36px_36px_60px_52px_52px] gap-2 px-4 py-3.5 items-center border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors text-sm last:border-0",
            i === 0 && "bg-yellow-500/5",
          )}
        >
          <span
            className={cn(
              "font-black text-sm",
              RANK_STYLES[i] || "text-gray-600",
            )}
          >
            {i + 1}
          </span>
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-6 h-6 rounded-full shrink-0 border-2 border-gray-700"
              style={{ backgroundColor: s.team?.color }}
            />
            <span className="font-bold text-white truncate">
              {s.team?.name}
            </span>
          </div>
          <span className="text-center text-gray-400">{s.matchesPlayed}</span>
          <span className="text-center text-green-400 font-medium">
            {s.wins}
          </span>
          <span className="text-center text-red-400 font-medium">
            {s.losses}
          </span>
          <span className="text-center text-gray-300">{s.pointsFor}</span>
          <span
            className={cn(
              "text-center font-semibold text-xs",
              s.pointDiff >= 0 ? "text-green-400" : "text-red-400",
            )}
          >
            {s.pointDiff > 0 ? "+" : ""}
            {s.pointDiff}
          </span>
          <div className="flex justify-center">
            <span className="bg-orange-500/20 text-orange-400 font-black px-2.5 py-0.5 rounded text-sm">
              {s.points}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
