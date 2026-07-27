import React, { useState, useMemo, useEffect } from 'react';

// ─── Country code map ────────────────────────────────────────────────────────
const CC = {
  "Argentina":"ar","Australia":"au","Belgium":"be","Brazil":"br","Canada":"ca",
  "Colombia":"co","Croatia":"hr","Denmark":"dk","Ecuador":"ec","Egypt":"eg",
  "England":"gb-eng","France":"fr","Germany":"de","Ghana":"gh","Italy":"it",
  "Japan":"jp","Mexico":"mx","Morocco":"ma","Netherlands":"nl","Norway":"no",
  "Paraguay":"py","Portugal":"pt","Saudi Arabia":"sa","Senegal":"sn",
  "South Korea":"kr","Spain":"es","Sweden":"se","Switzerland":"ch","Tunisia":"tn",
  "USA":"us","United States":"us","Uruguay":"uy","Wales":"gb-wls","Algeria":"dz",
  "Turkey":"tr","Türkiye":"tr","Panama":"pa","Austria":"at","Serbia":"rs",
  "Ukraine":"ua","Poland":"pl","Cameroon":"cm","Nigeria":"ng","Iran":"ir",
  "IR Iran":"ir","Costa Rica":"cr","Honduras":"hn","Chile":"cl",
};

function Flag({ name, size = 24 }) {
  const code = CC[name] || CC[name?.replace('Türkiye','Turkey')];
  if (code) return (
    <img src={`https://flagcdn.com/w40/${code}.png`} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }}
      onError={e => { e.target.style.display='none'; }} />
  );
  let h = 0;
  for (let i = 0; i < (name||'').length; i++) h = name.charCodeAt(i) + ((h<<5)-h);
  const hue = Math.abs(h) % 360;
  return <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0, background:`linear-gradient(135deg,hsl(${hue},70%,40%),hsl(${(hue+60)%360},80%,30%))`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8px', fontWeight:800, color:'white' }}>{(name||'??').slice(0,2).toUpperCase()}</div>;
}

