# Band App – Feature Suggestions

Ideas to make the Band Setlist app even better, organized by impact and effort.

---

## Quick Wins (Low Effort, High Value)

| Feature | Description |
|---------|-------------|
| **Keyboard shortcuts** | `J`/`K` or ↑/↓ for next/prev song (desktop singer view) |
| **Toast feedback** | "Song removed", "Song added", "Synced" for clearer feedback |
| **Font size control** | Lyrics view: small / medium / large for stage visibility |
| **Search by key/tempo** | Filter setlist by key (e.g. "Am") or tempo ("Slow", "Fast") |
| **Session persistence** | Remember last selected song across page reloads |

---

## Singer View Enhancements

| Feature | Description | Effort |
|---------|-------------|--------|
| **Drag-and-drop reorder** | Reorder setlist by dragging songs (singer only) | High |
| **Swipe to remove** | Swipe song left to remove from setlist | Medium |
| **Notes per song** | Add rehearsal notes or cues (e.g. "Watch bridge") | Medium |
| **Setlist templates** | Save/load named setlists (Gig A, Wedding, etc.) | High |
| **Undo/redo** | Undo last remove or reorder | Medium |
| **Copy setlist** | Copy setlist as text for sharing (setlist.fm, etc.) | Low |

---

## Member View Enhancements

| Feature | Description | Effort |
|---------|-------------|--------|
| **Landscape mode** | Side-by-side: Now Playing + metronome for tablets | Medium |
| **Count-in** | Optional 4-beat count-in before metronome starts | Low |
| **Tap tempo** | Tap to set BPM instead of using song value | Low |
| **Full-screen stage mode** | Maximize Now Playing, hide chrome for stage use | Low |

---

## Collaboration & Sync

| Feature | Description | Effort |
|---------|-------------|--------|
| **Session sharing** | Share link to join same gig (e.g. band.vasilangelov.com/band?session=xyz) | Medium |
| **Role handoff** | Temporarily promote member to singer (e.g. for a song) | Medium |
| **Conflict resolution** | Handle simultaneous edits from multiple singers | High |
| **Audit log** | "Singer changed song at 14:32" for rehearsal review | Low |

---

## Mobile & PWA

| Feature | Description | Effort |
|---------|-------------|--------|
| **PWA / Install prompt** | "Add to Home Screen" for app-like experience | Medium |
| **Pull-to-refresh** | Pull down to refresh setlist / sync | Low |
| **Offline indicator** | Clear "Offline – changes will sync when connected" | Low |
| **Haptic feedback** | Already on song select; extend to other actions | Low |

---

## Accessibility & UX

| Feature | Description | Effort |
|---------|-------------|--------|
| **Screen reader announcements** | "Now playing: Hotel California" on change (aria-live) | Low ✓ (partially done) |
| **High contrast mode** | WCAG-compliant contrast option | Low |
| **Reduced motion** | Respect `prefers-reduced-motion` | Low ✓ (done) |
| **Focus management** | Improve tab order in modals, setlist | Low |

---

## Export & Sharing

| Feature | Description | Effort |
|---------|-------------|--------|
| **Export PDF** | Generate printable setlist PDF | Medium |
| **Share link** | Share current setlist as read-only link | Medium |
| **Print-friendly view** | Optimized print layout for setlist | Low |

---

## Performance & Reliability

| Feature | Description | Effort |
|---------|-------------|--------|
| **Virtualized list** | Use `react-window` for 100+ songs (smoother scroll) | Medium |
| **Optimistic updates** | Update UI before server confirms | Medium |
| **Retry logic** | Auto-retry failed WebSocket / AI suggestions | Low |
| **Service worker** | Offline caching for static assets | Medium |

---

## Suggested Priority Order

1. **Keyboard shortcuts** – Fast for power users
2. **Font size in lyrics** – Big win for stage visibility
3. **Toast feedback** – Better UX with minimal code
4. **Setlist templates** – Huge value for recurring gigs
5. **Drag-and-drop reorder** – Most requested by band leaders
