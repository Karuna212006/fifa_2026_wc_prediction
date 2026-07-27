/**
 * BracketPage — Tournament bracket driven by shared backend data
 * ===============================================================
 *
 * Uses the same `matches` prop that every other page (Results, Standings,
 * Predictions) consumes — no more isolated mock/TanStack Query stack.
 *
 * Data flow:
 *   /api/matches (10 s polling in FIFAApp) → matches prop
 *       → actualBracket  (real results for finished matches)
 *       → predictedBracket (AI Elo-based projections for future rounds)
 */


import React, { useMemo } from 'react';
import TournamentBracket from '../components/TournamentBracket.jsx';


const TEAM_RATINGS = {
  "Argentina": 1773.9,
  "France": 1759.5,
  "Brazil": 1744.3,
  "England": 1728.8,
  "Spain": 1720.6,
  "Germany": 1710.2,
  "Netherlands": 1694.7,
  "Portugal": 1693.5,
  "Belgium": 1680.4,
  "Colombia": 1678.2,
  "Italy": 1672.1,
  "Croatia": 1660.8,
  "Uruguay": 1656.3,
  "Mexico": 1643.7,
  "USA": 1640.5,
  "United States": 1640.5,
  "Switzerland": 1635.2,
  "Denmark": 1630.8,
  "Japan": 1625.4,
  "Morocco": 1620.1,
  "Senegal": 1612.6,
  "South Korea": 1605.3,
  "Australia": 1598.7,
  "Ecuador": 1592.4,
  "Canada": 1588.1,
  "Turkey": 1585.6,
  "Egypt": 1580.2,
  "Saudi Arabia": 1575.8,
  "Tunisia": 1570.3,
  "Ghana": 1565.9,
  "Norway": 1560.4,
  "Sweden": 1555.1,
  "Paraguay": 1550.7,
  "Algeria": 1546.3,
  "Panama": 1541.8,
  "Cape Verde": 1537.4,
  "Bosnia and Herzegovina": 1533.0,
  "DR Congo": 1528.6,
  "Ivory Coast": 1524.2,
  "Wales": 1519.8,
  "Austria": 1515.4,
  "Serbia": 1510.9,
  "Peru": 1506.5,
  "Chile": 1502.1,
  "Cameroon": 1497.7,
  "Nigeria": 1493.3,
  "Qatar": 1488.9,
  "Iran": 1484.5,
  "IR Iran": 1484.5,
  "Costa Rica": 1480.1,
};

function getTeamRating(teamName) {
  if (!teamName) return 1500;
  return TEAM_RATINGS[teamName] || 1500;
}

function calculatePrediction(teamA, teamB) {
  if (!teamA || !teamB) {
    return { winner: null, scoreA: null, scoreB: null, confidence: 0 };
  }
  const rA = getTeamRating(teamA);
  const rB = getTeamRating(teamB);
  const probA = 1 / (1 + Math.pow(10, -(rA - rB) / 400));
  const winner = probA >= 0.5 ? teamA : teamB;
  const confidence = Math.round((probA >= 0.5 ? probA : (1 - probA)) * 100);
  const scoreA = winner === teamA ? 2 : 1;
  const scoreB = winner === teamB ? 2 : 1;
  return { winner, scoreA, scoreB, confidence };
}

// ─────────────────────────────────────────────────────────────────────
// COUNTRY CODE MAP (module-level — stable reference, no re-creation)
// ─────────────────────────────────────────────────────────────────────
const CC_MAP = {
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
  "IR Iran": "ir",
};
const getCC = (name) => CC_MAP[name] || 'un';

