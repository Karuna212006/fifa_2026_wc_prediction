import React, { useMemo } from 'react';
import { Trophy, ArrowRight, Star, Activity, Zap, TrendingUp, Calendar, CheckCircle2, Clock } from 'lucide-react';
import VideoBlock from '../components/VideoBlock';

// Country ISO codes
const COUNTRY_CODES = {
  "Argentina":"ar","Australia":"au","Belgium":"be","Brazil":"br","Canada":"ca",
  "Colombia":"co","Croatia":"hr","Denmark":"dk","Ecuador":"ec","Egypt":"eg",
  "England":"gb-eng","France":"fr","Germany":"de","Ghana":"gh","Italy":"it",
  "Japan":"jp","Mexico":"mx","Morocco":"ma","Netherlands":"nl","Norway":"no",
  "Paraguay":"py","Portugal":"pt","Saudi Arabia":"sa","Senegal":"sn",
  "South Korea":"kr","Spain":"es","Sweden":"se","Switzerland":"ch","Tunisia":"tn",
  "USA":"us","United States":"us","Uruguay":"uy","Wales":"gb-wls","Algeria":"dz",
  "Bosnia":"ba","DR Congo":"cd","Turkey":"tr","Panama":"pa","Cape Verde":"cv",
  "Ivory Coast":"ci","Austria":"at","Bosnia and Herzegovina":"ba","Türkiye":"tr",
  "Democratic Republic of the Congo":"cd","Costa Rica":"cr","Honduras":"hn",
  "Peru":"pe","Chile":"cl","Venezuela":"ve","Bolivia":"bo","Serbia":"rs",
  "Ukraine":"ua","Poland":"pl","Slovakia":"sk","Czech Republic":"cz","Romania":"ro",
  "Hungary":"hu","Scotland":"gb-sct","Ireland":"ie","Greece":"gr",
  "New Zealand":"nz","Cameroon":"cm","Nigeria":"ng","Mali":"ml","Zimbabwe":"zw",
};

function TeamFlag({ name, size = 24 }) {
  const code = COUNTRY_CODES[name] || COUNTRY_CODES[name?.replace('Türkiye','Turkey')];
  if (code) {
    return (
      <img
        src={`https://flagcdn.com/w40/${code}.png`}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }}
        onError={e => { e.target.style.display = 'none'; }}
      />
    );
  }
  let h = 0;
  for (let i = 0; i < (name||'').length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  const hue = Math.abs(h) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},70%,40%), hsl(${(hue+60)%360},80%,30%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.max(8, size * 0.35) + 'px', fontWeight: 800, color: 'white',
      border: '1px solid rgba(0,0,0,0.1)',
    }}>
      {(name||'??').slice(0,2).toUpperCase()}
    </div>
  );
}

const NEWS_ARTICLES = [
  {
    category: 'Preview', color: '#0066CC',
    title: 'Spain vs Germany: The Clash of Titans',
    excerpt: 'Two of Europe\'s most decorated nations face off in what our model rates as the highest-stakes fixture of the tournament. Key stats and AI forecast inside.',
    date: 'Jul 8, 2026', readTime: '4 min read',
    emoji: '⚔️',
  },
  {
    category: 'Analysis', color: '#00CC66',
    title: 'Elo Ratings Shake-Up After Group Stage',
    excerpt: 'Morocco\'s stunning performance in Group C has elevated their Elo rating by 48 points, pushing them into top-16 contention according to our model.',
    date: 'Jul 7, 2026', readTime: '6 min read',
    emoji: '📊',
  },
  {
    category: 'Insight', color: '#FF9900',
    title: 'The Dark Horses: Teams Beating the Odds',
    excerpt: 'Japan, Morocco and Colombia are defying pre-tournament predictions. Our Poisson model breaks down why traditional powerhouses are under threat.',
    date: 'Jul 6, 2026', readTime: '5 min read',
    emoji: '🐎',
  },
];

