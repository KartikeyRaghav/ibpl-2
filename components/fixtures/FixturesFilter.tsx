"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Team } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "● Live", value: "LIVE" },
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Finished", value: "FINISHED" },
];

interface Props {
  teams: Team[];
  currentStatus?: string;
  currentTeamId?: string;
}

export function FixturesFilter({ teams, currentStatus, currentTeamId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildUrl = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      return `/fixtures?${params.toString()}`;
    },
    [searchParams],
  );

  const navigate = (key: string, value: string) => {
    router.replace(buildUrl(key, value), { scroll: false });
  };

  const activeStatus = searchParams.get("status") ?? "";
  const activeTeam = searchParams.get("teamId") ?? "";

  return (
    <div className="space-y-3">
      {/* Status row */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide w-full sm:w-auto">
          Status
        </span>
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => navigate("status", value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
              activeStatus === value
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Team row */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide w-full sm:w-auto">
          Team
        </span>
        <button
          onClick={() => navigate("teamId", "")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
            !activeTeam
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white",
          )}
        >
          All Teams
        </button>
        {teams.map((t) => {
          const active = activeTeam === String(t.id);
          return (
            <button
              key={t.id}
              onClick={() => navigate("teamId", active ? "" : String(t.id))}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                active
                  ? "text-white border-transparent"
                  : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white",
              )}
              style={
                active ? { backgroundColor: t.color, borderColor: t.color } : {}
              }
            >
              <span className="hidden sm:inline">{t.name}</span>
              <span className="sm:hidden">{t.shortName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
