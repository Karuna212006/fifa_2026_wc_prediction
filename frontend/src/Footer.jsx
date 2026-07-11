import React from 'react';
import { Trophy, Share2, Link, Mail, ChevronRight, ExternalLink } from 'lucide-react';

const FOOTER_LINKS = {
  'About': [
    { label: 'Our Mission',       id: 'about' },
    { label: 'How It Works',      id: 'about' },
    { label: 'Prediction Model',  id: 'about' },
    { label: 'Data Sources',      id: 'about' },
  ],
  'Quick Links': [
    { label: 'Live Matches',  id: 'fixtures' },
    { label: 'Predictions',   id: 'predictions' },
    { label: 'Standings',     id: 'standings' },
    { label: 'Statistics',    id: 'statistics' },
  ],
  'Tournaments': [
    { label: 'Group Stage',      id: 'fixtures' },
    { label: 'Round of 32',      id: 'fixtures' },
    { label: 'Knockout Rounds',  id: 'fixtures' },
    { label: 'Final Bracket',    id: 'fixtures' },
  ],
  'Legal': [
    { label: 'Privacy Policy',   id: null },
    { label: 'Terms of Use',     id: null },
    { label: 'Cookie Policy',    id: null },
    { label: 'Disclaimer',       id: null },
  ],
};

const SOCIAL = [
  { Icon: Share2,       label: 'Share',   href: '#' },
  { Icon: Link,         label: 'Link',    href: '#' },
  { Icon: ExternalLink, label: 'Website', href: '#' },
  { Icon: Mail,         label: 'Email',   href: '#' },
];

export default function Footer({ navigate }) {
  const [email, setEmail] = React.useState('');

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #04091a 0%, #020c1b 100%)',
      borderTop: '1px solid rgba(255,215,0,0.12)',
      color: 'rgba(255,255,255,0.7)',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Top accent line */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #FFD700 30%, #0066CC 70%, transparent)' }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px 32px' }}>
        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', marginBottom: '48px' }}>
          {/* Brand Column */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '40px', height: '40px',
                background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trophy size={22} color="#003366" />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#FFD700', letterSpacing: '-0.01em' }}>FIFA 2026™</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,215,0,0.5)', letterSpacing: '0.12em', fontFamily: 'monospace' }}>PREDICTIONS</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>
              AI-powered match forecasts for the FIFA World Cup 2026. Built with Elo ratings, Poisson models & Monte Carlo simulation.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {SOCIAL.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: '34px', height: '34px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,215,0,0.15)'; e.currentTarget.style.color = '#FFD700'; e.currentTarget.style.borderColor = 'rgba(255,215,0,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
                {title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {links.map(({ label, id }) => (
                  <li key={label}>
                    {id ? (
                      <button
                        onClick={() => navigate(id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'rgba(255,255,255,0.5)', fontSize: '13px',
                          fontFamily: 'Inter, sans-serif', padding: 0,
                          display: 'flex', alignItems: 'center', gap: '4px',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#FFD700'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                      >
                        <ChevronRight size={12} style={{ opacity: 0.4 }} />
                        {label}
                      </button>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ChevronRight size={12} style={{ opacity: 0.25 }} />
                        {label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
              Stay Updated
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '14px' }}>
              Get prediction updates and tournament insights straight to your inbox.
            </p>
            <form
              onSubmit={e => { e.preventDefault(); setEmail(''); }}
              style={{ display: 'flex', gap: '6px' }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex: 1, padding: '9px 12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '7px', color: 'white',
                  fontSize: '12px', fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '9px 14px',
                  background: '#FFD700', color: '#040d1a',
                  border: 'none', borderRadius: '7px',
                  cursor: 'pointer', fontWeight: 700, fontSize: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <Mail size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            © 2026 FIFA World Cup Predictions. All rights reserved. Not affiliated with FIFA.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Privacy', 'Terms', 'Cookies'].map(t => (
              <span key={t} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
