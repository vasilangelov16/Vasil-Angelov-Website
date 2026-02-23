/** Band app constants and animation config */

export const PAGE_SIZE = 30;
export const SETLIST_SCROLL_STORAGE_KEY = "band-app-setlist-scroll";
export const BLINK_DURATION = 2600;
export const DEFAULT_METRONOME_BPM = 120;
export const METRONOME_PULSE_MS = 100;

export const APPLE_SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
export const APPLE_SPRING_TIGHT = { type: "spring" as const, stiffness: 400, damping: 30 };
export const APPLE_SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 25 };
export const LAYOUT_SPRING = { type: "spring" as const, stiffness: 180, damping: 22 };
export const LAYOUT_TWEEN = { duration: 0.45, ease: [0.32, 0.72, 0, 1] as const };
export const APPLE_TAP = { scale: 0.98 };
export const APPLE_EASE = [0.32, 0.72, 0, 1] as const;
export const FADE_DURATION = 0.25;

export const BLINK_COLORS = ["#fbbf24", "#ffffff"] as const;
export const BLINK_TIMES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9] as const;
export const BLINK_ANIMATE_COLORS = [
  ...BLINK_COLORS,
  ...BLINK_COLORS,
  ...BLINK_COLORS,
  ...BLINK_COLORS,
  ...BLINK_COLORS,
] as const;
