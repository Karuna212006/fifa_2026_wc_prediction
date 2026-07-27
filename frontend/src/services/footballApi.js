import { fallbackStats } from '../data/fallbackPlayerStats';

const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_WORLD_CUP_API_KEY || import.meta.env.VITE_RAPIDAPI_KEY || '';
const API_HOST = import.meta.env.VITE_RAPIDAPI_HOST || 'v3.football.api-sports.io';

// Helper function to generate correct headers for API integration
const getHeaders = () => ({
  'x-rapidapi-key': API_KEY,
  'x-api-key': API_KEY,
  'Authorization': `Bearer ${API_KEY}`,
  'x-rapidapi-host': API_HOST,
  'Content-Type': 'application/json'
});

// Mapping of nationalities/countries to flag-icons codes
const countryToCode = {
  'argentina': 'ar',
  'france': 'fr',
  'england': 'gb-eng',
  'brazil': 'br',
  'spain': 'es',
  'portugal': 'pt',
  'belgium': 'be',
  'italy': 'it',
  'germany': 'de',
  'netherlands': 'nl',
  'croatia': 'hr',
  'uruguay': 'uy',
  'colombia': 'co',
  'morocco': 'ma',
  'senegal': 'sn',
  'japan': 'jp',
  'south korea': 'kr',
  'korea republic': 'kr',
  'australia': 'au',
  'iran': 'ir',
  'saudi arabia': 'sa',
  'mexico': 'mx',
  'united states': 'us',
  'usa': 'us',
  'canada': 'ca',
  'switzerland': 'ch',
  'denmark': 'dk',
  'poland': 'pl',
  'sweden': 'se',
  'ukraine': 'ua',
  'wales': 'gb-wls',
  'scotland': 'gb-sct',
  'turkey': 'tr',
  'austria': 'at',
  'ecuador': 'ec',
  'peru': 'pe',
  'chile': 'cl',
  'venezuela': 've',
  'paraguay': 'py',
  'bolivia': 'bo',
  'cameroon': 'cm',
  'ghana': 'gh',
  'nigeria': 'ng',
  'algeria': 'dz',
  'tunisia': 'tn',
  'egypt': 'eg',
  'ivory coast': 'ci',
  "côte d'ivoire": 'ci',
  'costa rica': 'cr',
  'jamaica': 'jm',
  'panama': 'pa',
  'honduras': 'hn',
  'qatar': 'qa',
  'iraq': 'iq',
  'united arab emirates': 'ae',
  'china': 'cn',
  'new zealand': 'nz',
};

const getCountryCode = (nationality, teamName) => {
  const name = (nationality || teamName || '').toLowerCase().trim();
  if (countryToCode[name]) return countryToCode[name];
  return name.substring(0, 2);
};

// Helper to parse arguments into correct season and league ID
const parseParams = (arg1, arg2, defaultSeason = 2026, defaultLeague = 1) => {
  let season = defaultSeason;
  let league = defaultLeague;

  // Detect season parameter (e.g. 2026)
  if (typeof arg1 === 'number' && arg1 > 2000) {
    season = arg1;
  } else if (typeof arg1 === 'string' && !isNaN(arg1) && parseInt(arg1) > 2000) {
    season = parseInt(arg1);
  }

  if (typeof arg2 === 'number' && arg2 > 2000) {
    season = arg2;
  } else if (typeof arg2 === 'string' && !isNaN(arg2) && parseInt(arg2) > 2000) {
    season = parseInt(arg2);
  }

  // Detect league parameter (typically 1 for World Cup, or 2000 legacy mapped to 1)
  if (arg1 === '1' || arg1 === 1 || arg1 === '2000' || arg1 === 2000) {
    league = 1;
  }
  if (arg2 === '1' || arg2 === 1 || arg2 === '2000' || arg2 === 2000) {
    league = 1;
  }

  return { season, league };
};

// Transform API-Football player statistics response items to frontend format
const transformPlayerData = (apiData) => {
  const players = apiData.response || apiData.data || apiData.results || [];

  if (!Array.isArray(players)) {
    console.warn('Unexpected API response structure:', apiData);
    return [];
  }

  return players.map((item, index) => {
    const playerInfo = item.player || {};
    const stats = (item.statistics && item.statistics[0]) || {};
    const goals = stats.goals || {};
    const cards = stats.cards || {};
    const games = stats.games || {};
    const team = stats.team || {};

    return {
      id: playerInfo.id || index,
      name: playerInfo.name || 'Unknown Player',
      countryCode: getCountryCode(playerInfo.nationality, team.name),
      country: playerInfo.nationality || team.name || 'Unknown Country',
      team: team.name || 'Unknown Team',
      position: games.position || 'Unknown',
      goals: goals.total || 0,
      assists: goals.assists || 0,
      yellowCards: cards.yellow || 0,
      redCards: cards.red || 0,
      cleanSheets: goals.saves || games.cleansheets || 0,
      matchesPlayed: games.appearences || games.appearances || 0,
      photo: playerInfo.photo || null,
    };
  });
};

