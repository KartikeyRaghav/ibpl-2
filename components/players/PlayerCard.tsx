import Link from "next/link";
import { getInitials } from "@/lib/utils";
import { PositionBadge } from "@/components/ui/Badge";

export function PlayerCard({ player }: { player: any }) {
  return (
    <Link href={`/players/${player.id}`} className="block group">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-orange-500/50 transition-all flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0"
          style={{ backgroundColor: player.team?.color }}
        >
          {getInitials(player.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm truncate group-hover:text-orange-400 transition-colors">
            {player.name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-gray-500 text-xs">
              #{player.jerseyNumber}
            </span>
            <PositionBadge position={player.position} />
            <span className="text-gray-600 text-xs truncate">
              · {player.team?.shortName}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-black text-xl text-orange-400">
            {player.totalPoints || 0}
          </div>
          <div className="text-gray-500 text-xs">
            {(player.ppg || 0).toFixed(1)} PPG
          </div>
        </div>
      </div>
    </Link>
  );
}
