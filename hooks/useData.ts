"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Team, Player, Match, TeamStanding } from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
};

// ─── Teams ────────────────────────────────────────────────────────────────────
export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => fetcher("/api/teams"),
    staleTime: 30_000,
  });
}

export function useTeam(id: string) {
  return useQuery<Team>({
    queryKey: ["teams", id],
    queryFn: () => fetcher(`/api/teams/${id}`),
    enabled: !!id,
  });
}

// ─── Players ──────────────────────────────────────────────────────────────────
export function usePlayers(params?: { teamId?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.teamId) qs.set("teamId", params.teamId);
  if (params?.search) qs.set("search", params.search);
  return useQuery<Player[]>({
    queryKey: ["players", params],
    queryFn: () => fetcher(`/api/players?${qs}`),
    staleTime: 30_000,
  });
}

export function usePlayer(id: string) {
  return useQuery<Player>({
    queryKey: ["players", id],
    queryFn: () => fetcher(`/api/players/${id}`),
    enabled: !!id,
  });
}

// ─── Matches ──────────────────────────────────────────────────────────────────
export function useMatches(params?: { status?: string; teamId?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.teamId) qs.set("teamId", params.teamId);
  return useQuery<Match[]>({
    queryKey: ["matches", params],
    queryFn: () => fetcher(`/api/matches?${qs}`),
    staleTime: 10_000,
  });
}

export function useMatch(id: string) {
  return useQuery<Match>({
    queryKey: ["matches", id],
    queryFn: () => fetcher(`/api/matches/${id}`),
    enabled: !!id,
  });
}

// ─── Live match (polls every 3 seconds) ──────────────────────────────────────
export function useLiveMatch(matchId: string | null) {
  return useQuery<Match>({
    queryKey: ["live", matchId],
    queryFn: () => fetcher(`/api/live/${matchId}`),
    enabled: !!matchId,
    refetchInterval: 3000, // Poll every 3s
    staleTime: 0,
  });
}

// ─── Standings ────────────────────────────────────────────────────────────────
export function useStandings() {
  return useQuery<TeamStanding[]>({
    queryKey: ["standings"],
    queryFn: () => fetcher("/api/standings"),
    staleTime: 15_000,
  });
}

// ─── Admin mutations ──────────────────────────────────────────────────────────

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Team>) => {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return (await res.json()).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Team> & { id: string }) => {
      const res = await fetch(`/api/teams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return (await res.json()).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/teams/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useCreatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Player> & { teamId: string }) => {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return (await res.json()).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useUpdatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Player> & { id: string }) => {
      const res = await fetch(`/api/players/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return (await res.json()).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useCreateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Match> & { scheduledAt: string }) => {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return (await res.json()).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });
}

export function useUpdateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return (await res.json()).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["standings"] });
    },
  });
}

export function useDeleteMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/matches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });
}

export function useLiveScoreUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { matchId, ...rest } = payload;
      const res = await fetch(`/api/live/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return (await res.json()).data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["live", variables.matchId] });
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
