"""
bracket_projection.py — forward projection of matches that haven't been paired yet
====================================================================================

This is deliberately a SEPARATE concern from main.py's /api/matches:

  /api/matches              -> real fixtures: upcoming (already scheduled),
                                live, finished. Ground truth, no simulation.
  /api/bracket-projection    -> THIS module. For rounds where the actual
                                matchup isn't determined yet (e.g. the real
                                World Cup semifinal/final pairings don't
                                exist until the quarterfinals finish), this
                                runs your notebook's Elo+Poisson model forward
                                thousands of times to estimate: who's likely
                                to reach the semis, who reaches the final,
                                and — for the most probable finalists — a
                                predicted scoreline.

How "alive" teams are determined
---------------------------------
A team is eliminated the moment they lose a real knockout match, or finish
outside their group's qualifying spots. Everyone else is "alive" and gets
carried forward into the simulation. This is computed directly from the
live match feed — no manual bookkeeping needed.

Known limitation, stated plainly
---------------------------------
FIFA's actual bracket is a fixed tree (Quarterfinal 1's winner plays
Quarterfinal 2's winner — not a random draw among all remaining teams).
Once real fixtures for a round exist in the live feed, we use those exact
pairings. For rounds that don't have real fixtures yet, we approximate the
remaining bracket the same way your notebook's Section 10 does: seed by
adjusted-rating tier rather than trying to guess FIFA's exact future
placeholder slots. This is an approximation, not a leak of real bracket
data — treat "projected semifinalists" as "who the model rates likely to
get there", not "confirmed bracket slot."

Requires (see notebook_export_snippet.txt):
  team_ratings.csv     — team, elo_adjusted
  poisson_coeffs.json  — {"b0": ..., "b1": ...}
"""

import json
import math
import os
import random
from collections import defaultdict

import pandas as pd

TEAM_RATINGS_CSV = os.environ.get("TEAM_RATINGS_CSV", "./team_ratings.csv")
POISSON_COEFFS_JSON = os.environ.get("POISSON_COEFFS_JSON", "./poisson_coeffs.json")
N_SIMS = int(os.environ.get("PROJECTION_SIMS", "5000"))

_ratings: dict[str, float] = {}
_b0, _b1 = None, None


def load_model():
    global _ratings, _b0, _b1
    if not os.path.exists(TEAM_RATINGS_CSV) or not os.path.exists(POISSON_COEFFS_JSON):
        print("[warn] team_ratings.csv / poisson_coeffs.json not found — "
              "run the export snippet in your notebook. Projection endpoint will 503 until then.")
        return
    df = pd.read_csv(TEAM_RATINGS_CSV)
    _ratings = dict(zip(df.team, df.elo_adjusted))
    with open(POISSON_COEFFS_JSON) as f:
        coeffs = json.load(f)
    _b0, _b1 = coeffs["b0"], coeffs["b1"]


def model_ready() -> bool:
    return bool(_ratings) and _b0 is not None


def rating(team: str) -> float:
    return _ratings.get(team, 1500.0)  # unseen team -> neutral default


def exp_goals(delta: float) -> float:
    return max(0.15, math.exp(_b0 + _b1 * delta / 100.0))


def win_prob(a: str, b: str, neutral=True) -> float:
    ha = 0 if neutral else 100
    return 1 / (1 + 10 ** (-((rating(a) - rating(b)) + ha) / 400))


def sim_score(a: str, b: str, neutral=True):
    ha = 0 if neutral else 100
    mh = exp_goals((rating(a) - rating(b)) + ha)
    ma = exp_goals((rating(b) - rating(a)) - ha)
    return _poisson_sample(mh), _poisson_sample(ma)


def _poisson_sample(mu: float) -> int:
    # Knuth's algorithm — no numpy/scipy dependency needed for this module.
    L, k, p = math.exp(-mu), 0, 1.0
    while True:
        k += 1
        p *= random.random()
        if p <= L:
            return k - 1


def predict_single_match(a: str, b: str, neutral=True):
    """Deterministic prediction (most likely scoreline) for a KNOWN matchup."""
    p_a = win_prob(a, b, neutral)
    ha = 0 if neutral else 100
    mh = exp_goals((rating(a) - rating(b)) + ha)
    ma = exp_goals((rating(b) - rating(a)) - ha)
    # Most likely scoreline = round each expected-goals figure.
    gh, ga = round(mh), round(ma)
    winner = a if p_a > 0.5 else b
    return {
        "home": a, "away": b,
        "p_home": round(p_a, 3), "p_away": round(1 - p_a, 3),
        "predicted_score": f"{gh}-{ga}",
        "predicted_winner": winner,
    }


