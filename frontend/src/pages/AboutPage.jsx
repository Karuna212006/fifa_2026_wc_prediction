import React from 'react';
import { Trophy, Zap, Target, Brain, TrendingUp, Shield, Database, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    icon: <Database size={24} color="#FFD700" />,
    color: '#FFD700',
    title: 'Data Collection',
    desc: 'Match results, historical team statistics, and live scores are ingested from multiple sources into a structured dataset. Group-stage predictions are derived from a pre-computed CSV pipeline.',
  },
  {
    icon: <TrendingUp size={24} color="#0099FF" />,
    color: '#0099FF',
    title: 'Elo Rating System',
    desc: 'Each team receives a dynamic Elo rating updated after every match. Winners gain points, losers lose them — adjusted by the margin of victory and opponent strength. This captures current form accurately.',
  },
  {
    icon: <Brain size={24} color="#9333EA" />,
    color: '#9333EA',
    title: 'Poisson Goal Model',
    desc: 'Expected goals (xG) are computed per team using their Elo ratings and attack/defense coefficients. The Poisson distribution then models the probability of each exact scoreline.',
  },
  {
    icon: <Target size={24} color="#00CC66" />,
    color: '#00CC66',
    title: 'Monte Carlo Simulation',
    desc: '5,000+ tournament simulations are run from the current bracket state. Each run samples match outcomes from the Poisson model, accumulating win/reach probabilities per team.',
  },
  {
    icon: <Zap size={24} color="#FF9900" />,
    color: '#FF9900',
    title: 'AI Confidence Scoring',
    desc: 'A confidence level (High / Medium / Low) is derived from the winning probability: ≥55% = High, ≥40% = Medium, else Low. The Brier Score is tracked to penalize overconfident wrong predictions.',
  },
  {
    icon: <Shield size={24} color="#FF4444" />,
    color: '#FF4444',
    title: 'Live Accuracy Tracking',
    desc: 'Every finished match is evaluated against our pre-match prediction. Winner accuracy (correct direction) and exact scoreline accuracy are tracked in real-time via the backend API.',
  },
];

const FAQ = [
  { q: 'How accurate is the model?', a: 'Typically 60–75% winner accuracy for group stage matches. Knockout predictions are harder due to higher variance, single-elimination format, and penalties.' },
  { q: 'What is a Brier Score?', a: 'A Brier Score measures calibration quality — how close predicted probabilities are to actual outcomes. Lower is better. 0.25 is random chance; we target < 0.20.' },
  { q: 'Are predictions updated live?', a: 'Yes. Predictions for knockout matches are dynamically recomputed using current Elo ratings after every group stage result, with 10-second polling intervals.' },
  { q: 'Can I export predictions?', a: 'The backend exposes all predictions via /api/matches as JSON. You can use the data for your own analysis, CSV export, or custom dashboards.' },
];

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #040d1a 0%, #003366 50%, #040d1a 100%)',
        padding: '56px 24px 48px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #FFD700 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', padding: '6px 16px', borderRadius: '20px', marginBottom: '20px' }}>
            <Trophy size={14} color="#FFD700" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>How It Works</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: 'white', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            The Prediction <span className="text-gradient-gold">Engine</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            A multi-model approach combining Elo ratings, Poisson distribution, and Monte Carlo simulation to deliver tournament-grade forecasts.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Pipeline Steps */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px', textAlign: 'center' }}>
            Prediction Pipeline
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {STEPS.map((step, i) => (
              <PipelineStep key={i} step={step} index={i} isLast={i === STEPS.length - 1} />
            ))}
          </div>
        </div>

        {/* Model Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {[
            { title: 'Elo K-Factor', value: '32', note: 'Standard chess-derived update magnitude' },
            { title: 'Simulations', value: '5,000', note: 'Monte Carlo draws per projection' },
            { title: 'Poll Interval', value: '10s', note: 'Live match data refresh rate' },
            { title: 'Projection Refresh', value: '30s', note: 'Bracket simulation frequency' },
          ].map((m, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--navy-600)', marginBottom: '4px' }}>{m.value}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{m.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.note}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: '#003366' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'white', margin: 0 }}>Frequently Asked Questions</h2>
          </div>
          {FAQ.map((item, i) => (
            <FAQItem key={i} {...item} isLast={i === FAQ.length - 1} />
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: '32px', background: 'rgba(0,102,204,0.06)', border: '1px solid rgba(0,102,204,0.15)', borderRadius: '12px', padding: '16px 20px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <Shield size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: '#0066CC' }} />
          <strong>Disclaimer:</strong> All predictions are generated algorithmically for entertainment and analytical purposes only. This platform is not affiliated with FIFA or any football governing body. Predictions should not be used for gambling or financial decisions.
        </div>
      </div>
    </div>
  );
}

function PipelineStep({ step, index, isLast }) {
  return (
    <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
      {/* Left: number + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '48px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: `${step.color}18`, border: `2px solid ${step.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, zIndex: 1,
        }}>
          {step.icon}
        </div>
        {!isLast && (
          <div style={{ width: '2px', flex: 1, background: 'var(--border)', margin: '4px 0', minHeight: '28px' }} />
        )}
      </div>

      {/* Right: content */}
      <div style={{ paddingBottom: isLast ? 0 : '24px', paddingTop: '8px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: step.color, background: `${step.color}15`, padding: '2px 8px', borderRadius: '4px' }}>
            Step {index + 1}
          </span>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{step.title}</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
      </div>
    </div>
  );
}

function FAQItem({ q, a, isLast }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
          textAlign: 'left', fontFamily: 'Inter, sans-serif',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{q}</span>
        <ChevronRight size={16} color="var(--text-muted)" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ padding: '0 20px 16px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
}
