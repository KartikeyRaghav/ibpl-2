import Link from "next/link";
import { Match } from "@/types";
import { StatusBadge, TeamDot } from "@/components/ui/Badge";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils";

export function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const isUpcoming = match.status === "UPCOMING";

  return (
    <Link href={`/fixtures/${match.id}`} className="block">
      <div
        className={[
          "border rounded-xl p-4 transition-all group",
          isLive
            ? "border-red-700/50 bg-red-950/10 hover:border-red-500/60"
            : "border-gray-800 bg-gray-900 hover:border-orange-500/50",
        ].join(" ")}
      >
        {/* Meta row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={match.status} />
            {isLive && (
              <span className="text-gray-500 text-xs">
                Q{match.currentQuarter}
              </span>
            )}
          </div>
          <div className="text-gray-600 text-xs">
            {isUpcoming
              ? formatDateTime(match.scheduledAt)
              : formatDate(match.scheduledAt)}
          </div>
        </div>

        {/* Teams & score */}
        <div className="flex items-center gap-3">
          {/* Home team */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TeamDot
              color={match.homeTeam.color}
              shortName={match.homeTeam.shortName}
            />
            <div className="min-w-0">
              <div className="font-bold text-white text-sm truncate">
                {match.homeTeam.name}
              </div>
              <div className="text-gray-500 text-xs">
                Home · Leg {match.leg}
              </div>
            </div>
          </div>

          {/* Score / Time */}
          <div className="text-center px-2 shrink-0">
            {isFinished || isLive ? (
              <div>
                <div
                  className={`font-black text-2xl ${
                    isLive ? "text-red-400" : "text-white"
                  }`}
                >
                  {match.homeScore} – {match.awayScore}
                </div>
                {isFinished && match.homeScore !== match.awayScore && (
                  <div className="text-xs text-gray-500">
                    {match.homeScore > match.awayScore
                      ? match.homeTeam.shortName
                      : match.awayTeam.shortName}{" "}
                    wins
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">
                <div className="text-lg font-bold">
                  {formatTime(match.scheduledAt)}
                </div>
                <div className="text-xs">{formatDate(match.scheduledAt)}</div>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <div className="text-right min-w-0">
              <div className="font-bold text-white text-sm truncate">
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

        {/* Venue */}
        <div className="mt-3 text-gray-600 text-xs flex items-center gap-1">
          📍 {match.venue}
          {isLive && (
            <span className="ml-auto text-red-400 text-xs font-bold animate-pulse">
              Live →
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
