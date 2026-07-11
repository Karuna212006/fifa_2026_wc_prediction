/**
 * mockData.js — Complete mock tournament state for FIFA World Cup 2026
 * =====================================================================
 * 
 * Generates a realistic 48-team tournament state starting from the Round of 16.
 * Data is derived directly from the user's notebook predictions (wc2026_group_match_predictions.csv).
 */

// Country code mapping for flags
const CC = {
  "Argentina": "ar", "Australia": "au", "Belgium": "be", "Brazil": "br",
  "Canada": "ca", "Colombia": "co", "Croatia": "hr", "Denmark": "dk",
  "Ecuador": "ec", "Egypt": "eg", "England": "gb-eng", "France": "fr",
  "Germany": "de", "Ghana": "gh", "Italy": "it", "Japan": "jp",
  "Mexico": "mx", "Morocco": "ma", "Netherlands": "nl", "Norway": "no",
  "Paraguay": "py", "Portugal": "pt", "Saudi Arabia": "sa", "Senegal": "sn",
  "South Korea": "kr", "Spain": "es", "Sweden": "se", "Switzerland": "ch",
  "Tunisia": "tn", "USA": "us", "United States": "us", "Uruguay": "uy",
  "Wales": "gb-wls", "Turkey": "tr", "Panama": "pa", "Serbia": "rs",
  "Ukraine": "ua", "Poland": "pl", "Cameroon": "cm", "Nigeria": "ng",
  "Austria": "at", "Chile": "cl", "Peru": "pe", "Costa Rica": "cr",
  "Honduras": "hn", "Iran": "ir", "Algeria": "dz", "Ivory Coast": "ci",
};

const code = (team) => CC[team] || "un";

const VENUES = [
  "MetLife Stadium, New York", "AT&T Stadium, Dallas", "SoFi Stadium, Los Angeles",
  "Hard Rock Stadium, Miami", "Lumen Field, Seattle", "NRG Stadium, Houston",
  "Lincoln Financial Field, Philadelphia", "Mercedes-Benz Stadium, Atlanta",
  "Arrowhead Stadium, Kansas City", "Levi's Stadium, San Francisco",
  "Estadio Azteca, Mexico City", "Estadio BBVA, Monterrey",
  "BC Place, Vancouver", "BMO Field, Toronto",
];

const venue = (i) => VENUES[i % VENUES.length];

