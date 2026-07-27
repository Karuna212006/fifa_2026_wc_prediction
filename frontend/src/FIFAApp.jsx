import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SplashScreen from './SplashScreen';

import HomePage from './pages/HomePage';
import PredictionsPage from './pages/PredictionsPage';
import ResultsPage from './pages/ResultsPage';
import StandingsPage from './pages/StandingsPage';
import StatsPage from './pages/StatsPage';
import AboutPage from './pages/AboutPage';
import FixturesContent from './LiveScoresDashboard';
import BracketPage from './pages/BracketPage';


const API_BASE = 'http://localhost:8000';
const POLL_MS = 10000;

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
  const [showSplash, setShowSplash] = useState(true);

  // Data State (existing backend data)
  const [matches, setMatches] = useState([]);
  const [accuracy, setAccuracy] = useState({ finished_with_predictions: 0, winner_accuracy: 0, scoreline_accuracy: 0, brier_score: 0, by_group: {} });
  const [error, setError] = useState(null);

  // Projection State
  const [projectionData, setProjectionData] = useState(null);
  const [projectionLoading, setProjectionLoading] = useState(false);
  const [projectionError, setProjectionError] = useState(null);

  // Derive live match state from the shared matches array (same source used by all pages)
  const hasLiveMatches = matches.some(m => m.status === 'live');



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
    loadData(); loadProjection();
    const t1 = setInterval(loadData, POLL_MS);
    const t3 = setInterval(loadProjection, PROJECTION_POLL_MS);
    return () => { clearInterval(t1); clearInterval(t3); };
  }, [loadData, loadProjection]);


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
          matches={matches}
          hasLiveMatches={hasLiveMatches}
        />
      );
      case 'results': return <ResultsPage matches={matches} accuracy={accuracy} />;
      case 'standings': return <StandingsPage matches={matches} />;
      case 'stats': return <StatsPage matches={matches} />;
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
      />

      <main style={{ paddingTop: '64px', minHeight: 'calc(100vh - 64px)' }}>
        {renderPage()}
      </main>

      <Footer navigate={navigate} />

      />
    </div>
  );
}
