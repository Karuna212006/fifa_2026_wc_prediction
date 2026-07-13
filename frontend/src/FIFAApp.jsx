import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SplashScreen from './SplashScreen';
import ChatSidebar from './ChatSidebar';
import HomePage from './pages/HomePage';
import PredictionsPage from './pages/PredictionsPage';
import ResultsPage from './pages/ResultsPage';
import StandingsPage from './pages/StandingsPage';
import StatsPage from './pages/StatsPage';
import AboutPage from './pages/AboutPage';
import FixturesContent from './LiveScoresDashboard';
import BracketPage from './pages/BracketPage';
import { useWorldCup2026Data } from './hooks/useWorldCup2026Data';


const API_BASE = 'http://localhost:8000';
const POLL_MS = 10000;
const CHAT_POLL_MS = 2500;
const PROJECTION_POLL_MS = 30000;

const isCometChatConfigured = !!(
  import.meta.env.VITE_COMETCHAT_APP_ID &&
  import.meta.env.VITE_COMETCHAT_REGION &&
  import.meta.env.VITE_COMETCHAT_AUTH_KEY
);

const RANDOM_NICKNAMES = ['GoalScorer', 'VAR_Official', 'PitchInvader', 'Striker99', 'Gaffer_Joe', 'VAR_Guru', 'MidfieldMaestro', 'CornerKick', 'GoldenBoot'];

export default function FIFAApp() {
  // UI State
  const [currentPage, setCurrentPage] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Data State (existing backend data)
  const [matches, setMatches] = useState([]);
  const [accuracy, setAccuracy] = useState({ finished_with_predictions: 0, winner_accuracy: 0, scoreline_accuracy: 0, brier_score: 0, by_group: {} });
  const [error, setError] = useState(null);

  // Projection State
  const [projectionData, setProjectionData] = useState(null);
  const [projectionLoading, setProjectionLoading] = useState(false);
  const [projectionError, setProjectionError] = useState(null);

  // NEW: Tournament bracket data from TanStack Query auto-updating hook
  const {
    data: bracketData,
    isLoading: bracketLoading,
    isRefetching: bracketRefetching,
    hasLiveMatches,
    simulateGoal,
    finishMatch,
    resetData: resetBracketData,
  } = useWorldCup2026Data();

  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [activeChannel, setActiveChannel] = useState('live-discussion');
  const [nickname, setNickname] = useState(() => {
    const saved = localStorage.getItem('wc_chat_nickname');
    if (saved) return saved;
    const rand = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)] + '_' + Math.floor(Math.random() * 900 + 100);
    localStorage.setItem('wc_chat_nickname', rand);
    return rand;
  });

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Close mobile menu on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setIsMobileMenuOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Data fetching (existing backend)
  const loadData = useCallback(async () => {
    try {
      const [mRes, aRes] = await Promise.all([
        fetch(`${API_BASE}/api/matches`),
        fetch(`${API_BASE}/api/accuracy`),
      ]);
      if (!mRes.ok || !aRes.ok) throw new Error('Failed');
      setMatches(await mRes.json());
      setAccuracy(await aRes.json());
      setError(null);
    } catch {
      setError("Couldn't reach live backend server.");
    }
  }, []);

  const loadChat = useCallback(async () => {
    if (isCometChatConfigured) return;
    try {
      const res = await fetch(`${API_BASE}/api/chat`);
      if (!res.ok) throw new Error('Chat failed');
      setChatMessages(await res.json());
    } catch { /* silent */ }
  }, []);

  const loadProjection = useCallback(async () => {
    setProjectionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bracket-projection`);
      if (res.status === 503) {
        setProjectionError('Model not loaded — export team_ratings.csv and poisson_coeffs.json.');
        setProjectionData(null);
      } else if (!res.ok) {
        throw new Error('Projection failed');
      } else {
        setProjectionData(await res.json());
        setProjectionError(null);
      }
    } catch {
      setProjectionError("Couldn't reach projection endpoint.");
    } finally {
      setProjectionLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(); loadChat(); loadProjection();
    const t1 = setInterval(loadData, POLL_MS);
    const t2 = setInterval(loadChat, CHAT_POLL_MS);
    const t3 = setInterval(loadProjection, PROJECTION_POLL_MS);
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); };
  }, [loadData, loadChat, loadProjection]);

  const handleSendMessage = async (message) => {
    const msg = { username: nickname, text: message.trim(), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) };
    setChatMessages(prev => [...prev, msg]);
    try {
      await fetch(`${API_BASE}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: nickname, text: message.trim() }),
      });
      loadChat();
    } catch { /* silent */ }
  };

  const navigate = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const commonProps = { matches, accuracy, error, navigate };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage {...commonProps} />;
      case 'predictions': return <PredictionsPage matches={matches} />;
      case 'fixtures': return (
        <FixturesContent
          matches={matches}
          accuracy={accuracy}
          projectionData={projectionData}
          projectionLoading={projectionLoading}
          projectionError={projectionError}
          loadProjection={loadProjection}
        />
      );
      case 'bracket': return (
        <BracketPage
          bracketData={bracketData}
          isLoading={bracketLoading}
          isRefetching={bracketRefetching}
          hasLiveMatches={hasLiveMatches}
          simulateGoal={simulateGoal}
          finishMatch={finishMatch}
          resetData={resetBracketData}
        />
      );
      case 'results': return <ResultsPage matches={matches} accuracy={accuracy} />;
      case 'standings': return <StandingsPage matches={matches} />;
      case 'stats': return <StatsPage />;
      case 'about': return <AboutPage />;
      default: return <HomePage {...commonProps} />;
    }
  };

  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar
        currentPage={currentPage}
        navigate={navigate}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        error={error}
        isRefetching={bracketRefetching}
        hasLiveMatches={hasLiveMatches}
      />

      <main style={{ paddingTop: '64px', minHeight: 'calc(100vh - 64px)' }}>
        {renderPage()}
      </main>

      <Footer navigate={navigate} />

      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        nickname={nickname}
        setNickname={setNickname}
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        onSendMessage={handleSendMessage}
        isCometChatConfigured={isCometChatConfigured}
        accuracy={accuracy}
      />
    </div>
  );
}
