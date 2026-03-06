# ApexAI — Railway Deployment Guide

This guide walks you through deploying ApexAI on Railway from the GitHub repository.

---

## Prerequisites

- Railway account at [railway.app](https://railway.app)
- GitHub repository connected: `disputestrike/ApexAI`
- A MySQL 8 database (Railway provides one)

---

## Step 1 — Create a New Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **Deploy from GitHub repo**
3. Select `disputestrike/ApexAI`
4. Railway will detect the `Dockerfile` and start building automatically

---

## Step 2 — Add a MySQL Database

1. In your Railway project, click **+ New Service**
2. Select **Database → MySQL**
3. Railway will provision a MySQL 8 instance
4. Click the MySQL service → **Connect** tab → copy the `DATABASE_URL`

---

## Step 3 — Set Environment Variables

In your Railway service → **Variables** tab, add the following:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `mysql://...` | Auto-filled if you link the Railway MySQL service |
| `NODE_ENV` | `production` | Required |
| `JWT_SECRET` | `<random 32+ char string>` | Run: `openssl rand -hex 32` |
| `VITE_APP_ID` | From Manus project settings | Required for OAuth login |
| `OAUTH_SERVER_URL` | `https://api.manus.im` | Manus OAuth backend |
| `VITE_OAUTH_PORTAL_URL` | `https://manus.im` | Manus login portal |
| `OWNER_OPEN_ID` | From Manus project settings | Your Manus user ID |
| `OWNER_NAME` | Your name | Displayed in admin panel |
| `BUILT_IN_FORGE_API_URL` | `https://api.manus.im` | For LLM/AI features |
| `BUILT_IN_FORGE_API_KEY` | From Manus project settings | Server-side AI calls |
| `VITE_FRONTEND_FORGE_API_KEY` | From Manus project settings | Frontend AI calls |
| `VITE_FRONTEND_FORGE_API_URL` | `https://api.manus.im` | Frontend AI endpoint |

> **Note:** Railway automatically injects `PORT` — do NOT set it manually.

---

## Step 4 — Run Database Migrations

After the first successful deploy, open the Railway service shell and run:

```bash
pnpm drizzle-kit migrate
```

Or use the Railway CLI:

```bash
railway run pnpm drizzle-kit migrate
```

---

## Step 5 — Configure Custom Domain (Optional)

1. Railway service → **Settings** → **Domains**
2. Click **Generate Domain** for a free `*.up.railway.app` URL
3. Or add your own custom domain and configure DNS

---

## Health Check

Railway will ping `/api/health` to verify the service is running.
Expected response:
```json
{ "status": "ok", "timestamp": "...", "env": "production" }
```

---

## Build Configuration

The `railway.json` file at the project root configures:
- **Builder:** Dockerfile
- **Start command:** `node dist/index.js`
- **Restart policy:** On failure (max 3 retries)
- **Health check:** `/api/health` (30s timeout)

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Build fails at `pnpm install` | Check Node version — requires Node 22 |
| `DATABASE_URL` not found | Link Railway MySQL service or set variable manually |
| App starts but login fails | Verify `VITE_APP_ID`, `OAUTH_SERVER_URL`, `JWT_SECRET` are set |
| White screen / 404 on routes | Ensure `NODE_ENV=production` is set |
| Health check fails | Check `/api/health` returns 200 — server must bind to `0.0.0.0` |
