/**
 * mockApi.js — Mock API service for the FIFA World Cup 2026 app
 * ===============================================================
 * 
 * Provides a fetchable data layer that mirrors a real football API.
 * 
 * TO SWAP WITH A REAL API:
 * 1. Replace fetchWorldCupData() body with a real fetch call.
 * 2. Write a transformApiResponse() that maps the real schema to our shape.
 * 3. Remove simulateGoal() — it's dev-only.
 * 
 * Example swap:
 *   export async function fetchWorldCupData() {
 *     const res = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026', {
 *       headers: { 'x-apisports-key': import.meta.env.VITE_FOOTBALL_API_KEY }
 *     });
 *     const raw = await res.json();
 *     return transformApiResponse(raw);
 *   }
 */

import { generateMockData } from './mockData.js';

// ─────────────────────────────────────────────────────────────────────
// Mutable mock state — simulates a server-side data store
// ─────────────────────────────────────────────────────────────────────
let _mockState = generateMockData();

/**
 * Fetch the current tournament state.
 * Returns the same { bracket, statLeaders, meta } shape a real API would.
 * 
 * @returns {Promise<import('./mockData.js').ReturnType<typeof generateMockData>>}
 */
export async function fetchWorldCupData() {
  // Simulate network latency (50-150ms)
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

  // Return a deep copy so React detects changes correctly
  return JSON.parse(JSON.stringify({
    ..._mockState,
    meta: {
      ..._mockState.meta,
      lastUpdated: new Date().toISOString(),
    },
  }));
}

/**
 * DEV ONLY: Simulate a goal being scored in a match.
 * Mutates the internal mock state, so the next fetchWorldCupData()
 * call returns updated data — exercising the full auto-update pipeline.
 * 
 * @param {string} matchId - ID of the match (e.g. 'qf-2')
 * @param {'teamA' | 'teamB'} team - Which team scored
 * @returns {{ success: boolean, match?: object, error?: string }}
 */
export function simulateGoal(matchId, team) {
  const match = _mockState.bracket.find(m => m.id === matchId);
  if (!match) return { success: false, error: `Match ${matchId} not found` };

  // If match is scheduled, start it as live
  if (match.status === "scheduled") {
    match.status = "live";
    match.scoreA = 0;
    match.scoreB = 0;
    match.minute = "1'";
  }

  if (match.status !== "live") {
    return { success: false, error: `Match ${matchId} is ${match.status}, not live` };
  }

  // Score the goal
  if (team === "teamA") {
    match.scoreA = (match.scoreA || 0) + 1;
  } else {
    match.scoreB = (match.scoreB || 0) + 1;
  }

  // Update minute
  const currentMin = parseInt(match.minute) || 0;
  match.minute = `${Math.min(currentMin + Math.floor(Math.random() * 15) + 1, 90)}'`;

  // Update stat leaders: add a goal to a random player from that country
  const scoringTeam = team === "teamA" ? match.teamA : match.teamB;
  const teamPlayers = _mockState.statLeaders.filter(p => p.country === scoringTeam);
  if (teamPlayers.length > 0) {
    const scorer = teamPlayers[Math.floor(Math.random() * teamPlayers.length)];
    scorer.goals += 1;
    // Maybe add an assist to another player
    const others = teamPlayers.filter(p => p.id !== scorer.id);
    if (others.length > 0 && Math.random() > 0.3) {
      others[Math.floor(Math.random() * others.length)].assists += 1;
    }
  }

  // Recalculate meta
  _mockState.meta.hasLiveMatches = _mockState.bracket.some(m => m.status === "live");
  _mockState.meta.lastUpdated = new Date().toISOString();

  return { success: true, match: JSON.parse(JSON.stringify(match)) };
}

/**
 * DEV ONLY: Finish a live match and propagate winners forward.
 * 
 * @param {string} matchId
 * @returns {{ success: boolean, match?: object, error?: string }}
 */
export function finishMatch(matchId) {
  const match = _mockState.bracket.find(m => m.id === matchId);
  if (!match) return { success: false, error: `Match ${matchId} not found` };
  if (match.status !== "live") return { success: false, error: `Match ${matchId} is not live` };

  // Ensure there's a winner (if tied, teamA wins on pens)
  if (match.scoreA === match.scoreB) {
    match.scoreA += 1; // penalty win
  }

  match.status = "finished";
  match.winner = match.scoreA > match.scoreB ? match.teamA : match.teamB;

  // Propagate winner to the next match
  if (match.nextMatchId) {
    const nextMatch = _mockState.bracket.find(m => m.id === match.nextMatchId);
    if (nextMatch) {
      nextMatch[match.nextMatchSlot] = match.winner;
      const winnerCode = match.winner ? 
        (match.winner === match.teamA ? match.teamACode : match.teamBCode) : null;
      nextMatch[match.nextMatchSlot + "Code"] = winnerCode;
    }
  }

  // If this is a semi-final, propagate loser to 3rd place match
  if (match.round === "sf") {
    const thirdPlace = _mockState.bracket.find(m => m.round === "third_place");
    if (thirdPlace) {
      const loser = match.winner === match.teamA ? match.teamB : match.teamA;
      const loserCode = match.winner === match.teamA ? match.teamBCode : match.teamACode;
      const slot = match.matchNumber === 0 ? "teamA" : "teamB";
      thirdPlace[slot] = loser;
      thirdPlace[slot + "Code"] = loserCode;
    }
  }

  // Recalculate meta
  _mockState.meta.hasLiveMatches = _mockState.bracket.some(m => m.status === "live");
  _mockState.meta.completedMatches = _mockState.bracket.filter(m => m.status === "finished").length;
  _mockState.meta.lastUpdated = new Date().toISOString();

  return { success: true, match: JSON.parse(JSON.stringify(match)) };
}

/**
 * DEV ONLY: Reset mock data to initial state.
 */
export function resetMockData() {
  _mockState = generateMockData();
}
