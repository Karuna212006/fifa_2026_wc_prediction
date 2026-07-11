/**
 * LiveIndicator — Pulsing "LIVE" badge for the navbar
 * =====================================================
 * Shows when data is actively refreshing during live matches.
 */

import React from 'react';
import { Radio } from 'lucide-react';

/**
 * @param {{ isRefetching: boolean, hasLiveMatches: boolean }} props
 */
export default function LiveIndicator({ isRefetching, hasLiveMatches }) {
  if (!hasLiveMatches) return null;

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '9999px',
        background: isRefetching
          ? 'rgba(255, 68, 68, 0.15)'
          : 'rgba(255, 68, 68, 0.08)',
        border: '1px solid rgba(255, 68, 68, 0.3)',
        transition: 'all 0.3s ease',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#FF4444',
          boxShadow: '0 0 6px rgba(255, 68, 68, 0.6)',
        }}
        className="animate-live"
      />
      <span
        style={{
          fontSize: '10px',
          fontWeight: 800,
          color: '#FF4444',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        LIVE
      </span>
      {isRefetching && (
        <Radio
          size={10}
          color="#FF4444"
          className="animate-pulse"
          style={{ marginLeft: '-2px' }}
        />
      )}
    </div>
  );
}
