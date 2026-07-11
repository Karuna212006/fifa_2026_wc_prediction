import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

export default function SplashScreen({ onEnter }) {
  const [phase, setPhase] = useState(0); // 0=logo, 1=title, 2=btn

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #020c1b 0%, #003366 50%, #040d1a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'radial-gradient(circle, #FFD700 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Gold top glow */}
      <div style={{
        position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
        width: '500px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(255,215,0,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        background: 'rgba(7, 20, 40, 0.9)',
        border: '1px solid rgba(255,215,0,0.15)',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%', maxWidth: '400px',
        margin: '16px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Gold top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #FFD700 30%, #0066CC 70%, transparent)' }} />

        {/* Trophy Icon */}
        <div
          className="animate-float"
          style={{
            width: '96px', height: '96px', margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 60px rgba(255,215,0,0.3), 0 8px 32px rgba(0,0,0,0.4)',
            opacity: phase >= 0 ? 1 : 0,
            transition: 'opacity 0.5s',
          }}
        >
          <Trophy size={48} color="#003366" strokeWidth={2} />
        </div>

        {/* Title */}
        <div style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'none' : 'translateY(12px)', transition: 'all 0.5s' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#FFD700', letterSpacing: '-0.02em', marginBottom: '6px', textTransform: 'uppercase' }}>
            WORLD CUP 2026™
          </h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,215,0,0.55)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '8px' }}>
            Predictions & Analytics
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            AI-powered forecasts • Live scores • Bracket projection
          </p>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', margin: '24px 0', opacity: phase >= 1 ? 1 : 0, transition: 'all 0.6s 0.1s' }}>
          {[['48', 'Teams'], ['2026', 'Edition'], ['AI', 'Powered']].map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFD700' }}>{val}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'none' : 'translateY(8px)', transition: 'all 0.5s' }}>
          <button
            id="splash-enter-btn"
            onClick={onEnter}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #FFD700, #B8860B)',
              color: '#020c1b', border: 'none', borderRadius: '12px',
              fontSize: '14px', fontWeight: 900, cursor: 'pointer',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 24px rgba(255,215,0,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,215,0,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(255,215,0,0.3)'; }}
          >
            Enter Dashboard →
          </button>
        </div>
      </div>

      {/* Bottom note */}
      <p style={{ marginTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.2)', position: 'relative' }}>
        Not affiliated with FIFA • For entertainment purposes only
      </p>
    </div>
  );
}