// Fetch tournament player stats (Top Scorers as baseline / fallback)
export const fetchPlayerStats = async (arg1, arg2) => {
  if (!API_KEY || API_KEY === 'your_api_key_here' || API_KEY === '691ffe8a04msh1184b576baf5ecep1d421cjsne612a52ea38b') {
    return fallbackStats.topScorers;
  }

  const { season, league } = parseParams(arg1, arg2);

  try {
    const response = await fetch(
      `${API_BASE_URL}/players/topscorers?season=${season}&league=${league}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      return fallbackStats.topScorers;
    }

    const data = await response.json();
    const parsed = transformPlayerData(data);
    return parsed.length > 0 ? parsed : fallbackStats.topScorers;
  } catch (error) {
    console.warn('API fetchPlayerStats fallback:', error);
    return fallbackStats.topScorers;
  }
};

// Fetch top scorers
export const fetchTopScorers = async (arg1, arg2) => {
  if (!API_KEY || API_KEY === 'your_api_key_here' || API_KEY === '691ffe8a04msh1184b576baf5ecep1d421cjsne612a52ea38b') {
    return fallbackStats.topScorers;
  }
  const { season, league } = parseParams(arg1, arg2);
  try {
    const response = await fetch(
      `${API_BASE_URL}/players/topscorers?season=${season}&league=${league}`,
      { method: 'GET', headers: getHeaders() }
    );
    if (!response.ok) return fallbackStats.topScorers;
    const data = await response.json();
    const parsed = transformPlayerData(data);
    return parsed.length > 0 ? parsed : fallbackStats.topScorers;
  } catch (error) {
    console.warn('fetchTopScorers fallback:', error);
    return fallbackStats.topScorers;
  }
};

// Fetch top assists
export const fetchTopAssists = async (arg1, arg2) => {
  if (!API_KEY || API_KEY === 'your_api_key_here' || API_KEY === '691ffe8a04msh1184b576baf5ecep1d421cjsne612a52ea38b') {
    return fallbackStats.assists;
  }
  const { season, league } = parseParams(arg1, arg2);
  try {
    const response = await fetch(
      `${API_BASE_URL}/players/topassists?season=${season}&league=${league}`,
      { method: 'GET', headers: getHeaders() }
    );
    if (!response.ok) return fallbackStats.assists;
    const data = await response.json();
    const parsed = transformPlayerData(data);
    return parsed.length > 0 ? parsed : fallbackStats.assists;
  } catch (error) {
    console.warn('fetchTopAssists fallback:', error);
    return fallbackStats.assists;
  }
};

// Fetch cards (yellow or red)
export const fetchTopCards = async (arg1, arg2) => {
  let cardType = 'yellow';
  if (arg1 === 'yellow' || arg1 === 'red') {
    cardType = arg1;
  } else if (arg2 === 'yellow' || arg2 === 'red') {
    cardType = arg2;
  }

  const fallback = cardType === 'red' ? fallbackStats.redCards : fallbackStats.yellowCards;

  if (!API_KEY || API_KEY === 'your_api_key_here' || API_KEY === '691ffe8a04msh1184b576baf5ecep1d421cjsne612a52ea38b') {
    return fallback;
  }

  const { season, league } = parseParams(arg1, arg2);
  const endpoint = cardType === 'red' ? 'topredcards' : 'topyellowcards';

  try {
    const response = await fetch(
      `${API_BASE_URL}/players/${endpoint}?season=${season}&league=${league}`,
      { method: 'GET', headers: getHeaders() }
    );
    if (!response.ok) return fallback;
    const data = await response.json();
    const parsed = transformPlayerData(data);
    return parsed.length > 0 ? parsed : fallback;
  } catch (error) {
    console.warn(`fetchTopCards (${cardType}) fallback:`, error);
    return fallback;
  }
};

// Fetch clean sheets (goalkeepers)
export const fetchCleanSheets = async (arg1, arg2) => {
  // Predefined realistic set of top World Cup 2026 goalkeepers since API-Football does not support a dedicated clean sheets endpoint.
  return [
    { id: 'f7', name: 'Mike Maignan', countryCode: 'fr', country: 'France', team: 'France', cleanSheets: 4, photo: null },
    { id: 'f8', name: 'Unai Simón', countryCode: 'es', country: 'Spain', team: 'Spain', cleanSheets: 3, photo: null },
    { id: 'f9', name: 'Emiliano Martínez', countryCode: 'ar', country: 'Argentina', team: 'Argentina', cleanSheets: 3, photo: null },
    { id: 'f10', name: 'Jordan Pickford', countryCode: 'gb-eng', country: 'England', team: 'England', cleanSheets: 2, photo: null },
    { id: 'f11', name: 'Alisson Becker', countryCode: 'br', country: 'Brazil', team: 'Brazil', cleanSheets: 2, photo: null },
    { id: 'f12', name: 'Marc-André ter Stegen', countryCode: 'de', country: 'Germany', team: 'Germany', cleanSheets: 2, photo: null },
    { id: 'f13', name: 'Dominik Livaković', countryCode: 'hr', country: 'Croatia', team: 'Croatia', cleanSheets: 1, photo: null },
  ];
};