"use client";
import { useState, useEffect, useCallback } from "react";
import { Match } from "@/types";
import { api } from "@/lib/api-client";

export function useLiveMatch(matchId: number | null) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatch = useCallback(async () => {
    if (!matchId) return;
    try {
      const data = await api.getMatch(matchId);
      setMatch(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatch();
    const interval = setInterval(fetchMatch, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchMatch]);

  return { match, loading, refetch: fetchMatch };
}
