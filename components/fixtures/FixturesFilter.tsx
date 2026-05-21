"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Team } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "● Live", value: "LIVE" },
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Completed", value: "FINISHED" },
];

export function FixturesFilter({
  teams,
  currentStatus,
  currentTeamId,
}: {
  teams: Team[];
  currentStatus?: string;
  currentTeamId?: string;
}) {
  const router = useRouter();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/fixtures?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => updateParam("status", value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
              (currentStatus || "") === value
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => updateParam("teamId", "")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
            !currentTeamId
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500",
          )}
        >
          All Teams
        </button>
        {teams.map((t) => (
          <button
            key={t.id}
            onClick={() => updateParam("teamId", t.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1.5",
              currentTeamId === t.id
                ? "text-white border-transparent"
                : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500",
            )}
            style={
              currentTeamId === t.id
                ? { backgroundColor: t.color, borderColor: t.color }
                : {}
            }
          >
            {t.shortName}
          </button>
        ))}
      </div>
    </div>
  );
}
