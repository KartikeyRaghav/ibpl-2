"use client";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export function AdminTeamForm({ onSuccess }: { onSuccess: () => void }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    color: "#F47B20",
    coach: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || !form.shortName) {
      toast.error("Name and short name are required");
      return;
    }
    setLoading(true);
    try {
      await api.createTeam(form, token!);
      toast.success("Team created!");
      setForm({ name: "", shortName: "", color: "#F47B20", coach: "" });
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
            Team Name *
          </label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            placeholder="Thunder Ballers"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide block mb-1">
            Short Name * (2-3 chars)
          </label>
          <input
            maxLength={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            placeholder="TB"
            value={form.shortName}
            onChange={(e) =>
              setForm({ ...form, shortName: e.target.value.toUpperCase() })
            }
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide block mb-1">
            Team Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-10 h-9 rounded cursor-pointer bg-gray-800 border border-gray-700"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
            <input
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide block mb-1">
            Coach
          </label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            placeholder="Prof. Name"
            value={form.coach}
            onChange={(e) => setForm({ ...form, coach: e.target.value })}
          />
        </div>
      </div>
      <Button onClick={submit} disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Team"}
      </Button>
    </div>
  );
}
