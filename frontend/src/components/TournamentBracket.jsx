/**
 * TournamentBracket — Interactive 48-team knockout bracket
 * ==========================================================
 * 
 * Renders a horizontally scrollable bracket:
 *   R32 (16 matches) → R16 (8) → QF (4) → SF (2) → Final (1)
 *   + 3rd Place Play-off below the SF column
 * 
 * Connecting lines are drawn via CSS pseudo-elements and are
 * computed dynamically based on match positions in each round.
 */

import React, { useMemo } from 'react';
import MatchNode from './MatchNode.jsx';

const ROUND_LABELS = {
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-Finals',
  sf: 'Semi-Finals',
  final: 'Final',
  third_place: '3rd Place',
};

const ROUND_ORDER = ['r16', 'qf', 'sf', 'final'];

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

function predictMatch(teamA, teamB) {
  if (!teamA || !teamB) return { predictedWinner: null, predictionConfidence: 0 };
  const rA = getTeamRating(teamA);
  const rB = getTeamRating(teamB);
  const probA = 1 / (1 + Math.pow(10, -(rA - rB) / 400));
  const predictedWinner = probA >= 0.5 ? teamA : teamB;
  const confidence = Math.round((probA >= 0.5 ? probA : (1 - probA)) * 100);
  return { predictedWinner, predictionConfidence: confidence };
}

/**
 * Compute the vertical spacing and padding for each round
 */
function getRoundSpacing(round, matchCount) {
  switch (round) {
    case 'r16': return { gap: 8, topPad: 0 };
    case 'qf': return { gap: 136, topPad: 64 };
    case 'sf': return { gap: 392, topPad: 192 };
    case 'final': return { gap: 0, topPad: 448 };
    default: return { gap: 8, topPad: 0 };
  }
}




