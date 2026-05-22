async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...headers,
      ...((options?.headers as Record<string, string>) || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json.data ?? json;
}

export const api = {
  // Teams
  getTeams: () => apiFetch<any[]>("/teams"),
  getTeam: (id: number) => apiFetch<any>(`/teams/${id}`),
  createTeam: (data: any, token: string) =>
    apiFetch<any>(
      "/teams",
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),
  updateTeam: (id: number, data: any, token: string) =>
    apiFetch<any>(
      `/teams/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      token,
    ),
  deleteTeam: (id: number, token: string) =>
    apiFetch<any>(`/teams/${id}`, { method: "DELETE" }, token),

  // Players
  getPlayers: (params?: { teamId?: number; search?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<any[]>(`/players${qs ? `?${qs}` : ""}`);
  },
  getPlayer: (id: number) => apiFetch<any>(`/players/${id}`),
  createPlayer: (data: any, token: string) =>
    apiFetch<any>(
      "/players",
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),
  updatePlayer: (id: number, data: any, token: string) =>
    apiFetch<any>(
      `/players/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      token,
    ),
  deletePlayer: (id: number, token: string) =>
    apiFetch<any>(`/players/${id}`, { method: "DELETE" }, token),

  // Matches
  getMatches: (params?: { status?: string; teamId?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<any[]>(`/matches${qs ? `?${qs}` : ""}`);
  },
  getMatch: (id: number) => apiFetch<any>(`/matches/${id}`),
  createMatch: (data: any, token: string) =>
    apiFetch<any>(
      "/matches",
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),
  updateMatch: (id: number, data: any, token: string) =>
    apiFetch<any>(
      `/matches/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      token,
    ),
  startMatch: (id: number, token: string) =>
    apiFetch<any>(`/matches/${id}/start`, { method: "POST" }, token),
  addScore: (id: number, data: any, token: string) =>
    apiFetch<any>(
      `/matches/${id}/score`,
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),
  nextQuarter: (id: number, token: string) =>
    apiFetch<any>(`/matches/${id}/score`, { method: "PATCH" }, token),
  finishMatch: (id: number, data: any, token: string) =>
    apiFetch<any>(
      `/matches/${id}/finish`,
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),

  // Standings
  getStandings: () => apiFetch<any[]>("/standings"),

  // Auth
  login: (email: string, password: string) =>
    apiFetch<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};
