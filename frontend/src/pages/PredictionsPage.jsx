import React, { useState, useMemo, useEffect } from 'react';
import { Zap, Check, X, Filter } from 'lucide-react';

const COUNTRY_CODES = {
  "Argentina":"ar","Australia":"au","Belgium":"be","Brazil":"br","Canada":"ca",
  "Colombia":"co","Croatia":"hr","Denmark":"dk","Ecuador":"ec","Egypt":"eg",
  "England":"gb-eng","France":"fr","Germany":"de","Ghana":"gh","Italy":"it",
  "Japan":"jp","Mexico":"mx","Morocco":"ma","Netherlands":"nl","Norway":"no",
  "Paraguay":"py","Portugal":"pt","Saudi Arabia":"sa","Senegal":"sn",
  "South Korea":"kr","Spain":"es","Sweden":"se","Switzerland":"ch","Tunisia":"tn",
  "USA":"us","United States":"us","Uruguay":"uy","Wales":"gb-wls","Algeria":"dz",
  "Bosnia":"ba","DR Congo":"cd","Turkey":"tr","Türkiye":"tr","Panama":"pa",
  "Cape Verde":"cv","Ivory Coast":"ci","Austria":"at","Costa Rica":"cr",
  "Honduras":"hn","Peru":"pe","Chile":"cl","Serbia":"rs","Ukraine":"ua","Poland":"pl",
};

function TeamFlag({ name, size = 24 }) {
  const code = COUNTRY_CODES[name] || COUNTRY_CODES[name?.replace('Türkiye','Turkey')];
  if (code) return <img src={`https://flagcdn.com/w40/${code}.png`} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} onError={e => { e.target.style.display='none'; }} />;
  let h = 0;
  for (let i=0; i<(name||'').length; i++) h = name.charCodeAt(i) + ((h<<5)-h);
  const hue = Math.abs(h) % 360;
  return <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, hsl(${hue},70%,40%), hsl(${(hue+60)%360},80%,30%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.max(8, size*0.35)+'px', fontWeight: 800, color: 'white', border: '1px solid rgba(0,0,0,0.1)' }}>{(name||'??').slice(0,2).toUpperCase()}</div>;
}

const CONF_COLORS = { high: '#10B981', medium: '#F59E0B', low: '#EF4444' };
const CONF_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };

