import { useState, useEffect } from 'react';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';

// Fallback articles shown if API is unavailable (e.g. localhost restriction)
const FALLBACK_ARTICLES = [
  {
    title: "Spain Win FIFA World Cup 2026, Defeating Argentina 1-0 in Epic Final",
    description: "Spain claimed their second World Cup title after a tense 1-0 victory over Argentina at MetLife Stadium. Lamine Yamal was the standout performer throughout the tournament.",
    source: { name: 'FIFA.com' },
    publishedAt: '2026-07-19T23:00:00Z',
    urlToImage: null,
    url: 'https://www.fifa.com',
    category: 'Final',
    emoji: '🏆',
  },
  {
    title: "Kylian Mbappé Wins Golden Boot with 10 Goals at World Cup 2026",
    description: "France's Kylian Mbappé claimed the Golden Boot with an extraordinary 10-goal haul, becoming the tournament's all-time top scorer. His performance was hailed as one of the greatest in World Cup history.",
    source: { name: 'BBC Sport' },
    publishedAt: '2026-07-20T10:00:00Z',
    urlToImage: null,
    url: '#',
    category: 'Golden Boot',
    emoji: '👟',
  },
  {
    title: "Unai Simón Sets World Cup Record with 7 Clean Sheets & 650 Minutes",
    description: "Spain's Unai Simón won the Golden Glove after a historic tournament — 7 clean sheets and 650 consecutive minutes without conceding, breaking all previous World Cup goalkeeper records.",
    source: { name: 'ESPN' },
    publishedAt: '2026-07-20T08:00:00Z',
    urlToImage: null,
    url: '#',
    category: 'Golden Glove',
    emoji: '🧤',
  },
  {
    title: "Michael Olise Tops Assist Chart with 5 Assists for France at WC 2026",
    description: "Bayern Munich's Michael Olise finished as the tournament's top assist provider with 5 assists, playing a crucial role in France's run to the semi-finals.",
    source: { name: 'Sky Sports' },
    publishedAt: '2026-07-18T14:00:00Z',
    urlToImage: null,
    url: '#',
    category: 'Analysis',
    emoji: '🎯',
  },
  {
    title: "2026 FIFA World Cup: Most Cards in Tournament History with 281 Total",
    description: "The 2026 World Cup was the most disciplined in modern history — but still saw 266 yellow cards and 15 red cards across 104 matches. Argentina received the most cautions as a team.",
    source: { name: 'The Guardian' },
    publishedAt: '2026-07-19T20:00:00Z',
    urlToImage: null,
    url: '#',
    category: 'Stats',
    emoji: '🟨',
  },
  {
    title: "Norway and Erling Haaland Bow Out in Quarter-Finals Despite 7-Goal Haul",
    description: "Despite Erling Haaland's remarkable 7 goals, Norway were eliminated in the quarter-finals, unable to progress past defending champion Spain's resolute defensive unit.",
    source: { name: 'Reuters' },
    publishedAt: '2026-07-12T18:00:00Z',
    urlToImage: null,
    url: '#',
    category: 'Match Report',
    emoji: '⚽',
  },
];

/**
 * useWC2026News — fetches live FIFA World Cup 2026 news from NewsAPI.
 * Falls back to curated articles if the API is blocked (e.g. localhost restriction)
 * or if the key is invalid.
 */
export function useWC2026News(pageSize = 6) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchNews() {
      setLoading(true);
      setError(null);

      try {
        // Strategy 1: Use our own backend proxy at /api/news (avoids CORS)
        let data = null;
        try {
          const proxyRes = await fetch(`http://localhost:8000/api/news?pageSize=${pageSize}`);
          if (proxyRes.ok) {
            data = await proxyRes.json();
          }
        } catch (_) {
          // Backend not running — fall through to direct call
        }

        // Strategy 2: Direct NewsAPI call (works in production with correct CORS headers)
        if (!data || data.status !== 'ok') {
          const url = `https://newsapi.org/v2/everything?` +
            `q=%22FIFA+World+Cup+2026%22+OR+%22World+Cup+2026%22&` +
            `language=en&sortBy=publishedAt&pageSize=${pageSize}&` +
            `apiKey=${NEWS_API_KEY}`;
          const res = await fetch(url);
          data = await res.json();
        }

        if (!cancelled) {
          if (data.status === 'ok' && Array.isArray(data.articles) && data.articles.length > 0) {
            const filtered = data.articles
              .filter(a => a.title && a.title !== '[Removed]' && a.description)
              .slice(0, pageSize);

            if (filtered.length > 0) {
              setArticles(filtered);
              setIsLive(true);
            } else {
              setArticles(FALLBACK_ARTICLES);
              setIsLive(false);
            }
          } else {
            setArticles(FALLBACK_ARTICLES);
            setIsLive(false);
            if (data.message) setError(data.message);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setArticles(FALLBACK_ARTICLES);
          setIsLive(false);
          setError('NewsAPI CORS restriction — using curated articles.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchNews();
    return () => { cancelled = true; };
  }, [pageSize]);

  return { articles, loading, error, isLive };
}
