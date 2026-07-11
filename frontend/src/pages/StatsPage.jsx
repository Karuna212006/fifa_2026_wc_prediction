import React, { useState } from 'react';
import { useTopScorers, useTopAssists, useTopCards, useCleanSheets } from '../hooks/usePlayerStats';
import PlayerStatCard from '../components/PlayerStatCard';
import { fallbackStats } from '../data/fallbackPlayerStats';

const StatsPage = () => {
  const [activeTab, setActiveTab] = useState('topScorers');
  const [showMore, setShowMore] = useState(false);

  // Fetch data based on active tab - ALL AUTO-REFRESHING
  const { data: scorers, isLoading: loadingScorers, isError: errorScorers, error: errScorers, refetch: refetchScorers, dataUpdatedAt: updatedScorers } = useTopScorers();
  const { data: assists, isLoading: loadingAssists, isError: errorAssists, error: errAssists, refetch: refetchAssists, dataUpdatedAt: updatedAssists } = useTopAssists();
  const { data: yellowCards, isLoading: loadingYellow, isError: errorYellow, error: errYellow, refetch: refetchYellow, dataUpdatedAt: updatedYellow } = useTopCards('yellow');
  const { data: redCards, isLoading: loadingRed, isError: errorRed, error: errRed, refetch: refetchRed, dataUpdatedAt: updatedRed } = useTopCards('red');
  const { data: cleanSheets, isLoading: loadingClean, isError: errorClean, error: errClean, refetch: refetchClean, dataUpdatedAt: updatedClean } = useCleanSheets();

  // Get data for active tab
  const getDataForTab = () => {
    switch(activeTab) {
      case 'topScorers':  return { data: scorers, isLoading: loadingScorers, isError: errorScorers, error: errScorers, refetch: refetchScorers, updatedAt: updatedScorers };
      case 'assists':     return { data: assists, isLoading: loadingAssists, isError: errorAssists, error: errAssists, refetch: refetchAssists, updatedAt: updatedAssists };
      case 'yellowCards': return { data: yellowCards, isLoading: loadingYellow, isError: errorYellow, error: errYellow, refetch: refetchYellow, updatedAt: updatedYellow };
      case 'redCards':    return { data: redCards, isLoading: loadingRed, isError: errorRed, error: errRed, refetch: refetchRed, updatedAt: updatedRed };
      case 'cleanSheets': return { data: cleanSheets, isLoading: loadingClean, isError: errorClean, error: errClean, refetch: refetchClean, updatedAt: updatedClean };
      default:            return { data: null, isLoading: false, isError: false, error: null, refetch: () => {}, updatedAt: 0 };
    }
  };

  const { data: apiData, isLoading, isError, error, refetch, updatedAt } = getDataForTab();
  
  // Use API data if available and not empty, otherwise use fallback
  const hasApiData = apiData && apiData.length > 0;
  const players = hasApiData ? apiData : fallbackStats[activeTab] || [];
  
  // Filter out players with 0/null stats
  const filteredPlayers = players.filter(player => {
    const statKey = activeTab === 'topScorers' ? 'goals' :
                    activeTab === 'assists' ? 'assists' :
                    activeTab === 'yellowCards' ? 'yellowCards' :
                    activeTab === 'redCards' ? 'redCards' : 'cleanSheets';
    return player[statKey] > 0;
  });

  const displayCount = showMore ? filteredPlayers.length : 10;
  const displayedPlayers = filteredPlayers.slice(0, displayCount);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Tournament Statistics</h1>
        <div className="flex items-center gap-3">
          {isError && (
            <span className="text-xs text-orange-600 bg-orange-100 px-3 py-1.5 rounded-full font-bold shadow-sm border border-orange-200">
              ⚠ Using cached data
            </span>
          )}
          {!isError && hasApiData && (
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Live</span>
            </div>
          )}
          <span className="text-xs text-gray-500 font-medium">
            Updated: {updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Error Banner - Shows but doesn't block the page */}
      {isError && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="text-orange-800 font-bold text-lg mb-1">Live data unavailable</p>
            <p className="text-orange-700 text-sm">
              Showing fallback data. Please verify your API key in the .env file.
            </p>
            <p className="text-orange-600 text-xs mt-1 font-mono bg-orange-100 p-1 rounded inline-block">
              Error: {error?.message}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition shadow-sm w-full sm:w-auto flex-shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {['topScorers', 'assists', 'yellowCards', 'redCards', 'cleanSheets'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setShowMore(false); }}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all shadow-sm ${
              activeTab === tab
                ? 'bg-[#003366] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab === 'topScorers' ? 'Top Scorers' :
             tab === 'assists' ? 'Assists' :
             tab === 'yellowCards' ? 'Yellow Cards' :
             tab === 'redCards' ? 'Red Cards' : 'Clean Sheets'}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && !hasApiData && !isError ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#003366]"></div>
        </div>
      ) : displayedPlayers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
          <p className="text-gray-500 font-medium text-lg">No stats available yet</p>
          <p className="text-sm text-gray-400 mt-1">Stats will appear once tournament matches begin</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {displayedPlayers.map((player, index) => (
              <PlayerStatCard
                key={player.id || index}
                player={player}
                rank={index + 1}
                statType={activeTab}
              />
            ))}
          </div>
          
          {/* Show More Button */}
          {filteredPlayers.length > 10 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowMore(!showMore)}
                className="px-8 py-3 border-2 border-[#003366] text-[#003366] bg-transparent rounded-full font-bold hover:bg-[#003366] hover:text-white transition-colors duration-200"
              >
                {showMore ? 'Show Less' : `Show All (${filteredPlayers.length} players)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatsPage;
