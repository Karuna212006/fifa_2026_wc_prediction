import React, { useState, useMemo } from 'react';
import { Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const COUNTRY_CODES = {
  "Argentina":"ar","Australia":"au","Belgium":"be","Brazil":"br","Canada":"ca",
  "Colombia":"co","Croatia":"hr","Denmark":"dk","Ecuador":"ec","Egypt":"eg",
  "England":"gb-eng","France":"fr","Germany":"de","Ghana":"gh","Italy":"it",
  "Japan":"jp","Mexico":"mx","Morocco":"ma","Netherlands":"nl","Norway":"no",
  "Paraguay":"py","Portugal":"pt","Saudi Arabia":"sa","Senegal":"sn",
  "South Korea":"kr","Spain":"es","Sweden":"se","Switzerland":"ch","Tunisia":"tn",
  "USA":"us","United States":"us","Uruguay":"uy","Wales":"gb-wls","Algeria":"dz",
  "Bosnia":"ba","DR Congo":"cd","Turkey":"tr","Türkiye":"tr","Panama":"pa",
  "Ivory Coast":"ci","Austria":"at","Costa Rica":"cr","Honduras":"hn",
  "Peru":"pe","Chile":"cl","Serbia":"rs","Ukraine":"ua","Poland":"pl",
  "Cameroon":"cm","Nigeria":"ng","Morocco":"ma","Senegal":"sn",
};

function TeamFlag({ name, size = 22 }) {
  const code = COUNTRY_CODES[name] || COUNTRY_CODES[name?.replace('Türkiye','Turkey')];
  if (code) return <img src={`https://flagcdn.com/w40/${code}.png`} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} onError={e => { e.target.style.display='none'; }} />;
  let h = 0;
  for (let i=0; i<(name||'').length; i++) h = name.charCodeAt(i) + ((h<<5)-h);
  const hue = Math.abs(h) % 360;
  return <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, hsl(${hue},70%,40%), hsl(${(hue+60)%360},80%,30%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: 'white' }}>{(name||'??').slice(0,2).toUpperCase()}</div>;
}

