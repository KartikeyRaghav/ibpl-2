"use client";
import { useState, useMemo } from "react";
import { Team } from "@/types";
import { PlayerCard } from "./PlayerCard";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { label: "Total Points", value: "totalPoints" },
  { label: "PPG", value: "ppg" },
  { label: "Name", value: "name" },
  { label: "Jersey #", value: "jerseyNumber" },
];

const POSITION_FILTERS = ["All", "PG", "SG", "SF", "PF", "C"];

export function PlayersClient({
  players,
  teams,
}: {
  players: any[];
  teams: Team[];
}) {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [posFilter, setPosFilter] = useState("All");
  const [sortBy, setSortBy] = useState("totalPoints");

  const filtered = useMemo(() => {
    let list = [...players];
    if (search)
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    if (teamFilter) list = list.filter((p) => p.teamId === teamFilter);
    if (posFilter !== "All")
      list = list.filter((p) => p.position === posFilter);
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "jerseyNumber") return a.jerseyNumber - b.jerseyNumber;
      return (b[sortBy] ?? 0) - (a[sortBy] ?? 0);
    });
    return list;
  }, [players, search, teamFilter, posFilter, sortBy]);

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        placeholder="Search players..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 mb-4 focus:outline-none focus:border-orange-500"
      />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-3">
        <button
          onClick={() => setTeamFilter("")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
            !teamFilter
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500",
          )}
        >
          All Teams
        </button>
        {teams.map((t) => (
          <button
            key={t.id}
            onClick={() =>
              setTeamFilter(teamFilter === String(t.id) ? "" : String(t.id))
            }
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
              teamFilter === String(t.id)
                ? "text-white border-transparent"
                : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500",
            )}
            style={
              teamFilter === String(t.id)
                ? { backgroundColor: t.color, borderColor: t.color }
                : {}
            }
          >
            {t.shortName}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {POSITION_FILTERS.map((pos) => (
          <button
            key={pos}
            onClick={() => setPosFilter(pos)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
              posFilter === pos
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500",
            )}
          >
            {pos}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-gray-600 text-xs">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-white text-xs"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-gray-600 text-xs mb-3">
        {filtered.length} players
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((p) => (
          <PlayerCard key={p.id} player={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-gray-600 text-center py-16 border border-gray-800 rounded-xl">
          No players match your search.
        </div>
      )}
    </div>
  );
}
