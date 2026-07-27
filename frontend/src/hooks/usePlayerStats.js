import { useQuery } from '@tanstack/react-query';
import { fetchPlayerStats, fetchTopScorers, fetchTopAssists, fetchTopCards, fetchCleanSheets } from '../services/footballApi';

const tournamentId = import.meta.env.VITE_TOURNAMENT_ID || '1'; // 1 is default World Cup ID in API-Football

export const usePlayerStats = (autoRefresh = true) => {
  return useQuery({
    queryKey: ['playerStats', tournamentId],
    queryFn: () => fetchPlayerStats(2026, tournamentId),
    refetchInterval: autoRefresh ? 60000 : false, // Auto-refresh every 60 seconds
    refetchIntervalInBackground: true,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 3,
    retryDelay: 1000,
  });
};

export const useTopScorers = () => {
  return useQuery({
    queryKey: ['topScorers', tournamentId],
    queryFn: () => fetchTopScorers(2026, tournamentId),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    retry: 3,
  });
};

export const useTopAssists = () => {
  return useQuery({
    queryKey: ['topAssists', tournamentId],
    queryFn: () => fetchTopAssists(2026, tournamentId),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    retry: 3,
  });
};

export const useTopCards = (cardType = 'yellow') => {
  return useQuery({
    queryKey: ['topCards', tournamentId, cardType],
    queryFn: () => fetchTopCards(2026, cardType, tournamentId),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    retry: 3,
  });
};

export const useCleanSheets = () => {
  return useQuery({
    queryKey: ['cleanSheets', tournamentId],
    queryFn: () => fetchCleanSheets(2026, tournamentId),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    retry: 3,
  });
};
