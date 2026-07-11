import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { Radio, Check, X, Clock, Trophy } from "lucide-react";

/**
 * LiveScoresDashboard
 * --------------------
 * Drop this into a Next.js page. It polls your own backend (see backend/main.py)
 * which merges live worldcup26.ir data with your model's predictions.
 *
 * Swap MOCK_MATCHES for a real fetch by setting API_BASE below, e.g.:
 *   const API_BASE = "https://your-backend.onrender.com";
 * Leave it null to run on mock data (useful for building the UI before the
 * backend is deployed).
 */

const API_BASE = null; // e.g. "https://wc-dashboard-backend.onrender.com"
const POLL_MS = 20000;

// Sample shape mirrors exactly what GET /api/matches returns.
const MOCK_MATCHES = [
  { id: "61", group: "H", stage: "group", home: "Spain", away: "Uruguay", home_score: 2, away_score: 1, status: "finished", prediction: { p_home: 0.52, p_draw: 0.27, p_away: 0.21, scoreline: "2-1", predicted_winner: "Spain" }, correct_winner: true, correct_scoreline: true },
  { id: "44", group: "F", stage: "group", home: "Netherlands", away: "Japan", home_score: 1, away_score: 1, status: "finished", prediction: { p_home: 0.48, p_draw: 0.28, p_away: 0.24, scoreline: "2-1", predicted_winner: "Netherlands" }, correct_winner: false, correct_scoreline: false },
  { id: "80", group: "R32", stage: "r32", home: "Argentina", away: "Panama", home_score: 3, away_score: 0, status: "finished", prediction: { p_home: 0.71, p_draw: 0.18, p_away: 0.11, scoreline: "3-0", predicted_winner: "Argentina" }, correct_winner: true, correct_scoreline: true },
  { id: "83", group: "R32", stage: "r32", home: "England", away: "Colombia", home_score: 1, away_score: 1, status: "42:10", prediction: { p_home: 0.44, p_draw: 0.29, p_away: 0.27, scoreline: "2-1", predicted_winner: "England" } },
  { id: "84", group: "R32", stage: "r32", home: "France", away: "Morocco", home_score: null, away_score: null, status: "notstarted", prediction: { p_home: 0.55, p_draw: 0.25, p_away: 0.20, scoreline: "2-0", predicted_winner: "France" } },
  { id: "85", group: "R32", stage: "r32", home: "Portugal", away: "Ecuador", home_score: 2, away_score: 0, status: "finished", prediction: { p_home: 0.58, p_draw: 0.24, p_away: 0.18, scoreline: "2-0", predicted_winner: "Portugal" }, correct_winner: true, correct_scoreline: true },
];

const MOCK_ACCURACY = {
  finished_with_predictions: 42,
  winner_accuracy: 66.7,
  scoreline_accuracy: 28.6,
  brier_score: 0.187,
  by_group: {
    A: { total: 6, correct_winner: 4, accuracy_pct: 66.7 },
    B: { total: 6, correct_winner: 5, accuracy_pct: 83.3 },
    C: { total: 6, correct_winner: 3, accuracy_pct: 50.0 },
    D: { total: 6, correct_winner: 4, accuracy_pct: 66.7 },
    E: { total: 6, correct_winner: 4, accuracy_pct: 66.7 },
    R32: { total: 12, correct_winner: 8, accuracy_pct: 66.7 },
  },
};

function StatusBadge({ status }) {
  if (status === "finished") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-400">
        <Check className="w-3 h-3" /> FT
      </span>
    );
  }
  if (status === "notstarted") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500">
        <Clock className="w-3 h-3" /> Upcoming
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400">
      <Radio className="w-3 h-3 animate-pulse" /> LIVE {status}
    </span>
  );
}

function ScoreDigits({ value }) {
  return (
    <span className="font-mono text-2xl tabular-nums text-amber-300 bg-emerald-950 rounded px-2 py-0.5 border border-emerald-800">
      {value === null || value === undefined ? "–" : value}
    </span>
  );
}

