"""
FIFA World Cup 2026 — Live Scores + Prediction Accuracy backend
================================================================

What this does
---------------
1. Logs into the free worldcup26.ir API (https://github.com/rezarahiminia/worldcup2026)
   and caches the JWT (valid ~84 days per their docs).
2. Pulls live match data on a short poll interval (respecting their public
   rate limit: 120 req/min, responses cached 30s server-side by them too).
3. Merges each match against YOUR model's predictions
   (wc2026_group_match_predictions.csv, produced by Section 9 of your notebook).
4. Exposes endpoints for the frontend:
     GET /api/matches             -> every match with predicted vs actual, live or not
     GET /api/accuracy            -> running accuracy stats (winner %, exact score %, Brier score)
     GET /api/bracket-projection  -> Monte Carlo forward-projection for unset rounds
     GET /api/chat                -> local fallback chat messages
     POST /api/chat               -> post a new chat message

Run locally
-----------
    pip install fastapi uvicorn httpx pandas python-dateutil --break-system-packages
    export WC26_EMAIL=you@example.com
    export WC26_PASSWORD=your_password       # registers automatically on first run
    export PREDICTIONS_CSV=./wc2026_group_match_predictions.csv
    uvicorn main:app --reload --port 8000

Deploy
------
Render.com free tier (see README.md). Set the three env vars above in the
Render dashboard instead of a local .env file.
"""

import os
import time
import math
from datetime import datetime, timedelta
from typing import Optional

import httpx
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import bracket_projection

WC26_BASE = "https://worldcup26.ir"
WC26_EMAIL = os.environ.get("WC26_EMAIL", "antigravity_test_999@example.com")
WC26_PASSWORD = os.environ.get("WC26_PASSWORD", "SuperSecretPassword123!")
PREDICTIONS_CSV = os.environ.get("PREDICTIONS_CSV", "./wc2026_group_match_predictions.csv")

# How long we trust our own in-memory cache of /get/games before refetching.
MATCHES_CACHE_TTL = 20  # seconds

