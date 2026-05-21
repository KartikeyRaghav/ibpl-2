import { cn } from "@/lib/utils";
import { MatchStatus } from "@/types";

export function StatusBadge({ status }: { status: MatchStatus }) {
  const map = {
    LIVE: "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse",
    FINISHED: "bg-gray-700/50 text-gray-400 border-gray-600",
    UPCOMING: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    CANCELLED: "bg-gray-700 text-gray-500 border-gray-600",
  };
  const labels = {
    LIVE: "● Live",
    FINISHED: "Final",
    UPCOMING: "Upcoming",
    CANCELLED: "Cancelled",
  };
  return (
    <span
      className={cn(
        "text-xs font-bold px-2 py-0.5 rounded-full border",
        map[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

export function TeamDot({
  color,
  shortName,
}: {
  color: string;
  shortName: string;
}) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0"
      style={{ backgroundColor: color }}
    >
      {shortName}
    </div>
  );
}

export function PositionBadge({ position }: { position: string }) {
  return (
    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-medium">
      {position}
    </span>
  );
}
