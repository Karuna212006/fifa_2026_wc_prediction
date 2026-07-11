/**
 * useWorldCup2026Data — Auto-updating data hook for tournament state
 * ===================================================================
 * 
 * Uses TanStack Query with adaptive refetch:
 *   - 30s when live matches exist (real-time feel)
 *   - 5min when all matches are scheduled/finished (saves resources)
 * 
 * Exposes: { data, isLoading, isRefetching, error, hasLiveMatches,
 *            simulateGoal, finishMatch, resetData }
 * 
 * @example
 *   const { data, isRefetching, hasLiveMatches, simulateGoal } = useWorldCup2026Data();
 *   // data.bracket — BracketMatch[]
 *   // data.statLeaders — StatPlayer[]
 *   // data.meta — { lastUpdated, tournamentPhase, hasLiveMatches, ... }
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  fetchWorldCupData,
  simulateGoal as apiSimulateGoal,
  finishMatch as apiFinishMatch,
  resetMockData,
} from '../data/mockApi.js';

const QUERY_KEY = ['wc2026-tournament-data'];
const LIVE_REFETCH_MS = 30_000;    // 30 seconds during live matches
const IDLE_REFETCH_MS = 300_000;   // 5 minutes when no live matches

export function useWorldCup2026Data() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchWorldCupData,

    // Adaptive refetch: fast during live matches, slow otherwise
    refetchInterval: (query) => {
      const data = query.state?.data;
      if (!data?.meta) return IDLE_REFETCH_MS;
      return data.meta.hasLiveMatches ? LIVE_REFETCH_MS : IDLE_REFETCH_MS;
    },

    // Keep fetching even when the tab is backgrounded
    refetchIntervalInBackground: true,

    // Don't refetch on window focus (we have our own interval)
    refetchOnWindowFocus: false,

    // Keep previous data visible while refetching
    placeholderData: (prev) => prev,

    // Stale time matches our fastest refetch interval
    staleTime: LIVE_REFETCH_MS,
  });

  const hasLiveMatches = query.data?.meta?.hasLiveMatches ?? false;

  /**
   * DEV: Simulate a goal and immediately refetch data.
   * @param {string} matchId
   * @param {'teamA' | 'teamB'} team
   */
  const simulateGoal = useCallback((matchId, team) => {
    const result = apiSimulateGoal(matchId, team);
    if (result.success) {
      // Invalidate to trigger immediate refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }
    return result;
  }, [queryClient]);

  /**
   * DEV: Finish a live match and propagate winners.
   * @param {string} matchId
   */
  const finishMatch = useCallback((matchId) => {
    const result = apiFinishMatch(matchId);
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }
    return result;
  }, [queryClient]);

  /**
   * DEV: Reset all mock data to initial state.
   */
  const resetData = useCallback(() => {
    resetMockData();
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isFetching: query.isFetching,
    error: query.error,
    hasLiveMatches,
    simulateGoal,
    finishMatch,
    resetData,
  };
}