export default function PredictionsPage({ matches }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedConfidence, setSelectedConfidence] = useState('all');
  const [sortType, setSortType] = useState('matchOrder');

  const isLive = (status) => {
    const normalized = status?.toLowerCase();
    return normalized === 'live' || 
           normalized === 'in_progress' || 
           normalized === 'playing' ||
           normalized === 'halftime';
  };

  const isFinishedStatus = (status) => {
    const normalized = status?.toLowerCase();
    return normalized === 'finished' || normalized === 'completed' || normalized === 'ft';
  };

  const predictions = useMemo(() => {
    return matches
      .filter(m => m.prediction)
      .map(m => {
        let status = 'upcoming';
        if (isFinishedStatus(m.status)) {
          status = 'finished';
        } else if (isLive(m.status)) {
          status = 'live';
        }

        const maxP = Math.max(m.prediction.p_home || 0, m.prediction.p_away || 0, m.prediction.p_draw || 0);
        const confidence = maxP >= 0.55 ? 'high' : maxP >= 0.4 ? 'medium' : 'low';
        const predictedWinner = m.prediction.predicted_winner || 'TBD';
        const matchDate = m.date || m.datetime || new Date().toISOString();

        return {
          ...m,
          status,
          confidence,
          predictedWinner,
          matchDate,
        };
      });
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return predictions.filter(match => {
      const statusMatch = selectedStatus === 'all' || match.status === selectedStatus;
      const confidenceMatch = selectedConfidence === 'all' || match.confidence === selectedConfidence;
      return statusMatch && confidenceMatch;
    });
  }, [predictions, selectedStatus, selectedConfidence]);

  const sortedMatches = useMemo(() => {
    const result = [...filteredMatches];
    if (sortType === 'matchOrder') {
      result.sort((a, b) => new Date(a.matchDate || a.date || 0) - new Date(b.matchDate || b.date || 0));
    } else if (sortType === 'recentCompleted') {
      result.sort((a, b) => {
        const aFin = a.status === 'finished';
        const bFin = b.status === 'finished';
        if (aFin && !bFin) return -1;
        if (bFin && !aFin) return 1;
        return new Date(b.matchDate || b.date || 0) - new Date(a.matchDate || a.date || 0);
      });
    } else if (sortType === 'oldestFirst') {
      result.sort((a, b) => new Date(a.matchDate || a.date || 0) - new Date(b.matchDate || b.date || 0));
    } else if (sortType === 'alphabetical') {
      result.sort((a, b) => (a.home || '').localeCompare(b.home || ''));
    }
    return result;
  }, [filteredMatches, sortType]);

  useEffect(() => {
    console.log('=== FILTER DEBUG ===');
    console.log('All matches:', matches);
    console.log('Unique statuses:', [...new Set(matches.map(m => m.status))]);
    console.log('Selected filters:', { selectedStatus, selectedConfidence });
    console.log('Filtered results:', filteredMatches);
    console.log('Sorted results:', sortedMatches);

    // Force a live match for testing
    if (matches && matches.length > 0) {
      const testLiveMatch = { ...matches[0], status: 'live' };
      console.log('Is this live?', testLiveMatch.status === 'live');
    }
  }, [matches, selectedStatus, selectedConfidence, filteredMatches]);

  const totalPreds = predictions.length;
  const highConf = predictions.filter(p => p.confidence === 'high').length;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ background: 'linear-gradient(135deg, #040d1a, #003366)', padding: '36px 24px 28px', borderBottom: '1px solid rgba(255,215,0,0.15)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            <span className="text-gradient-gold">AI Predictions</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            {totalPreds} total predictions — {highConf} high-confidence forecasts
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'upcoming', 'live', 'finished'].map(f => (
              <button key={f} onClick={() => setSelectedStatus(f)} style={{
                padding: '7px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize',
                background: selectedStatus === f ? '#003366' : 'var(--bg-card)',
                color: selectedStatus === f ? 'white' : 'var(--text-muted)',
                border: selectedStatus === f ? '1px solid #003366' : '1px solid var(--border)',
                transition: 'all 0.2s',
              }}>
                {f}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', alignItems: 'center' }}>
            <Filter size={14} color="var(--text-muted)" />
            {['all', 'high', 'medium', 'low'].map(c => (
              <button key={c} onClick={() => setSelectedConfidence(c)} style={{
                padding: '7px 12px', fontSize: '11px', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize',
                background: selectedConfidence === c ? (c === 'all' ? '#003366' : `${CONF_COLORS[c]}18`) : 'var(--bg-card)',
                color: selectedConfidence === c ? (c === 'all' ? 'white' : CONF_COLORS[c]) : 'var(--text-muted)',
                border: `1px solid ${selectedConfidence === c && c !== 'all' ? CONF_COLORS[c] : 'var(--border)'}`,
                transition: 'all 0.2s',
              }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>Sort by:</span>
          {[
            { id: 'matchOrder', label: 'Match Order' },
            { id: 'recentCompleted', label: 'Recently Completed' },
            { id: 'oldestFirst', label: 'Oldest First' },
            { id: 'alphabetical', label: 'A-Z' }
          ].map(opt => (
            <button key={opt.id} onClick={() => setSortType(opt.id)} style={{
              padding: '7px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              background: sortType === opt.id ? '#003366' : 'var(--bg-card)',
              color: sortType === opt.id ? 'white' : 'var(--text-muted)',
              border: sortType === opt.id ? '1px solid #003366' : '1px solid var(--border)',
              transition: 'all 0.2s',
            }}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {sortedMatches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
            <Zap size={40} style={{ margin: '0 auto 12px', opacity: 0.25 }} />
            {/* 4. UI FEEDBACK: Dynamic empty message */}
            <p style={{ fontSize: '15px', fontWeight: 600 }}>
              No predictions found for {selectedStatus === 'all' ? 'all' : selectedStatus} matches with {selectedConfidence === 'all' ? 'any' : selectedConfidence} confidence.
            </p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Try changing the status or confidence filter</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
            {sortedMatches.map(m => <FullPredictionCard key={m.id} m={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function FullPredictionCard({ m }) {
  const conf = m.confidence;
  const confColor = CONF_COLORS[conf];
  const isLive = m.status === 'live';
  const isDone = m.status === 'finished';
  const hasScore = m.home_score !== null && m.home_score !== undefined;

  return (
    <div className="card-hover" style={{
      background: 'var(--bg-card)', border: `1px solid ${isLive ? 'rgba(255,68,68,0.25)' : 'var(--border)'}`,
      borderRadius: '14px', overflow: 'hidden',
      boxShadow: isLive ? '0 0 20px rgba(255,68,68,0.06)' : 'var(--shadow-card)',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Live bar */}
      {isLive && <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #FF4444, transparent)' }} />}

      <div style={{ padding: '14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#0066CC', background: 'rgba(0,102,204,0.08)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
            {m.stage === 'group' ? `Group ${m.group}` : m.stage}
          </span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {/* 5. CONFIDENCE COLOR CODING BADGE */}
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'white', background: confColor, padding: '3px 8px', borderRadius: '4px' }}>
              {CONF_LABELS[conf]}
            </span>
            {isLive && (
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#FF4444' }} className="animate-live">● LIVE</span>
            )}
            {isDone && (
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>FT</span>
            )}
          </div>
        </div>

        {/* Teams */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <TeamFlag name={m.home} size={30} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.2 }}>{m.home}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            {hasScore ? (
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--navy-600)', fontFamily: 'monospace' }}>
                {m.home_score} – {m.away_score}
              </div>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>VS</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <TeamFlag name={m.away} size={30} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.2 }}>{m.away}</span>
          </div>
        </div>

        {/* AI Forecast Section */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Forecast</span>
            {m.prediction.is_dynamic && (
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#0099FF', background: 'rgba(0,153,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>ELO</span>
            )}
          </div>

          {/* 3 prob bars */}
          {[
            { name: m.home, pct: Math.round(m.prediction.p_home * 100), color: '#003366' },
            { name: 'Draw',  pct: Math.round(m.prediction.p_draw * 100), color: '#6B7280' },
            { name: m.away, pct: Math.round(m.prediction.p_away * 100), color: '#0099FF' },
          ].map(row => (
            <div key={row.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '72px', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
              <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${row.pct}%`, height: '100%', background: row.color, borderRadius: '3px', transition: 'width 1s ease' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: row.color, width: '30px', flexShrink: 0 }}>{row.pct}%</span>
            </div>
          ))}

          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              <Zap size={10} color="#FFD700" style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Pick: <strong style={{ color: 'var(--text-primary)' }}>{m.predictedWinner}</strong>
            </span>
            {m.prediction.scoreline && (
              <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-secondary)' }}>{m.prediction.scoreline}</span>
            )}
          </div>

          {/* Result evaluation if finished */}
          {isDone && hasScore && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {m.correct_winner ? (
                <><Check size={12} color="#00CC66" />
                <span style={{ fontSize: '11px', color: '#00CC66', fontWeight: 600 }}>Prediction Correct</span></>
              ) : (
                <><X size={12} color="#FF3333" />
                <span style={{ fontSize: '11px', color: '#FF3333', fontWeight: 600 }}>Prediction Missed</span></>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