export default function TournamentBracket({
  bracket = [],
  isActual = false,
  title = "🏆 Tournament Bracket",
  isAIProjections = false,
}) {
  // Group matches by round
  const roundGroups = useMemo(() => {
    const groups = {};
    for (const round of ROUND_ORDER) {
      groups[round] = bracket
        .filter(m => m.round === round)
        .sort((a, b) => a.matchNumber - b.matchNumber);
    }
    return groups;
  }, [bracket]);

  // Compute the 3rd Place match dynamically based on Semi-Final results
  const thirdPlaceMatch = useMemo(() => {
    const sfMatches = roundGroups.sf || [];
    const sf0 = sfMatches[0];
    const sf1 = sfMatches[1];

    let teamA = null;
    let teamACode = null;
    let teamB = null;
    let teamBCode = null;

    if (isActual) {
      if (sf0) {
        if (sf0.winner) {
          teamA = sf0.winner === sf0.teamA ? sf0.teamB : sf0.teamA;
          teamACode = sf0.winner === sf0.teamA ? sf0.teamBCode : sf0.teamACode;
        } else if (sf0.status === 'finished' && sf0.scoreA !== null && sf0.scoreB !== null) {
          teamA = sf0.scoreA < sf0.scoreB ? sf0.teamA : sf0.teamB;
          teamACode = sf0.scoreA < sf0.scoreB ? sf0.teamACode : sf0.teamBCode;
        }
      }
      if (sf1) {
        if (sf1.winner) {
          teamB = sf1.winner === sf1.teamA ? sf1.teamB : sf1.teamA;
          teamBCode = sf1.winner === sf1.teamA ? sf1.teamBCode : sf1.teamACode;
        } else if (sf1.status === 'finished' && sf1.scoreA !== null && sf1.scoreB !== null) {
          teamB = sf1.scoreA < sf1.scoreB ? sf1.teamA : sf1.teamB;
          teamBCode = sf1.scoreA < sf1.scoreB ? sf1.teamACode : sf1.teamBCode;
        }
      }
    } else {
      if (sf0) {
        if (sf0.predictedWinner) {
          teamA = sf0.predictedWinner === sf0.teamA ? sf0.teamB : sf0.teamA;
          teamACode = sf0.predictedWinner === sf0.teamA ? sf0.teamBCode : sf0.teamACode;
        } else if (sf0.winner) {
          teamA = sf0.winner === sf0.teamA ? sf0.teamB : sf0.teamA;
          teamACode = sf0.winner === sf0.teamA ? sf0.teamBCode : sf0.teamACode;
        }
      }
      if (sf1) {
        if (sf1.predictedWinner) {
          teamB = sf1.predictedWinner === sf1.teamA ? sf1.teamB : sf1.teamA;
          teamBCode = sf1.predictedWinner === sf1.teamA ? sf1.teamBCode : sf1.teamACode;
        } else if (sf1.winner) {
          teamB = sf1.winner === sf1.teamA ? sf1.teamB : sf1.teamA;
          teamBCode = sf1.winner === sf1.teamA ? sf1.teamBCode : sf1.teamACode;
        }
      }
    }

    const existing = bracket.find(m => m.id === 'third_place' || m.round === 'third_place' || m.id === (isActual ? '3rd-place-actual' : '3rd-place-prediction'));

    let predictedWinner = existing?.predictedWinner ?? null;
    let predictionConfidence = existing?.predictionConfidence ?? 0;
    let scoreA = existing?.scoreA ?? null;
    let scoreB = existing?.scoreB ?? null;

    if (!isActual && teamA && teamB) {
      const pred = predictMatch(teamA, teamB);
      predictedWinner = pred.predictedWinner;
      predictionConfidence = pred.predictionConfidence;
      if (scoreA === null || scoreB === null) {
        scoreA = predictedWinner === teamA ? 2 : 1;
        scoreB = predictedWinner === teamB ? 2 : 1;
      }
    }

    return {
      id: isActual ? '3rd-place-actual' : '3rd-place-prediction',
      round: '3rd Place Play-off',
      teamA,
      teamACode,
      teamB,
      teamBCode,
      status: existing?.status || 'scheduled',
      scoreA: existing?.scoreA ?? null,
      scoreB: existing?.scoreB ?? null,
      winner: existing?.winner ?? null,
      predictedWinner,
      predictionConfidence,
      isThirdPlace: true,
      isActual,
      awaitingResults: existing?.awaitingResults ?? (isActual ? true : false),
      penaltiesA: existing?.penaltiesA ?? null,
      penaltiesB: existing?.penaltiesB ?? null,
    };
  }, [bracket, roundGroups.sf, isActual]);

  // For the SF losers label when they're not yet determined
  const sf0 = roundGroups.sf?.[0];
  const sf1 = roundGroups.sf?.[1];

  return (
    <div style={{
      width: '100%',
      padding: isAIProjections ? '24px' : '0',
      borderRadius: isAIProjections ? '16px' : '0',
      border: isAIProjections ? '1.5px solid rgba(255, 215, 0, 0.3)' : 'none',
      background: isAIProjections ? 'rgba(255, 215, 0, 0.015)' : 'transparent',
      boxShadow: isAIProjections ? '0 0 20px rgba(255, 215, 0, 0.05), var(--shadow-sm)' : 'none',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '20px',
      }}>
        <h2 className="section-title" style={{ margin: 0, color: isAIProjections ? '#FFD700' : 'inherit' }}>
          {title}
        </h2>
      </div>

      {/* Scrollable bracket container */}
      <div
        className="bracket-container"
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '20px',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0',
          minWidth: 'max-content',
          position: 'relative',
        }}>
          {ROUND_ORDER.map((round) => {
            const matches = roundGroups[round] || [];
            const spacing = getRoundSpacing(round, matches.length);

            return (
              <div key={round} className="bracket-round" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {/* Sticky round header */}
                <div style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  background: 'var(--bg-secondary)',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: '1px solid var(--border)',
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: round === 'final' ? '#FFD700' : 'var(--text-muted)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}>
                    {ROUND_LABELS[round]}
                  </span>
                </div>

                {/* Matches column */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${spacing.gap}px`,
                  paddingTop: `${spacing.topPad}px`,
                  position: 'relative',
                }}>
                  {matches.map((match, idx) => (
                    <div
                      key={match.id}
                      className="bracket-match-wrapper"
                      data-round={round}
                      data-index={idx}
                      style={{ position: 'relative' }}
                    >
                      <MatchNode
                        {...match}
                        isFinal={round === 'final'}
                        isActual={isActual}
                      />
                    </div>
                  ))}
                </div>



                {/* Connector lines between rounds */}
                {round !== 'final' && (
                  <BracketConnectors round={round} matchCount={matches.length} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3rd Place Play-off Match */}
      {thirdPlaceMatch && (
        <div style={{
          position: 'sticky',
          left: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '24px',
        }}>
          <div style={{
            width: '100%',
            height: '1px',
            background: 'var(--border)',
            opacity: 0.3,
            marginBottom: '24px',
          }} />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(205, 127, 50, 0.3)',
              background: 'rgba(205, 127, 50, 0.04)',
              textAlign: 'center',
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#CD7F32',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                3rd Place Play-off
              </span>
            </div>
            <MatchNode
              teamA={thirdPlaceMatch.teamA}
              teamB={thirdPlaceMatch.teamB}
              teamACode={thirdPlaceMatch.teamACode}
              teamBCode={thirdPlaceMatch.teamBCode}
              scoreA={thirdPlaceMatch.scoreA}
              scoreB={thirdPlaceMatch.scoreB}
              winner={thirdPlaceMatch.winner}
              status={thirdPlaceMatch.status}
              predictedWinner={thirdPlaceMatch.predictedWinner}
              predictionConfidence={thirdPlaceMatch.predictionConfidence}
              awaitingResults={thirdPlaceMatch.awaitingResults ?? false}
              penaltiesA={thirdPlaceMatch.penaltiesA ?? null}
              penaltiesB={thirdPlaceMatch.penaltiesB ?? null}
              isThirdPlace={true}
              isFinal={false}
              isActual={isActual}
            />
          </div>
        </div>
      )}
    </div>
  );
}


/**
 * BracketConnectors — CSS-generated lines connecting adjacent rounds.
 */
function BracketConnectors({ round, matchCount }) {
  if (matchCount < 2) return null;

  const pairCount = Math.floor(matchCount / 2);
  const baseNodeHeight = 120; // approx height of a MatchNode
  const spacing = getRoundSpacing(round, matchCount);
  const gapBetweenNodes = spacing.gap;

  const lines = [];

  for (let pair = 0; pair < pairCount; pair++) {
    const topMatchIdx = pair * 2;
    const bottomMatchIdx = pair * 2 + 1;

    // Y positions relative to the column top (accounting for topPad)
    const topMatchCenter = spacing.topPad + topMatchIdx * (baseNodeHeight + gapBetweenNodes) + baseNodeHeight / 2;
    const bottomMatchCenter = spacing.topPad + bottomMatchIdx * (baseNodeHeight + gapBetweenNodes) + baseNodeHeight / 2;
    const midY = (topMatchCenter + bottomMatchCenter) / 2;

    const connectorWidth = 28;

    lines.push(
      <g key={`pair-${pair}`}>
        {/* Horizontal from top match */}
        <line
          x1={0} y1={topMatchCenter}
          x2={connectorWidth / 2} y2={topMatchCenter}
          stroke="var(--border-strong)"
          strokeWidth={1.5}
        />
        {/* Horizontal from bottom match */}
        <line
          x1={0} y1={bottomMatchCenter}
          x2={connectorWidth / 2} y2={bottomMatchCenter}
          stroke="var(--border-strong)"
          strokeWidth={1.5}
        />
        {/* Vertical connecting pair */}
        <line
          x1={connectorWidth / 2} y1={topMatchCenter}
          x2={connectorWidth / 2} y2={bottomMatchCenter}
          stroke="var(--border-strong)"
          strokeWidth={1.5}
        />
        {/* Horizontal to next round */}
        <line
          x1={connectorWidth / 2} y1={midY}
          x2={connectorWidth} y2={midY}
          stroke="var(--border-strong)"
          strokeWidth={1.5}
        />
      </g>
    );
  }

  // Total height needed
  const lastMatchBottom = spacing.topPad + (matchCount - 1) * (baseNodeHeight + gapBetweenNodes) + baseNodeHeight;

  return (
    <svg
      className="bracket-connectors-svg"
      style={{
        position: 'absolute',
        right: '-28px',
        top: '36px', // offset for the header
        width: '28px',
        height: `${lastMatchBottom}px`,
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {lines}
    </svg>
  );
}
