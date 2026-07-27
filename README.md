# WC 2026 Live Scores + Accuracy Dashboard

Two pieces:
* **backend/main.py** — FastAPI service that logs into the free worldcup26.ir API, merges live matches with your notebook's predictions, computes accuracy.
* **LiveScoresDashboard.jsx** — React component that displays it.

---

### 1. Get your predictions CSV
Run your notebook through Section 9 as usual — it already writes `wc2026_group_match_predictions.csv`. Put that file next to `main.py` (or point `PREDICTIONS_CSV` at wherever you keep it).

> [!NOTE]  
> That file only covers the 72 group matches. Knockout matches (R32 onward) won't have a prediction in the merged output until you extend the notebook to also export knockout picks — the backend handles missing predictions gracefully (it just omits the prediction field), so the dashboard won't break, it'll just show group-stage accuracy first.

---

### 2. Get a worldcup26.ir account
No manual signup needed — the backend auto-registers on first run using whatever `WC26_EMAIL` / `WC26_PASSWORD` you set. Any email works, it's just used as your API identity.

---

### 3. Run locally
```bash
cd backend
pip install fastapi uvicorn httpx pandas python-dotenv --break-system-packages
export WC26_EMAIL=you@example.com
export WC26_PASSWORD=choose-a-password
export PREDICTIONS_CSV=./wc2026_group_match_predictions.csv
uvicorn main:app --reload --port 8000
```
* Visit `http://localhost:8000/api/matches` — you should see merged data.
* Visit `http://localhost:8000/api/accuracy` — you should see accuracy stats.

---

### 4. Wire up the frontend
In `LiveScoresDashboard.jsx`, set:
```javascript
const API_BASE = "http://localhost:8000";
```
Drop the component into a Next.js page (`app/page.jsx` or `pages/index.jsx`). It ships with mock data so you can preview the UI even before the backend is running — just leave `API_BASE = null`.

---

### 5. Deploy for free

#### **Backend → Render**
1. Push `backend/` to a GitHub repo.
2. On [render.com](https://render.com), **New** → **Web Service** → connect the repo.
3. Build command: `pip install -r requirements.txt`  
   Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables: `WC26_EMAIL`, `WC26_PASSWORD`, `PREDICTIONS_CSV`.
5. Free tier: 750 hrs/month, sleeps after 15 min idle (first request after that takes ~10-30s to wake up — fine for a hobby project).

#### **Frontend → Vercel**
1. Push your Next.js app (with the dashboard component) to GitHub.
2. Import the repo on [vercel.com](https://vercel.com) — zero config needed.
3. Set `API_BASE` in the component to your Render URL (e.g. `https://wc-dashboard-backend.onrender.com`).

Both are free at this scale. The only real limitation: Render's free instance goes to sleep, so if nobody's visited your site in >15 minutes, the first live-score refresh after that will be slow once, then fast again.

---

### requirements.txt for Render
```text
fastapi
uvicorn[standard]
httpx
pandas
```
