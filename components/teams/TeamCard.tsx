import Link from "next/link";
import { Team } from "@/types";
import { getInitials } from "@/lib/utils";

export function TeamCard({ team }: { team: Team }) {
  const standing = team.standing;
  return (
    <Link href={`/teams/${team.id}`} className="block group">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 transition-all h-full">
        {/* Logo */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white mb-4 border-2 border-gray-700"
          style={{ backgroundColor: team.color }}
        >
          {getInitials(team.name)}
        </div>
        <div className="font-black text-white text-xl group-hover:text-orange-400 transition-colors">
          {team.name}
        </div>
        <div className="text-gray-500 text-xs mb-4">
          Coach: {team.coach || "TBD"} · {team.players?.length || 0} players
        </div>
        {standing && (
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Wins" value={standing.wins} color="text-green-400" />
            <Stat
              label="Pts For"
              value={standing.pointsFor}
              color="text-white"
            />
            <Stat
              label="Table Pts"
              value={standing.points}
              color="text-orange-400"
            />
          </div>
        )}
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-gray-800/60 rounded-lg p-2 text-center">
      <div className={`font-black text-lg ${color}`}>{value}</div>
      <div className="text-gray-600 text-xs">{label}</div>
    </div>
  );
}
