const API_BASE_URL = '/api/football/v4';
const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;

// Fetch tournament player stats
export const fetchPlayerStats = async (tournamentId) => {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('API key is missing or invalid. Please add a valid VITE_FOOTBALL_API_KEY to your .env file.');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/competitions/${tournamentId}/scorers`,
      {
        headers: {
          'X-Auth-Token': API_KEY,
        },
      }
    );
    if (!response.ok) throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);

    const data = await response.json();
    return transformPlayerData(data);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Transform API data to our format
const transformPlayerData = (apiData) => {
  if (!apiData || !apiData.scorers) return [];
  
  return apiData.scorers.map((player) => ({
    id: player.player.id,
    name: player.player.name,
    countryCode: player.player.nationality?.substring(0, 2).toLowerCase() || 'xx',
    country: player.player.nationality,
    team: player.team?.name || 'Unknown Team',
    position: player.player.position,
    goals: player.goals || player.numberOfGoals || 0,
    assists: player.assists || player.numberOfAssists || 0,
    yellowCards: player.yellowCards || player.numberOfYellowCards || 0,
    redCards: player.redCards || player.numberOfRedCards || 0,
    cleanSheets: player.cleanSheets || player.numberOfCleanSheets || 0,
    matchesPlayed: player.playedMatches || player.numberOfMatches || 0,
    photo: player.player.dateOfBirth
      ? `https://crests.football-data.org/player${player.player.id}.png`
      : null,
  }));
};

// Fetch top scorers
export const fetchTopScorers = async (tournamentId) => {
  const data = await fetchPlayerStats(tournamentId);
  return data.sort((a, b) => b.goals - a.goals);
};

// Fetch top assists
export const fetchTopAssists = async (tournamentId) => {
  const data = await fetchPlayerStats(tournamentId);
  return data
    .filter((player) => player.assists > 0)
    .sort((a, b) => b.assists - a.assists);
};

// Fetch cards (yellow + red)
export const fetchTopCards = async (tournamentId, cardType = 'yellow') => {
  const data = await fetchPlayerStats(tournamentId);
  const field = cardType === 'yellow' ? 'yellowCards' : 'redCards';
  return data
    .filter((player) => player[field] > 0)
    .sort((a, b) => b[field] - a[field]);
};

// Fetch clean sheets (goalkeepers)
export const fetchCleanSheets = async (tournamentId) => {
  // Normally there is no explicit /goalkeepers endpoint in the free tier of football-data.org,
  // but if the user requested it:
  try {
    const response = await fetch(
      `${API_BASE_URL}/competitions/${tournamentId}/teams`, 
      {
        headers: { 'X-Auth-Token': API_KEY },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch teams/goalkeepers');
    
    // As a fallback to the scorers endpoint to keep it functional in case /goalkeepers doesn't exist
    const data = await fetchPlayerStats(tournamentId);
    return data
      .filter((player) => player.cleanSheets > 0)
      .sort((a, b) => b.cleanSheets - a.cleanSheets);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
