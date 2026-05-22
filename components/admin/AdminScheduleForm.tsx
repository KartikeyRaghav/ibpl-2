"use client";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Team } from "@/types";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export function AdminScheduleForm({
  teams,
  onSuccess,
}: {
  teams: Team[];
  onSuccess: () => void;
}) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    homeTeamId: "",
    awayTeamId: "",
    scheduledAt: "",
    venue: "IIT Indore Sports Complex",
    leg: "1",
    matchNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    if (
      !form.homeTeamId ||
      !form.awayTeamId ||
      !form.scheduledAt ||
      !form.matchNumber
    ) {
      toast.error("Fill all required fields");
      return;
    }
    if (form.homeTeamId === form.awayTeamId) {
      toast.error("Home and away teams must be different");
      return;
    }
    setLoading(true);
    try {
      await api.createMatch(
        {
          homeTeamId: form.homeTeamId,
          awayTeamId: form.awayTeamId,
          scheduledAt: form.scheduledAt,
          venue: form.venue,
          leg: Number(form.leg),
          matchNumber: Number(form.matchNumber),
        },
        token!,
      );
      toast.success("Match scheduled!");
      setForm({
        homeTeamId: "",
        awayTeamId: "",
        scheduledAt: "",
        venue: "IIT Indore Sports Complex",
        leg: "1",
        matchNumber: "",
      });
      onSuccess();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to schedule match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Match number */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Match Number *
          </label>
          <input
            type="number"
            placeholder="e.g. 7"
            value={form.matchNumber}
            onChange={(e) => set("matchNumber", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Leg */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Leg
          </label>
          <select
            value={form.leg}
            onChange={(e) => set("leg", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="1">Leg 1 (First)</option>
            <option value="2">Leg 2 (Return)</option>
          </select>
        </div>

        {/* Home team */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Home Team *
          </label>
          <select
            value={form.homeTeamId}
            onChange={(e) => set("homeTeamId", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="">— Select Home Team —</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Away team */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Away Team *
          </label>
          <select
            value={form.awayTeamId}
            onChange={(e) => set("awayTeamId", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="">— Select Away Team —</option>
            {teams
              .filter((t) => String(t.id) !== form.homeTeamId)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
        </div>

        {/* Date/time */}
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Date & Time *
          </label>
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => set("scheduledAt", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Venue */}
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Venue
          </label>
          <input
            type="text"
            value={form.venue}
            onChange={(e) => set("venue", e.target.value)}
            placeholder="IIT Indore Sports Complex"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Preview */}
      {form.homeTeamId && form.awayTeamId && (
        <div className="flex items-center gap-3 bg-gray-800/60 rounded-xl p-3 text-sm">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs"
            style={{
              backgroundColor: teams.find((t) => String(t.id) === form.homeTeamId)
                ?.color,
            }}
          >
            {teams.find((t) => String(t.id) === form.homeTeamId)?.shortName}
          </div>
          <span className="text-gray-400 font-semibold">vs</span>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs"
            style={{
              backgroundColor: teams.find((t) => String(t.id) === form.awayTeamId)
                ?.color,
            }}
          >
            {teams.find((t) => String(t.id) === form.awayTeamId)?.shortName}
          </div>
          <span className="text-gray-500 text-xs ml-auto">
            M{form.matchNumber} · Leg {form.leg}
          </span>
        </div>
      )}

      <Button onClick={submit} disabled={loading} className="w-full" size="lg">
        {loading ? "Scheduling…" : "Schedule Match"}
      </Button>
    </div>
  );
}
