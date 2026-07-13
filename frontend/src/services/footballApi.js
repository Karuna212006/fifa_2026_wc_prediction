const API_BASE_URL = 'https://free-api-live-football-data.p.rapidapi.com';
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const API_HOST = import.meta.env.VITE_RAPIDAPI_HOST;

// Helper function to generate correct RapidAPI headers
const getHeaders = () => ({
  'x-rapidapi-key': API_KEY,
  'x-rapidapi-host': API_HOST,
  'Content-Type': 'application/json'
});

// Fetch tournament player stats (Top Scorers)
export const fetchPlayerStats = async (season = 2026) => {
  if (!API_KEY || API_KEY === 'your_api_key_here' || API_KEY === '691ffe8a04msh1184b576baf5ecep1d421cjsne612a52ea38b') {
    throw new Error('API key is missing or invalid. Please add a valid VITE_RAPIDAPI_KEY to your .env file.');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/football-players-topscorers?season=${season}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return transformPlayerData(data);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Transform API data to our frontend format
const transformPlayerData = (apiData) => {
  // RapidAPI responses usually wrap data in 'data', 'response', or 'results'
  const players = apiData.data || apiData.response || apiData.results || [];

  if (!Array.isArray(players)) {
    console.warn('Unexpected API response structure:', apiData);
    return [];
  }

  return players.map((player, index) => ({
    id: player.id || player.player_id || index,
    name: player.name || player.player_name || 'Unknown Player',
    countryCode: (player.country_code || player.nationality)?.substring(0, 2).toLowerCase() || 'xx',
    country: player.country || player.nationality || 'Unknown Country',
    team: player.team || player.club || 'Unknown Team',
    position: player.position || 'Unknown',
    goals: player.goals || player.number_of_goals || 0,
    assists: player.assists || player.number_of_assists || 0,
    yellowCards: player.yellow_cards || player.yellowCards || 0,
    redCards: player.red_cards || player.redCards || 0,
    cleanSheets: player.clean_sheets || player.cleanSheets || 0,
    matchesPlayed: player.matches_played || player.appearances || 0,
    photo: player.photo || player.image || null,
  }));
};

// Fetch top scorers
export const fetchTopScorers = async (season = 2026) => {
  const data = await fetchPlayerStats(season);
  return data.sort((a, b) => b.goals - a.goals);
};

// Fetch top assists
export const fetchTopAssists = async (season = 2026) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/football-players-topassists?season=${season}`,
      { method: 'GET', headers: getHeaders() }
    );
    if (response.ok) {
      const data = await response.json();
      const players = data.data || data.response || data.results || [];
      return players
        .map((p, i) => ({ ...transformPlayerData({ data: [p] })[0], assists: p.assists || p.number_of_assists || 0 }))
        .filter((player) => player.assists > 0)
        .sort((a, b) => b.assists - a.assists);
    }
  } catch (error) {
    console.warn('Assists endpoint failed, falling back to general stats', error);
  }

  // Fallback to general stats if specific endpoint fails
  const data = await fetchPlayerStats(season);
  return data.filter((player) => player.assists > 0).sort((a, b) => b.assists - a.assists);
};

// Fetch cards (yellow + red)
export const fetchTopCards = async (season = 2026, cardType = 'yellow') => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/football-players-topcards?season=${season}`,
      { method: 'GET', headers: getHeaders() }
    );
    if (response.ok) {
      const data = await response.json();
      const players = data.data || data.response || data.results || [];
      const field = cardType === 'yellow' ? 'yellowCards' : 'RedCards'; // Adjust based on API response

      const mapped = players.map((p, i) => ({
        ...transformPlayerData({ data: [p] })[0],
        yellowCards: p.yellow_cards || p.yellowCards || 0,
        redCards: p.red_cards || p.redCards || 0
      }));

      return mapped
        .filter((player) => player[field === 'RedCards' ? 'redCards' : 'yellowCards'] > 0)
        .sort((a, b) => b[field === 'RedCards' ? 'redCards' : 'yellowCards'] - a[field === 'RedCards' ? 'redCards' : 'yellowCards']);
    }
  } catch (error) {
    console.warn('Cards endpoint failed, falling back to general stats', error);
  }

  // Fallback
  const data = await fetchPlayerStats(season);
  const field = cardType === 'yellow' ? 'yellowCards' : 'redCards';
  return data.filter((player) => player[field] > 0).sort((a, b) => b[field] - a[field]);
};

// Fetch clean sheets (goalkeepers)
export const fetchCleanSheets = async (season = 2026) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/football-players-topcleansheets?season=${season}`,
      { method: 'GET', headers: getHeaders() }
    );
    if (response.ok) {
      const data = await response.json();
      const players = data.data || data.response || data.results || [];
      return players
        .map((p, i) => ({ ...transformPlayerData({ data: [p] })[0], cleanSheets: p.clean_sheets || p.cleanSheets || 0 }))
        .filter((player) => player.cleanSheets > 0)
        .sort((a, b) => b.cleanSheets - a.cleanSheets);
    }
  } catch (error) {
    console.warn('Clean sheets endpoint failed, falling back to general stats', error);
  }

  // Fallback
  const data = await fetchPlayerStats(season);
  return data.filter((player) => player.cleanSheets > 0).sort((a, b) => b.cleanSheets - a.cleanSheets);
};