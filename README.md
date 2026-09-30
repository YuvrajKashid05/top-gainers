# NSE Top Gainers Dashboard

This project contains two completely independent npm applications. There is no root package.json, no npm workspaces, and no root-level npm install/dev command.

## Backend

```powershell
cd backend
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Backend runs on http://localhost:5000

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
