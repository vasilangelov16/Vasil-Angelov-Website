# Changes Summary – Lyrics & Band App

Branch: `feat/add-lyrics-to-songs`

## 1. Lyrics Added to Songs (`server/data/songs.json`)

**142 songs** now have lyrics (up from ~0). Format:
- Section labels: `[Verse 1]`, `[Chorus]`, `[Pre-Chorus]`, `[Bridge]`, `[Outro]`, etc.
- Newlines: `\n` in JSON
- No chord symbols
- Macedonian lyrics in Cyrillic where applicable

**New songs added:**
- Ja volim (Jakov Jozinović) – id 146, EX-YU Mid
- Hilton hotel, Barça (Nucci) – id 147, EX-YU Fast

**Songs repositioned in repertoire:**
- Ja volim: after Vjerujem u nas (EX-YU Mid)
- Hilton hotel, Barça: after Jedina od svih (EX-YU Fast)

**3 songs still need lyrics:** 129, 139, 140.

---

## 2. BandContext Changes (`src/context/BandContext.tsx`)

- **`deduplicateSetlist()`** – Removes duplicate songs by `title|artist` (keeps first occurrence). Applied to:
  - Loaded state from localStorage
  - WebSocket state updates
  - All `setState` calls
- **`setState` wrapper** – Every state update runs through deduplication before applying.

---

## 3. BandApp Changes (`src/pages/BandApp.tsx`)

- **`normalizeForSearch()`** – Accent-insensitive search using `normalize("NFD")` + strip combining marks. Examples:
  - `"noc"` matches `"Noć"`
  - `"c"` matches `"č"`, `"ć"`
- **Search input** – `type="text"` + `inputMode="search"` for better mobile keyboards.
- **Clear button** – Wrapped in `motion.div` for consistent animation.

---

## 4. Lyrics Loading Optimizations (this session)

- **Memoized lyrics parsing** – `MemoizedLyricsContent` caches parsed lyrics per `song.id` + `lyrics`; avoids re-splitting on every render.
- **Songs chunk** – `songs.json` in separate Vite chunk (`songs-*.js`, ~227 KB) for parallel loading with BandApp (~54 KB).
- **Lyrics API** – `GET /api/songs/:id/lyrics` returns `{ id, lyrics }` for future on-demand loading.
- **Lyrics scroll CSS** – `contain: layout` on `.lyrics-scroll` for better layout performance.

---

## Files Modified

| File | Changes |
|------|---------|
| `server/data/songs.json` | +142 lyrics, +2 new songs, repositioned 2 |
| `server/src/index.js` | `GET /api/songs/:id/lyrics` endpoint |
| `src/context/BandContext.tsx` | Deduplication, setState wrapper |
| `src/pages/BandApp.tsx` | Search normalization, input tweaks, memoized lyrics |
| `src/index.css` | `.lyrics-scroll` layout containment |
| `vite.config.ts` | `songs.json` → separate chunk |
| `docs/LYRICS_TODO.md` | Progress tracking (untracked) |
| `docs/CHANGES_SUMMARY.md` | This file |

---

## Stats

- **Total songs:** 147
- **With lyrics:** 142 (97.9%)
- **Without lyrics:** 3 (ids 129, 139, 140)
- **songs.json size:** ~230 KB
