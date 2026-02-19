# Pre-Commit Checklist – Band App Changes

## Files Changed

| File | Status | Notes |
|------|--------|-------|
| `index.html` | ✓ | Unchanged from template (Marcus Vale – verify if Vasil Angelov) |
| `public/_redirects` | ✓ | band.vasilangelov.com → /band, SPA fallback |
| `src/App.tsx` | ✓ | Band subdomain routing, /band route |
| `src/index.css` | ✓ | Band app styles (blink, scrollbar, safe-area) |
| `tsconfig.json` | ✓ | No band-specific changes |
| `src/pages/BandApp.tsx` | ✓ | Full band app with PIN, singer/member, logout |
| `src/components/PinGate.tsx` | ✓ | PIN gate, success animation, security |
| `src/context/BandContext.tsx` | ✓ | State, WebSocket, singer/member logic |
| `src/hooks/useBandWebSocket.ts` | ✓ | WebSocket hook with reconnect |
| `docs/BAND_APP_DEPLOYMENT.md` | ✓ | Porkbun, Netlify, backend deployment |
| `server/src/index.js` | ✓ | Express + WebSocket backend |
| `server/package.json` | ✓ | Dependencies, scripts |
| `server/README.md` | ✓ | Server docs |
| `.env.example` | ✓ | PIN + WS URL vars |

## Line-by-Line Review

### src/App.tsx
- [x] `isBandSubdomain()` – correct hostname check
- [x] Route `/` – BandApp when subdomain, Index otherwise
- [x] Route `/band` – BandApp always

### src/pages/BandApp.tsx
- [x] Imports – all used
- [x] Constants – PAGE_SIZE, BLINK_* used
- [x] CurrentSongDisplay – memo, compact prop
- [x] SearchBar – memo, a11y
- [x] SongItem – memo, onSelect callback
- [x] SetlistSection – infinite scroll, IntersectionObserver
- [x] BandAppContent – authRole, onLogout, logout dialog
- [x] BandApp – auth flow, PinGate when !auth

### src/components/PinGate.tsx
- [x] Constants – all used
- [x] getStoredAuth – session expiry check
- [x] clearStoredAuth – clears band-app-role
- [x] validatePin – singer/member
- [x] lockoutRemaining – guard against negative
- [x] handleSubmit – failedAttempts deps cleaned
- [x] Success overlay – animations, 1800ms delay

### src/context/BandContext.tsx
- [x] useBandWebSocket – only when VITE_WS_URL
- [x] localStorage sync – skipped when WebSocket
- [x] setCurrentSong/addSong/removeSong – sendUpdate in setState callback

### src/hooks/useBandWebSocket.ts
- [x] WS_URL – env check
- [x] sendUpdate – singer only, WS open check
- [x] Reconnect – 3s delay on close
- [x] Message handling – state merge by lastUpdate

### server/src/index.js
- [x] CORS – configurable
- [x] WebSocket path – /ws
- [x] State merge – MOCK_SONGS + userAdded
- [x] Singer-only updates – role check

### docs/BAND_APP_DEPLOYMENT.md
- [x] Porkbun – CNAME steps
- [x] WebSocket URL – include /ws in examples
