"use client";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Team } from "@/types";
import { Button } from "@/components/ui/Button";
import { PositionBadge } from "@/components/ui/Badge";
import { getInitials, POSITION_LABELS } from "@/lib/utils";
import toast from "react-hot-toast";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;

export function AdminPlayerRoster({
  players,
  teams,
  onRemove,
  onSuccess,
}: {
  players: any[];
  teams: Team[];
  onRemove: (id: string) => void;
  onSuccess: () => void;
}) {
  const { token } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      jerseyNumber: p.jerseyNumber,
      position: p.position,
      teamId: p.teamId,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      await api.updatePlayer(id, editForm, token!);
      toast.success("Player updated");
      setEditingId(null);
      onSuccess();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (players.length === 0) {
    return (
      <div className="text-gray-600 text-sm text-center py-12 border border-gray-800 rounded-xl">
        No players found.
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800/60">
              {["#", "Player", "Position", "Team", "GP", "PTS", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className={[
                      "px-4 py-3 text-gray-500 font-semibold text-xs uppercase",
                      ["Player", "#", "Position", "Team"].includes(h)
                        ? "text-left"
                        : "text-center",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              const isEditing = editingId === p.id;
              const teamColor =
                teams.find((t) => t.id === p.teamId)?.color ?? "#888";

              return (
                <tr
                  key={p.id}
                  className="border-t border-gray-800 hover:bg-gray-800/20 transition-colors"
                >
                  {/* Jersey # */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.jerseyNumber}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            jerseyNumber: e.target.value,
                          })
                        }
                        className="w-14 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    ) : (
                      <span className="font-bold text-gray-400">
                        #{p.jerseyNumber}
                      </span>
                    )}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                          style={{ backgroundColor: teamColor }}
                        >
                          {getInitials(p.name)}
                        </div>
                        <span className="font-semibold text-white">
                          {p.name}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Position */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        value={editForm.position}
                        onChange={(e) =>
                          setEditForm({ ...editForm, position: e.target.value })
                        }
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      >
                        {POSITIONS.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <PositionBadge position={p.position} />
                    )}
                  </td>

                  {/* Team */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        value={editForm.teamId}
                        onChange={(e) =>
                          setEditForm({ ...editForm, teamId: e.target.value })
                        }
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      >
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.shortName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: teamColor + "30",
                          color: teamColor,
                        }}
                      >
                        {p.team?.shortName}
                      </span>
                    )}
                  </td>

                  {/* GP */}
                  <td className="px-4 py-3 text-center text-gray-400 text-xs">
                    {p.matchesPlayed ?? 0}
                  </td>

                  {/* PTS */}
                  <td className="px-4 py-3 text-center font-black text-orange-400">
                    {p.totalPoints ?? 0}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-center">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => saveEdit(p.id)}
                            disabled={saving}
                          >
                            {saving ? "…" : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(p)}
                            className="text-gray-500 hover:text-white text-xs px-2.5 py-1 border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onRemove(p.id)}
                            className="text-gray-600 hover:text-red-400 text-xs px-2.5 py-1 border border-gray-700 hover:border-red-700 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