// ─────────────────────────────────────────────────────────────────────
// BRACKET SKELETON — fixed match slot structure for R16 → Final
// ─────────────────────────────────────────────────────────────────────
const BRACKET_SKELETON = [
  // Round of 16 — TOP HALF (France side + Spain side → sf-0)
  { id: 'r16-0', round: 'r16', matchNumber: 0, nextMatchId: 'qf-0', nextMatchSlot: 'teamA', venue: 'MetLife Stadium, New York',             datetime: '5 Jul' },  // Paraguay vs France (89)
  { id: 'r16-1', round: 'r16', matchNumber: 1, nextMatchId: 'qf-0', nextMatchSlot: 'teamB', venue: 'AT&T Stadium, Dallas',                   datetime: '4 Jul' },  // Canada vs Morocco (90)
  { id: 'r16-2', round: 'r16', matchNumber: 2, nextMatchId: 'qf-1', nextMatchSlot: 'teamA', venue: 'Lumen Field, Seattle',                   datetime: '7 Jul' },  // Portugal vs Spain (93)
  { id: 'r16-3', round: 'r16', matchNumber: 3, nextMatchId: 'qf-1', nextMatchSlot: 'teamB', venue: 'NRG Stadium, Houston',                   datetime: '7 Jul' },  // USA vs Belgium (94)
  // Round of 16 — BOTTOM HALF (England side + Argentina side → sf-1)
  { id: 'r16-4', round: 'r16', matchNumber: 4, nextMatchId: 'qf-2', nextMatchSlot: 'teamA', venue: 'SoFi Stadium, Los Angeles',              datetime: '6 Jul' },  // Brazil vs Norway (91)
  { id: 'r16-5', round: 'r16', matchNumber: 5, nextMatchId: 'qf-2', nextMatchSlot: 'teamB', venue: 'Hard Rock Stadium, Miami',               datetime: '6 Jul' },  // Mexico vs England (92)
  { id: 'r16-6', round: 'r16', matchNumber: 6, nextMatchId: 'qf-3', nextMatchSlot: 'teamA', venue: 'Lincoln Financial Field, Philadelphia',  datetime: '7 Jul' },  // Argentina vs Egypt (95)
  { id: 'r16-7', round: 'r16', matchNumber: 7, nextMatchId: 'qf-3', nextMatchSlot: 'teamB', venue: 'Mercedes-Benz Stadium, Atlanta',         datetime: '8 Jul' },  // Switzerland vs Colombia (96) — pen shootout
  // Quarter-Finals — TOP HALF
  { id: 'qf-0', round: 'qf', matchNumber: 0, nextMatchId: 'sf-0', nextMatchSlot: 'teamA', venue: 'Arrowhead Stadium, Kansas City',           datetime: 'Fri, 10 Jul' }, // France vs Morocco (97)
  { id: 'qf-1', round: 'qf', matchNumber: 1, nextMatchId: 'sf-0', nextMatchSlot: 'teamB', venue: "Levi's Stadium, San Francisco",            datetime: 'Sat, 11 Jul' }, // Spain vs Belgium (98)
  // Quarter-Finals — BOTTOM HALF
  { id: 'qf-2', round: 'qf', matchNumber: 2, nextMatchId: 'sf-1', nextMatchSlot: 'teamA', venue: 'Estadio Azteca, Mexico City',              datetime: 'Sun, 12 Jul' }, // Norway vs England (99)
  { id: 'qf-3', round: 'qf', matchNumber: 3, nextMatchId: 'sf-1', nextMatchSlot: 'teamB', venue: 'Estadio BBVA, Monterrey',                  datetime: 'Sun, 12 Jul' }, // Argentina vs Switzerland (100)
  // Semi-Finals
  { id: 'sf-0', round: 'sf', matchNumber: 0, nextMatchId: 'final', nextMatchSlot: 'teamA', venue: 'BC Place, Vancouver',                     datetime: 'Wed, 15 Jul' }, // France vs Spain (101)
  { id: 'sf-1', round: 'sf', matchNumber: 1, nextMatchId: 'final', nextMatchSlot: 'teamB', venue: 'BMO Field, Toronto',                      datetime: 'Thu, 16 Jul' }, // England vs Argentina (102)
  // 3rd Place
  { id: 'third_place', round: 'third_place', matchNumber: 0, nextMatchId: null, nextMatchSlot: null, venue: 'Hard Rock Stadium, Miami',       datetime: 'Sun, 19 Jul' }, // France vs England (103)
  // Final
  { id: 'final', round: 'final', matchNumber: 0, nextMatchId: null, nextMatchSlot: null, venue: 'MetLife Stadium, New York',                  datetime: 'Sun, 20 Jul' }, // Spain vs Argentina (104)
];


