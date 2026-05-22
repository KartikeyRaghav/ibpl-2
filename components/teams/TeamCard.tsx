import Link from "next/link";
import { Team } from "@/types";
import { getInitials } from "@/lib/utils";

export function TeamCard({ team }: { team: Team }) {
  const standing = team.standing;
  return (
    <Link href={`/teams/${team.id}`} className="block group h-full">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 hover:border-orange-500/50 transition-all h-full flex flex-col">
        {/* Logo */}
        <div
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl text-white mb-3 sm:mb-4 border-2 border-gray-700"
          style={{ backgroundColor: team.color }}
        >
          {getInitials(team.name)}
        </div>

        <div className="font-black text-white text-lg sm:text-xl group-hover:text-orange-400 transition-colors">
          {team.name}
        </div>
        <div className="text-gray-500 text-xs mb-3 sm:mb-4 mt-0.5">
          Coach: {team.coach ?? "TBD"} · {(team as any).players?.length ?? 0}{" "}
          players
        </div>

        {standing && (
          <div className="grid grid-cols-3 gap-2 mt-auto">
            <StatBox
              label="Wins"
              value={standing.wins}
              color="text-green-400"
            />
            <StatBox
              label="Pts For"
              value={standing.pointsFor}
              color="text-white"
            />
            <StatBox
              label="Pts"
              value={standing.points}
              color="text-orange-400"
            />
          </div>
        )}
      </div>
    </Link>
  );
}

function StatBox({
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
      <div className={`font-black text-base sm:text-lg ${color}`}>{value}</div>
      <div className="text-gray-600 text-xs">{label}</div>
    </div>
  );
}
