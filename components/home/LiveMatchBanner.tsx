"use client";
import Link from "next/link";
import { Match } from "@/types";
import { TeamDot } from "@/components/ui/Badge";

export function LiveMatchBanner({ match }: { match: Match }) {
  return (
    <Link href={`/fixtures/${match.id}`} className="block">
      <div className="bg-linear-to-r from-red-950/50 via-gray-900 to-red-950/50 border border-red-800/50 rounded-xl p-4 hover:border-red-600/50 transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 bg-red-400 rounded-full" />
            LIVE NOW
          </span>
          <span className="text-gray-600 text-xs">
            Q{match.currentQuarter} · {match.venue}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <TeamDot
              color={match.homeTeam.color}
              shortName={match.homeTeam.shortName}
            />
            <div>
              <div className="font-bold text-white text-sm">
                {match.homeTeam.name}
              </div>
              <div className="text-gray-500 text-xs">Home</div>
            </div>
          </div>
          <div className="text-center">
            <div className="font-black text-3xl text-white">
              <span className="text-orange-400">{match.homeScore}</span>
              <span className="text-gray-600 mx-2">—</span>
              <span className="text-orange-400">{match.awayScore}</span>
            </div>
            <div className="text-red-400 text-xs font-bold">
              Quarter {match.currentQuarter}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="text-right">
              <div className="font-bold text-white text-sm">
                {match.awayTeam.name}
              </div>
              <div className="text-gray-500 text-xs">Away</div>
            </div>
            <TeamDot
              color={match.awayTeam.color}
              shortName={match.awayTeam.shortName}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
