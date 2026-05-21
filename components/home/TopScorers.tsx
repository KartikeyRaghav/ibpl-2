import Link from "next/link";
import { getInitials } from "@/lib/utils";

export function TopScorers({ players }: { players: any[] }) {
  return (
    <div className="space-y-2">
      {players.slice(0, 5).map((p, i) => (
        <Link
          key={p.id}
          href={`/players/${p.id}`}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
        >
          <span className="font-black text-xl text-orange-500 w-6 shrink-0">
            {i + 1}
          </span>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0"
            style={{ backgroundColor: p.team?.color }}
          >
            {getInitials(p.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm truncate group-hover:text-orange-400 transition-colors">
              {p.name}
            </div>
            <div className="text-gray-500 text-xs">
              {p.team?.shortName} · #{p.jerseyNumber} · {p.position}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-black text-lg text-white">{p.totalPoints}</div>
            <div className="text-gray-500 text-xs">{p.ppg.toFixed(1)} PPG</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
