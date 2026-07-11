import React from 'react';
import { Trophy, Menu, X, Moon, Sun, MessageSquare, ChevronDown } from 'lucide-react';
import LiveIndicator from './components/LiveIndicator.jsx';

const NAV_ITEMS = [
  { id: 'home',        label: 'Home' },
  { id: 'predictions', label: 'Predictions' },
  { id: 'fixtures',    label: 'Fixtures' },
  { id: 'bracket',     label: 'Bracket' },
  { id: 'results',     label: 'Results' },
  { id: 'standings',   label: 'Standings' },
  { id: 'stats',       label: 'Stats' },
  { id: 'about',       label: 'About' },
];

export default function Navbar({
  currentPage, navigate,
  darkMode, setDarkMode,
  isMobileMenuOpen, setIsMobileMenuOpen,
  isChatOpen, setIsChatOpen,
  error,
  isRefetching, hasLiveMatches,
}) {
  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 'var(--navbar-height)',
        background: 'linear-gradient(90deg, #040d1a 0%, #003366 35%, #07142a 65%, #040d1a 100%)',
        borderBottom: '1px solid rgba(255,215,0,0.2)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: '16px',
      }}>
        {/* ---- Logo ---- */}
        <button
          onClick={() => navigate('home')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 0',
          }}
          id="nav-logo-btn"
        >
          <div style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(255,215,0,0.35)',
            flexShrink: 0,
          }}>
            <Trophy size={20} color="#003366" strokeWidth={2.5} />
          </div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#FFD700', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
              FIFA 2026™
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255,215,0,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
              Predictions
            </div>
          </div>
        </button>

        {/* ---- Desktop Nav Links ---- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }}
             className="hidden md:flex">
          {NAV_ITEMS.map(item => (
            <NavBtn
              key={item.id}
              item={item}
              active={currentPage === item.id}
              onClick={() => navigate(item.id)}
            />
          ))}
          <LiveIndicator isRefetching={isRefetching} hasLiveMatches={hasLiveMatches} />
        </div>

        {/* ---- Right Actions ---- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
          {error && (
            <span style={{
              fontSize: '10px', fontWeight: 700, color: '#FFA500',
              background: 'rgba(255,165,0,0.12)',
              border: '1px solid rgba(255,165,0,0.3)',
              padding: '3px 10px', borderRadius: '20px',
            }} className="hidden sm:inline">
              ● Offline
            </span>
          )}

          {/* Dark Mode */}
          <IconBtn onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode" id="dark-mode-btn">
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </IconBtn>

          {/* Live Chat */}
          <button
            id="chat-toggle-btn"
            onClick={() => setIsChatOpen(!isChatOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 13px',
              background: isChatOpen ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${isChatOpen ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '8px', cursor: 'pointer',
              color: isChatOpen ? '#FFD700' : 'rgba(255,255,255,0.8)',
              fontSize: '12px', fontWeight: 600,
              transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
            }}
          >
            <MessageSquare size={14} />
            <span className="hidden sm:inline">Live Chat</span>
          </button>

          {/* Mobile Hamburger */}
          <IconBtn
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            id="mobile-menu-btn"
            className="md:hidden"
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </IconBtn>
        </div>
      </nav>

      {/* ---- Mobile Menu ---- */}
      {isMobileMenuOpen && (
        <div
          className="animate-fade-in md:hidden"
          style={{
            position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 999,
            background: '#071428',
            borderBottom: '1px solid rgba(255,215,0,0.15)',
            padding: '12px',
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}
        >
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                padding: '12px 16px',
                background: currentPage === item.id ? 'rgba(255,215,0,0.1)' : 'transparent',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                color: currentPage === item.id ? '#FFD700' : 'rgba(255,255,255,0.75)',
                fontSize: '14px',
                fontWeight: currentPage === item.id ? 700 : 500,
                textAlign: 'left', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {currentPage === item.id && (
                <span style={{ width: '4px', height: '4px', background: '#FFD700', borderRadius: '50%', flexShrink: 0 }} />
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function NavBtn({ item, active, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      id={`nav-${item.id}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '7px 13px',
        background: active ? 'rgba(255,215,0,0.1)' : hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
        border: 'none', borderRadius: '7px',
        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        fontWeight: active ? 700 : 500,
        color: active ? '#FFD700' : hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)',
        transition: 'all 0.2s',
        position: 'relative',
        whiteSpace: 'nowrap',
      }}
    >
      {item.label}
      {active && (
        <span style={{
          position: 'absolute', bottom: -1, left: '20%', right: '20%',
          height: '2px', background: '#FFD700', borderRadius: '1px',
        }} />
      )}
    </button>
  );
}

function IconBtn({ children, onClick, title, id, className, style }) {
  return (
    <button
      id={id}
      onClick={onClick}
      title={title}
      className={className}
      style={{
        padding: '8px',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px', cursor: 'pointer',
        color: 'rgba(255,255,255,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