def determine_alive_teams(all_teams: list[str], finished_ko_matches: list[dict]) -> set[str]:
    """
    all_teams: every team still in scope at the START of the round you're
               projecting from (pass in e.g. the R16 field once group stage
               is done — main.py derives this from group standings).
    finished_ko_matches: [{home, away, home_score, away_score}, ...] for
               knockout matches that have actually been played.
    """
    alive = set(all_teams)
    for m in finished_ko_matches:
        loser = m["home"] if m["home_score"] < m["away_score"] else m["away"]
        alive.discard(loser)
    return alive


def project_remaining_bracket(alive_teams: list[str], known_future_fixtures: list[dict]):
    """
    known_future_fixtures: real, already-paired-but-unplayed matches from the
        live feed, e.g. [{"stage": "QF", "home": "France", "away": "Brazil"}].
        These are predicted directly (no simulation needed — the matchup is real).

    For teams alive but NOT in a known fixture yet (their next opponent isn't
    determined), we Monte Carlo the rest of the bracket by rating-tier seeding,
    same approach as your notebook's Section 10.
    """
    if not model_ready():
        raise RuntimeError("Model not loaded — export team_ratings.csv and poisson_coeffs.json")

    direct_predictions = [predict_single_match(f["home"], f["away"]) for f in known_future_fixtures]
    paired_teams = {t for f in known_future_fixtures for t in (f["home"], f["away"])}
    unpaired = [t for t in alive_teams if t not in paired_teams]

    reach_sf = defaultdict(int)
    reach_final = defaultdict(int)
    win_it_all = defaultdict(int)

    for _ in range(N_SIMS):
        # Resolve any already-real fixtures first, so their winners correctly
        # feed into whatever later round we're projecting.
        pool = []
        for f in known_future_fixtures:
            p = win_prob(f["home"], f["away"])
            pool.append(f["home"] if random.random() < p else f["away"])
        pool.extend(unpaired)

        # Seed the remaining bracket by rating strength — strongest vs
        # weakest, next-strongest vs next-weakest — same tier-seeding
        # approximation as your notebook's Section 10.
        round_teams = sorted(pool, key=lambda t: -rating(t))
        if len(round_teams) % 2 == 1:
            round_teams = round_teams[:-1]  # drop the odd one out (edge case safeguard)

        n_rounds = _rounds_needed(len(round_teams))
        stage_names = ["QF", "SF", "Final"][-n_rounds:] if n_rounds else []

        for stage in stage_names:
            if len(round_teams) < 2:
                break
            half = len(round_teams) // 2
            top_half, bottom_half = round_teams[:half], list(reversed(round_teams[half:]))
            next_round = []
            for a, b in zip(top_half, bottom_half):
                p = win_prob(a, b)
                next_round.append(a if random.random() < p else b)

            if stage == "QF":
                for t in next_round:
                    reach_sf[t] += 1
            elif stage == "SF":
                for t in next_round:
                    reach_final[t] += 1
            elif stage == "Final":
                win_it_all[next_round[0]] += 1

            round_teams = next_round

    total = N_SIMS
    projection = {
        "reach_semifinal_pct": {t: round(100 * c / total, 1) for t, c in sorted(reach_sf.items(), key=lambda x: -x[1])[:8]},
        "reach_final_pct": {t: round(100 * c / total, 1) for t, c in sorted(reach_final.items(), key=lambda x: -x[1])[:8]},
        "win_it_all_pct": {t: round(100 * c / total, 1) for t, c in sorted(win_it_all.items(), key=lambda x: -x[1])[:8]},
    }

    most_likely_final = None
    if projection["reach_final_pct"]:
        top2 = list(projection["reach_final_pct"].keys())[:2]
        if len(top2) == 2:
            most_likely_final = predict_single_match(top2[0], top2[1])
            most_likely_final["note"] = "Most probable finalists per simulation, not a confirmed bracket slot."

    return {
        "known_fixture_predictions": direct_predictions,
        "simulated_projection": projection,
        "most_likely_final": most_likely_final,
        "sims_run": N_SIMS,
    }


def _rounds_needed(n_teams: int) -> int:
    return max(1, math.ceil(math.log2(max(n_teams, 2))))
