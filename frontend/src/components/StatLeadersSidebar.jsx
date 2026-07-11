/**
 * StatLeadersSidebar — Tabbed stat leaders with Framer Motion rank animations
 * ==============================================================================
 * 
 * Tabs: Top Goalscorers | Assists | Yellow Cards | Clean Sheets
 * 
 * Each list item: Rank, circular avatar, player name, country flag, stat value.
 * Framer Motion `layout` + `AnimatePresence` for smooth rank change animations.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Handshake, SquareSlash, Shield, Trophy, ChevronDown } from 'lucide-react';
import { Flag } from './MatchNode.jsx';

const TABS = [
  { key: 'goals',       label: 'Goals',        icon: Target,      field: 'goals' },
  { key: 'assists',     label: 'Assists',      icon: Handshake,   field: 'assists' },
  { key: 'yellowCards', label: 'Cards',        icon: SquareSlash,  field: 'yellowCards' },
  { key: 'cleanSheets', label: 'Clean Sheets', icon: Shield,      field: 'cleanSheets' },
];

/**
 * @param {{ statLeaders: Array, isRefetching?: boolean }} props
 */
export default function StatLeadersSidebar({ statLeaders = [], isRefetching = false }) {
  const [activeTab, setActiveTab] = useState('goals');
  const [showAll, setShowAll] = useState(false);

  const activeTabConfig = TABS.find(t => t.key === activeTab);
  const field = activeTabConfig?.field || 'goals';

  // Sort players by the active stat field, descending
  const sorted = useMemo(() => {
    return [...statLeaders]
      .sort((a, b) => {
        const diff = (b[field] || 0) - (a[field] || 0);
        if (diff !== 0) return diff;
        // Secondary sort by name for stable order
        return a.name.localeCompare(b.name);
      })
      .filter(p => (p[field] || 0) > 0)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [statLeaders, field]);

  const displayed = showAll ? sorted : sorted.slice(0, 10);

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
      width: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(135deg, rgba(0,51,102,0.04), rgba(255,215,0,0.02))',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '12px',
        }}>
          <Trophy size={18} color="#FFD700" />
          <h3 style={{
            fontSize: '16px', fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em', margin: 0,
          }}>
            Stat Leaders
          </h3>
          {isRefetching && (
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#FFD700', marginLeft: 'auto',
            }} className="animate-pulse" />
          )}
        </div>

        {/* Tab buttons */}
        <div style={{
          display: 'flex', gap: '4px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setShowAll(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.01em',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: isActive ? 'var(--navy-600)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Player list */}
      <div style={{ padding: '8px 0' }}>
        <AnimatePresence mode="popLayout">
          {displayed.map((player) => (
            <motion.div
              key={player.id}
              layoutId={`stat-${activeTab}-${player.id}`}
              layout="position"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                layout: { type: 'spring', stiffness: 500, damping: 35 },
                opacity: { duration: 0.2 },
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.15s',
                cursor: 'default',
              }}
              whileHover={{ backgroundColor: 'var(--bg-card-hover)' }}
            >
              {/* Rank */}
              <span style={{
                width: '24px',
                fontSize: '13px',
                fontWeight: 800,
                color: player.rank <= 3
                  ? ['#FFD700', '#C0C0C0', '#CD7F32'][player.rank - 1]
                  : 'var(--text-subtle)',
                textAlign: 'center',
                fontFamily: 'monospace',
              }}>
                {player.rank}
              </span>

              {/* Avatar */}
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: player.rank <= 3
                  ? `2px solid ${['#FFD700', '#C0C0C0', '#CD7F32'][player.rank - 1]}`
                  : '2px solid var(--border)',
                flexShrink: 0,
              }}>
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  width={36}
                  height={36}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              </div>

              {/* Name + country */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px', fontWeight: 600,
                  color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em',
                }}>
                  {player.name}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  marginTop: '2px',
                }}>
                  <Flag code={player.countryCode} size={14} />
                  <span style={{
                    fontSize: '10px', color: 'var(--text-subtle)',
                    fontWeight: 500,
                  }}>
                    {player.country}
                  </span>
                  <span style={{
                    fontSize: '9px', color: 'var(--text-subtle)',
                    opacity: 0.6,
                  }}>
                    · {player.position}
                  </span>
                </div>
              </div>

              {/* Stat value */}
              <motion.span
                key={`${player.id}-${player[field]}`}
                initial={{ scale: 1.3, color: '#FFD700' }}
                animate={{ scale: 1, color: 'var(--text-primary)' }}
                transition={{ duration: 0.4 }}
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  minWidth: '30px',
                  textAlign: 'right',
                  letterSpacing: '-0.02em',
                }}
              >
                {player[field] || 0}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Show more / less */}
        {sorted.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '4px', width: '100%',
              padding: '10px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600,
              color: 'var(--accent-400)',
            }}
          >
            {showAll ? 'Show Less' : `Show All (${sorted.length})`}
            <ChevronDown
              size={14}
              style={{
                transform: showAll ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </button>
        )}

        {/* Empty state */}
        {sorted.length === 0 && (
          <div style={{
            padding: '32px 20px',
            textAlign: 'center',
            color: 'var(--text-subtle)',
            fontSize: '13px',
          }}>
            No stats recorded yet for this category.
          </div>
        )}
      </div>
    </div>
  );
}
