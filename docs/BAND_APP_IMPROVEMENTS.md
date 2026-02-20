# Band App – Polish, Improvements & Future Features

## Implemented in This Session

### Visual & UX Polish
- **Connection status** – "Live" (green) or "…" (amber) indicator in header when WebSocket is configured
- **Sync feedback** – "Synced" pill appears briefly when state updates from another device
- **Empty state copy** – "Tap a song below" / "Select a song from the setlist" for clearer guidance
- **Lyrics modal hint** – "Tap outside to close" on mobile
- **Scroll-to-current FAB** – Floating button (singer view) to jump to the current song in long setlists

### Mobile & Tablet
- **Safe areas** – `viewport-fit=cover` and padding for notch/home indicator (iOS)
- **Touch targets** – Min 44px for buttons, search, role toggle, logout, AI suggest, song rows
- **Touch manipulation** – `touch-manipulation` to reduce 300ms tap delay
- **Responsive sizing** – Larger padding and tap areas on small screens
- **Viewport** – Removed `user-scalable=no` for accessibility (zoom allowed)

### Performance
- **BandProvider** – Wrapped in `memo()` to avoid unnecessary re-renders
- **localStorage polling** – Interval increased from 300ms to 1000ms (no WebSocket mode)
- **Save debounce** – Increased from 150ms to 300ms to reduce writes

---

## Suggested Future Improvements

### Mobile-First Features

| Feature | Description | Effort |
|--------|-------------|--------|
| **Pull-to-refresh** | Refresh setlist/sync on pull-down (mobile) | Medium |
| **Haptic feedback** | Vibration on song select (navigator.vibrate) | Low |
| **Landscape mode** | Optimized layout for member view (e.g. side-by-side) | Medium |
| **PWA / Install prompt** | Add to home screen for app-like experience | Medium |
| **Offline indicator** | Show when WebSocket is disconnected | Low |
| **Swipe gestures** | Swipe song left to remove (singer), swipe lyrics modal to close | Medium |

### Visual Enhancements

| Feature | Description | Effort |
|--------|-------------|--------|
| **Dark mode** | System preference or manual toggle | Medium |
| **Theme variants** | Light/dark/auto for stage vs rehearsal | Low |
| **Song thumbnails** | Optional cover art in setlist | Low |
| **Progress indicator** | Visual progress through setlist (e.g. 3/12) | Low |
| **Animation preferences** | Reduce motion for accessibility | Low |

### Functional Improvements

| Feature | Description | Effort |
|--------|-------------|--------|
| **Drag-and-drop reorder** | Reorder setlist by dragging (singer) | High |
| **Setlist templates** | Save/load named setlists (gig A, gig B) | High |
| **Notes per song** | Add rehearsal notes or cues | Medium |
| **Export setlist** | PDF or shareable link | Medium |
| **Song search filters** | Filter by key, tempo, artist | Low |
| **Undo/redo** | Undo last change (remove, reorder) | Medium |
| **Keyboard shortcuts** | Next/prev song, play/pause (desktop) | Low |

### Collaboration & Sync

| Feature | Description | Effort |
|--------|-------------|--------|
| **Conflict resolution** | Handle simultaneous edits from multiple singers | High |
| **Session sharing** | Share a link to join the same gig session | Medium |
| **Role-based permissions** | Temporary "singer" handoff to a member | Medium |
| **Audit log** | Who changed what and when | Low |

### Accessibility

| Feature | Description | Effort |
|--------|-------------|--------|
| **Screen reader announcements** | "Now playing: Hotel California" on change | Low |
| **High contrast mode** | WCAG-compliant contrast option | Low |
| **Focus management** | Improve tab order in modals and lists | Low |
| **Reduced motion** | Respect `prefers-reduced-motion` | Low |

### Performance & Reliability

| Feature | Description | Effort |
|--------|-------------|--------|
| **Virtualized list** | Use `react-window` or similar for 100+ songs | Medium |
| **Optimistic updates** | Update UI before server confirms | Medium |
| **Retry logic** | Auto-retry failed WebSocket/suggestions | Low |
| **Service worker** | Offline caching for static assets | Medium |

---

## Quick Wins (Low Effort)

1. Add `aria-live="polite"` for "Now Playing" changes
2. Add `prefers-reduced-motion: reduce` media query to tone down animations
3. Add "No results" state with clear search hint
4. Add loading skeleton for AI suggestions
5. Add toast for "Song removed" / "Song added" feedback

---

## Testing Checklist (Mobile/Tablet)

- [ ] Test on iOS Safari (notch, home indicator)
- [ ] Test on Android Chrome (navigation bar)
- [ ] Test in landscape (member view)
- [ ] Test with slow 3G (connection states)
- [ ] Test with screen reader (VoiceOver / TalkBack)
- [ ] Test with large text / zoom
- [ ] Test double-tap for lyrics on touch devices
