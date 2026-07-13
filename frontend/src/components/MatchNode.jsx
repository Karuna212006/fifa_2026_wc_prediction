/**
 * MatchNode — Individual match card for the tournament bracket
 * ==============================================================
 * 
 * @typedef {Object} MatchNodeProps
 * @property {string|null} teamA
 * @property {string|null} teamB
 * @property {string|null} teamACode - ISO country code for flag
 * @property {string|null} teamBCode
 * @property {number|null} scoreA
 * @property {number|null} scoreB
 * @property {'scheduled'|'live'|'finished'} status
 * @property {string|null} winner
 * @property {number} predictionConfidence - 0-100
 * @property {string|null} predictedWinner
 * @property {boolean} [isThirdPlace]
 * @property {boolean} [isFinal]
 * @property {string} [minute] - Current match minute for live games
 * @property {string} [venue]
 */

import CountryFlag from './CountryFlag';
import React from 'react';
import { Radio, Trophy, Medal, Clock } from 'lucide-react';

/**
 * Renders a country flag from flagcdn.com
 * @param {{ code: string|null, size?: number }} props
 */
/**
 * Wrapper for CountryFlag component
 * @param {{ code: string|null, size?: number }} props
 */
function Flag({ code, size = 20 }) {
  if (!code) return <div style={{ width: size, height: size * 0.75, background: 'var(--border)', borderRadius: 2 }} />;

  // Map size to className
  const sizeClass = size <= 14 ? 'sm' : size <= 18 ? 'md' : size <= 24 ? 'lg' : 'xl';

  return <CountryFlag countryCode={code} size={sizeClass} />;

}

/**
 * Status badge for a match
 */
function StatusBadge({ status, minute, isActual }) {
  if (status === 'live') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontSize: '10px', fontWeight: 800, color: '#FF4444',
        letterSpacing: '0.05em',
      }}>
        <span className="animate-live" style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#FF4444', boxShadow: '0 0 4px rgba(255,68,68,0.6)',
        }} />
        {minute || 'LIVE'}
      </span>
    );
  }
  if (status === 'finished') {
    return (
      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.05em' }}>
        FT
      </span>
    );
  }
  if (isActual) {
    return null;
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      fontSize: '10px', fontWeight: 600, color: 'var(--accent-400)',
    }}>
      <Clock size={10} />
      <span>TBD</span>
    </span>
  );
}

/**
 * Team row within a match node
 */
function TeamRow({ name, code, score, isWinner, isPredicted, status, isActual }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 8px',
      borderRadius: '6px',
      background: isWinner && status === 'finished' ? 'rgba(0, 204, 102, 0.06)' : 'transparent',
      transition: 'background 0.2s',
    }}>
      <Flag code={code} size={18} />
      <span style={{
        flex: 1,
        fontSize: '12px',
        fontWeight: isWinner ? 700 : 500,
        color: name ? (isWinner ? 'var(--text-primary)' : 'var(--text-secondary)') : 'var(--text-subtle)',
        letterSpacing: '-0.01em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontStyle: name ? 'normal' : 'italic',
      }}>
        {name || (isActual ? '' : 'TBD')}
      </span>
      <span style={{
        fontFamily: 'monospace',
        fontSize: '13px',
        fontWeight: 700,
        color: isWinner ? 'var(--text-primary)' : 'var(--text-muted)',
        minWidth: '18px',
        textAlign: 'right',
      }}>
        {score !== null && score !== undefined ? score : '–'}
      </span>
    </div>
  );
}

