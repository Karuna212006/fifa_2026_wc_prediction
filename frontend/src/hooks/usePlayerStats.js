import { useQuery } from '@tanstack/react-query';
import { fetchPlayerStats, fetchTopScorers, fetchTopAssists, fetchTopCards, fetchCleanSheets } from '../services/footballApi';

const tournamentId = import.meta.env.VITE_TOURNAMENT_ID || '2000'; // 2000 is default World Cup ID in football-data.org

export const usePlayerStats = (autoRefresh = true) => {
  return useQuery({
    queryKey: ['playerStats', tournamentId],
    queryFn: () => fetchPlayerStats(tournamentId),
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
    queryFn: () => fetchTopScorers(tournamentId),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    retry: 3,
  });
};

export const useTopAssists = () => {
  return useQuery({
    queryKey: ['topAssists', tournamentId],
    queryFn: () => fetchTopAssists(tournamentId),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    retry: 3,
  });
};

export const useTopCards = (cardType = 'yellow') => {
  return useQuery({
    queryKey: ['topCards', tournamentId, cardType],
    queryFn: () => fetchTopCards(tournamentId, cardType),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    retry: 3,
  });
};

export const useCleanSheets = () => {
  return useQuery({
    queryKey: ['cleanSheets', tournamentId],
    queryFn: () => fetchCleanSheets(tournamentId),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    retry: 3,
  });
};