// ─── Player Avatar (Wikipedia lookup) ────────────────────────────────────────
const avatarCache = {};
function PlayerAvatar({ name, country, size = 44 }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    if (avatarCache[name]) { setSrc(avatarCache[name]); return; }
    const q = encodeURIComponent(`${name} footballer`);
    fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=100&origin=*`)
      .then(r => r.json())
      .then(d => {
        const pages = d.query?.pages || {};
        const page = Object.values(pages)[0];
        const url = page?.thumbnail?.source || null;
        avatarCache[name] = url;
        setSrc(url);
      })
      .catch(() => {});
  }, [name]);

  if (src) return <img src={src} alt={name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.1)', flexShrink:0 }} onError={() => setSrc(null)} />;

  let h = 0;
  for (let i = 0; i < (name||'').length; i++) h = name.charCodeAt(i) + ((h<<5)-h);
  const hue = Math.abs(h) % 360;
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0, background:`linear-gradient(135deg,hsl(${hue},65%,35%),hsl(${(hue+40)%360},75%,25%))`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:800, color:'rgba(255,255,255,0.9)', border:'2px solid rgba(255,255,255,0.08)' }}>
      {(name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
    </div>
  );
}

// ─── Default Player Dataset for Instant High Quality Rendering ─────────────
const INITIAL_PLAYERS = [
  { id: "p1",  name: "Kylian Mbappé",      countryCode: "fr",     country: "France",       team: "Paris Saint-Germain", stats: { goals: 10, assists: 4, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 7 } },
  { id: "p2",  name: "Lionel Messi",       countryCode: "ar",     country: "Argentina",    team: "Inter Miami",         stats: { goals: 8,  assists: 4, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 7 } },
  { id: "p3",  name: "Erling Haaland",     countryCode: "no",     country: "Norway",       team: "Manchester City",     stats: { goals: 7,  assists: 1, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 5 } },
  { id: "p4",  name: "Jude Bellingham",    countryCode: "gb-eng", country: "England",      team: "Real Madrid",         stats: { goals: 7,  assists: 2, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 6 } },
  { id: "p5",  name: "Ousmane Dembélé",    countryCode: "fr",     country: "France",       team: "Paris Saint-Germain", stats: { goals: 6,  assists: 2, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 7 } },
  { id: "p6",  name: "Harry Kane",         countryCode: "gb-eng", country: "England",      team: "Bayern Munich",       stats: { goals: 6,  assists: 1, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 6 } },
  { id: "p7",  name: "Michael Olise",      countryCode: "fr",     country: "France",       team: "Bayern Munich",       stats: { goals: 3,  assists: 5, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 7 } },
  { id: "p8",  name: "Bruno Guimarães",    countryCode: "br",     country: "Brazil",       team: "Newcastle United",    stats: { goals: 2,  assists: 4, yellowCards: 2, redCards: 0, cleanSheets: 0, matchesPlayed: 5 } },
  { id: "p9",  name: "Vinícius Júnior",    countryCode: "br",     country: "Brazil",       team: "Real Madrid",         stats: { goals: 5,  assists: 1, yellowCards: 2, redCards: 0, cleanSheets: 0, matchesPlayed: 5 } },
  { id: "p10", name: "Jamal Musiala",      countryCode: "de",     country: "Germany",      team: "Bayern Munich",       stats: { goals: 4,  assists: 2, yellowCards: 1, redCards: 0, cleanSheets: 0, matchesPlayed: 4 } },
  { id: "p11", name: "Lamine Yamal",       countryCode: "es",     country: "Spain",        team: "Barcelona",           stats: { goals: 3,  assists: 3, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 8 } },
  { id: "p12", name: "Leandro Paredes",    countryCode: "ar",     country: "Argentina",    team: "Roma",                stats: { goals: 0,  assists: 1, yellowCards: 3, redCards: 0, cleanSheets: 0, matchesPlayed: 7 } },
  { id: "p13", name: "Nicolás Otamendi",   countryCode: "ar",     country: "Argentina",    team: "Benfica",             stats: { goals: 0,  assists: 0, yellowCards: 3, redCards: 0, cleanSheets: 0, matchesPlayed: 7 } },
  { id: "p14", name: "Cristian Romero",    countryCode: "ar",     country: "Argentina",    team: "Tottenham Hotspur",   stats: { goals: 0,  assists: 0, yellowCards: 3, redCards: 0, cleanSheets: 0, matchesPlayed: 7 } },
  { id: "p15", name: "Lisandro Martínez",  countryCode: "ar",     country: "Argentina",    team: "Manchester United",   stats: { goals: 0,  assists: 0, yellowCards: 3, redCards: 0, cleanSheets: 0, matchesPlayed: 7 } },
  { id: "p16", name: "Sphephelo Sithole",  countryCode: "za",     country: "South Africa", team: "TS Galaxy",           stats: { goals: 0,  assists: 0, yellowCards: 0, redCards: 1, cleanSheets: 0, matchesPlayed: 1 } },
  { id: "p17", name: "Themba Zwane",       countryCode: "za",     country: "South Africa", team: "Mamelodi Sundowns",   stats: { goals: 0,  assists: 0, yellowCards: 0, redCards: 1, cleanSheets: 0, matchesPlayed: 1 } },
  { id: "p18", name: "César Montes",       countryCode: "mx",     country: "Mexico",       team: "Monterrey",           stats: { goals: 0,  assists: 0, yellowCards: 0, redCards: 1, cleanSheets: 0, matchesPlayed: 1 } },
  { id: "p19", name: "Enzo Fernández",     countryCode: "ar",     country: "Argentina",    team: "Chelsea",             stats: { goals: 0,  assists: 1, yellowCards: 1, redCards: 1, cleanSheets: 0, matchesPlayed: 8 } },
  { id: "p20", name: "Unai Simón",         countryCode: "es",     country: "Spain",        team: "Athletic Club",       stats: { goals: 0,  assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 7, matchesPlayed: 8 } },
  { id: "p21", name: "Emiliano Martínez",  countryCode: "ar",     country: "Argentina",    team: "Aston Villa",         stats: { goals: 0,  assists: 0, yellowCards: 1, redCards: 0, cleanSheets: 4, matchesPlayed: 8 } },
  { id: "p22", name: "Mike Maignan",       countryCode: "fr",     country: "France",       team: "AC Milan",            stats: { goals: 0,  assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 4, matchesPlayed: 7 } },
  { id: "p23", name: "Alisson Becker",     countryCode: "br",     country: "Brazil",       team: "Liverpool",           stats: { goals: 0,  assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 3, matchesPlayed: 5 } },
  { id: "p24", name: "Jordan Pickford",    countryCode: "gb-eng", country: "England",      team: "Everton",             stats: { goals: 0,  assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 3, matchesPlayed: 6 } },
];

// ─── Tab config ──────────────────────────────────────────────────────────────
const PLAYER_TABS = [
  { key: 'goals',       label: '⚽ Top Scorers',   stat: 'goals',       unit: 'Goals' },
  { key: 'assists',     label: '🎯 Assists',         stat: 'assists',     unit: 'Assists' },
  { key: 'yellowCards', label: '🟨 Yellow Cards',   stat: 'yellowCards', unit: 'Cards' },
  { key: 'redCards',    label: '🟥 Red Cards',       stat: 'redCards',    unit: 'Cards' },
  { key: 'cleanSheets', label: '🧤 Clean Sheets',   stat: 'cleanSheets', unit: 'Sheets' },
];

const TEAM_TABS = [
  { key: 'goals',       label: 'Goals Scored' },
  { key: 'conceded',    label: 'Goals Conceded' },
  { key: 'wins',        label: 'Most Wins' },
  { key: 'cleanSheets', label: 'Clean Sheets' },
  { key: 'played',      label: 'Most Played' },
];

// ─── Section header ──────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
  );
}

// ─── Player stat card ────────────────────────────────────────────────────────
function PlayerCard({ player, rank, statKey, unit }) {
  const val = player.stats?.[statKey] ?? player[statKey] ?? 0;
  const isTop3 = rank <= 3;
  const gold = ['#FFD700','#C0C0C0','#CD7F32'][rank-1];

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px',
      background: isTop3 ? 'rgba(255,215,0,0.04)' : 'transparent',
      borderBottom: '1px solid var(--border)',
      transition:'background 0.15s', cursor:'default',
    }}
    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-card-hover)'}
    onMouseLeave={e=>e.currentTarget.style.background=isTop3?'rgba(255,215,0,0.04)':'transparent'}
    >
      {/* Rank */}
      <div style={{ width:32, textAlign:'center', flexShrink:0 }}>
        {isTop3
          ? <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${gold},${gold}88)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:900, color:'white', margin:'0 auto' }}>{rank}</div>
          : <span style={{ fontSize:'13px', fontWeight:700, color:'var(--text-muted)' }}>#{rank}</span>
        }
      </div>

      {/* Avatar */}
      <PlayerAvatar name={player.name} country={player.country} size={40} />

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'14px', fontWeight:700, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{player.name}</div>
        <div style={{ fontSize:'12px', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'5px', marginTop:'2px' }}>
          <Flag name={player.country} size={14} />
          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{player.country}</span>
          {player.team && player.team !== player.country && <><span style={{opacity:0.4}}>·</span><span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{player.team}</span></>}
        </div>
      </div>

      {/* Stat */}
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontSize:'22px', fontWeight:900, color: isTop3 ? '#0066CC' : 'var(--text-primary)', lineHeight:1 }}>{val}</div>
        <div style={{ fontSize:'9px', fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:'2px' }}>{unit}</div>
      </div>
    </div>
  );
}

// ─── Team stat row ───────────────────────────────────────────────────────────
function TeamRow({ team, rank, activeKey }) {
  const isTop3 = rank <= 3;
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'36px 1fr 56px 56px 56px 56px 72px',
      gap:'8px', alignItems:'center', padding:'11px 16px',
      background: isTop3 ? 'rgba(255,215,0,0.03)' : 'transparent',
      borderBottom:'1px solid var(--border)', transition:'background 0.15s',
    }}
    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-card-hover)'}
    onMouseLeave={e=>e.currentTarget.style.background=isTop3?'rgba(255,215,0,0.03)':'transparent'}
    >
      <div style={{textAlign:'center',fontSize:'13px',fontWeight:800,color:isTop3?'#FFD700':'var(--text-muted)'}}>{rank}</div>
      <div style={{display:'flex',alignItems:'center',gap:'8px',minWidth:0}}>
        <Flag name={team.name} size={22} />
        <span style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{team.name}</span>
      </div>
      {['played','wins','goals','conceded','cleanSheets'].map(k => (
        <div key={k} style={{textAlign:'center'}}>
          <span style={{
            fontSize: k===activeKey?'15px':'13px', fontWeight: k===activeKey?900:500,
            color: k===activeKey?'#0066CC':'var(--text-primary)',
            background: k===activeKey?'rgba(0,102,204,0.08)':'transparent',
            padding: k===activeKey?'2px 6px':'0', borderRadius:'5px',
          }}>{team[k]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function StatsPage({ matches = [] }) {
  const [playerTab, setPlayerTab] = useState('goals');
  const [teamTab,   setTeamTab]   = useState('goals');
  const [players,   setPlayers]   = useState(INITIAL_PLAYERS);
  const [loading,   setLoading]   = useState(false);

  // Fetch updated player stats from backend if available
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/player-stats');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPlayers(data);
          }
        }
      } catch (err) {
        // Fallback to /api/wc2026/live-data if /api/player-stats is unavailable
        try {
          const res2 = await fetch('http://localhost:8000/api/wc2026/live-data');
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2.players && data2.players.length > 0) {
              setPlayers(data2.players);
            }
          }
        } catch (e) {
          // Keep INITIAL_PLAYERS on error
        }
      }
    };

    fetchPlayers();
  }, []);

  // Active player stat key
  const activeStat = PLAYER_TABS.find(t => t.key === playerTab)?.stat || 'goals';
  const activeUnit = PLAYER_TABS.find(t => t.key === playerTab)?.unit || '';

  // Sorted + filtered player list
  const rankedPlayers = useMemo(() =>
    [...players]
      .filter(p => (p.stats?.[activeStat] ?? p[activeStat] ?? 0) > 0)
      .sort((a, b) => (b.stats?.[activeStat] ?? b[activeStat] ?? 0) - (a.stats?.[activeStat] ?? a[activeStat] ?? 0)),
    [players, activeStat]
  );

  // Team stats derived from real matches
  const teamStats = useMemo(() => {
    const s = {};
    matches.filter(m => m.status==='finished' && m.home_score!=null && m.away_score!=null).forEach(m => {
      const home=m.home, away=m.away, hs=Number(m.home_score), as_=Number(m.away_score);
      if (!home||!away||isNaN(hs)||isNaN(as_)) return;
      [home, away].forEach(t => { if (!s[t]) s[t]={name:t,goals:0,conceded:0,played:0,wins:0,draws:0,losses:0,cleanSheets:0}; });
      s[home].goals+=hs; s[home].conceded+=as_; s[home].played+=1;
      s[away].goals+=as_; s[away].conceded+=hs; s[away].played+=1;
      if (hs>as_){s[home].wins++;s[away].losses++;}
      else if(as_>hs){s[away].wins++;s[home].losses++;}
      else{s[home].draws++;s[away].draws++;}
      if (as_===0) s[home].cleanSheets++;
      if (hs===0)  s[away].cleanSheets++;
    });
    return Object.values(s);
  }, [matches]);

  const rankedTeams = useMemo(() =>
    [...teamStats].sort((a,b)=>b[teamTab]-a[teamTab]).filter(t=>t[teamTab]>0),
    [teamStats, teamTab]
  );

  // Summary numbers
  const finishedCount = matches.filter(m=>m.status==='finished').length;
  const totalGoals = teamStats.reduce((s,t)=>s+t.goals,0)/2;

  function TabBar({ tabs, active, onChange, small }) {
    return (
      <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'16px'}}>
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>onChange(t.key)} style={{
            padding: small?'6px 14px':'8px 18px', borderRadius:'24px',
            fontWeight:700, fontSize: small?'12px':'13px', whiteSpace:'nowrap',
            cursor:'pointer', transition:'all 0.15s', border:'none',
            background: active===t.key?'linear-gradient(135deg,#003366,#0055AA)':'var(--bg-card)',
            color: active===t.key?'white':'var(--text-muted)',
            boxShadow: active===t.key?'0 4px 12px rgba(0,51,102,0.3)':'var(--shadow-card)',
          }}>{t.label}</button>
        ))}
      </div>
    );
  }

  return (
    <div style={{fontFamily:'Inter,sans-serif',background:'var(--bg-secondary)',minHeight:'100vh'}}>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#040d1a,#003366)',padding:'36px 24px 28px',borderBottom:'1px solid rgba(255,215,0,0.15)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto'}}>
          <h1 style={{fontSize:'32px',fontWeight:900,color:'white',margin:0,letterSpacing:'-0.02em'}}>
            <span className="text-gradient-gold">Tournament Statistics</span>
          </h1>
          <p style={{color:'rgba(255,255,255,0.5)',fontSize:'14px',marginTop:'8px',marginBottom:0}}>
            FIFA World Cup 2026 · Individual players & team performance
          </p>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{background:'var(--navy-600)',padding:'14px 24px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'1px',background:'rgba(255,255,255,0.08)',borderRadius:'10px',overflow:'hidden'}}>
          {[
            {label:'Matches Played',  value: finishedCount},
            {label:'Total Goals',     value: Math.round(totalGoals)},
            {label:'Teams Tracked',   value: teamStats.length},
            {label:'Players Tracked', value: players.length},
          ].map((s,i)=>(
            <div key={i} style={{background:'rgba(0,51,102,0.95)',padding:'12px 16px'}}>
              <div style={{fontSize:'20px',fontWeight:900,color:'white'}}>{s.value}</div>
              <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',marginTop:'2px'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'28px 24px',display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(420px, 1fr))',gap:'32px'}}>

        {/* ── LEFT: Individual Player Stats ──────────────────────────── */}
        <div>
          <SectionHeader
            title="Player Stats"
            subtitle="Individual tournament performance"
          />
          <TabBar tabs={PLAYER_TABS} active={playerTab} onChange={setPlayerTab} />

          <div style={{background:'var(--bg-card)',borderRadius:'16px',border:'1px solid var(--border)',overflow:'hidden',boxShadow:'var(--shadow-card)'}}>
            {rankedPlayers.length === 0 ? (
              <div style={{padding:'48px',textAlign:'center',color:'var(--text-muted)'}}>
                <p style={{margin:0,fontSize:'16px',fontWeight:600}}>No data for this category</p>
                <p style={{margin:'6px 0 0',fontSize:'13px',opacity:0.6}}>Try another tab</p>
              </div>
            ) : (
              rankedPlayers.map((p,i) => (
                <PlayerCard key={p.id||i} player={p} rank={i+1} statKey={activeStat} unit={activeUnit} />
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT: Team Stats ───────────────────────────────────────── */}
        <div>
          <SectionHeader
            title="Team Stats"
            subtitle="Computed from live match results"
          />
          <TabBar tabs={TEAM_TABS} active={teamTab} onChange={setTeamTab} small />

          <div style={{background:'var(--bg-card)',borderRadius:'16px',border:'1px solid var(--border)',overflow:'hidden',boxShadow:'var(--shadow-card)'}}>
            {/* Column header */}
            <div style={{display:'grid',gridTemplateColumns:'36px 1fr 56px 56px 56px 56px 72px',gap:'8px',alignItems:'center',padding:'10px 16px',background:'rgba(0,51,102,0.06)',borderBottom:'1px solid var(--border)'}}>
              {['#','Team','P','W','GF','GA','CS'].map((h,i)=>(
                <div key={i} style={{fontSize:'10px',fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',textAlign:i>1?'center':'left'}}>{h}</div>
              ))}
            </div>

            {rankedTeams.length === 0 ? (
              <div style={{padding:'40px',textAlign:'center',color:'var(--text-muted)'}}>
                <p style={{margin:0,fontSize:'14px'}}>Stats appear once matches are finished</p>
              </div>
            ) : (
              rankedTeams.map((t,i) => (
                <TeamRow key={t.name} team={t} rank={i+1} activeKey={teamTab} />
              ))
            )}
          </div>

          <p style={{fontSize:'11px',color:'var(--text-muted)',margin:'10px 0 0',opacity:0.6}}>
            P=Played · W=Wins · GF=Goals For · GA=Goals Against · CS=Clean Sheets
          </p>
        </div>

      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
