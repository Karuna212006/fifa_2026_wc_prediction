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

/**
 * Compute the vertical spacing and padding for each round
 */
function getRoundSpacing(round, matchCount) {
  switch (round) {
    case 'r16': return { gap: 8, topPad: 0 };
    case 'qf':  return { gap: 136, topPad: 64 };
    case 'sf':  return { gap: 392, topPad: 192 };
    case 'final': return { gap: 0, topPad: 448 };
    default: return { gap: 8, topPad: 0 };
  }
}

/**
 * Derive 3rd place teams from the semi-final matches
 */
function derive3rdPlaceTeams(sfMatches, thirdPlaceMatch) {
  if (thirdPlaceMatch.teamA && thirdPlaceMatch.teamB) {
    return thirdPlaceMatch;
  }

  const sf0 = sfMatches.find(m => m.matchNumber === 0);
  const sf1 = sfMatches.find(m => m.matchNumber === 1);

  let teamA = thirdPlaceMatch.teamA;
  let teamACode = thirdPlaceMatch.teamACode;
  let teamB = thirdPlaceMatch.teamB;
  let teamBCode = thirdPlaceMatch.teamBCode;

  if (!teamA && sf0 && sf0.status === 'finished' && sf0.winner) {
    teamA = sf0.winner === sf0.teamA ? sf0.teamB : sf0.teamA;
    teamACode = sf0.winner === sf0.teamA ? sf0.teamBCode : sf0.teamACode;
  }

  if (!teamB && sf1 && sf1.status === 'finished' && sf1.winner) {
    teamB = sf1.winner === sf1.teamA ? sf1.teamB : sf1.teamA;
    teamBCode = sf1.winner === sf1.teamA ? sf1.teamBCode : sf1.teamACode;
  }

  return { ...thirdPlaceMatch, teamA, teamACode, teamB, teamBCode };
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

  // Get 3rd place match with derived teams
  const thirdPlaceMatch = useMemo(() => {
    const raw = bracket.find(m => m.round === 'third_place');
    if (!raw) return null;
    const sfMatches = roundGroups.sf || [];
    return derive3rdPlaceTeams(sfMatches, raw);
  }, [bracket, roundGroups]);

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

                {/* 3rd Place Play-off — positioned below SF column */}
                {round === 'sf' && thirdPlaceMatch && (
                  <div style={{
                    marginTop: '32px',
                    position: 'relative',
                  }}>
                    {/* Connector lines from SF matches to 3rd place */}
                    <div className="third-place-connector" />

                    <div style={{
                      padding: '6px 16px',
                      borderRadius: '8px',
                      marginBottom: '12px',
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
                      {...thirdPlaceMatch}
                      teamA={thirdPlaceMatch.teamA}
                      teamB={thirdPlaceMatch.teamB}
                      isThirdPlace={true}
                      isActual={isActual}
                    />

                    {/* Show which SF each team comes from */}
                    <div style={{
                      marginTop: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}>
                      <span style={{
                        fontSize: '9px', color: 'var(--text-subtle)',
                        fontStyle: 'italic',
                      }}>
                        ← Loser of SF1{sf0?.teamA && sf0?.teamB ? ` (${sf0.teamA} vs ${sf0.teamB})` : ''}
                      </span>
                      <span style={{
                        fontSize: '9px', color: 'var(--text-subtle)',
                        fontStyle: 'italic',
                      }}>
                        ← Loser of SF2{sf1?.teamA && sf1?.teamB ? ` (${sf1.teamA} vs ${sf1.teamB})` : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Connector lines between rounds */}
                {round !== 'final' && (
                  <BracketConnectors round={round} matchCount={matches.length} />
                )}
              </div>
            );
          })}
        </div>
      </div>
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
