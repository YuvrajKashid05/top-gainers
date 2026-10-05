# NSE Top Gainers Dashboard

This project contains two completely independent npm applications. There is no root package.json, no npm workspaces, and no root-level npm install/dev command.

## Backend

```powershell
cd backend
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Backend runs on http://127.0.0.1:5000

## Frontend

Open a second PowerShell window:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Important

Run `npm install` only inside `backend` or `frontend`. Do not run npm commands from the project root.

## Environment

Configure `backend/.env` with the Angel One SmartAPI credentials and application settings from `backend/.env.example`. Credentials are backend-only and are never exposed to the frontend.

The backend binds to `127.0.0.1` by default for local personal use. Settings updates and manual refresh are available without a separate admin key. Keep Angel One credentials in `backend/.env`; do not expose them in frontend configuration. Avoid setting `HOST=0.0.0.0` unless remote access is intentional and appropriately protected.

## Deployment status

This repository is currently configured for local personal use, not direct public deployment:

- The API has no authentication, so do not expose it directly to the public internet.
- For separate frontend hosting, build the frontend with `VITE_API_URL` set to the deployed API origin, and configure the backend `FRONTEND_ORIGIN` to the exact frontend origin.
- A hosted backend must set `HOST=0.0.0.0` (or the host platform's required bind address) and use persistent storage for `DATABASE_PATH`; otherwise SQLite snapshots may be lost on restart or redeploy.
- Store Angel One credentials only in the backend's deployment secrets/environment. Do not put them in frontend `VITE_*` variables.
- Use HTTPS and add access control at a trusted reverse proxy or hosting platform before making the API remotely reachable.


## Start independently

Backend:
```powershell
cd backend
npm install
npm run dev
```

Frontend (second terminal):
```powershell
cd frontend
npm install
npm run dev
```

The root directory is not an npm project. Do not run npm install or npm run dev from the root.
The Vite config is `vite.config.mjs` and uses the frontend working directory as its root to avoid parent-directory package/workspace discovery.


## Market snapshot cycle

The backend enforces a fixed NSE equity snapshot cycle:

- Market window: **09:15 to 15:15 IST**, Monday-Friday.
- Snapshot interval: **exactly every 5 minutes**: 09:15, 09:20, 09:25, ... 15:15.
- Every successful snapshot replaces the current dashboard rows and appends that Top N snapshot to `top20_history`.
- No Angel One market-data fetch is performed outside 09:15-15:15 IST.
- Settings changes do not trigger an immediate market fetch; they apply to the next scheduled snapshot.
- The frontend polls the backend for display updates, but this polling does **not** fetch market data from Angel One.
- The 5-minute interval is fixed and is not user-configurable.

This keeps each trading day's history as a sequence of 5-minute snapshots. History retention is still controlled by `historyDays`.
