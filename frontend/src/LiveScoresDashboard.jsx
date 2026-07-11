/**
 * LiveScoresDashboard — Fixtures / Bracket / Projection tabs
 * Now receives all data via props from FIFAApp (no own fetching).
 * Sub-components: TeamBadge, MatchCard, KnockoutBracket, ForwardProjection, etc.
 */

import React, { useState, useMemo, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import {
  Radio, Check, X, Clock, Trophy, Settings, Hash, Volume2, Shield,
  Calendar, Sparkles, TrendingUp, Zap, Target, MessageSquare, Send
} from "lucide-react";
import MatchdayChat from "./MatchdayChat";

// ─── Country → ISO flag code ───────────────────────────────────────────────
const COUNTRY_CODES = {
  "Argentina":"ar","Australia":"au","Belgium":"be","Brazil":"br","Canada":"ca",
  "Colombia":"co","Croatia":"hr","Denmark":"dk","Ecuador":"ec","Egypt":"eg",
  "England":"gb-eng","France":"fr","Germany":"de","Ghana":"gh","Italy":"it",
  "Japan":"jp","Mexico":"mx","Morocco":"ma","Netherlands":"nl","Norway":"no",
  "Paraguay":"py","Portugal":"pt","Saudi Arabia":"sa","Senegal":"sn",
  "South Korea":"kr","Spain":"es","Sweden":"se","Switzerland":"ch","Tunisia":"tn",
  "USA":"us","United States":"us","Uruguay":"uy","Wales":"gb-wls","Algeria":"dz",
  "Bosnia":"ba","Bosnia and Herzegovina":"ba","DR Congo":"cd","Turkey":"tr",
  "Türkiye":"tr","Panama":"pa","Cape Verde":"cv","Ivory Coast":"ci",
  "Austria":"at","Democratic Republic of the Congo":"cd","Costa Rica":"cr",
  "Honduras":"hn","Peru":"pe","Chile":"cl","Serbia":"rs","Ukraine":"ua",
  "Poland":"pl","Cameroon":"cm","Nigeria":"ng",
};

// ─── Props: matches, accuracy, projectionData, projectionLoading, projectionError, loadProjection
export default function FixturesContent({
  matches = [],
  accuracy = { winner_accuracy: 0, scoreline_accuracy: 0, brier_score: 0, finished_with_predictions: 0, by_group: {} },
  projectionData,
  projectionLoading,
  projectionError,
  loadProjection,
}) {
  const [filter, setFilter]       = useState("all");
  const [activeTab, setActiveTab] = useState("fixtures");

  const filteredMatches = useMemo(() => {
    if (filter === "all")      return matches;
    if (filter === "live")     return matches.filter(m => m.status !== "finished" && m.status !== "notstarted");
    if (filter === "finished") return matches.filter(m => m.status === "finished");
    if (filter === "upcoming") return matches.filter(m => m.status === "notstarted");
    return matches;
  }, [matches, filter]);

  const sortedMatches = useMemo(() => {
    const list = [...filteredMatches];
    list.sort((a, b) => {
      const aLive = a.status !== "finished" && a.status !== "notstarted";
      const bLive = b.status !== "finished" && b.status !== "notstarted";
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;
      if (a.status === "finished" && b.status === "finished") {
        return new Date(b.date || 0) - new Date(a.date || 0);
      }
      if (a.status === "notstarted" && b.status === "notstarted") {
        return new Date(a.date || 9e15) - new Date(b.date || 9e15);
      }
      return a.status === "finished" ? 1 : -1;
    });
    return list;
  }, [filteredMatches]);

  const chartData = useMemo(() =>
    Object.entries(accuracy.by_group || {}).map(([g, v]) => ({
      group: g === "r32" ? "R32" : g === "r16" ? "R16" : g === "qf" ? "QF" : g === "sf" ? "SF" : g === "final" ? "Final" : `Grp ${g}`,
      accuracy: v.accuracy_pct,
    })),
    [accuracy]
  );

  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Page header */}
      <div style={{ background: "linear-gradient(135deg, #040d1a, #003366)", padding: "36px 24px 28px", borderBottom: "1px solid rgba(255,215,0,0.15)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 900, color: "white", marginBottom: "8px", letterSpacing: "-0.02em" }}>
            <span className="text-gradient-gold">Fixtures & Predictions</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
            {matches.length} matches tracked • Live scores, AI predictions & bracket simulation
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
        {/* Stats Pills */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          <StatPill label="Winner Accuracy" value={accuracy.winner_accuracy} suffix="%" icon={<Trophy size={14} color="#FFD700" />} color="#FFD700" />
          <StatPill label="Exact Scoreline" value={accuracy.scoreline_accuracy} suffix="%" icon={<Check size={14} color="#00CC66" />} color="#00CC66" />
          <StatPill label="Brier Score"     value={accuracy.brier_score}        suffix=""  icon={<Clock size={14} color="#0099FF" />} color="#0099FF" />
          <StatPill label="Scored Matches"  value={accuracy.finished_with_predictions} suffix="" icon={<Calendar size={14} color="#FF9900" />} color="#FF9900" />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid var(--border)", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", gap: "0" }}>
            {[
              { id: "fixtures", label: "Fixtures & Predictions" },
              { id: "bracket",  label: "Knockout Bracket" },
              { id: "projection", label: "Forward Projection", icon: <TrendingUp size={13} /> },
            ].map(tab => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 16px", background: "none", border: "none",
                  borderBottom: `2px solid ${activeTab === tab.id ? "#003366" : "transparent"}`,
                  marginBottom: "-2px", cursor: "pointer",
                  fontSize: "13px", fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? "#003366" : "var(--text-muted)",
                  display: "flex", alignItems: "center", gap: "6px",
                  transition: "all 0.2s", fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {activeTab === "fixtures" && (
            <div style={{ display: "flex", gap: "4px" }}>
              {["all", "live", "upcoming", "finished"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "6px 12px", fontSize: "11px", fontWeight: 700, borderRadius: "6px",
                    textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    background: filter === f ? "#003366" : "var(--bg-card)",
                    color: filter === f ? "white" : "var(--text-muted)",
                    border: filter === f ? "1px solid #003366" : "1px solid var(--border)",
                    transition: "all 0.2s",
                  }}
                >{f}</button>
              ))}
            </div>
          )}
        </div>

        {/* Tab Panels */}
        {activeTab === "fixtures" ? (
          sortedMatches.length === 0 ? (
            <EmptyMsg />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
              {sortedMatches.map(m => <MatchCard key={m.id} m={m} />)}
            </div>
          )
        ) : activeTab === "bracket" ? (
          <KnockoutBracket matches={matches} />
        ) : (
          <ForwardProjection data={projectionData} loading={projectionLoading} error={projectionError} onRefresh={loadProjection} />
        )}

        {/* Chart — below fixtures when there's data */}
        {activeTab === "fixtures" && chartData.length > 0 && (
          <div style={{ marginTop: "24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px", boxShadow: "var(--shadow-card)" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Radio size={14} color="#FFD700" /> Winner Accuracy by Group & Stage
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="group" style={{ fontSize: 11 }} tick={{ fill: "var(--text-muted)" }} tickLine={false} />
                <YAxis style={{ fontSize: 11 }} domain={[0, 100]} tick={{ fill: "var(--text-muted)" }} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: 11 }} />
                <Bar dataKey="accuracy" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#003366" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#0066CC" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TeamBadge ───────────────────────────────────────────────────────────────
export function TeamBadge({ name, size = 24 }) {
  const code = COUNTRY_CODES[name] || COUNTRY_CODES[name?.replace("Türkiye", "Turkey")];
  if (code) {
    return (
      <img
        src={`https://flagcdn.com/w40/${code}.png`}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }}
        onError={e => { e.target.style.display = "none"; }}
      />
    );
  }
  let h1 = 0, h2 = 0;
  for (let i = 0; i < (name || "").length; i++) {
    h1 = name.charCodeAt(i) + ((h1 << 5) - h1);
    h2 = name.charCodeAt(i) + ((h2 << 7) - h2);
  }
  const hue = Math.abs(h1) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},70%,40%), hsl(${(hue + 60) % 360},80%,30%))`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.max(8, size * 0.35) + "px", fontWeight: 800, color: "white",
    }}>
      {(name || "??").slice(0, 2).toUpperCase()}
    </div>
  );
}

// ─── StatPill ────────────────────────────────────────────────────────────────
function StatPill({ label, value, suffix, icon, color }) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px",
      padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px",
      boxShadow: "var(--shadow-xs)",
    }}>
      <div style={{ width: "30px", height: "30px", background: `${color}15`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>
          {value === null || value === undefined ? "–" : value}{suffix}
        </div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{label}</div>
      </div>
    </div>
  );
}

// ─── MatchCard ────────────────────────────────────────────────────────────────
function MatchCard({ m }) {
  const isLive   = m.status !== "finished" && m.status !== "notstarted";
  const isDone   = m.status === "finished";
  const hasSim   = m.is_simulated;
  const hasScore = m.home_score !== null && m.home_score !== undefined;

  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${isLive ? "rgba(255,68,68,0.3)" : m.prediction?.is_winner_path ? "rgba(255,215,0,0.3)" : "var(--border)"}`,
      borderRadius: "14px", padding: "14px",
      boxShadow: isLive ? "0 0 20px rgba(255,68,68,0.05)" : "var(--shadow-card)",
      position: "relative", overflow: "hidden",
      transition: "transform 0.25s, box-shadow 0.25s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-xl)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = isLive ? "0 0 20px rgba(255,68,68,0.05)" : "var(--shadow-card)"; }}
    >
      {isLive && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #FF4444, transparent)" }} />}

      {/* Winner Path banner */}
      {m.prediction?.is_winner_path && (
        <div style={{ marginBottom: "10px", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: "8px", padding: "6px 10px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#B8860B", fontWeight: 700 }}>
          <span>⭐ Champion's Path</span>
          <span style={{ color: "var(--text-muted)" }}>vs {m.prediction.winner_path_opposition}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#0066CC", background: "rgba(0,102,204,0.08)", padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase" }}>
            {m.stage === "group" ? `Group ${m.group}` : m.stage?.toUpperCase()}
          </span>
          {hasSim && <span style={{ fontSize: "9px", fontWeight: 800, color: "#FF9900", background: "rgba(255,153,0,0.1)", padding: "2px 6px", borderRadius: "3px" }}>SIM</span>}
        </div>
        <StatusBadge status={m.status} />
      </div>

      {/* Teams + Scores */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
        {[{ name: m.home, score: m.home_score }, { name: m.away, score: m.away_score }].map((team, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              <TeamBadge name={team.name} size={20} />{team.name}
            </span>
            {hasScore && (
              <span style={{
                fontSize: "16px", fontWeight: 900, fontFamily: "monospace",
                color: hasSim ? "var(--text-muted)" : "#003366",
                background: hasSim ? "var(--bg-secondary)" : "rgba(0,51,102,0.06)",
                padding: "2px 8px", borderRadius: "6px", minWidth: "28px", textAlign: "center",
              }}>
                {team.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Prediction */}
      {m.prediction && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "11px", flexWrap: "wrap", gap: "4px" }}>
            <span style={{ color: "var(--text-muted)" }}>
              Pick: <strong style={{ color: "var(--navy-600, #003366)" }}>{m.prediction.predicted_winner}</strong>
              {m.prediction.scoreline && <span style={{ fontFamily: "monospace", marginLeft: "6px", color: "var(--text-secondary)" }}>({m.prediction.scoreline})</span>}
            </span>
            {m.prediction.is_dynamic && (
              <span style={{ fontSize: "9px", fontWeight: 800, color: "#0099FF", background: "rgba(0,153,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>ELO</span>
            )}
          </div>

          {/* 3-col probability cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
            {[
              { name: m.home, pct: Math.round(m.prediction.p_home * 100), color: "#003366" },
              { name: "Draw", pct: Math.round(m.prediction.p_draw * 100), color: "#6B7280", emoji: "🤝" },
              { name: m.away, pct: Math.round(m.prediction.p_away * 100), color: "#0099FF" },
            ].map((col, i) => (
              <div key={i} style={{ background: "var(--bg-secondary)", borderRadius: "8px", padding: "8px 6px", textAlign: "center", border: "1px solid var(--border)" }}>
                {col.emoji ? (
                  <span style={{ fontSize: "14px" }}>{col.emoji}</span>
                ) : (
                  <TeamBadge name={col.name} size={16} />
                )}
                <div style={{ fontSize: "9px", color: "var(--text-muted)", margin: "3px 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{col.name}</div>
                <div style={{ fontSize: "14px", fontWeight: 900, color: col.color }}>{col.pct}%</div>
              </div>
            ))}
          </div>

          {/* Evaluation */}
          {isDone && hasScore && m.correct_winner !== undefined && (
            <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
              {m.correct_winner
                ? <><Check size={12} color="#00CC66" /><span style={{ color: "#00CC66", fontWeight: 600 }}>Prediction Correct</span></>
                : <><X size={12} color="#FF3333" /><span style={{ color: "#FF3333", fontWeight: 600 }}>Prediction Missed</span></>
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "finished") return <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>FT</span>;
  if (status === "notstarted") return <span style={{ fontSize: "10px", fontWeight: 700, color: "#0066CC", background: "rgba(0,102,204,0.08)", padding: "2px 8px", borderRadius: "4px" }}>UPCOMING</span>;
  return <span style={{ fontSize: "10px", fontWeight: 700, color: "#FF4444", display: "flex", alignItems: "center", gap: "4px" }} className="animate-live"><Radio size={10} /> LIVE {status}</span>;
}

// ─── BracketMatchNode ─────────────────────────────────────────────────────────
function BracketMatchNode({ match }) {
  if (!match) return (
    <div style={{ background: "var(--bg-secondary)", border: "1px dashed var(--border)", borderRadius: "10px", padding: "10px", width: "176px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--text-muted)" }}>
      TBD
    </div>
  );
  const isSim = match.is_simulated;
  return (
    <div style={{
      background: "var(--bg-card)", border: `1px ${isSim ? "dashed" : "solid"} ${isSim ? "rgba(255,153,0,0.3)" : "var(--border)"}`,
      borderRadius: "10px", padding: "10px", width: "176px",
      boxShadow: "var(--shadow-xs)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--text-muted)", marginBottom: "6px" }}>
        <span>#{match.id}{isSim && <span style={{ marginLeft: "4px", color: "#FF9900", fontWeight: 800 }}>SIM</span>}</span>
        <StatusBadge status={match.status} />
      </div>
      {[{ name: match.home, score: match.home_score }, { name: match.away, score: match.away_score }].map((t, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: i === 0 ? "3px" : 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 600, color: "var(--text-primary)", maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <TeamBadge name={t.name} size={14} />{t.name}
          </span>
          <span style={{ fontSize: "12px", fontWeight: 800, color: isSim ? "var(--text-muted)" : "#003366", fontFamily: "monospace" }}>
            {t.score !== null && t.score !== undefined ? t.score : "–"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── KnockoutBracket ─────────────────────────────────────────────────────────
function KnockoutBracket({ matches }) {
  const kMatches = useMemo(() => {
    const stages = { r32: [], r16: [], qf: [], sf: [], final: [] };
    matches.forEach(m => { const s = m.stage?.toLowerCase(); if (stages[s]) stages[s].push(m); });
    return stages;
  }, [matches]);

  const leftR16  = kMatches.r16.slice(0, 4);
  const rightR16 = kMatches.r16.slice(4, 8);
  const leftQF   = kMatches.qf.slice(0, 2);
  const rightQF  = kMatches.qf.slice(2, 4);
  const leftSF   = kMatches.sf[0];
  const rightSF  = kMatches.sf[1];
  const finalM   = kMatches.final[0];

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px", overflowX: "auto", boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", minWidth: "960px", padding: "16px 8px", userSelect: "none" }}>
        {/* Left R16 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "space-around", height: "360px" }}>
          {[0,1,2,3].map(i => <BracketMatchNode key={i} match={leftR16[i] || (kMatches.r32[i] ? { ...kMatches.r32[i] } : null)} />)}
        </div>
        {/* Left QF */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", justifyContent: "space-around", height: "360px" }}>
          {[0,1].map(i => <BracketMatchNode key={i} match={leftQF[i]} />)}
        </div>
        {/* Left SF */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "360px" }}>
          <BracketMatchNode match={leftSF} />
        </div>
        {/* Center Final */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "20px 16px", background: "rgba(0,51,102,0.04)", borderRadius: "14px", border: "1px solid rgba(255,215,0,0.15)" }}>
          <span style={{ fontSize: "10px", fontWeight: 900, color: "#B8860B", background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.25)", padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🏆 World Champions
          </span>
          <Trophy size={48} color="#FFD700" style={{ filter: "drop-shadow(0 0 16px rgba(255,215,0,0.4))" }} />
          <BracketMatchNode match={finalM} />
          <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Grand Final</span>
        </div>
        {/* Right SF */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "360px" }}>
          <BracketMatchNode match={rightSF} />
        </div>
        {/* Right QF */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", justifyContent: "space-around", height: "360px" }}>
          {[0,1].map(i => <BracketMatchNode key={i} match={rightQF[i]} />)}
        </div>
        {/* Right R16 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "space-around", height: "360px" }}>
          {[0,1,2,3].map(i => <BracketMatchNode key={i} match={rightR16[i] || (kMatches.r32[i+4] ? { ...kMatches.r32[i+4] } : null)} />)}
        </div>
      </div>
    </div>
  );
}

// ─── ForwardProjection ────────────────────────────────────────────────────────
function ForwardProjection({ data, loading, error, onRefresh }) {
  if (loading && !data) return (
    <div style={{ textAlign: "center", padding: "64px 24px" }}>
      <div style={{ width: "56px", height: "56px", margin: "0 auto 16px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, border: "3px solid var(--border)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", inset: 0, border: "3px solid #003366", borderTop: "3px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <TrendingUp size={20} style={{ position: "absolute", inset: 0, margin: "auto", color: "#003366" }} />
      </div>
      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Running Monte Carlo Simulation...</p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Projecting tournament bracket forward</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ width: "56px", height: "56px", margin: "0 auto 16px", background: "rgba(255,51,51,0.08)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <X size={24} color="#FF3333" />
      </div>
      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>Projection Unavailable</p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto 16px" }}>{error}</p>
      <button onClick={onRefresh} style={{ padding: "8px 20px", background: "rgba(0,51,102,0.08)", border: "1px solid rgba(0,51,102,0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 700, color: "#003366", fontFamily: "Inter, sans-serif" }}>
        Retry
      </button>
    </div>
  );

  if (!data) return null;

  const { known_fixture_predictions, simulated_projection, most_likely_final, sims_run } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #FFD700, #B8860B)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={18} color="#040d1a" />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Forward Projection Engine</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, fontFamily: "monospace" }}>Elo + Poisson Monte Carlo • {sims_run?.toLocaleString() || "5,000"} simulations</p>
          </div>
        </div>
        <button onClick={onRefresh} disabled={loading} style={{ padding: "8px 14px", background: loading ? "var(--bg-secondary)" : "rgba(0,51,102,0.08)", border: `1px solid ${loading ? "var(--border)" : "rgba(0,51,102,0.2)"}`, borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontSize: "11px", fontWeight: 700, color: loading ? "var(--text-muted)" : "#003366", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: "6px" }}>
          {loading ? "Simulating..." : <><Zap size={12} /> Re-simulate</>}
        </button>
      </div>

      {/* Disclaimer */}
      <div style={{ background: "rgba(0,102,204,0.05)", border: "1px solid rgba(0,102,204,0.15)", borderRadius: "10px", padding: "12px 16px", fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.6, display: "flex", gap: "8px" }}>
        <Shield size={14} color="#0066CC" style={{ flexShrink: 0, marginTop: "1px" }} />
        <span><strong style={{ color: "#0066CC" }}>How this works:</strong> For rounds without real pairings, the engine uses rating-tier seeding. Percentages = probability of reaching that stage, not confirmed placement.</span>
      </div>

      {/* Most Likely Final */}
      {most_likely_final && <MostLikelyFinalCard data={most_likely_final} />}

      {/* Known Fixtures */}
      {known_fixture_predictions?.length > 0 && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px", boxShadow: "var(--shadow-card)" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Target size={14} color="#0066CC" /> Known Fixture Predictions
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
            {known_fixture_predictions.map((f, i) => {
              const [hs, as_] = (f.predicted_score || "0-0").split("-").map(Number);
              return (
                <div key={i} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px" }}>
                  {[{ name: f.home, score: hs }, { name: f.away, score: as_ }].map((t, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: j === 0 ? "4px" : 0 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                        <TeamBadge name={t.name} size={16} />{t.name}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 900, color: "#003366", fontFamily: "monospace" }}>{t.score}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)" }}>
                    <span>Pick: <strong style={{ color: "var(--text-primary)" }}>{f.predicted_winner}</strong></span>
                    <span style={{ fontFamily: "monospace" }}>{Math.round(f.p_home * 100)}% | {Math.round(f.p_away * 100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Projection Bars */}
      {simulated_projection && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <ProjectionSection title="Win It All" icon={<Trophy size={14} color="#FFD700" />} data={simulated_projection.win_it_all_pct} color="#003366" trackColor="rgba(0,51,102,0.1)" />
          <ProjectionSection title="Reach the Final" icon={<Target size={14} color="#0099FF" />} data={simulated_projection.reach_final_pct} color="#0066CC" trackColor="rgba(0,102,204,0.1)" />
          <ProjectionSection title="Reach the Semifinals" icon={<TrendingUp size={14} color="#00CC66" />} data={simulated_projection.reach_semifinal_pct} color="#00CC66" trackColor="rgba(0,204,102,0.1)" />
        </div>
      )}
    </div>
  );
}

function MostLikelyFinalCard({ data }) {
  const [hs, as_] = (data.predicted_score || "0-0").split("-").map(Number);
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: "14px", padding: "20px", boxShadow: "0 4px 20px rgba(255,215,0,0.06)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #FFD700, transparent)" }} />
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", padding: "5px 14px", borderRadius: "20px", marginBottom: "8px" }}>
          <Trophy size={13} color="#FFD700" />
          <span style={{ fontSize: "10px", fontWeight: 900, color: "#B8860B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Most Likely Final</span>
        </div>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{data.note || "Based on Monte Carlo simulation"}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
            <TeamBadge name={data.home} size={32} />
          </div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px" }}>{data.home}</p>
          <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>{Math.round(data.p_home * 100)}% win</p>
        </div>
        <div style={{ fontSize: "36px", fontWeight: 900, color: "#003366", fontFamily: "monospace" }}>{hs} – {as_}</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
            <TeamBadge name={data.away} size={32} />
          </div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px" }}>{data.away}</p>
          <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>{Math.round(data.p_away * 100)}% win</p>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "14px" }}>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          <Zap size={11} color="#FFD700" style={{ verticalAlign: "middle", marginRight: "4px" }} />
          Predicted Champion: <strong style={{ color: "#B8860B" }}>{data.predicted_winner}</strong>
        </span>
      </div>
    </div>
  );
}

function ProjectionSection({ title, icon, data, color, trackColor }) {
  if (!data || Object.keys(data).length === 0) return null;
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxPct  = Math.max(...entries.map(([, v]) => v));

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px", boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
          {icon} {title}
        </h3>
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{entries.length} teams</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {entries.map(([team, pct]) => {
          const w = maxPct > 0 ? (pct / maxPct) * 100 : 0;
          return (
            <div key={team} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "130px", flexShrink: 0 }}>
                <TeamBadge name={team} size={16} />
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team}</span>
              </div>
              <div style={{ flex: 1, height: "7px", background: trackColor || "var(--bg-tertiary)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${Math.max(w, 2)}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.7s ease" }} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700, color, width: "44px", textAlign: "right", fontFamily: "monospace" }}>{pct.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyMsg() {
  return (
    <div style={{ textAlign: "center", padding: "48px", background: "var(--bg-card)", borderRadius: "14px", border: "1px dashed var(--border)", color: "var(--text-muted)" }}>
      <Clock size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
      <p style={{ fontSize: "14px", fontWeight: 500 }}>No matches match this filter</p>
    </div>
  );
}