function computeStandings(matches) {
  const groups = {};
  const groupMatches = matches.filter(m => m.stage === 'group' && m.status === 'finished' && m.home_score !== null);

  groupMatches.forEach(m => {
    const g = m.group || 'X';
    if (!groups[g]) groups[g] = {};
    [m.home, m.away].forEach(team => {
      if (!groups[g][team]) {
        groups[g][team] = { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
      }
    });

    const hs = Number(m.home_score), as_ = Number(m.away_score);
    groups[g][m.home].played++;
    groups[g][m.away].played++;
    groups[g][m.home].gf += hs; groups[g][m.home].ga += as_;
    groups[g][m.away].gf += as_; groups[g][m.away].ga += hs;

    if (hs > as_) {
      groups[g][m.home].won++; groups[g][m.home].pts += 3;
      groups[g][m.away].lost++;
    } else if (hs < as_) {
      groups[g][m.away].won++; groups[g][m.away].pts += 3;
      groups[g][m.home].lost++;
    } else {
      groups[g][m.home].drawn++; groups[g][m.home].pts++;
      groups[g][m.away].drawn++; groups[g][m.away].pts++;
    }
  });

  // Sort each group by points, GD, GF
  const sorted = {};
  Object.entries(groups).forEach(([g, teams]) => {
    sorted[g] = Object.values(teams).sort((a, b) =>
      b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
    );
  });
  return sorted;
}

export default function StandingsPage({ matches }) {
  const standings = useMemo(() => computeStandings(matches), [matches]);
  const groups = Object.keys(standings).sort();
  const [activeGroup, setActiveGroup] = useState(groups[0] || null);

  const noData = groups.length === 0;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #040d1a, #003366)', padding: '36px 24px 28px', borderBottom: '1px solid rgba(255,215,0,0.15)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            <span className="text-gradient-gold">Group Standings</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            {noData ? 'Standings are computed from finished group-stage matches' : `${groups.length} groups tracked from ${matches.filter(m => m.stage === 'group' && m.status === 'finished').length} completed matches`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {noData ? (
          <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
            <Trophy size={40} style={{ margin: '0 auto 12px', opacity: 0.25 }} />
            <p style={{ fontSize: '15px', fontWeight: 600 }}>No group stage data available yet</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Standings will appear once matches are played and results are in</p>
          </div>
        ) : (
          <>
            {/* Group Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {groups.map(g => (
                <button key={g} onClick={() => setActiveGroup(g)} style={{
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 700, fontFamily: 'Inter, sans-serif',
                  background: activeGroup === g ? '#003366' : 'var(--bg-card)',
                  color: activeGroup === g ? 'white' : 'var(--text-muted)',
                  border: activeGroup === g ? '1px solid #003366' : '1px solid var(--border)',
                  transition: 'all 0.2s',
                }}>
                  Group {g}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[
                { color: 'rgba(255,215,0,0.12)', label: 'Group winner (advances to R16)' },
                { color: 'rgba(0,102,204,0.08)', label: 'Runner-up (advances to R16)' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <div style={{ width: '16px', height: '10px', background: l.color, borderRadius: '3px', border: '1px solid var(--border)' }} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* Table */}
            {activeGroup && standings[activeGroup] && (
              <GroupTable group={activeGroup} rows={standings[activeGroup]} />
            )}

            {/* All groups (compact) */}
            <div style={{ marginTop: '32px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>All Groups — Quick View</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {groups.map(g => (
                  <div key={g} onClick={() => setActiveGroup(g)} style={{ cursor: 'pointer' }}>
                    <MiniGroupTable group={g} rows={standings[g]} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GroupTable({ group, rows }) {
  const COLS = ['POS', 'TEAM', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'];
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ padding: '14px 20px', background: '#003366', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trophy size={16} color="#FFD700" />
        <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>Group {group}</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="standings-table" style={{ minWidth: '580px' }}>
          <thead>
            <tr>
              {COLS.map(c => <th key={c} style={{ fontSize: '10px', padding: '10px', textAlign: c === 'TEAM' ? 'left' : 'center', paddingLeft: c === 'TEAM' ? '16px' : undefined }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const rowClass = i === 0 ? 'qualify-champion' : i === 1 ? 'qualify-ucl' : '';
              return (
                <tr key={r.team} className={rowClass}>
                  <td style={{ textAlign: 'center', width: '40px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: i === 0 ? '#FFD700' : i === 1 ? '#003366' : 'var(--border)',
                      color: i < 2 ? (i === 0 ? '#040d1a' : 'white') : 'var(--text-muted)',
                      fontSize: '11px', fontWeight: 800,
                    }}>
                      {i + 1}
                    </span>
                  </td>
                  <td style={{ textAlign: 'left', paddingLeft: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TeamFlag name={r.team} size={20} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.team}</span>
                    </div>
                  </td>
                  {[r.played, r.won, r.drawn, r.lost, r.gf, r.ga, r.gf - r.ga].map((v, j) => (
                    <td key={j} style={{ fontSize: '13px', color: j === 6 ? (v > 0 ? '#00CC66' : v < 0 ? '#FF3333' : 'var(--text-muted)') : 'var(--text-secondary)' }}>
                      {j === 6 ? (v > 0 ? `+${v}` : v) : v}
                    </td>
                  ))}
                  <td>
                    <strong style={{ fontSize: '14px', color: i < 2 ? '#003366' : 'var(--text-primary)', fontWeight: 800 }}>{r.pts}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniGroupTable({ group, rows }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)', transition: 'box-shadow 0.2s, transform 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ padding: '10px 14px', background: '#003366', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Trophy size={12} color="#FFD700" />
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>Group {group}</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.team} style={{
          padding: '8px 14px',
          borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: i === 0 ? 'rgba(255,215,0,0.04)' : i === 1 ? 'rgba(0,102,204,0.03)' : 'transparent',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: i < 2 ? (i === 0 ? '#B8860B' : '#003366') : 'var(--text-muted)', width: '16px' }}>{i + 1}</span>
            <TeamFlag name={r.team} size={18} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.team}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>{r.played}MP</span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{r.pts}pts</span>
          </div>
        </div>
      ))}
    </div>
  );
}
