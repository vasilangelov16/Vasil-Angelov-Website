# Band App – Production Checklist

Use this checklist before deploying the Band Setlist app to band.vasilangelov.com.

---

## Pre-Deploy Verification

- [ ] **Build succeeds**: `npm run build` completes without errors
- [ ] **145 songs loaded**: `server/data/songs.json` has full repertoire
- [ ] **Server runs**: `cd server && npm run dev` starts without errors
- [ ] **Merge main**: Branch is up to date with `origin/main`

---

## Environment Variables (Production)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SINGER_PIN` | **Yes** | Singer PIN – change from default `1234` |
| `VITE_MEMBER_PIN` | **Yes** | Member PIN – change from default `5678` |
| `VITE_WS_URL` | If using sync | WebSocket URL, e.g. `wss://your-ws.railway.app` |
| `VITE_API_URL` | Optional | Override API URL (derived from `VITE_WS_URL` if not set) |

**⚠️ Never deploy with default PINs (1234/5678) in production.**

---

## Frontend (Netlify)

- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] `VITE_SINGER_PIN` and `VITE_MEMBER_PIN` set (strong PINs)
- [ ] `VITE_WS_URL` set if backend is deployed
- [ ] Custom domain: `band.vasilangelov.com`
- [ ] `public/_redirects` includes band subdomain → `/band`

---

## Backend (Railway / Render / Fly.io)

- [ ] Root directory: `server`
- [ ] Start command: `npm start`
- [ ] `PORT` (usually auto-set by host)
- [ ] `CORS_ORIGIN` (optional, defaults to `*`)
- [ ] Server reads `server/data/songs.json` at startup (relative to index.js)

---

## Post-Deploy Tests

- [ ] Open `band.vasilangelov.com` → redirects to `/band`
- [ ] Enter Singer PIN → full setlist, search, AI suggest, lyrics
- [ ] Enter Member PIN → view-only, sees Now Playing
- [ ] Wrong PIN → lockout after 5 attempts
- [ ] All 145 songs visible (scroll or "Load all")
- [ ] WebSocket: singer change syncs to member (if `VITE_WS_URL` set)
- [ ] AI suggestions work (if backend deployed)

---

## Features Included

- 145-song repertoire (STRANSKI, EX-YU, Makedonski)
- Infinite scroll + "Load all" button
- AI suggestions (English→English, Balkan→Balkan)
- Key, tempo, genre, BPM per song
- Lyrics modal (double-tap song)
- Real-time sync via WebSocket
- PIN auth (Singer/Member), 24h session, rate limiting
