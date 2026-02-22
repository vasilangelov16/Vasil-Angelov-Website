import { useState, useCallback, useEffect } from "react";

const LYRICS_FONT_SIZE_KEY = "band-app-lyrics-font-size";
const LYRICS_FONT_BOLD_KEY = "band-app-lyrics-font-bold";

export type LyricsFontSize = "small" | "medium" | "large";

const FONT_SIZE_ORDER: LyricsFontSize[] = ["small", "medium", "large"];

function readFontSize(): LyricsFontSize {
  if (typeof window === "undefined") return "medium";
  try {
    const stored = localStorage.getItem(LYRICS_FONT_SIZE_KEY);
    return (stored === "small" || stored === "medium" || stored === "large") ? stored : "medium";
  } catch {
    return "medium";
  }
}

function readIsBold(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem(LYRICS_FONT_BOLD_KEY);
    return stored === "false" ? false : true;
  } catch {
    return true;
  }
}

export function useLyricsFontSettings(syncWhen?: boolean) {
  const [fontSize, setFontSize] = useState<LyricsFontSize>(readFontSize);
  const [isBold, setIsBold] = useState(readIsBold);

  useEffect(() => {
    if (syncWhen) {
      setFontSize(readFontSize());
      setIsBold(readIsBold());
    }
  }, [syncWhen]);

  const adjustFontSize = useCallback((delta: 1 | -1) => {
    setFontSize((prev) => {
      const i = FONT_SIZE_ORDER.indexOf(prev);
      const next = FONT_SIZE_ORDER[Math.max(0, Math.min(FONT_SIZE_ORDER.length - 1, i + delta))];
      try {
        localStorage.setItem(LYRICS_FONT_SIZE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleBold = useCallback(() => {
    setIsBold((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LYRICS_FONT_BOLD_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { fontSize, isBold, adjustFontSize, toggleBold };
}

export const LYRICS_FONT_CLASSES: Record<LyricsFontSize, string> = {
  small: "text-sm sm:text-base md:text-lg",
  medium: "text-base sm:text-lg md:text-xl",
  large: "text-lg sm:text-xl md:text-2xl",
};