export default function BracketPage({
  matches = [],
  hasLiveMatches = false,
}) {


  // ─────────────────────────────────────────────────────────────────────
  // ACTUAL BRACKET — built from the real backend `matches` prop
  // ─────────────────────────────────────────────────────────────────────
  const actualBracket = useMemo(() => {
    // Maps backend match IDs → bracket slot IDs
    // Bracket layout:
    //   TOP HALF:    r16-0,1 → qf-0 → sf-0 (France side)
    //                r16-2,3 → qf-1 → sf-0 (Spain side)
    //   BOTTOM HALF: r16-4,5 → qf-2 → sf-1 (England side)
    //                r16-6,7 → qf-3 → sf-1 (Argentina side)
    const idMap = {
      '89': 'r16-0',  // Paraguay vs France  → top-half, feeds qf-0
      '90': 'r16-1',  // Canada vs Morocco   → top-half, feeds qf-0
      '93': 'r16-2',  // Portugal vs Spain   → top-half, feeds qf-1 (Spain joins France's semi)
      '94': 'r16-3',  // USA vs Belgium      → top-half, feeds qf-1
      '91': 'r16-4',  // Brazil vs Norway    → bottom-half, feeds qf-2
      '92': 'r16-5',  // Mexico vs England   → bottom-half, feeds qf-2
      '95': 'r16-6',  // Argentina vs Egypt  → bottom-half, feeds qf-3
      '96': 'r16-7',  // Switzerland vs Colombia → bottom-half, feeds qf-3
      '97': 'qf-0',   // France vs Morocco   → top-half qf (feeds sf-0 teamA)
      '98': 'qf-1',   // Spain vs Belgium    → top-half qf (feeds sf-0 teamB)
      '99': 'qf-2',   // Norway vs England   → bottom-half qf (feeds sf-1 teamA)
      '100': 'qf-3',  // Argentina vs Switzerland → bottom-half qf (feeds sf-1 teamB)
      '101': 'sf-0',  // France vs Spain
      '102': 'sf-1',  // England vs Argentina
      '103': 'third_place',
      '104': 'final',
    };

    const teamPairMap = {
      // R16 — top half
      'Paraguay|France': 'r16-0',    'France|Paraguay': 'r16-0',
      'Canada|Morocco': 'r16-1',     'Morocco|Canada': 'r16-1',
      'Portugal|Spain': 'r16-2',     'Spain|Portugal': 'r16-2',
      'United States|Belgium': 'r16-3', 'Belgium|United States': 'r16-3',
      'USA|Belgium': 'r16-3',        'Belgium|USA': 'r16-3',
      // R16 — bottom half
      'Brazil|Norway': 'r16-4',      'Norway|Brazil': 'r16-4',
      'Mexico|England': 'r16-5',     'England|Mexico': 'r16-5',
      'Argentina|Egypt': 'r16-6',    'Egypt|Argentina': 'r16-6',
      'Switzerland|Colombia': 'r16-7', 'Colombia|Switzerland': 'r16-7',
      // QF
      'France|Morocco': 'qf-0',      'Morocco|France': 'qf-0',
      'Spain|Belgium': 'qf-1',       'Belgium|Spain': 'qf-1',
      'Norway|England': 'qf-2',      'England|Norway': 'qf-2',
      'Argentina|Switzerland': 'qf-3', 'Switzerland|Argentina': 'qf-3',
      'Argentina|Colombia': 'qf-3',  'Colombia|Argentina': 'qf-3',
      // SF
      'France|Spain': 'sf-0',        'Spain|France': 'sf-0',
      'England|Argentina': 'sf-1',   'Argentina|England': 'sf-1',
      // Final & 3rd
      'Spain|Argentina': 'final',    'Argentina|Spain': 'final',
      'France|England': 'third_place', 'England|France': 'third_place',
    };


    // Build a lookup from backend matches → bracket slot
    const slotData = {};
    if (Array.isArray(matches)) {
      matches.forEach(m => {
        const homeName = m.home || m.home_team_name_en;
        const awayName = m.away || m.away_team_name_en;
        const pairKey  = homeName && awayName ? `${homeName}|${awayName}` : null;
        const slotId   = idMap[String(m.id)] || (pairKey ? teamPairMap[pairKey] : null);

        if (!slotId) return;

        const finished = m.status === 'finished';
        const isLive   = typeof m.status === 'string' && m.status !== 'finished' && m.status !== 'notstarted' && m.status !== 'scheduled';

        // Skip simulated matches that haven't actually been played yet.
        // The backend fills in 'is_simulated' for future knockout rounds using
        // predicted team names and scores — we don't want those in the Actual Bracket.
        if (!finished && !isLive) return;

        const hs = m.home_score !== undefined && m.home_score !== null ? Number(m.home_score) : null;
        const as_ = m.away_score !== undefined && m.away_score !== null ? Number(m.away_score) : null;

        let winner = m.winner || null;
        if (finished && hs !== null && as_ !== null) {
          if (hs > as_) winner = homeName;
          else if (as_ > hs) winner = awayName;
          else if (slotId === 'r16-7') winner = 'Switzerland'; // Pen shootout special case
        }

        slotData[slotId] = {
          teamA: homeName || null,
          teamACode: getCC(homeName),
          scoreA: finished || isLive ? hs : null,
          teamB: awayName || null,
          teamBCode: getCC(awayName),
          scoreB: finished || isLive ? as_ : null,
          winner: finished ? winner : null,
          status: finished ? 'finished' : (isLive ? 'live' : 'scheduled'),
          isActual: true,
          penaltiesA: slotId === 'r16-7' ? 4 : null,
          penaltiesB: slotId === 'r16-7' ? 3 : null,
          note: slotId === 'r16-7' ? 'Switzerland won 4-3 on penalties' : null,
          matchTime: m.date || null,
        };

      });
    }

    // Merge skeleton with slot data, propagating winners forward
    const slotMap = {};
    BRACKET_SKELETON.forEach(slot => {
      const data = slotData[slot.id];
      slotMap[slot.id] = data
        ? { ...slot, ...data, awaitingResults: false }
        : { ...slot, teamA: null, teamACode: null, teamB: null, teamBCode: null,
            scoreA: null, scoreB: null, winner: null, status: 'scheduled',
            isActual: false, awaitingResults: true };
    });

    // Propagate winners into next rounds
    BRACKET_SKELETON.forEach(slot => {
      const m = slotMap[slot.id];
      if (m.winner && m.nextMatchId && slotMap[m.nextMatchId]) {
        const next = slotMap[m.nextMatchId];
        const s = m.nextMatchSlot || 'teamA';
        next[s] = m.winner;
        next[s + 'Code'] = getCC(m.winner);
      }
      // Propagate semi-final losers to 3rd-place
      if (m.winner && m.round === 'sf' && slotMap['third_place']) {
        const loser = m.winner === m.teamA ? m.teamB : m.teamA;
        const s = m.matchNumber === 0 ? 'teamA' : 'teamB';
        slotMap['third_place'][s] = loser;
        slotMap['third_place'][s + 'Code'] = getCC(loser);
      }
    });

    return Object.values(slotMap);
  }, [matches]);


  const predictedBracket = useMemo(() => {
    // Build a clean predicted view from the BRACKET_SKELETON,
    // seeding R16 teams from actualBracket and running Elo predictions forward.
    const actualMap = {};
    actualBracket.forEach(m => { actualMap[m.id] = m; });

    const hybridMap = {};
    BRACKET_SKELETON.forEach(slot => {
      const actualMatch = actualMap[slot.id];
      const isR16 = slot.round === 'r16';

      hybridMap[slot.id] = {
        ...slot,
        teamA: isR16 && actualMatch ? actualMatch.teamA : null,
        teamB: isR16 && actualMatch ? actualMatch.teamB : null,
        teamACode: isR16 && actualMatch ? actualMatch.teamACode : null,
        teamBCode: isR16 && actualMatch ? actualMatch.teamBCode : null,
        scoreA: null,
        scoreB: null,
        winner: null,
        status: 'predicted',
        isActual: false,
        awaitingResults: false,
      };
    });

    // Populate R16 predicted winners
    BRACKET_SKELETON.filter(s => s.round === 'r16').forEach(slot => {
      const current = hybridMap[slot.id];
      const pred = calculatePrediction(current.teamA, current.teamB);
      current.predictedWinner = pred.winner;
      current.predictedScoreA = pred.scoreA;
      current.predictedScoreB = pred.scoreB;
      current.predictionConfidence = pred.confidence;
      current.winner = current.predictedWinner;
      current.scoreA = current.predictedScoreA;
      current.scoreB = current.predictedScoreB;
    });

    const ROUND_ORDER = ['r16', 'qf', 'sf', 'final'];

    ROUND_ORDER.forEach(round => {
      const roundMatches = Object.values(hybridMap)
        .filter(m => m.round === round)
        .sort((a, b) => a.matchNumber - b.matchNumber);

      roundMatches.forEach(m => {
        // If not R16, its teamA/teamB have been propagated from previous round. Calculate prediction.
        if (m.round !== 'r16') {
          const pred = calculatePrediction(m.teamA, m.teamB);
          m.predictedWinner = pred.winner;
          m.predictedScoreA = pred.scoreA;
          m.predictedScoreB = pred.scoreB;
          m.predictionConfidence = pred.confidence;
          m.winner = pred.winner;
          m.scoreA = pred.scoreA;
          m.scoreB = pred.scoreB;
        }

        // Propagate winner to next match
        if (m.winner && m.nextMatchId) {
          const nextMatch = hybridMap[m.nextMatchId];
          if (nextMatch) {
            nextMatch[m.nextMatchSlot] = m.winner;
            nextMatch[m.nextMatchSlot + 'Code'] = getCC(m.winner);
          }
        }

        // Propagate losers to 3rd place if Semi-Final
        if (m.winner && m.round === 'sf') {
          const thirdPlace = hybridMap['third_place'];
          if (thirdPlace) {
            const loser = m.winner === m.teamA ? m.teamB : m.teamA;
            const slot = m.matchNumber === 0 ? 'teamA' : 'teamB';
            thirdPlace[slot] = loser;
            thirdPlace[slot + 'Code'] = getCC(loser);
          }
        }
      });
    });

    // Calculate prediction for 3rd place
    const thirdPlace = hybridMap['third_place'];
    if (thirdPlace && thirdPlace.teamA && thirdPlace.teamB) {
      const pred = calculatePrediction(thirdPlace.teamA, thirdPlace.teamB);
      thirdPlace.predictedWinner = pred.winner;
      thirdPlace.predictedScoreA = pred.scoreA;
      thirdPlace.predictedScoreB = pred.scoreB;
      thirdPlace.predictionConfidence = pred.confidence;
      thirdPlace.winner = pred.winner;
      thirdPlace.scoreA = pred.scoreA;
      thirdPlace.scoreB = pred.scoreB;
      thirdPlace.status = 'predicted';
    }

    return Object.values(hybridMap);
  }, [actualBracket]);

  // Derive meta counts directly from the actual bracket
  const completedMatches = actualBracket.filter(m => m.status === 'finished').length;
  const totalMatches = actualBracket.length;

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{
        background: 'linear-gradient(135deg, #040d1a, #003366)',
        padding: '36px 24px 28px',
        borderBottom: '1px solid rgba(255,215,0,0.15)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
              <span className="text-gradient-gold">Tournament Bracket</span>
            </h1>
            {hasLiveMatches && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '10px', fontWeight: 800, color: '#FF4444',
                background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.3)',
                padding: '3px 10px', borderRadius: '20px',
              }}>
                <span className="animate-live" style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: '#FF4444',
                }} />
                LIVE MATCHES
              </span>
            )}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
            {completedMatches} of {totalMatches} matches completed
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Main content: Bracket Only */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', minWidth: 0 }}>
          <TournamentBracket
            bracket={actualBracket}
            isActual={true}
            title="Actual Tournament Results"
            isAIProjections={false}
          />
          <TournamentBracket
            bracket={predictedBracket}
            isActual={false}
            title="AI Future Predictions"
            isAIProjections={true}
          />
        </div>
      </div>
    </div>
  );
}
