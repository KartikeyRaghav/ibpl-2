"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api-client";
import { Match, Team } from "@/types";
import { AdminMatchManager } from "./AdminMatchManager";
import { AdminPlayerForm } from "./AdminPlayerForm";
import { AdminTeamForm } from "./AdminTeamForm";
import { AdminPlayerRoster } from "./AdminPlayerRoster";
import { AdminScheduleForm } from "./AdminScheduleForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, Users, User, LogOut, PlusCircle, ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Tab = "overview" | "matches" | "schedule" | "teams" | "players";

export function AdminDashboard() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, played: 0, live: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [m, t, p] = await Promise.all([
        api.getMatches(),
        api.getTeams(),
        api.getPlayers(),
      ]);
      setMatches(m);
      setTeams(t);
      setPlayers(p);
      setStats({
        total: m.length,
        played: m.filter((x: Match) => x.status === "FINISHED").length,
        live: m.filter((x: Match) => x.status === "LIVE").length,
        upcoming: m.filter((x: Match) => x.status === "UPCOMING").length,
      });
    } catch (e: any) {
      toast.error("Failed to load data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
    toast.success("Logged out");
  };

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview",  icon: LayoutDashboard },
    { id: "matches",  label: "Matches",   icon: Calendar },
    { id: "schedule", label: "Schedule",  icon: PlusCircle },
    { id: "teams",    label: "Teams",     icon: Users },
    { id: "players",  label: "Players",   icon: User },
  ];

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-950">
      {/* Admin top bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-black">
            A
          </div>
          <div>
            <div className="text-white text-sm font-bold">{user?.name}</div>
            <div className="text-gray-500 text-xs">Administrator</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">
            ✓ JWT Active
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 text-sm transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab nav */}
        <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex-1 justify-center",
                tab === id
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading dashboard…" />
        ) : (
          <>
            {tab === "overview" && (
              <OverviewTab stats={stats} teams={teams} players={players} />
            )}
            {tab === "matches" && (
              <MatchesTab matches={matches} onRefresh={load} />
            )}
            {tab === "schedule" && (
              <ScheduleTab teams={teams} onSuccess={load} />
            )}
            {tab === "teams" && (
              <TeamsTab teams={teams} onSuccess={load} token={token!} />
            )}
            {tab === "players" && (
              <PlayersTab teams={teams} players={players} onSuccess={load} token={token!} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ stats, teams, players }: { stats: any; teams: Team[]; players: any[] }) {
  const topScorers = [...players]
    .sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Matches",    value: stats.total,    color: "text-white",        bg: "bg-gray-800/60"        },
          { label: "Completed",        value: stats.played,   color: "text-green-400",    bg: "bg-green-500/10"       },
          { label: "Live Now",         value: stats.live,     color: "text-red-400",      bg: "bg-red-500/10"         },
          { label: "Upcoming",         value: stats.upcoming, color: "text-orange-400",   bg: "bg-orange-500/10"      },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border border-gray-800 rounded-xl p-5`}>
            <div className={`font-black text-4xl ${color}`}>{value}</div>
            <div className="text-gray-500 text-xs uppercase tracking-wide mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teams summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" />
            Teams ({teams.length})
          </div>
          {teams.map((t: any) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/50 last:border-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: t.color }}>
                {t.shortName}
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold">{t.name}</div>
                <div className="text-gray-500 text-xs">{t.players?.length ?? 0} players · Coach: {t.coach ?? "TBD"}</div>
              </div>
              {t.standing && (
                <span className="bg-orange-500/20 text-orange-400 font-black text-sm px-2 py-0.5 rounded">
                  {t.standing.points} pts
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Top scorers */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 font-bold text-white text-sm flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-orange-400" />
            Top Scorers
          </div>
          {topScorers.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/50 last:border-0">
              <span className="font-black text-lg text-orange-500 w-5">{i + 1}</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: p.team?.color }}>
                {p.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold truncate">{p.name}</div>
                <div className="text-gray-500 text-xs">#{p.jerseyNumber} · {p.team?.shortName}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-white">{p.totalPoints ?? 0}</div>
                <div className="text-gray-600 text-xs">{(p.ppg ?? 0).toFixed(1)} PPG</div>
              </div>
            </div>
          ))}
          {topScorers.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-600 text-sm">No match data yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Matches tab ──────────────────────────────────────────────────────────────

function MatchesTab({ matches, onRefresh }: { matches: Match[]; onRefresh: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-white text-lg">Match Management</h2>
        <button onClick={onRefresh} className="text-orange-400 hover:text-orange-300 text-sm font-semibold">
          ↻ Refresh
        </button>
      </div>
      <AdminMatchManager initialMatches={matches} />
    </div>
  );
}

// ─── Schedule tab ─────────────────────────────────────────────────────────────

function ScheduleTab({ teams, onSuccess }: { teams: Team[]; onSuccess: () => void }) {
  return (
    <div className="max-w-lg">
      <h2 className="font-bold text-white text-lg mb-4">Schedule a Match</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <AdminScheduleForm teams={teams} onSuccess={onSuccess} />
      </div>
    </div>
  );
}

// ─── Teams tab ────────────────────────────────────────────────────────────────

function TeamsTab({ teams, onSuccess, token }: { teams: Team[]; onSuccess: () => void; token: string }) {
  const [adding, setAdding] = useState(false);
  const { token: authToken } = useAuth();

  const deleteTeam = async (id: string) => {
    if (!confirm("Delete this team? This cannot be undone.")) return;
    try {
      await api.deleteTeam(id, authToken!);
      toast.success("Team deleted");
      onSuccess();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white text-lg">Team Management</h2>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Team
        </button>
      </div>

      {adding && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-bold text-white text-sm mb-4">Create Team</h3>
          <AdminTeamForm onSuccess={() => { setAdding(false); onSuccess(); }} />
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {teams.map((t: any) => (
          <div key={t.id} className="flex items-center gap-4 px-4 py-4 border-b border-gray-800/50 last:border-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0" style={{ backgroundColor: t.color }}>
              {t.shortName}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm">{t.name}</div>
              <div className="text-gray-500 text-xs">
                {t.players?.length ?? 0} players ·  Coach: {t.coach ?? "TBD"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => deleteTeam(t.id)}
                className="text-gray-600 hover:text-red-400 text-xs px-3 py-1.5 border border-gray-700 hover:border-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {teams.length === 0 && (
          <div className="px-4 py-10 text-center text-gray-600 text-sm">
            No teams yet. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Players tab ──────────────────────────────────────────────────────────────

function PlayersTab({ teams, players, onSuccess, token }: { teams: Team[]; players: any[]; onSuccess: () => void; token: string }) {
  const [adding, setAdding] = useState(false);
  const [teamFilter, setTeamFilter] = useState("");
  const { token: authToken } = useAuth();

  const filtered = teamFilter ? players.filter((p) => p.teamId === teamFilter) : players;

  const removePlayer = async (id: string) => {
    if (!confirm("Remove this player? (soft delete — stats preserved)")) return;
    try {
      await api.deletePlayer(id, authToken!);
      toast.success("Player removed");
      onSuccess();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white text-lg">Player Management</h2>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Player
        </button>
      </div>

      {adding && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-bold text-white text-sm mb-4">Add New Player</h3>
          <AdminPlayerForm teams={teams} onSuccess={() => { setAdding(false); onSuccess(); }} />
        </div>
      )}

      {/* Filter by team */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTeamFilter("")}
          className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
            !teamFilter ? "bg-orange-500 text-white border-orange-500" : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500")}
        >
          All Teams
        </button>
        {teams.map((t) => (
          <button
            key={t.id}
            onClick={() => setTeamFilter(teamFilter === t.id ? "" : t.id)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
              teamFilter === t.id ? "text-white border-transparent" : "bg-gray-900 text-gray-400 border-gray-700")}
            style={teamFilter === t.id ? { backgroundColor: t.color, borderColor: t.color } : {}}
          >
            {t.shortName}
          </button>
        ))}
      </div>

      <AdminPlayerRoster players={filtered} teams={teams} onRemove={removePlayer} onSuccess={onSuccess} />
    </div>
  );
}
