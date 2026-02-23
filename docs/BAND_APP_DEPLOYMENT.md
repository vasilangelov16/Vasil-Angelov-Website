# Band App Deployment Guide

## Overview

InSync lives at **band.vasilangelov.com** and is part of this monorepo. It uses PIN-based access control (Singer/Member) and supports real-time sync via WebSocket.

---

## Part 1: Porkbun Domain Setup

### Step 1: Add Subdomain for band.vasilangelov.com

1. Log in to [Porkbun](https://porkbun.com) → **Account** → **Domain Management**
2. Find **vasilangelov.com** → click **Details** or hover and click **DNS**
3. In **Manage DNS Records**, remove any default records for the `band` subdomain (e.g. parking page pointing to `pixie.porkbun.com`) if they exist
4. Add a new record:
   - **Type**: `CNAME`
   - **Host**: `band` (this creates band.vasilangelov.com)
   - **Answer/Value**: Your hosting provider’s target (see below)
   - **TTL**: Default (or 600)
   - Click **Add**

### Step 2: CNAME Target by Host

| Host | CNAME Target |
|------|--------------|
| **Netlify** | `your-site-name.netlify.app` |
| **Vercel** | `cname.vercel-dns.com` |
| **Cloudflare Pages** | `your-project.pages.dev` |
| **GitHub Pages** | `username.github.io` |

**Example (Netlify):** If your site is `vasil-angelov.netlify.app`, set:
- Host: `band`
- Answer: `vasil-angelov.netlify.app`

### Step 3: Root Domain (vasilangelov.com)

For the main site, use either:
- **A record** (Host blank) → IP from your host
- **ALIAS record** (if Porkbun supports it) → same target as CNAME

Netlify/Vercel usually give you both A and CNAME targets in their domain settings.

### Step 4: Propagation

DNS can take 5–60 minutes. Check with:
- [whatsmydns.net](https://www.whatsmydns.net) → search `band.vasilangelov.com`
- Or: `dig band.vasilangelov.com CNAME`

---

## Part 2: Frontend Deployment (Netlify)

### 1. Connect Repo

1. [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Connect GitHub/GitLab and select the repo
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (leave blank)

### 2. Environment Variables

Netlify → **Site settings** → **Environment variables**:

| Key | Value | Scopes |
|-----|-------|--------|
| `VITE_SINGER_PIN` | Your singer PIN | All |
| `VITE_MEMBER_PIN` | Your member PIN | All |
| `VITE_WS_URL` | `wss://your-ws-server.com` | All (if using real-time) |

### 3. Custom Domain

1. **Domain settings** → **Add custom domain** → `band.vasilangelov.com`
2. Netlify will show the CNAME target (e.g. `random-name.netlify.app`)
3. Add that CNAME in Porkbun (Step 1 above)
4. Enable **HTTPS** (Netlify provisions Let’s Encrypt)

### 4. Redirects

`public/_redirects` should contain:

```
# band subdomain → /band route
https://band.vasilangelov.com/* /band 200!

# SPA fallback
/* /index.html 200
```

---

## Part 3: WebSocket Backend (Express.js)

The backend provides real-time sync so singer and members see the same setlist across devices.

### 1. Run Locally

```bash
cd server
npm install
npm run dev
```

- HTTP: `http://localhost:3001`
- WebSocket: `ws://localhost:3001/ws`

**Testing on phone (same WiFi):** Open the app on your phone at `http://<laptop-ip>:8080/band` (e.g. `http://192.168.1.100:8080/band`). With `VITE_WS_URL=ws://localhost:3001/ws`, the app automatically replaces `localhost` with the current hostname, so the phone connects to your laptop's IP. Ensure both frontend (Vite) and backend (Express) are running.

**If the badge stays "Connecting" on your phone:** The server may be unreachable. Check: (1) Phone and laptop on same WiFi, (2) Server running (`cd server && npm run dev`), (3) macOS firewall allows port 3001. After ~3 failed attempts the badge shows "Offline" — the app still works with local data.

### 2. Deploy Backend (Railway / Render / Fly.io)

**Railway:**
1. Connect repo → add `server` as root or set root to `server`
2. Build: `npm install && npm run build` (or `npm start`)
3. Add env: `PORT` (auto-set by Railway)
4. Expose public URL → use `wss://your-app.railway.app`

**Render:**
1. New **Web Service** → connect repo
2. Root directory: `server`
3. Build: `npm install`
4. Start: `npm start`
5. Copy the `.onrender.com` URL for `VITE_WS_URL`

**Fly.io:**
1. `fly launch` in `server/`
2. Set `PORT=8080` in `fly.toml`
3. `fly deploy`

### 3. Frontend WebSocket URL

Set `VITE_WS_URL` to your deployed WebSocket URL, e.g.:

- `wss://band-ws.vasilangelov.com` (if you proxy WebSocket on your domain)
- `wss://your-app.railway.app`
- `wss://your-app.onrender.com`

**Same-origin deployment:** If you serve the frontend and backend from the same host (e.g. reverse proxy at `band.vasilangelov.com` with `/api` and `/ws` proxied to the backend), you can omit `VITE_WS_URL` and `VITE_API_URL`. The app will use the current origin for both.

---

## Part 3b: Song Suggestions

When the singer selects a song, a suggestions button (✨) appears next to the tempo badge. Clicking it reshuffles the setlist so the 3 best "next" songs appear right after the current song.

**Backend:** The server uses an advanced rule-based algorithm that considers key compatibility (circle of fifths, relative/parallel keys), tempo and BPM similarity, artist diversity, and energy flow.

**Frontend:** The API URL is derived from `VITE_WS_URL` (same host). If your API is elsewhere, set `VITE_API_URL` explicitly.

---

## Part 4: Security Features

- **Session expiry**: Auth expires after 24 hours
- **Rate limiting**: 5 failed PIN attempts → 60s lockout; 10+ → 5min
- **Real-time**: WebSocket sync; only singer can change setlist

---

## Part 4b: Song Repertoire

Songs are stored in **`server/data/songs.json`** — a single source of truth used by both the frontend and server (loaded relative to `server/src/index.js`). Each song has: `id`, `title`, `artist`, `key`, `bpm`, `tempo`, `genre`, `lyrics`.

The current repertoire has **145 songs** (STRANSKI, EX-YU, Makedonski). To add or edit songs, update this file. The server reads it at startup; the frontend bundles it at build time. If saved localStorage has fewer songs than the repertoire, the app auto-upgrades to the full list.

---

## Part 5: PIN Configuration

| Variable | Description |
|----------|-------------|
| `VITE_SINGER_PIN` | Singer PIN (full access) |
| `VITE_MEMBER_PIN` | Member PIN (view-only) |

Defaults (dev only): Singer `1234`, Member `5678`. **⚠️ Set strong PINs in production.**

---

## Part 6: Checklist

- [ ] Porkbun: CNAME `band` → Netlify (or your host)
- [ ] Netlify: Custom domain `band.vasilangelov.com`
- [ ] Netlify: `VITE_SINGER_PIN`, `VITE_MEMBER_PIN` set (change from defaults)
- [ ] Backend: Deployed and `VITE_WS_URL` set (if using real-time)
- [ ] Test: Open `band.vasilangelov.com` → PIN → Singer/Member behavior

See **`docs/BAND_APP_PROD_CHECKLIST.md`** for a full pre-deploy checklist.