function buildBracket() {
  /** @type {import('./mockData.js').BracketMatch[]} */
  const matches = [];

  // R16 pairings from predictions CSV (accurate to user stats)
  const r16Pairings = [
    { a: "Paraguay",      b: "France",        sA: 0, sB: 4, status: "finished", conf: 96, predWin: "France", predSA: 1, predSB: 3 },
    { a: "Canada",        b: "Morocco",       sA: 0, sB: 2, status: "finished", conf: 72, predWin: "Morocco", predSA: 0, predSB: 2 },
    { a: "Brazil",        b: "Norway",        sA: 2, sB: 1, status: "finished", conf: 65, predWin: "Brazil", predSA: 2, predSB: 1 },
    { a: "Mexico",        b: "England",       sA: 2, sB: 1, status: "finished", conf: 70, predWin: "Mexico", predSA: 2, predSB: 1 },
    { a: "Portugal",      b: "Spain",         sA: 1, sB: 2, status: "finished", conf: 65, predWin: "Spain", predSA: 1, predSB: 2 },
    { a: "United States", b: "Belgium",       sA: 2, sB: 1, status: "finished", conf: 51, predWin: "United States", predSA: 2, predSB: 1 },
    { a: "Argentina",     b: "Egypt",         sA: 3, sB: 0, status: "finished", conf: 90, predWin: "Argentina", predSA: 3, predSB: 0 },
    { a: "Switzerland",   b: "Colombia",      sA: 1, sB: 1, status: "finished", conf: 39, predWin: "Switzerland", predSA: 2, predSB: 1 }, // Won on penalties
  ];

  // Determine R16 winners
  const r16Winners = r16Pairings.map(m => {
    if (m.status !== "finished") return null;
    if (m.sA > m.sB) return m.a;
    if (m.sB > m.sA) return m.b;
    // Tie breaker
    return m.predWin;
  });

  // Create R16 match objects
  r16Pairings.forEach((m, i) => {
    const winner = r16Winners[i];
    const nextMatchIdx = Math.floor(i / 2);
    const nextSlot = i % 2 === 0 ? "teamA" : "teamB";

    matches.push({
      id: `r16-${i}`,
      round: "r16",
      matchNumber: i,
      teamA: m.a,
      teamB: m.b,
      teamACode: code(m.a),
      teamBCode: code(m.b),
      scoreA: m.sA,
      scoreB: m.sB,
      status: m.status,
      winner,
      predictionConfidence: m.conf,
      predictedWinner: m.predWin,
      predictedScoreA: m.predSA,
      predictedScoreB: m.predSB,
      nextMatchId: `qf-${nextMatchIdx}`,
      nextMatchSlot: nextSlot,
      venue: venue(i),
      datetime: `2026-07-0${1 + Math.floor(i / 2)}T${16 + (i % 2) * 3}:00:00Z`,
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // QUARTER-FINALS (4 matches)
  // ─────────────────────────────────────────────────────────────────
  const qfPairings = [
    { a: r16Winners[0], b: r16Winners[1], sA: 2, sB: 0, status: "finished", conf: 76, predWin: "France", predSA: 2, predSB: 0 },
    { a: r16Winners[2], b: r16Winners[3], sA: 1, sB: 2, status: "finished", conf: 65, predWin: "Mexico", predSA: 1, predSB: 2 },
    { a: r16Winners[4], b: r16Winners[5], sA: 2, sB: 1, status: "live", conf: 54, predWin: "Spain", minute: "67'", predSA: 2, predSB: 1 },
    { a: r16Winners[6], b: r16Winners[7], sA: null, sB: null, status: "scheduled", conf: 72, predWin: "Argentina", predSA: 2, predSB: 1 },
  ];

  const qfWinners = qfPairings.map(m => {
    if (m.status !== "finished" || !m.a || !m.b) return null;
    if (m.sA > m.sB) return m.a;
    if (m.sB > m.sA) return m.b;
    return m.predWin;
  });

  qfPairings.forEach((m, i) => {
    const winner = qfWinners[i];
    const nextMatchIdx = Math.floor(i / 2);
    const nextSlot = i % 2 === 0 ? "teamA" : "teamB";

    matches.push({
      id: `qf-${i}`,
      round: "qf",
      matchNumber: i,
      teamA: m.a,
      teamB: m.b,
      teamACode: m.a ? code(m.a) : null,
      teamBCode: m.b ? code(m.b) : null,
      scoreA: m.sA,
      scoreB: m.sB,
      status: m.status,
      winner,
      predictionConfidence: m.conf,
      predictedWinner: m.predWin,
      predictedScoreA: m.predSA,
      predictedScoreB: m.predSB,
      nextMatchId: `sf-${nextMatchIdx}`,
      nextMatchSlot: nextSlot,
      venue: venue(i + 8),
      datetime: `2026-07-0${8 + Math.floor(i / 2)}T${18 + (i % 2) * 3}:00:00Z`,
      minute: m.minute || null,
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // SEMI-FINALS (2 matches)
  // ─────────────────────────────────────────────────────────────────
  const sfPairings = [
    { a: qfWinners[0], b: qfWinners[1], sA: null, sB: null, status: "scheduled", conf: 42, predWin: "France", predSA: 2, predSB: 1 },
    { a: qfWinners[2], b: qfWinners[3], sA: null, sB: null, status: "scheduled", conf: 70, predWin: "Argentina", predSA: 1, predSB: 2 },
  ];

  const sfWinners = sfPairings.map(m => {
    if (m.status !== "finished" || !m.a || !m.b) return null;
    if (m.sA > m.sB) return m.a;
    if (m.sB > m.sA) return m.b;
    return m.predWin;
  });

  const sfLosers = sfPairings.map((m, i) => {
    if (m.status !== "finished" || !m.a || !m.b) return null;
    return sfWinners[i] === m.a ? m.b : m.a;
  });

  sfPairings.forEach((m, i) => {
    matches.push({
      id: `sf-${i}`,
      round: "sf",
      matchNumber: i,
      teamA: m.a,
      teamB: m.b,
      teamACode: m.a ? code(m.a) : null,
      teamBCode: m.b ? code(m.b) : null,
      scoreA: m.sA,
      scoreB: m.sB,
      status: m.status,
      winner: sfWinners[i],
      predictionConfidence: m.conf,
      predictedWinner: m.predWin,
      predictedScoreA: m.predSA,
      predictedScoreB: m.predSB,
      nextMatchId: "final",
      nextMatchSlot: i === 0 ? "teamA" : "teamB",
      venue: venue(i + 12),
      datetime: `2026-07-11T${18 + i * 3}:00:00Z`,
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 3RD PLACE PLAY-OFF
  // ─────────────────────────────────────────────────────────────────
  matches.push({
    id: "third_place",
    round: "third_place",
    matchNumber: 0,
    teamA: sfLosers[0],
    teamB: sfLosers[1],
    teamACode: sfLosers[0] ? code(sfLosers[0]) : null,
    teamBCode: sfLosers[1] ? code(sfLosers[1]) : null,
    scoreA: null,
    scoreB: null,
    status: "scheduled",
    winner: null,
    predictionConfidence: 36,
    predictedWinner: "Argentina", // Fallback prediction from CSV
    predictedScoreA: 2,
    predictedScoreB: 1,
    nextMatchId: null,
    nextMatchSlot: null,
    venue: "Hard Rock Stadium, Miami",
    datetime: "2026-07-18T18:00:00Z",
    feedsFrom: ["sf-0", "sf-1"],
    feedsFromSlot: "loser",
  });

  // ─────────────────────────────────────────────────────────────────
  // FINAL
  // ─────────────────────────────────────────────────────────────────
  matches.push({
    id: "final",
    round: "final",
    matchNumber: 0,
    teamA: sfWinners[0],
    teamB: sfWinners[1],
    teamACode: sfWinners[0] ? code(sfWinners[0]) : null,
    teamBCode: sfWinners[1] ? code(sfWinners[1]) : null,
    scoreA: null,
    scoreB: null,
    status: "scheduled",
    winner: null,
    predictionConfidence: 39,
    predictedWinner: "France", // Fallback prediction from CSV (France wins final vs Argentina)
    predictedScoreA: 2,
    predictedScoreB: 1,
    nextMatchId: null,
    nextMatchSlot: null,
    venue: "MetLife Stadium, New York",
    datetime: "2026-07-19T20:00:00Z",
  });

  return matches;
}

// ─────────────────────────────────────────────────────────────────────
// STAT LEADERS (Accurate stats matching tournament)
// ─────────────────────────────────────────────────────────────────────
function buildStatLeaders() {
  const players = [
    { id: "p1",  name: "Kylian Mbappé",       country: "France",      pos: "FW", club: "Real Madrid",      goals: 5, assists: 2, yellowCards: 0, cleanSheets: 0 },
    { id: "p2",  name: "Lionel Messi",         country: "Argentina",   pos: "FW", club: "Inter Miami",      goals: 4, assists: 4, yellowCards: 1, cleanSheets: 0 },
    { id: "p3",  name: "Vinícius Jr.",         country: "Brazil",      pos: "FW", club: "Real Madrid",      goals: 4, assists: 1, yellowCards: 2, cleanSheets: 0 },
    { id: "p4",  name: "Harry Kane",           country: "England",     pos: "FW", club: "Bayern Munich",    goals: 3, assists: 2, yellowCards: 0, cleanSheets: 0 },
    { id: "p5",  name: "Lamine Yamal",         country: "Spain",       pos: "FW", club: "Barcelona",        goals: 3, assists: 3, yellowCards: 0, cleanSheets: 0 },
    { id: "p6",  name: "Bruno Fernandes",      country: "Portugal",    pos: "MF", club: "Al Nassr",         goals: 3, assists: 2, yellowCards: 1, cleanSheets: 0 },
    { id: "p7",  name: "Kevin De Bruyne",      country: "Belgium",     pos: "MF", club: "Man City",         goals: 1, assists: 5, yellowCards: 0, cleanSheets: 0 },
    { id: "p8",  name: "Jude Bellingham",      country: "England",     pos: "MF", club: "Real Madrid",      goals: 2, assists: 3, yellowCards: 1, cleanSheets: 0 },
    { id: "p9",  name: "Erling Haaland",       country: "Norway",      pos: "FW", club: "Man City",         goals: 3, assists: 0, yellowCards: 1, cleanSheets: 0 },
    { id: "p10", name: "Alisson Becker",       country: "Brazil",      pos: "GK", club: "Liverpool",        goals: 0, assists: 0, yellowCards: 0, cleanSheets: 3 },
    { id: "p11", name: "Emiliano Martínez",    country: "Argentina",   pos: "GK", club: "Aston Villa",      goals: 0, assists: 0, yellowCards: 1, cleanSheets: 4 },
    { id: "p12", name: "Mike Maignan",         country: "France",      pos: "GK", club: "AC Milan",         goals: 0, assists: 0, yellowCards: 0, cleanSheets: 4 },
    { id: "p13", name: "Rúben Dias",           country: "Portugal",    pos: "DF", club: "Man City",         goals: 0, assists: 1, yellowCards: 3, cleanSheets: 3 },
  ];

  return players.map(p => ({
    ...p,
    countryCode: code(p.country),
    position: p.pos,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=003366&color=FFD700&size=96&bold=true&font-size=0.4`,
  }));
}

export function generateMockData() {
  const bracket = buildBracket();
  const statLeaders = buildStatLeaders();
  const hasLiveMatches = bracket.some(m => m.status === "live");

  return {
    bracket,
    statLeaders,
    meta: {
      lastUpdated: new Date().toISOString(),
      tournamentPhase: detectPhase(bracket),
      hasLiveMatches,
      totalMatches: bracket.length,
      completedMatches: bracket.filter(m => m.status === "finished").length,
    },
  };
}

function detectPhase(bracket) {
  const rounds = ["final", "third_place", "sf", "qf", "r16"];
  for (const round of rounds) {
    const roundMatches = bracket.filter(m => m.round === round);
    if (roundMatches.some(m => m.status === "live")) return round;
    if (roundMatches.some(m => m.status === "scheduled")) return round;
  }
  return "completed";
}

export { CC as COUNTRY_CODES };
