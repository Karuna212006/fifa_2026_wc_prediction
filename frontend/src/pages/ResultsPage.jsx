import React, { useMemo } from 'react';
import { Check, X, Clock, Trophy, TrendingUp } from 'lucide-react';

const COUNTRY_CODES = {
  "Argentina":"ar","Australia":"au","Belgium":"be","Brazil":"br","Canada":"ca",
  "Colombia":"co","Croatia":"hr","Denmark":"dk","Ecuador":"ec","Egypt":"eg",
  "England":"gb-eng","France":"fr","Germany":"de","Ghana":"gh","Italy":"it",
  "Japan":"jp","Mexico":"mx","Morocco":"ma","Netherlands":"nl","Norway":"no",
  "Paraguay":"py","Portugal":"pt","Saudi Arabia":"sa","Senegal":"sn",
  "South Korea":"kr","Spain":"es","Sweden":"se","Switzerland":"ch","Tunisia":"tn",
  "USA":"us","United States":"us","Uruguay":"uy","Wales":"gb-wls","Algeria":"dz",
  "Bosnia":"ba","DR Congo":"cd","Turkey":"tr","Türkiye":"tr","Panama":"pa","Austria":"at",
};

function TeamFlag({ name, size = 22 }) {
  const code = COUNTRY_CODES[name] || COUNTRY_CODES[name?.replace('Türkiye','Turkey')];
  if (code) return <img src={`https://flagcdn.com/w40/${code}.png`} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} onError={e => { e.target.style.display='none'; }} />;
  let h = 0;
  for (let i=0; i<(name||'').length; i++) h = name.charCodeAt(i) + ((h<<5)-h);
  const hue = Math.abs(h) % 360;
  return <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, hsl(${hue},70%,40%), hsl(${(hue+60)%360},80%,30%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: 'white' }}>{(name||'??').slice(0,2).toUpperCase()}</div>;
}

export default function ResultsPage({ matches, accuracy }) {
  const finished = useMemo(() =>
    matches
      .filter(m => m.status === 'finished')
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
    [matches]
  );

  const correct = finished.filter(m => m.correct_winner).length;
  const withPred = finished.filter(m => m.prediction).length;
  const accPct = withPred > 0 ? Math.round((correct / withPred) * 100) : null;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #040d1a, #003366)', padding: '36px 24px 28px', borderBottom: '1px solid rgba(255,215,0,0.15)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            <span className="text-gradient-gold">Results</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Completed matches with prediction accuracy tracking</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ background: 'var(--navy-600)', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
          {[
            { label: 'Matches Played', value: finished.length, icon: <Trophy size={16} color="#FFD700" /> },
            { label: 'Predictions Made', value: withPred, icon: <TrendingUp size={16} color="#0099FF" /> },
            { label: 'Correct Picks', value: correct, icon: <Check size={16} color="#00CC66" /> },
            { label: 'Winner Accuracy', value: accPct !== null ? `${accPct}%` : '–', icon: <Trophy size={16} color="#FFD700" /> },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(0,51,102,0.95)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {s.icon}
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'white' }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {finished.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
            <Clock size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No finished matches yet.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            {finished.map((m, i) => (
              <ResultRow key={m.id} m={m} isLast={i === finished.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRow({ m, isLast }) {
  const hasScore = m.home_score !== null && m.home_score !== undefined;

  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
      display: 'grid', gridTemplateColumns: '100px 1fr auto',
      gap: '16px', alignItems: 'center',
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Stage + Date */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#0066CC', background: 'rgba(0,102,204,0.08)', padding: '2px 7px', borderRadius: '4px', display: 'inline-block', textTransform: 'uppercase', marginBottom: '4px' }}>
          {m.stage === 'group' ? `Grp ${m.group}` : m.stage}
        </div>
        {m.date && (
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {new Date(m.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>

      {/* Match */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.home}</span>
          <TeamFlag name={m.home} size={22} />
        </div>
        {/* Score */}
        <div style={{ textAlign: 'center', minWidth: '64px' }}>
          {hasScore ? (
            <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--navy-600)', fontFamily: 'monospace' }}>
              {m.home_score} – {m.away_score}
            </span>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FT</span>
          )}
          {m.prediction && (
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Pred: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{m.prediction.scoreline || '–'}</span>
            </div>
          )}
        </div>
        {/* Away */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
          <TeamFlag name={m.away} size={22} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.away}</span>
        </div>
      </div>

      {/* Result Badge */}
      <div style={{ textAlign: 'right' }}>
        {m.prediction ? (
          m.correct_winner ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#00CC66', background: 'rgba(0,204,102,0.1)', padding: '4px 10px', borderRadius: '6px' }}>
              <Check size={12} /> Correct
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#FF3333', background: 'rgba(255,51,51,0.1)', padding: '4px 10px', borderRadius: '6px' }}>
              <X size={12} /> Missed
            </span>
          )
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No pred.</span>
        )}
      </div>
    </div>
  );
}
