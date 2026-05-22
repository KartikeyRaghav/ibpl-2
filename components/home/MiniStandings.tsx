import Link from "next/link";
import { TeamStanding } from "@/types";
import { cn } from "@/lib/utils";

const RANK_COLORS = [
  "text-yellow-400",
  "text-gray-400",
  "text-amber-700",
  "text-gray-600",
];

export function MiniStandings({ standings }: { standings: TeamStanding[] }) {
  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[20px_1fr_28px_28px_28px_40px_44px] gap-1.5 px-4 py-2 bg-gray-800/50 text-gray-500 text-xs font-semibold uppercase tracking-wide">
        <span>#</span>
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">L</span>
        <span className="text-center">PD</span>
        <span className="text-center">Pts</span>
      </div>

      {standings.map((s, i) => (
        <Link
          key={s.id}
          href={`/teams/${s.teamId}`}
          className={cn(
            "grid grid-cols-[20px_1fr_28px_28px_28px_40px_44px] gap-1.5 px-4 py-3 items-center border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors last:border-0 text-sm",
            i === 0 && "bg-yellow-500/5",
          )}
        >
          <span
            className={cn(
              "font-black text-sm",
              RANK_COLORS[i] ?? "text-gray-600",
            )}
          >
            {i + 1}
          </span>

          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: s.team?.color }}
            />
            <span className="font-semibold text-white truncate text-xs">
              {/* Abbreviate on tiny screens */}
              <span className="sm:hidden">{s.team?.name?.split(" ")[0]}</span>
              <span className="hidden sm:inline">{s.team?.name}</span>
            </span>
          </div>

          <span className="text-center text-gray-400 text-xs">
            {s.matchesPlayed}
          </span>
          <span className="text-center text-gray-400 text-xs">{s.wins}</span>
          <span className="text-center text-gray-400 text-xs">{s.losses}</span>
          <span
            className={cn(
              "text-center font-medium text-xs",
              s.pointDiff >= 0 ? "text-green-400" : "text-red-400",
            )}
          >
            {s.pointDiff > 0 ? "+" : ""}
            {s.pointDiff}
          </span>
          <div className="flex justify-center">
            <span className="bg-orange-500/20 text-orange-400 font-black text-xs px-2 py-0.5 rounded">
              {s.points}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
