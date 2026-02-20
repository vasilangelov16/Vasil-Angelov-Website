# Band App – Deploy to band.vasilangelov.com (Vercel + Railway)

Step-by-step guide to deploy the Band Setlist app using **Vercel** (frontend) and **Railway** (WebSocket backend).

---

## Can I use Vercel for everything?

**No.** Vercel is great for the frontend (static/SPA) but **does not support WebSocket servers**. Serverless functions have short timeouts and can't hold long-lived connections.

**Solution:** Frontend on Vercel, backend on Railway (free tier).

---

## Architecture

```
band.vasilangelov.com (Vercel)     →  Frontend (React SPA)
your-app.railway.app (Railway)     →  Backend (Express + WebSocket)
```

---

## Part 1: Deploy Backend to Railway (Free)

### 1.1 Create Railway Account

1. Go to [railway.app](https://railway.app) → **Login** (GitHub)
2. Free tier: 500 execution hours/month

### 1.2 New Project from Repo

1. **New Project** → **Deploy from GitHub repo**
2. Select your repo (e.g. `Vasil-Angelov-Website`)
3. Railway will detect the project

### 1.3 Configure the Service

1. Click the new service → **Settings**
2. **Root Directory**: `server` (important – backend lives in `server/`)
3. **Build Command**: `npm install` (or leave default)
4. **Start Command**: `npm start` (runs `node src/index.js`)
5. **Watch Paths**: `server/**` (optional – redeploy on server changes)

### 1.4 Environment Variables

In **Variables** tab, add:

| Variable | Value |
|----------|-------|
| `PORT` | (Railway sets this automatically) |
| `CORS_ORIGIN` | `*` or `https://band.vasilangelov.com` |

### 1.5 Generate Domain

1. **Settings** → **Networking** → **Generate Domain**
2. Copy the URL, e.g. `band-app-server-production-xxxx.up.railway.app`
3. The WebSocket URL is: `wss://band-app-server-production-xxxx.up.railway.app/ws`

---

## Part 2: Deploy Frontend to Vercel (Free)

### 2.1 Connect Repo

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repo
3. Vercel will detect Vite (or use `vercel.json` settings)

### 2.2 Build Settings

If not auto-detected, set:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

(Or rely on `vercel.json` in the repo.)

### 2.3 Environment Variables

In **Settings** → **Environment Variables**:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_SINGER_PIN` | Your singer PIN (e.g. 4–6 digits) | Production, Preview |
| `VITE_MEMBER_PIN` | Your member PIN | Production, Preview |
| `VITE_WS_URL` | `wss://YOUR-RAILWAY-URL.up.railway.app/ws` | Production, Preview |

Replace `YOUR-RAILWAY-URL` with your Railway domain from Part 1.5.

### 2.4 Add Custom Domain

1. **Settings** → **Domains** → **Add**
2. Enter: `band.vasilangelov.com`
3. Vercel will show DNS instructions

---

## Part 3: DNS (Porkbun)

### 3.1 Point band.vasilangelov.com to Vercel

1. Log in to [Porkbun](https://porkbun.com) → **Domain Management** → **vasilangelov.com** → **DNS**
2. Add CNAME record:
   - **Host**: `band`
   - **Answer**: `cname.vercel-dns.com` (or the exact value Vercel shows)
   - **TTL**: 600

### 3.2 Verify

- Wait 5–30 minutes for DNS propagation
- Check: [whatsmydns.net](https://www.whatsmydns.net) → `band.vasilangelov.com`
- Vercel will provision HTTPS automatically

---

## Part 4: How band.vasilangelov.com Works

1. User visits `band.vasilangelov.com`
2. DNS resolves to Vercel
3. Vercel serves your built app from `dist/`
4. The app checks `window.location.hostname === "band.vasilangelov.com"` and shows **BandApp** (not the main site)
5. With `VITE_WS_URL` set, the app connects to Railway for real-time sync

No redirect to `/band` is needed – the subdomain alone triggers the Band app.

---

## Part 5: Post-Deploy Checklist

- [ ] Open `band.vasilangelov.com` → Band app loads
- [ ] Enter Singer PIN → full setlist, search, AI suggest
- [ ] Enter Member PIN → view-only
- [ ] Badge shows **Live** (green) when connected
- [ ] Change song on one device → syncs to another (if both connected)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Badge stays "Offline" | Check `VITE_WS_URL` is correct and Railway service is running |
| 404 on refresh | Vercel rewrites – ensure `vercel.json` or framework handles SPA |
| CORS errors | Set `CORS_ORIGIN` on Railway to your frontend URL |
| Wrong PIN | Verify `VITE_SINGER_PIN` and `VITE_MEMBER_PIN` in Vercel env vars |

---

## Summary

| Component | Host | URL |
|-----------|------|-----|
| Frontend | Vercel | band.vasilangelov.com |
| Backend | Railway | wss://xxx.up.railway.app/ws |

Both have free tiers. Railway may sleep after inactivity; first request may be slow.