export default function HomePage({ matches, accuracy, error, navigate }) {
  const liveMatches = useMemo(() => matches.filter(m => m.status !== 'finished' && m.status !== 'notstarted').slice(0, 6), [matches]);
  const upcomingMatches = useMemo(() => matches.filter(m => m.status === 'notstarted').slice(0, 6), [matches]);
  const displayMatches = liveMatches.length > 0 ? liveMatches : upcomingMatches;

  const stats = [
    { label: 'Winner Accuracy', value: accuracy.winner_accuracy ? `${accuracy.winner_accuracy}%` : '–', icon: <Trophy size={18} color="#FFD700" />, color: '#FFD700' },
    { label: 'Matches Scored',  value: accuracy.finished_with_predictions ?? '–',                       icon: <CheckCircle2 size={18} color="#00CC66" />, color: '#00CC66' },
    { label: 'Exact Scoreline', value: accuracy.scoreline_accuracy ? `${accuracy.scoreline_accuracy}%` : '–', icon: <Star size={18} color="#0099FF" />, color: '#0099FF' },
    { label: 'Brier Score',     value: accuracy.brier_score ?? '–',                                     icon: <Activity size={18} color="#FF9900" />, color: '#FF9900' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ===== HERO ===== */}
      <VideoBlock
        src="/media/placeholder-hero.mp4"
        poster="/media/placeholder-hero-poster.jpg"
        mode="background"
        height="520px"
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', alignItems: 'center', textAlign: 'left' }}>
          <div>
            {/* Badge */}
            <div className="animate-fade-in-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', padding: '6px 14px', borderRadius: '20px', marginBottom: '20px' }}>
              <Zap size={13} color="#FFD700" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI-Powered Predictions</span>
            </div>

            {/* Heading */}
            <h1 className="animate-fade-in-up delay-100" style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px' }}>
              FIFA World Cup<br />
              <span className="text-gradient-gold">2026™ Predictions</span>
            </h1>

            <p className="animate-fade-in-up delay-200" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '520px', marginBottom: '32px' }}>
              Experience the most advanced tournament forecasting platform — powered by Elo ratings, Poisson models and Monte Carlo simulation across {matches.length || '100+'} matches.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up delay-300" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                id="hero-predictions-btn"
                onClick={() => navigate('predictions')}
                className="btn btn-gold"
                style={{ padding: '13px 24px', fontSize: '14px', borderRadius: '10px' }}
              >
                <TrendingUp size={16} /> View Predictions
              </button>
              <button
                id="hero-about-btn"
                onClick={() => navigate('about')}
                className="btn btn-outline-white"
                style={{ padding: '13px 24px', fontSize: '14px', borderRadius: '10px' }}
              >
                How It Works <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Floating Ball */}
          <div className="animate-float hidden md:flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(ellipse, rgba(255,215,0,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
              <svg width="140" height="140" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))' }}>
                <circle cx="50" cy="50" r="45" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
                <path d="M 50 25 L 65 35 L 60 55 L 40 55 L 35 35 Z" fill="#0f172a" />
                <path d="M 50 25 L 50 5 M 65 35 L 85 25 M 60 55 L 75 70 M 40 55 L 25 70 M 35 35 L 15 25" stroke="#1e293b" strokeWidth="2" fill="none" />
                <path d="M 50 5 L 65 15 L 85 25 L 88 45 L 75 70 L 50 85 L 25 70 L 12 45 L 15 25 L 35 15 Z" stroke="#1e293b" strokeWidth="2" fill="none" />
              </svg>
              <div style={{ position: 'absolute', bottom: -8, left: '15%', right: '15%', height: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', filter: 'blur(6px)' }} />
            </div>
          </div>
        </div>
      </VideoBlock>

      {/* ===== STATS STRIP ===== */}
      <section style={{ background: 'var(--navy-600)', padding: '20px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: 'rgba(0,51,102,0.95)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', background: `rgba(${s.color === '#FFD700' ? '255,215,0' : s.color === '#00CC66' ? '0,204,102' : s.color === '#0099FF' ? '0,153,255' : '255,153,0'},0.15)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== LIVE / UPCOMING MATCHES ===== */}
      <section style={{ background: 'var(--bg-secondary)', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="section-title">
                {liveMatches.length > 0 ? (
                  <><span style={{ color: '#FF4444', fontSize: '10px' }}>●</span> Live Matches</>
                ) : (
                  <><Calendar size={22} color="#003366" /> Upcoming Matches</>
                )}
              </h2>
              <p className="section-subtitle">{displayMatches.length > 0 ? `${displayMatches.length} match${displayMatches.length === 1 ? '' : 'es'} displayed` : 'No matches available'}</p>
            </div>
            <button onClick={() => navigate('fixtures')} className="btn btn-ghost" style={{ fontSize: '13px' }}>
              View All <ArrowRight size={14} />
            </button>
          </div>

          {displayMatches.length === 0 ? (
            <EmptyState message={error ? 'Backend offline — connect the server to see matches.' : 'No live or upcoming matches right now.'} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {displayMatches.map(m => <HomeMatchCard key={m.id} m={m} />)}
            </div>
          )}
        </div>
      </section>

      {/* ===== FEATURED PREDICTIONS ===== */}
      {matches.filter(m => m.prediction && m.status === 'notstarted').length > 0 && (
        <section style={{ background: 'var(--bg-primary)', padding: '48px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="section-title"><Zap size={22} color="#FFD700" /> Featured Predictions</h2>
                <p className="section-subtitle">Top AI forecasts for upcoming fixtures</p>
              </div>
              <button onClick={() => navigate('predictions')} className="btn btn-ghost" style={{ fontSize: '13px' }}>
                All Predictions <ArrowRight size={14} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {matches.filter(m => m.prediction && m.status === 'notstarted').slice(0, 3).map(m => (
                <PredictionCard key={m.id} m={m} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== NEWS & INSIGHTS ===== */}
      <section style={{ background: 'var(--bg-secondary)', padding: '48px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 className="section-title"><Activity size={22} color="#0066CC" /> News & Insights</h2>
            <p className="section-subtitle">Latest analysis, previews and tournament coverage</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {NEWS_ARTICLES.map((art, i) => <NewsCard key={i} art={art} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Sub-Components ---------- */

function HomeMatchCard({ m }) {
  const isLive = m.status !== 'finished' && m.status !== 'notstarted';
  const hasScore = m.home_score !== null && m.home_score !== undefined;

  return (
    <div className="match-card card-hover" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Stage badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: '#0066CC', background: 'rgba(0,102,204,0.08)', padding: '3px 8px', borderRadius: '4px',
        }}>
          {m.stage === 'group' ? `Group ${m.group}` : m.stage?.toUpperCase()}
        </span>
        {isLive ? (
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#FF4444', display: 'flex', alignItems: 'center', gap: '4px' }} className="animate-live">
            <span style={{ width: 6, height: 6, background: '#FF4444', borderRadius: '50%' }} />LIVE
          </span>
        ) : (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={10} /> {m.date ? new Date(m.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : 'TBD'}
          </span>
        )}
      </div>

      {/* Teams */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[{ name: m.home, score: m.home_score }, { name: m.away, score: m.away_score }].map((team, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TeamFlag name={team.name} size={22} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{team.name}</span>
            </div>
            {hasScore && (
              <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--navy-600)', fontFamily: 'monospace', minWidth: '20px', textAlign: 'right' }}>
                {team.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Prediction strip */}
      {m.prediction && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            AI Pick: <strong style={{ color: 'var(--navy-600)' }}>{m.prediction.predicted_winner}</strong>
          </span>
          <span style={{ fontSize: '10px', background: 'rgba(0,51,102,0.07)', color: '#003366', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
            {Math.round(Math.max(m.prediction.p_home, m.prediction.p_away, m.prediction.p_draw) * 100)}% conf.
          </span>
        </div>
      )}
    </div>
  );
}

function PredictionCard({ m }) {
  const maxP = Math.max(m.prediction.p_home, m.prediction.p_away, m.prediction.p_draw);
  const conf = maxP >= 0.55 ? 'high' : maxP >= 0.4 ? 'medium' : 'low';
  const confColor = conf === 'high' ? '#00CC66' : conf === 'medium' ? '#FF9900' : '#FF3333';

  return (
    <div className="card-hover" style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#0066CC', background: 'rgba(0,102,204,0.08)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
          {m.stage === 'group' ? `Group ${m.group}` : m.stage}
        </span>
        <span style={{ fontSize: '10px', background: `${confColor}18`, color: confColor, padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
          {conf} confidence
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '80px' }}>
          <TeamFlag name={m.home} size={28} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.2 }}>{m.home}</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy-600)' }}>{Math.round(m.prediction.p_home * 100)}%</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Draw</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-secondary)' }}>{Math.round(m.prediction.p_draw * 100)}%</div>
          {m.prediction.scoreline && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{m.prediction.scoreline}</div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '80px' }}>
          <TeamFlag name={m.away} size={28} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.2 }}>{m.away}</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy-600)' }}>{Math.round(m.prediction.p_away * 100)}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--bg-tertiary)', borderRadius: '4px', height: '6px', overflow: 'hidden', display: 'flex' }}>
        <div style={{ width: `${Math.round(m.prediction.p_home * 100)}%`, background: '#003366', borderRadius: '4px 0 0 4px', transition: 'width 1s ease' }} />
        <div style={{ width: `${Math.round(m.prediction.p_draw * 100)}%`, background: '#9CA3AF' }} />
        <div style={{ width: `${Math.round(m.prediction.p_away * 100)}%`, background: '#0099FF', borderRadius: '0 4px 4px 0', transition: 'width 1s ease' }} />
      </div>

      <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Zap size={10} color="#FFD700" />
        AI Pick: <strong style={{ color: 'var(--text-primary)' }}>{m.prediction.predicted_winner}</strong>
      </div>
    </div>
  );
}

function NewsCard({ art }) {
  return (
    <div className="news-card card-hover" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Emoji/Image placeholder */}
      <div className="img-wrap" style={{ background: 'linear-gradient(135deg, #003366, #0066CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px' }}>
        <span style={{ fontSize: '64px' }}>{art.emoji}</span>
      </div>
      <div style={{ padding: '16px' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, color: art.color, background: `${art.color}18`, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {art.category}
        </span>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '10px 0 6px', lineHeight: 1.35 }}>
          {art.title}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
          {art.excerpt}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-subtle)' }}>
          <span>{art.date}</span>
          <span>·</span>
          <span>{art.readTime}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      background: 'var(--bg-card)', border: '1px dashed var(--border)',
      borderRadius: '16px', color: 'var(--text-muted)',
    }}>
      <Clock size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
      <p style={{ fontSize: '14px', fontWeight: 500 }}>{message}</p>
    </div>
  );
}