function MatchCard({ m }) {
  const isLive = m.status !== "finished" && m.status !== "notstarted";
  const hasResult = m.status === "finished";

  return (
    <div className={`rounded-lg border p-4 bg-emerald-900/40 ${isLive ? "border-red-500/50" : "border-emerald-800"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
          {m.stage === "group" ? `Group ${m.group}` : m.group}
        </span>
        <StatusBadge status={m.status} />
      </div>

      <div className="flex items-center justify-between mb-1">
        <span className="text-stone-100 font-medium truncate">{m.home}</span>
        <ScoreDigits value={m.home_score} />
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-stone-100 font-medium truncate">{m.away}</span>
        <ScoreDigits value={m.away_score} />
      </div>

      {m.prediction && (
        <div className="flex items-center justify-between pt-2 border-t border-emerald-800/60 text-xs">
          <span className="text-stone-400">
            Model picked <span className="text-amber-400 font-semibold">{m.prediction.predicted_winner}</span>
            {" "}({m.prediction.scoreline})
          </span>
          {hasResult && (
            m.correct_winner ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" /> Correct
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                <X className="w-3.5 h-3.5" /> Missed
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, suffix = "" }) {
  return (
    <div className="flex-1 min-w-[140px] rounded-lg bg-emerald-900/60 border border-emerald-800 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold mb-1">{label}</div>
      <div className="text-2xl font-mono text-stone-100">
        {value === null || value === undefined ? "–" : value}
        <span className="text-sm text-stone-500">{suffix}</span>
      </div>
    </div>
  );
}

export default function LiveScoresDashboard() {
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [accuracy, setAccuracy] = useState(MOCK_ACCURACY);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!API_BASE) return; // stay on mock data until a real backend is wired up
    try {
      const [mRes, aRes] = await Promise.all([
        fetch(`${API_BASE}/api/matches`),
        fetch(`${API_BASE}/api/accuracy`),
      ]);
      if (!mRes.ok || !aRes.ok) throw new Error("Backend request failed");
      setMatches(await mRes.json());
      setAccuracy(await aRes.json());
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, POLL_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  const filtered = useMemo(() => {
    if (filter === "all") return matches;
    if (filter === "live") return matches.filter(m => m.status !== "finished" && m.status !== "notstarted");
    if (filter === "finished") return matches.filter(m => m.status === "finished");
    if (filter === "upcoming") return matches.filter(m => m.status === "notstarted");
    return matches;
  }, [matches, filter]);

  const chartData = useMemo(() => {
    return Object.entries(accuracy.by_group || {}).map(([group, v]) => ({
      group,
      accuracy: v.accuracy_pct,
    }));
  }, [accuracy]);

  return (
    <div className="min-h-full bg-emerald-950 text-stone-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-semibold tracking-tight">World Cup 2026 — Predictions vs Reality</h1>
        </div>
        <p className="text-sm text-stone-500 mb-6">
          {API_BASE ? "Live data" : "Preview mode — showing sample data"} · refreshes every {POLL_MS / 1000}s
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-800 rounded px-3 py-2">
            Couldn't reach backend ({error}) — showing last known data.
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-6">
          <StatPill label="Winner accuracy" value={accuracy.winner_accuracy} suffix="%" />
          <StatPill label="Exact scoreline" value={accuracy.scoreline_accuracy} suffix="%" />
          <StatPill label="Brier score" value={accuracy.brier_score} />
          <StatPill label="Matches scored" value={accuracy.finished_with_predictions} />
        </div>

        {chartData.length > 0 && (
          <div className="mb-6 rounded-lg bg-emerald-900/40 border border-emerald-800 p-4">
            <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold mb-3">
              Winner accuracy by group / stage
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0d3b2e" />
                <XAxis dataKey="group" stroke="#6b8077" fontSize={12} />
                <YAxis stroke="#6b8077" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "#0D1512", border: "1px solid #1c4a3a", fontSize: 12 }}
                  labelStyle={{ color: "#EDEFE7" }}
                />
                <Bar dataKey="accuracy" fill="#d9a441" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          {["all", "live", "upcoming", "finished"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize border ${
                filter === f
                  ? "bg-amber-400 text-emerald-950 border-amber-400"
                  : "bg-transparent text-stone-400 border-emerald-800 hover:border-emerald-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(m => <MatchCard key={m.id} m={m} />)}
        </div>
      </div>
    </div>
  );
}
