/**
 * BracketPage — Tournament bracket + stat leaders sidebar + dev tools
 * =====================================================================
 * 
 * Combines TournamentBracket and StatLeadersSidebar in a responsive grid.
 * In dev mode, shows a "Simulate Goal" panel for testing auto-updates.
 */

import React, { useState, useMemo } from 'react';
import TournamentBracket from '../components/TournamentBracket.jsx';
import { Trophy, Zap, RotateCcw, Play, Square, Clock } from 'lucide-react';
import { actualMatches } from '../data/actualMatchData.js';

/**
 * @param {{
 *   bracketData: { bracket: object[], statLeaders: object[], meta: object } | null,
 *   isLoading: boolean,
 *   isRefetching: boolean,
 *   hasLiveMatches: boolean,
 *   simulateGoal: (matchId: string, team: 'teamA'|'teamB') => object,
 *   finishMatch: (matchId: string) => object,
 *   resetData: () => void,
 * }} props
 */
export default function BracketPage({
  bracketData,
  isLoading,
  isRefetching,
  hasLiveMatches,
  simulateGoal,
  finishMatch,
  resetData,
}) {
  const [devMessage, setDevMessage] = useState(null);

  const bracket = bracketData?.bracket || [];
  const statLeaders = bracketData?.statLeaders || [];
  const meta = bracketData?.meta || {};

  const actualBracket = useMemo(() => {
    console.log('BracketPage: Using actualMatchData.js for Actual Tournament Results. Available verified matches count:', actualMatches.length);
    
    if (!bracket || bracket.length === 0) return [];

    const actualMap = {};
    bracket.forEach(m => {
      actualMap[m.id] = {
        ...m,
        teamA: m.round === 'r16' ? m.teamA : null,
        teamB: m.round === 'r16' ? m.teamB : null,
        teamACode: m.round === 'r16' ? m.teamACode : null,
        teamBCode: m.round === 'r16' ? m.teamBCode : null,
        scoreA: null,
        scoreB: null,
        status: 'scheduled',
        winner: null,
        awaitingResults: true,
      };
    });

    const ROUND_ORDER = ['r16', 'qf', 'sf', 'final'];
    
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
    };
    const getCountryCode = (name) => CC_MAP[name] || "un";

    ROUND_ORDER.forEach(round => {
      const roundMatches = Object.values(actualMap)
        .filter(m => m.round === round)
        .sort((a, b) => a.matchNumber - b.matchNumber);

      roundMatches.forEach(m => {
        const realMatch = actualMatches.find(am => am.id === m.id);

        if (realMatch) {
          m.teamA = realMatch.teamA;
          m.teamB = realMatch.teamB;
          m.teamACode = realMatch.teamACode || getCountryCode(realMatch.teamA);
          m.teamBCode = realMatch.teamBCode || getCountryCode(realMatch.teamB);
          m.scoreA = realMatch.scoreA;
          m.scoreB = realMatch.scoreB;
          m.status = realMatch.status || 'finished';
          m.winner = realMatch.winner;
          m.awaitingResults = false;

          if (m.winner && m.nextMatchId) {
            const nextMatch = actualMap[m.nextMatchId];
            if (nextMatch) {
              nextMatch[m.nextMatchSlot] = m.winner;
              nextMatch[m.nextMatchSlot + 'Code'] = getCountryCode(m.winner);
            }
          }

          if (m.winner && m.round === 'sf') {
            const thirdPlace = actualMap['third_place'];
            if (thirdPlace) {
              const loser = m.winner === m.teamA ? m.teamB : m.teamA;
              const slot = m.matchNumber === 0 ? 'teamA' : 'teamB';
              thirdPlace[slot] = loser;
              thirdPlace[slot + 'Code'] = getCountryCode(loser);
            }
          }
        }
      });
    });

    const thirdPlace = actualMap['third_place'];
    if (thirdPlace) {
      const realThird = actualMatches.find(am => am.id === 'third_place');
      if (realThird) {
        thirdPlace.teamA = realThird.teamA;
        thirdPlace.teamB = realThird.teamB;
        thirdPlace.teamACode = realThird.teamACode || getCountryCode(realThird.teamA);
        thirdPlace.teamBCode = realThird.teamBCode || getCountryCode(realThird.teamB);
        thirdPlace.scoreA = realThird.scoreA;
        thirdPlace.scoreB = realThird.scoreB;
        thirdPlace.status = realThird.status || 'finished';
        thirdPlace.winner = realThird.winner;
        thirdPlace.awaitingResults = false;
      }
    }

    return Object.values(actualMap);
  }, [bracket]);

  const predictedBracket = useMemo(() => {
    console.log('BracketPage: Using live mock API / predictions data for AI Future Predictions.');
    
    if (!bracket || bracket.length === 0) return [];
    
    const actualMap = {};
    actualBracket.forEach(m => {
      actualMap[m.id] = m;
    });

    const hybridMap = {};
    bracket.forEach(m => {
      const actualMatch = actualMap[m.id];
      const hasActualResult = actualMatch && !actualMatch.awaitingResults;

      hybridMap[m.id] = {
        ...m,
        teamA: hasActualResult || m.round === 'r16' ? actualMatch.teamA : null,
        teamB: hasActualResult || m.round === 'r16' ? actualMatch.teamB : null,
        teamACode: hasActualResult || m.round === 'r16' ? actualMatch.teamACode : null,
        teamBCode: hasActualResult || m.round === 'r16' ? actualMatch.teamBCode : null,
        scoreA: hasActualResult ? actualMatch.scoreA : null,
        scoreB: hasActualResult ? actualMatch.scoreB : null,
        winner: hasActualResult ? actualMatch.winner : null,
        status: hasActualResult ? actualMatch.status : m.status,
      };
    });

    const ROUND_ORDER = ['r16', 'qf', 'sf', 'final'];
    
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
    };
    const getCountryCode = (name) => CC_MAP[name] || "un";

    ROUND_ORDER.forEach(round => {
      const roundMatches = Object.values(hybridMap)
        .filter(m => m.round === round)
        .sort((a, b) => a.matchNumber - b.matchNumber);

      roundMatches.forEach(m => {
        const actualMatch = actualMap[m.id];
        const hasActualResult = actualMatch && !actualMatch.awaitingResults;

        if (!hasActualResult) {
          m.scoreA = m.predictedScoreA !== undefined ? m.predictedScoreA : (m.predictedWinner === m.teamA ? 2 : 1);
          m.scoreB = m.predictedScoreB !== undefined ? m.predictedScoreB : (m.predictedWinner === m.teamB ? 2 : 1);
          m.winner = m.predictedWinner;
        }

        if (m.winner && m.nextMatchId) {
          const nextMatch = hybridMap[m.nextMatchId];
          if (nextMatch) {
            nextMatch[m.nextMatchSlot] = m.winner;
            nextMatch[m.nextMatchSlot + 'Code'] = getCountryCode(m.winner);
          }
        }

        if (m.winner && m.round === 'sf') {
          const thirdPlace = hybridMap['third_place'];
          if (thirdPlace) {
            const loser = m.winner === m.teamA ? m.teamB : m.teamA;
            const slot = m.matchNumber === 0 ? 'teamA' : 'teamB';
            thirdPlace[slot] = loser;
            thirdPlace[slot + 'Code'] = getCountryCode(loser);
          }
        }
      });
    });

    const thirdPlace = hybridMap['third_place'];
    if (thirdPlace) {
      const actualThird = actualMap['third_place'];
      const hasActualThird = actualThird && !actualThird.awaitingResults;
      if (!hasActualThird) {
        thirdPlace.scoreA = thirdPlace.predictedScoreA !== undefined ? thirdPlace.predictedScoreA : (thirdPlace.predictedWinner === thirdPlace.teamA ? 2 : 1);
        thirdPlace.scoreB = thirdPlace.predictedScoreB !== undefined ? thirdPlace.predictedScoreB : (thirdPlace.predictedWinner === thirdPlace.teamB ? 2 : 1);
        thirdPlace.winner = thirdPlace.predictedWinner;
      }
    }

    return Object.values(hybridMap);
  }, [bracket, actualBracket]);

  // Find live matches for the dev tools
  const liveMatches = useMemo(() =>
    bracket.filter(m => m.status === 'live'),
    [bracket]
  );

  const scheduledMatches = useMemo(() =>
    bracket.filter(m => m.status === 'scheduled' && m.teamA && m.teamB),
    [bracket]
  );

  const showDevMessage = (msg) => {
    setDevMessage(msg);
    setTimeout(() => setDevMessage(null), 3000);
  };

  const handleSimulateGoal = (matchId, team) => {
    const result = simulateGoal(matchId, team);
    if (result.success) {
      const match = result.match;
      const teamName = team === 'teamA' ? match.teamA : match.teamB;
      showDevMessage(`⚽ GOAL! ${teamName} scores! (${match.scoreA}–${match.scoreB})`);
    } else {
      showDevMessage(`❌ ${result.error}`);
    }
  };

  const handleFinishMatch = (matchId) => {
    const result = finishMatch(matchId);
    if (result.success) {
      showDevMessage(`✅ Match finished: ${result.match.winner} wins!`);
    } else {
      showDevMessage(`❌ ${result.error}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
        <div style={{
          background: 'linear-gradient(135deg, #040d1a, #003366)',
          padding: '36px 24px 28px',
          borderBottom: '1px solid rgba(255,215,0,0.15)',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              <span className="text-gradient-gold">Tournament Bracket</span>
            </h1>
          </div>
        </div>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
        </div>
      </div>
    );
  }

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
            {meta.completedMatches || 0} of {meta.totalMatches || 0} matches completed
            {isRefetching && ' • Updating...'}
            {meta.lastUpdated && ` • Last updated ${new Date(meta.lastUpdated).toLocaleTimeString()}`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Dev toast */}
        {devMessage && (
          <div className="toast animate-slide-in-right" style={{
            background: 'var(--navy-600)', color: 'white',
            border: '1px solid rgba(255,215,0,0.3)',
          }}>
            {devMessage}
          </div>
        )}

        {/* Dev Tools */}
        <details className="dev-tools-panel">
          <summary>🛠 Dev Tools — Simulate Match Events</summary>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Simulate goal buttons for live matches */}
            {liveMatches.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Live Matches — Score a Goal:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {liveMatches.map(m => (
                    <div key={m.id} style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: '8px', padding: '6px 10px',
                    }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '4px' }}>
                        {m.id}:
                      </span>
                      <button
                        onClick={() => handleSimulateGoal(m.id, 'teamA')}
                        className="btn"
                        style={{
                          padding: '3px 8px', fontSize: '10px', fontWeight: 700,
                          background: 'var(--navy-600)', color: 'white', borderRadius: '4px',
                        }}
                      >
                        ⚽ {m.teamA}
                      </button>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {m.scoreA ?? 0}–{m.scoreB ?? 0}
                      </span>
                      <button
                        onClick={() => handleSimulateGoal(m.id, 'teamB')}
                        className="btn"
                        style={{
                          padding: '3px 8px', fontSize: '10px', fontWeight: 700,
                          background: 'var(--navy-600)', color: 'white', borderRadius: '4px',
                        }}
                      >
                        ⚽ {m.teamB}
                      </button>
                      <button
                        onClick={() => handleFinishMatch(m.id)}
                        className="btn"
                        style={{
                          padding: '3px 8px', fontSize: '10px', fontWeight: 700,
                          background: 'var(--success)', color: 'white', borderRadius: '4px',
                          marginLeft: '4px',
                        }}
                      >
                        <Square size={8} /> FT
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start a scheduled match */}
            {scheduledMatches.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Start a Scheduled Match (scores a goal to begin):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {scheduledMatches.slice(0, 6).map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleSimulateGoal(m.id, 'teamA')}
                      className="btn"
                      style={{
                        padding: '4px 10px', fontSize: '10px', fontWeight: 600,
                        background: 'var(--bg-card)', color: 'var(--text-secondary)',
                        border: '1px solid var(--border)', borderRadius: '6px',
                      }}
                    >
                      <Play size={10} /> {m.id}: {m.teamA} vs {m.teamB}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reset button */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={resetData}
                className="btn"
                style={{
                  padding: '4px 12px', fontSize: '10px', fontWeight: 700,
                  background: 'rgba(255,51,51,0.1)', color: 'var(--error)',
                  border: '1px solid rgba(255,51,51,0.3)', borderRadius: '6px',
                }}
              >
                <RotateCcw size={10} /> Reset All Data
              </button>
              <span style={{ fontSize: '10px', color: 'var(--text-subtle)', alignSelf: 'center' }}>
                Auto-updates every {hasLiveMatches ? '30s' : '5min'}
                {isRefetching && ' (fetching...)'}
              </span>
            </div>
          </div>
        </details>

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
