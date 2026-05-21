"use client";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Team } from "@/types";
import toast from "react-hot-toast";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"];

export function AdminPlayerForm({
  teams,
  onSuccess,
}: {
  teams: Team[];
  onSuccess: () => void;
}) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: "",
    jerseyNumber: "",
    position: "PG",
    teamId: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || !form.jerseyNumber || !form.teamId) {
      toast.error("Fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await api.createPlayer(form, token!);
      toast.success("Player added!");
      setForm({ name: "", jerseyNumber: "", position: "PG", teamId: "" });
      onSuccess();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide block mb-1">
            Player Name *
          </label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide block mb-1">
            Jersey # *
          </label>
          <input
            type="number"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            placeholder="7"
            value={form.jerseyNumber}
            onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide block mb-1">
            Position *
          </label>
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide block mb-1">
            Team *
          </label>
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            value={form.teamId}
            onChange={(e) => setForm({ ...form, teamId: e.target.value })}
          >
            <option value="">— Select Team —</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button onClick={submit} disabled={loading} className="w-full">
        {loading ? "Adding..." : "Add Player"}
      </Button>
    </div>
  );
}