export default function MatchNode({
  teamA, teamB, teamACode, teamBCode,
  scoreA, scoreB, status, winner,
  predictionConfidence, predictedWinner,
  isThirdPlace, isFinal, minute, venue, id,
  isActual = false,
  awaitingResults = false,
}) {
  const isLive = !awaitingResults && status === 'live';
  const isFinished = !awaitingResults && status === 'finished';
  const hasPrediction = !isActual && !awaitingResults && !!predictedWinner;

  // Gold glow for predicted winner matches
  const showGoldGlow = hasPrediction && isFinished && winner === predictedWinner;

  const displayScoreA = awaitingResults ? null : scoreA;
  const displayScoreB = awaitingResults ? null : scoreB;
  const displayWinner = awaitingResults ? null : winner;
  const displayStatus = awaitingResults ? 'scheduled' : status;

  return (
    <div
      className="match-node"
      data-match-id={id}
      style={{
        width: '200px',
        background: 'var(--bg-card)',
        borderRadius: '10px',
        border: isLive
          ? '1.5px solid rgba(255, 68, 68, 0.4)'
          : showGoldGlow
            ? '1.5px solid rgba(255, 215, 0, 0.5)'
            : '1px solid var(--border)',
        boxShadow: isLive
          ? '0 0 12px rgba(255, 68, 68, 0.12), var(--shadow-sm)'
          : showGoldGlow
            ? '0 0 12px rgba(255, 215, 0, 0.25), var(--shadow-sm)'
            : 'var(--shadow-sm)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Live top accent line */}
      {isLive && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #FF4444, transparent)',
        }} />
      )}

      {/* Gold accent for correct predictions */}
      {showGoldGlow && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
        }} />
      )}

      {/* Header: round badge + status */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px',
        borderBottom: '1px solid var(--border)',
        background: isFinal
          ? 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,215,0,0.02))'
          : isThirdPlace
            ? 'linear-gradient(135deg, rgba(205,127,50,0.08), rgba(205,127,50,0.02))'
            : 'transparent',
      }}>
        {isFinal && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '9px', fontWeight: 800, color: '#FFD700',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <Trophy size={10} color="#FFD700" />
            FINAL
          </span>
        )}
        {isThirdPlace && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '9px', fontWeight: 800, color: '#CD7F32',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <Medal size={10} color="#CD7F32" />
            3RD PLACE
          </span>
        )}
        {!isFinal && !isThirdPlace && <span />}
        <StatusBadge status={displayStatus} minute={minute} isActual={isActual || awaitingResults} />
      </div>

      {/* Teams */}
      <div style={{ padding: '4px 4px' }}>
        <TeamRow
          name={teamA}
          code={teamACode}
          score={displayScoreA}
          isWinner={isFinished && displayWinner === teamA}
          isPredicted={hasPrediction && predictedWinner === teamA}
          status={displayStatus}
          isActual={isActual}
        />
        <div style={{
          height: '1px', margin: '0 8px',
          background: 'var(--border)',
          opacity: 0.5,
        }} />
        <TeamRow
          name={teamB}
          code={teamBCode}
          score={displayScoreB}
          isWinner={isFinished && displayWinner === teamB}
          isPredicted={hasPrediction && predictedWinner === teamB}
          status={displayStatus}
          isActual={isActual}
        />
      </div>

      {/* Prediction confidence bar */}
      {hasPrediction && (
        <div style={{
          padding: '4px 10px 6px',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '3px',
          }}>
            <span style={{
              fontSize: '9px', fontWeight: 600,
              color: 'var(--text-subtle)', letterSpacing: '0.03em',
            }}>
              {predictedWinner}
            </span>
            <span style={{
              fontSize: '9px', fontWeight: 700,
              color: predictionConfidence >= 75 ? 'var(--success)' :
                predictionConfidence >= 50 ? 'var(--warning)' : 'var(--error)',
            }}>
              {predictionConfidence}%
            </span>
          </div>
          <div style={{
            height: '3px', borderRadius: '2px',
            background: 'var(--bg-tertiary)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              width: `${predictionConfidence}%`,
              background: predictionConfidence >= 75 ? 'var(--success)' :
                predictionConfidence >= 50 ? 'var(--warning)' : 'var(--error)',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      )}

      {/* Awaiting Official Results footer */}
      {awaitingResults && (
        <div style={{
          padding: '6px 10px',
          borderTop: '1px solid var(--border)',
          background: 'rgba(255, 255, 255, 0.015)',
          fontSize: '9px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          Awaiting Official Results
        </div>
      )}
    </div>
  );
}

export { Flag };