app = FastAPI(title="WC2026 Predictions Live Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# 0. Load bracket-projection model at startup
# ---------------------------------------------------------------------------
bracket_projection.load_model()

# ---------------------------------------------------------------------------
# 1. Auth: register/login once, cache the token in memory
# ---------------------------------------------------------------------------

_token_cache = {"token": None, "obtained_at": 0}
TOKEN_TTL = 60 * 60 * 24 * 80  # refresh a few days before expiry


async def get_token() -> str:
    if _token_cache["token"] and (time.time() - _token_cache["obtained_at"]) < TOKEN_TTL:
        return _token_cache["token"]

    if not WC26_EMAIL or not WC26_PASSWORD:
        raise HTTPException(500, "Set WC26_EMAIL and WC26_PASSWORD environment variables.")

    async with httpx.AsyncClient(timeout=15) as client:
        # Try logging in first; if the account doesn't exist yet, register it.
        r = await client.post(
            f"{WC26_BASE}/auth/authenticate",
            json={"email": WC26_EMAIL, "password": WC26_PASSWORD},
        )
        if r.status_code != 200:
            r = await client.post(
                f"{WC26_BASE}/auth/register",
                json={"name": "WC Dashboard Bot", "email": WC26_EMAIL, "password": WC26_PASSWORD},
            )
        if r.status_code != 200:
            raise HTTPException(502, f"worldcup26.ir auth failed: {r.text}")

        token = r.json()["token"]
        _token_cache["token"] = token
        _token_cache["obtained_at"] = time.time()
        return token


# ---------------------------------------------------------------------------
# 2. Fetch live matches (short-lived local cache)
# ---------------------------------------------------------------------------

_matches_cache = {"data": None, "fetched_at": 0}


async def fetch_raw_games() -> list[dict]:
    if _matches_cache["data"] is not None and (time.time() - _matches_cache["fetched_at"]) < MATCHES_CACHE_TTL:
        return _matches_cache["data"]

    token = await get_token()
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(
            f"{WC26_BASE}/get/games",
            headers={"Authorization": f"Bearer {token}"},
        )
        r.raise_for_status()
        games = r.json()["games"]

    _matches_cache["data"] = games
    _matches_cache["fetched_at"] = time.time()
    return games


# ---------------------------------------------------------------------------
# 3. Load your model's predictions once at startup
# ---------------------------------------------------------------------------

NAME_HARMONIZE = {
    "Turkiye": "Turkey",
    "Türkiye": "Turkey",
    "Congo DR": "DR Congo",
    "Democratic Republic of the Congo": "DR Congo",
    "Bosnia-Herzegovina": "Bosnia and Herzegovina",
}


def load_predictions() -> pd.DataFrame:
    if not os.path.exists(PREDICTIONS_CSV):
        print(f"[warn] predictions file not found at {PREDICTIONS_CSV} — /api/matches will run without predictions")
        return pd.DataFrame(columns=["group", "home", "away", "p_home", "p_draw", "p_away", "scoreline", "predicted"])
    df = pd.read_csv(PREDICTIONS_CSV)
    df["home"] = df["home"].replace(NAME_HARMONIZE)
    df["away"] = df["away"].replace(NAME_HARMONIZE)
    return df


PREDICTIONS = load_predictions()


def find_prediction(home: str, away: str) -> Optional[pd.Series]:
    home = NAME_HARMONIZE.get(home, home)
    away = NAME_HARMONIZE.get(away, away)
    row = PREDICTIONS[(PREDICTIONS.home == home) & (PREDICTIONS.away == away)]
    if len(row):
        return row.iloc[0], False
    row = PREDICTIONS[(PREDICTIONS.home == away) & (PREDICTIONS.away == home)]
    if len(row):
        return row.iloc[0], True
    return None, False


# ---------------------------------------------------------------------------
# 4. Kickoff Override Validator
# ---------------------------------------------------------------------------

def is_future_match(local_date_str: str) -> bool:
    try:
        # Format: "MM/DD/YYYY HH:MM"
        match_dt = datetime.strptime(local_date_str, "%m/%d/%Y %H:%M")

        # Assume match_dt is in Eastern Time (UTC-4) for general North America scheduling.
        # Convert current system UTC time to Eastern Time.
        current_utc = datetime.utcnow()
        current_est = current_utc - timedelta(hours=4)

        return match_dt > current_est
    except Exception:
        return False


# ---------------------------------------------------------------------------
# 5. Dynamic Ratings and Softmax Elo-style predictions
# ---------------------------------------------------------------------------

def calculate_team_ratings(games: list[dict]) -> dict[str, float]:
    ratings = {}
    stats = {}  # team -> {points, goals_scored, goals_conceded, games_played}

    for g in games:
        if g.get("type") != "group":
            continue
        finished = str(g.get("finished")).lower() == "true"
        if not finished:
            continue

        home_raw = g.get("home_team_name_en")
        away_raw = g.get("away_team_name_en")
        if not home_raw or not away_raw:
            continue
        home = NAME_HARMONIZE.get(home_raw, home_raw)
        away = NAME_HARMONIZE.get(away_raw, away_raw)

        try:
            hs = int(g["home_score"])
            as_ = int(g["away_score"])
        except (ValueError, TypeError):
            continue

        for team in [home, away]:
            if team not in stats:
                stats[team] = {"points": 0, "goals_scored": 0, "goals_conceded": 0, "games_played": 0}

        stats[home]["games_played"] += 1
        stats[away]["games_played"] += 1
        stats[home]["goals_scored"] += hs
        stats[home]["goals_conceded"] += as_
        stats[away]["goals_scored"] += as_
        stats[away]["goals_conceded"] += hs

        if hs > as_:
            stats[home]["points"] += 3
        elif hs < as_:
            stats[away]["points"] += 3
        else:
            stats[home]["points"] += 1
            stats[away]["points"] += 1

    for team, s in stats.items():
        gp = s["games_played"]
        if gp > 0:
            avg_pts = s["points"] / gp
            avg_gd = (s["goals_scored"] - s["goals_conceded"]) / gp
            ratings[team] = avg_pts * 10.0 + avg_gd * 2.0

    return ratings


def generate_dynamic_prediction(home: str, away: str, ratings: dict[str, float]) -> dict:
    home = NAME_HARMONIZE.get(home, home)
    away = NAME_HARMONIZE.get(away, away)
    rating_home = ratings.get(home, 10.0)
    rating_away = ratings.get(away, 10.0)

    diff = rating_home - rating_away

    # Softmax logic for win, loss, draw
    p_home_raw = math.exp(diff / 8.0)
    p_away_raw = math.exp(-diff / 8.0)
    p_draw_raw = 0.8  # baseline draw probability in 90 mins

    total = p_home_raw + p_away_raw + p_draw_raw
    p_home = p_home_raw / total
    p_away = p_away_raw / total
    p_draw = p_draw_raw / total

    # Predict scoreline
    base_home_goals = 1.3 + (diff / 10.0)
    base_away_goals = 1.3 - (diff / 10.0)

    pred_home = max(0, round(base_home_goals))
    pred_away = max(0, round(base_away_goals))

    # If high probability of draw but scores are different, normalize score to draw
    if p_draw > max(p_home, p_away):
        pred_home = pred_away = round((pred_home + pred_away) / 2)

    scoreline = f"{pred_home}-{pred_away}"
    predicted_winner = home if p_home > max(p_away, p_draw) else (
        away if p_away > max(p_home, p_draw) else "Draw"
    )

    return {
        "p_home": round(p_home, 3),
        "p_draw": round(p_draw, 3),
        "p_away": round(p_away, 3),
        "scoreline": scoreline,
        "predicted_winner": predicted_winner,
        "is_dynamic": True
    }


# ---------------------------------------------------------------------------
# 6. In-Memory Chat Storage & Endpoints
# ---------------------------------------------------------------------------

chat_messages = [
    {"username": "VAR_Official", "text": "Welcome to the World Cup 2026 Live Discussion Room! ⚽🔥", "timestamp": "10:00"},
    {"username": "Striker99", "text": "Netherlands vs Morocco was an absolute thriller! Still can't believe it went to penalties.", "timestamp": "10:05"},
    {"username": "VAR_Official", "text": "Morocco vs Canada next up in R16. Who's your pick?", "timestamp": "10:15"},
]

@app.get("/api/chat")
async def get_chat():
    return chat_messages

@app.post("/api/chat")
async def post_chat(msg: dict):
    username = msg.get("username", "Anonymous")
    text = msg.get("text", "")
    if not text.strip():
        raise HTTPException(400, "Message text cannot be empty")

    t = datetime.now().strftime("%H:%M")

    new_msg = {
        "username": username[:20],
        "text": text[:200],
        "timestamp": t
    }
    chat_messages.append(new_msg)
    if len(chat_messages) > 100:
        chat_messages.pop(0)
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# 7. Match / Accuracy Endpoints
# ---------------------------------------------------------------------------

def get_winner_of_match(match_id: str, sim_map: dict, ratings: dict) -> str:
    g = sim_map.get(match_id)
    if not g:
        return "TBD"
    finished = str(g.get("finished")).lower() == "true"
    hs = int(g["home_score"]) if str(g.get("home_score")).isdigit() else None
    as_ = int(g["away_score"]) if str(g.get("away_score")).isdigit() else None
    home = g.get("home_team_name_en")
    away = g.get("away_team_name_en")

    if not home or home == "TBD" or not away or away == "TBD":
        return "TBD"

    if finished and hs is not None and as_ is not None:
        return home if hs > as_ else (away if as_ > hs else home)

    # Check predictions
    pred, flipped = find_prediction(home, away)
    if pred is not None:
        p_home, p_away = (pred["p_away"], pred["p_home"]) if flipped else (pred["p_home"], pred["p_away"])
        return home if p_home > p_away else away
    else:
        # Dynamic Elo softmax
        p = generate_dynamic_prediction(home, away, ratings)
        return home if p["p_home"] > p["p_away"] else away

@app.get("/api/matches")
async def get_matches():
    global PREDICTIONS
    PREDICTIONS = load_predictions()
    games = await fetch_raw_games()
    ratings = calculate_team_ratings(games)

    # Simulate knockout progression dynamically
    sim_games = [dict(g) for g in games]
    sim_map = {str(g["id"]): g for g in sim_games}

    # 1. R16 feeds from R32
    r16_feeds = {
        "89": ("74", "77"),
        "90": ("73", "75"),
        "91": ("76", "78"),
        "92": ("79", "80"),
        "93": ("83", "84"),
        "94": ("81", "82"),
        "95": ("86", "88"),
        "96": ("85", "87")
    }

    for r16_id, (f1, f2) in r16_feeds.items():
        g = sim_map.get(r16_id)
        if g:
            if not g.get("home_team_name_en") or g.get("home_team_name_en") == "TBD":
                g["home_team_name_en"] = get_winner_of_match(f1, sim_map, ratings)
                g["is_simulated"] = True
            if not g.get("away_team_name_en") or g.get("away_team_name_en") == "TBD":
                g["away_team_name_en"] = get_winner_of_match(f2, sim_map, ratings)
                g["is_simulated"] = True

    # 2. QF feeds from R16
    qf_feeds = {
        "97": ("89", "90"),
        "98": ("91", "92"),
        "99": ("93", "94"),
        "100": ("95", "96")
    }

    for qf_id, (f1, f2) in qf_feeds.items():
        g = sim_map.get(qf_id)
        if g:
            if not g.get("home_team_name_en") or g.get("home_team_name_en") == "TBD":
                g["home_team_name_en"] = get_winner_of_match(f1, sim_map, ratings)
                g["is_simulated"] = True
            if not g.get("away_team_name_en") or g.get("away_team_name_en") == "TBD":
                g["away_team_name_en"] = get_winner_of_match(f2, sim_map, ratings)
                g["is_simulated"] = True

    # 3. SF feeds from QF
    sf_feeds = {
        "101": ("97", "98"),
        "102": ("99", "100")
    }

    for sf_id, (f1, f2) in sf_feeds.items():
        g = sim_map.get(sf_id)
        if g:
            if not g.get("home_team_name_en") or g.get("home_team_name_en") == "TBD":
                g["home_team_name_en"] = get_winner_of_match(f1, sim_map, ratings)
                g["is_simulated"] = True
            if not g.get("away_team_name_en") or g.get("away_team_name_en") == "TBD":
                g["away_team_name_en"] = get_winner_of_match(f2, sim_map, ratings)
                g["is_simulated"] = True

    # 4. Final feeds from SF
    final_id = "104"
    g = sim_map.get(final_id)
    if g:
        if not g.get("home_team_name_en") or g.get("home_team_name_en") == "TBD":
            g["home_team_name_en"] = get_winner_of_match("101", sim_map, ratings)
            g["is_simulated"] = True
        if not g.get("away_team_name_en") or g.get("away_team_name_en") == "TBD":
            g["away_team_name_en"] = get_winner_of_match("102", sim_map, ratings)
            g["is_simulated"] = True

    # Find the predicted champion to trace their path
    predicted_champion = get_winner_of_match(final_id, sim_map, ratings)

    out = []
    for g in sim_games:
        home = g.get("home_team_name_en")
        away = g.get("away_team_name_en")
        if not home or not away:
            home = home or "TBD"
            away = away or "TBD"

        is_future = is_future_match(g.get("local_date", ""))
        is_simulated = g.get("is_simulated", False)

        if (is_future or home == "TBD" or away == "TBD") and not is_simulated:
            finished = False
            status = "notstarted"
            hs = None
            as_ = None
        else:
            finished = str(g.get("finished")).lower() == "true"
            status = "finished" if finished else g.get("time_elapsed", "notstarted")
            hs = int(g["home_score"]) if str(g.get("home_score")).isdigit() else None
            as_ = int(g["away_score"]) if str(g.get("away_score")).isdigit() else None

        # Check champion path details
        is_winner_path = False
        winner_path_opposition = ""
        if predicted_champion != "TBD" and home != "TBD" and away != "TBD":
            if home == predicted_champion:
                is_winner_path = True
                winner_path_opposition = away
            elif away == predicted_champion:
                is_winner_path = True
                winner_path_opposition = home

        prediction_data = None
        if home != "TBD" and away != "TBD":
            pred, flipped = find_prediction(home, away)
            if pred is not None:
                p_home, p_away = (pred["p_away"], pred["p_home"]) if flipped else (pred["p_home"], pred["p_away"])
                pred_scoreline = pred["scoreline"]
                if flipped:
                    a, b = pred_scoreline.split("-")
                    pred_scoreline = f"{b}-{a}"
                predicted_winner = home if p_home > max(p_away, pred["p_draw"]) else (
                    away if p_away > max(p_home, pred["p_draw"]) else "Draw"
                )
                prediction_data = {
                    "p_home": round(float(p_home), 3),
                    "p_draw": round(float(pred["p_draw"]), 3),
                    "p_away": round(float(p_away), 3),
                    "scoreline": pred_scoreline,
                    "predicted_winner": predicted_winner,
                    "is_dynamic": False,
                    "is_winner_path": is_winner_path,
                    "winner_path_opposition": winner_path_opposition
                }
            else:
                p = generate_dynamic_prediction(home, away, ratings)
                prediction_data = {
                    "p_home": p["p_home"],
                    "p_draw": p["p_draw"],
                    "p_away": p["p_away"],
                    "scoreline": p["scoreline"],
                    "predicted_winner": p["predicted_winner"],
                    "is_dynamic": True,
                    "is_winner_path": is_winner_path,
                    "winner_path_opposition": winner_path_opposition
                }

        entry = {
            "id": g["id"],
            "group": g["group"],
            "stage": g["type"],
            "matchday": g["matchday"],
            "date": g["local_date"],
            "home": home,
            "away": away,
            "home_score": hs,
            "away_score": as_,
            "status": status,
            "prediction": prediction_data,
            "is_simulated": is_simulated,
        }

        if is_simulated and status == "notstarted" and prediction_data:
            ps_home, ps_away = map(int, prediction_data["scoreline"].split("-"))
            entry["home_score"] = ps_home
            entry["away_score"] = ps_away

        if prediction_data and finished and hs is not None and as_ is not None:
            actual_winner = home if hs > as_ else (away if as_ > hs else "Draw")
            entry["correct_winner"] = actual_winner == prediction_data["predicted_winner"]
            entry["correct_scoreline"] = prediction_data["scoreline"] == f"{hs}-{as_}"

        out.append(entry)
    return out


@app.get("/api/accuracy")
async def get_accuracy():
    matches = await get_matches()
    scored = [m for m in matches if m["status"] == "finished" and m.get("prediction")]
    if not scored:
        return {"finished_with_predictions": 0, "winner_accuracy": None, "scoreline_accuracy": None,
                "brier_score": None, "by_group": {}}

    correct_winner = sum(1 for m in scored if m.get("correct_winner"))
    correct_score = sum(1 for m in scored if m.get("correct_scoreline"))

    brier_total = 0.0
    for m in scored:
        p = m["prediction"]
        hs, as_ = m["home_score"], m["away_score"]
        actual = [1 if hs > as_ else 0, 1 if hs == as_ else 0, 1 if as_ > hs else 0]
        pred_vec = [p["p_home"], p["p_draw"], p["p_away"]]
        brier_total += sum((pv - av) ** 2 for pv, av in zip(pred_vec, actual))
    brier = brier_total / len(scored)

    by_group: dict[str, dict] = {}
    for m in scored:
        g = m["group"]
        by_group.setdefault(g, {"total": 0, "correct_winner": 0})
        by_group[g]["total"] += 1
        by_group[g]["correct_winner"] += int(m.get("correct_winner", False))
    for g, v in by_group.items():
        v["accuracy_pct"] = round(100 * v["correct_winner"] / v["total"], 1)

    return {
        "finished_with_predictions": len(scored),
        "winner_accuracy": round(100 * correct_winner / len(scored), 1),
        "scoreline_accuracy": round(100 * correct_score / len(scored), 1),
        "brier_score": round(brier, 3),
        "by_group": by_group,
    }


# ---------------------------------------------------------------------------
# 8. Bracket Projection Endpoint (separate from /api/matches)
# ---------------------------------------------------------------------------

@app.get("/api/bracket-projection")
async def get_bracket_projection():
    """
    Separate from /api/matches on purpose: that endpoint reports real
    fixtures with simulated fill-in. This one projects FORWARD into rounds
    that aren't paired yet — semifinal/final participants, and a predicted
    final scoreline — using the Elo+Poisson model via Monte Carlo.
    """
    if not bracket_projection.model_ready():
        raise HTTPException(
            503,
            "Model not loaded — export team_ratings.csv and poisson_coeffs.json "
            "from your notebook first (see notebook_export_snippet.txt).",
        )
    games = await fetch_raw_games()
    alive = _compute_alive_teams(games)
    known_fixtures = _compute_known_future_fixtures(games)
    return bracket_projection.project_remaining_bracket(alive, known_fixtures)


def _is_placeholder_name(name: str) -> bool:
    # Live feeds often show "Winner Match 74" / "TBD" for KO slots that
    # haven't been decided yet — those aren't real teams to simulate with.
    if not name:
        return True
    return any(marker in name for marker in ("Winner", "TBD", "Runner"))


def _compute_alive_teams(games: list[dict]) -> list[str]:
    eliminated, ko_teams = set(), set()
    for g in games:
        if g.get("type") == "group":
            continue
        home = g.get("home_team_name_en", "")
        away = g.get("away_team_name_en", "")
        if _is_placeholder_name(home) or _is_placeholder_name(away):
            continue
        home = NAME_HARMONIZE.get(home, home)
        away = NAME_HARMONIZE.get(away, away)
        ko_teams.update([home, away])
        if str(g.get("finished")).lower() == "true":
            hs = g.get("home_score")
            as_ = g.get("away_score")
            if hs is not None and as_ is not None:
                try:
                    hs, as_ = int(hs), int(as_)
                    if hs != as_:
                        eliminated.add(home if hs < as_ else away)
                except (ValueError, TypeError):
                    pass
    return list(ko_teams - eliminated)


def _compute_known_future_fixtures(games: list[dict]) -> list[dict]:
    out = []
    for g in games:
        if g.get("type") == "group":
            continue
        home = g.get("home_team_name_en", "")
        away = g.get("away_team_name_en", "")
        if _is_placeholder_name(home) or _is_placeholder_name(away):
            continue
        home = NAME_HARMONIZE.get(home, home)
        away = NAME_HARMONIZE.get(away, away)
        if str(g.get("finished")).lower() != "true":
            out.append({"stage": g["type"], "home": home, "away": away})
    return out


# ---------------------------------------------------------------------------
# 9. Mock Live Data Endpoint (Added for Prediction Application)
# ---------------------------------------------------------------------------

import random
import time as pytime

@app.get("/api/wc2026/live-data")
async def get_live_data():
    """
    Mock API endpoint providing the current bracket state, player stats, and match statuses.
    Structure designed to be easily swapped with a real football API.
    """
    # Simulate a dynamic value that changes over time (for the "Simulate Goal" dev button logic,
    # or just to see updates). We use time.time() to make things slightly dynamic if needed,
    # but hardcoded base data is fine for a mock.
    
    current_timestamp = int(pytime.time())
    # Create some mock bracket data (48 teams -> Round of 32)
    # We'll just provide a few rounds of the bracket as an example, but structured correctly.
    
    return {
        "status": "success",
        "timestamp": current_timestamp,
        "matches": [
            # Example SF 1
            {
                "id": "sf1", "round": "Semi-Finals",
                "teamA": "Brazil", "teamB": "France",
                "scoreA": 1, "scoreB": 2,
                "status": "finished", "winner": "France",
                "predictionConfidence": 58, "isSimulated": False
            },
            # Example SF 2
            {
                "id": "sf2", "round": "Semi-Finals",
                "teamA": "Argentina", "teamB": "Spain",
                "scoreA": 0, "scoreB": 0,
                "status": "live", "winner": None,
                "predictionConfidence": 51, "isSimulated": False,
                "minute": 72
            },
            # 3rd Place
            {
                "id": "3rd", "round": "3rd Place Play-off",
                "teamA": "Brazil", "teamB": "TBD", # Spain or Argentina
                "scoreA": 0, "scoreB": 0,
                "status": "scheduled", "winner": None,
                "predictionConfidence": 45, "isSimulated": False
            },
            # Final
            {
                "id": "final", "round": "Final",
                "teamA": "France", "teamB": "TBD",
                "scoreA": 0, "scoreB": 0,
                "status": "scheduled", "winner": None,
                "predictionConfidence": 60, "isSimulated": False
            },
            # We add a few QF matches just for visual fullness
            {
                "id": "qf1", "round": "Quarter-Finals",
                "teamA": "Brazil", "teamB": "England",
                "scoreA": 2, "scoreB": 1, "status": "finished", "winner": "Brazil", "predictionConfidence": 55
            },
            {
                "id": "qf2", "round": "Quarter-Finals",
                "teamA": "France", "teamB": "Portugal",
                "scoreA": 3, "scoreB": 0, "status": "finished", "winner": "France", "predictionConfidence": 62
            },
            {
                "id": "qf3", "round": "Quarter-Finals",
                "teamA": "Argentina", "teamB": "Germany",
                "scoreA": 1, "scoreB": 0, "status": "finished", "winner": "Argentina", "predictionConfidence": 50
            },
            {
                "id": "qf4", "round": "Quarter-Finals",
                "teamA": "Spain", "teamB": "Italy",
                "scoreA": 2, "scoreB": 0, "status": "finished", "winner": "Spain", "predictionConfidence": 65
            }
        ],
        "players": [
            {
                "id": "p1",
                "name": "Kylian Mbappé",
                "countryCode": "fr",
                "country": "France",
                "team": "Paris Saint-Germain",
                "photo": null,
                "stats": { "goals": 7, "assists": 2, "yellowCards": 1, "redCards": 0, "cleanSheets": 0, "matchesPlayed": 6 }
            },
            {
                "id": "p2",
                "name": "Lionel Messi",
                "countryCode": "ar",
                "country": "Argentina",
                "team": "Inter Miami",
                "photo": null,
                "stats": { "goals": 5, "assists": 4, "yellowCards": 0, "redCards": 0, "cleanSheets": 0, "matchesPlayed": 6 }
            },
            {
                "id": "p3",
                "name": "Vinícius Júnior",
                "countryCode": "br",
                "country": "Brazil",
                "team": "Real Madrid",
                "photo": null,
                "stats": { "goals": 4, "assists": 1, "yellowCards": 2, "redCards": 0, "cleanSheets": 0, "matchesPlayed": 5 }
            },
            {
                "id": "p4",
                "name": "Álvaro Morata",
                "countryCode": "es",
                "country": "Spain",
                "team": "Atletico Madrid",
                "photo": null,
                "stats": { "goals": 4, "assists": 0, "yellowCards": 1, "redCards": 0, "cleanSheets": 0, "matchesPlayed": 5 }
            },
            {
                "id": "p5",
                "name": "Harry Kane",
                "countryCode": "gb-eng",
                "country": "England",
                "team": "Bayern Munich",
                "photo": null,
                "stats": { "goals": 3, "assists": 0, "yellowCards": 0, "redCards": 0, "cleanSheets": 0, "matchesPlayed": 5 }
            },
            {
                "id": "p6",
                "name": "Antoine Griezmann",
                "countryCode": "fr",
                "country": "France",
                "team": "Atletico Madrid",
                "photo": null,
                "stats": { "goals": 1, "assists": 4, "yellowCards": 1, "redCards": 0, "cleanSheets": 0, "matchesPlayed": 6 }
            },
            {
                "id": "p7",
                "name": "Rodri",
                "countryCode": "es",
                "country": "Spain",
                "team": "Manchester City",
                "photo": null,
                "stats": { "goals": 1, "assists": 3, "yellowCards": 1, "redCards": 0, "cleanSheets": 0, "matchesPlayed": 5 }
            },
            {
                "id": "p8",
                "name": "Nicolás Otamendi",
                "countryCode": "ar",
                "country": "Argentina",
                "team": "Benfica",
                "photo": null,
                "stats": { "goals": 0, "assists": 0, "yellowCards": 3, "redCards": 0, "cleanSheets": 0, "matchesPlayed": 6 }
            },
            {
                "id": "p10",
                "name": "Mike Maignan",
                "countryCode": "fr",
                "country": "France",
                "team": "AC Milan",
                "photo": null,
                "stats": { "goals": 0, "assists": 0, "yellowCards": 0, "redCards": 0, "cleanSheets": 4, "matchesPlayed": 6 }
            },
            {
                "id": "p11",
                "name": "Unai Simón",
                "countryCode": "es",
                "country": "Spain",
                "team": "Athletic Club",
                "photo": null,
                "stats": { "goals": 0, "assists": 0, "yellowCards": 0, "redCards": 0, "cleanSheets": 3, "matchesPlayed": 5 }
            },
            {
                "id": "p12",
                "name": "Pepe",
                "countryCode": "pt",
                "country": "Portugal",
                "team": "Porto",
                "photo": null,
                "stats": { "goals": 0, "assists": 0, "yellowCards": 1, "redCards": 1, "cleanSheets": 2, "matchesPlayed": 4 }
            }
        ]
    }

# ---------------------------------------------------------------------------
# 10. Health Check
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "predictions_loaded": len(PREDICTIONS),
        "projection_model_ready": bracket_projection.model_ready(),
    }
