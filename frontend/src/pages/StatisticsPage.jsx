import React, { useMemo, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Trophy, Target, Activity, TrendingUp, Check, Zap, Award } from 'lucide-react';

export default function StatisticsPage({ matches, accuracy }) {
  const totalPreds = matches.filter(m => m.prediction).length;
  const finished  = matches.filter(m => m.status === 'finished');
  const correct   = finished.filter(m => m.correct_winner).length;
  const withPred  = finished.filter(m => m.prediction).length;
  const accPct    = withPred > 0 ? Math.round((correct / withPred) * 100) : 0;

  const chartData = useMemo(() =>
    Object.entries(accuracy.by_group || {}).map(([g, v]) => ({
      group: g === 'r32' ? 'R32' : g === 'r16' ? 'R16' : g === 'qf' ? 'QF' : g === 'sf' ? 'SF' : g === 'final' ? 'Final' : `Grp ${g}`,
      accuracy: v.accuracy_pct,
      total: v.total,
    })).sort((a, b) => a.group.localeCompare(b.group)),
    [accuracy]
  );

  // Group stage breakdown
  const groupBreakdown = useMemo(() => {
    const byGroup = {};
    finished.filter(m => m.stage === 'group' && m.prediction).forEach(m => {
      const g = m.group || 'X';
      if (!byGroup[g]) byGroup[g] = { total: 0, correct: 0 };
      byGroup[g].total++;
      if (m.correct_winner) byGroup[g].correct++;
    });
    return Object.entries(byGroup).map(([g, v]) => ({ group: g, ...v, pct: Math.round(v.correct / v.total * 100) })).sort((a,b) => a.group.localeCompare(b.group));
  }, [finished]);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #040d1a, #003366)', padding: '36px 24px 28px', borderBottom: '1px solid rgba(255,215,0,0.15)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            <span className="text-gradient-gold">Statistics</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            Detailed analytics and model performance metrics
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {/* Big Hero Accuracy + Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>
          {/* Circular Progress */}
          <CircularProgress pct={accPct} label="Winner Accuracy" />

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {[
              { icon: <Target size={18} color="#003366" />, label: 'Total Predictions',  value: totalPreds,                                      color: '#003366' },
              { icon: <Check  size={18} color="#00CC66" />, label: 'Correct Picks',       value: correct,                                         color: '#00CC66' },
              { icon: <Award  size={18} color="#FFD700" />, label: 'Scoreline Accuracy',  value: accuracy.scoreline_accuracy ? `${accuracy.scoreline_accuracy}%` : '–', color: '#FFD700' },
              { icon: <Zap    size={18} color="#0099FF" />, label: 'Brier Score',         value: accuracy.brier_score ?? '–',                     color: '#0099FF' },
              { icon: <Trophy size={18} color="#FF9900" />, label: 'Matches Evaluated',   value: accuracy.finished_with_predictions ?? '–',       color: '#FF9900' },
              { icon: <TrendingUp size={18} color="#9333EA" />, label: 'Prediction Coverage', value: totalPreds > 0 ? `${Math.round((withPred / Math.max(finished.length, 1)) * 100)}%` : '–', color: '#9333EA' },
            ].map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        {chartData.length > 0 && (
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px', marginBottom: '20px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Activity size={16} color="#003366" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Winner Accuracy by Stage</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="group" style={{ fontSize: 11 }} tick={{ fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} style={{ fontSize: 11 }} tick={{ fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }}
                  formatter={(v, n, p) => [`${v}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.accuracy >= 70 ? '#00CC66' : entry.accuracy >= 50 ? '#FFD700' : '#FF3333'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Group Breakdown */}
        {groupBreakdown.length > 0 && (
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Trophy size={16} color="#FFD700" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Accuracy by Group</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {groupBreakdown.map(g => (
                <div key={g.group} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '60px', fontSize: '12px', fontWeight: 700, color: 'var(--navy-600)' }}>Group {g.group}</span>
                  <div style={{ flex: 1, height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${g.pct}%`, height: '100%', borderRadius: '4px',
                      background: g.pct >= 70 ? '#00CC66' : g.pct >= 50 ? '#FFD700' : '#FF3333',
                      transition: 'width 1s ease',
                    }} />
                  </div>
                  <span style={{ width: '60px', fontSize: '12px', fontWeight: 700, color: g.pct >= 70 ? '#00CC66' : g.pct >= 50 ? '#FF9900' : '#FF3333', textAlign: 'right' }}>
                    {g.pct}% ({g.correct}/{g.total})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CircularProgress({ pct, label }) {
  const r = 54; const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;
  const color = pct >= 70 ? '#00CC66' : pct >= 50 ? '#FFD700' : '#FF3333';

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      boxShadow: 'var(--shadow-card)', minWidth: '140px',
    }}>
      <svg width="130" height="130" viewBox="0 0 130 130" className="ring-svg">
        <circle cx="65" cy="65" r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease' }}
        />
        <text x="65" y="62" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'Inter,sans-serif', fontSize: '24px', fontWeight: 900, fill: 'var(--text-primary)' }}>
          {pct}%
        </text>
        <text x="65" y="80" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'Inter,sans-serif', fontSize: '9px', fill: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Accuracy
        </text>
      </svg>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>{label}</span>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '14px 16px',
      boxShadow: 'var(--shadow-xs)',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: `${color}15`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
    </div>
  );
}
