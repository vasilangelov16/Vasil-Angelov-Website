import { useState, useMemo, useEffect, useRef, memo, useCallback, useDeferredValue } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { BandProvider, useBandState, useBandUI, type Song } from "@/context/BandContext";
import { hasWebSocket } from "@/hooks/useBandWebSocket";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLyricsFontSettings, LYRICS_FONT_CLASSES, type LyricsFontSize } from "@/hooks/useLyricsFontSettings";
import {
  PinGate,
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth,
  type BandAuth,
} from "@/components/PinGate";
import { Music, Mic2, Users, LogOut, Sparkles, List, FileText, Timer, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BandAppTutorial } from "@/components/BandAppTutorial";
import {
  PAGE_SIZE,
  SETLIST_SCROLL_STORAGE_KEY,
  BLINK_DURATION,
  APPLE_SPRING,
  APPLE_SPRING_TIGHT,
  APPLE_SPRING_GENTLE,
  APPLE_EASE,
  FADE_DURATION,
  BLINK_COLORS,
  BLINK_ANIMATE_COLORS,
  BLINK_TIMES,
  LAYOUT_TWEEN,
  LAYOUT_SPRING,
  APPLE_TAP,
  DEFAULT_METRONOME_BPM,
} from "@/band/constants";
import {
  normalizeForSearch,
  animateScrollTo,
  getSongCategory,
  matchesCategory,
  readStoredScrollState,
} from "@/band/utils";
import type { RepertoireCategory } from "@/band/types";
import { CATEGORY_COLORS } from "@/band/types";
import { MemoizedLyricsContent } from "@/band/lyrics";
import { VisualMetronome, SearchBar, CategoryFilter } from "@/band";

const CurrentSongDisplay = memo(
  ({
    compact = false,
    stageMode = false,
    isFullscreen = false,
    onScrollToCurrent,
  }: { compact?: boolean; stageMode?: boolean; isFullscreen?: boolean; onScrollToCurrent?: () => void }) => {
  const { state } = useBandState();
  const { currentSong } = state;
  const reducedMotion = useReducedMotion();
  const [blinkCount, setBlinkCount] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const prevSongIdRef = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const currentId = currentSong?.id ?? null;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevSongIdRef.current = currentId;
      return;
    }
    if (currentId !== prevSongIdRef.current) {
      setBlinkCount((c) => c + 1);
      setIsBlinking(true);
      prevSongIdRef.current = currentId;
      const t = setTimeout(() => setIsBlinking(false), BLINK_DURATION);
      return () => clearTimeout(t);
    }
  }, [currentSong?.id]);

  const containerClass = compact
    ? "px-4 sm:px-5 py-2"
    : stageMode
      ? isFullscreen 
        ? "px-8 sm:px-12 md:px-16 lg:px-24 py-8 sm:py-12 md:py-16 lg:py-20"
        : "px-6 sm:px-10 md:px-14 lg:px-20 py-6 sm:py-10 md:py-12 lg:py-16"
      : "px-6 sm:px-10 md:px-14 py-4 sm:py-8 md:py-12 lg:py-16";
  const labelClass = compact ? "mb-1 sm:mb-1.5" : stageMode ? (isFullscreen ? "mb-4 sm:mb-5 md:mb-6" : "mb-3 sm:mb-4 md:mb-5") : "mb-2 sm:mb-3 md:mb-4";
  const dotClass = compact ? "h-1.5 w-1.5" : stageMode ? (isFullscreen ? "h-4 w-4 sm:h-4.5 sm:w-4.5" : "h-3 w-3 sm:h-3.5 sm:w-3.5") : "h-2.5 w-2.5 sm:h-3 sm:w-3";
  const labelTextClass = compact ? "text-[8px]" : stageMode ? (isFullscreen ? "text-sm sm:text-base md:text-lg" : "text-xs sm:text-sm md:text-base") : "text-xs sm:text-sm md:text-base";
  const titleClass = compact
    ? "text-lg sm:text-xl md:text-2xl"
    : stageMode
      ? isFullscreen
        ? "text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]"
        : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
      : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl";
  const artistClass = compact 
    ? "mt-0.5 text-[10px] sm:text-xs" 
    : stageMode 
      ? isFullscreen
        ? "mt-4 sm:mt-5 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
        : "mt-3 sm:mt-4 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
      : "mt-2 sm:mt-3 text-base sm:text-xl md:text-2xl lg:text-3xl";
  const badgesClass = compact ? "mt-1 sm:mt-1.5" : stageMode ? (isFullscreen ? "mt-8 sm:mt-10 md:mt-12" : "mt-6 sm:mt-8 md:mt-10") : "mt-4 sm:mt-6 md:mt-8";
  const badgeClass = compact
    ? "px-1.5 py-0.5 text-[10px]"
    : stageMode
      ? isFullscreen
        ? "px-6 sm:px-8 py-3 sm:py-3.5 text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
        : "px-4 sm:px-6 py-2 sm:py-2.5 text-lg sm:text-xl md:text-2xl lg:text-3xl"
      : "px-5 sm:px-6 py-2.5 sm:py-3 text-xl sm:text-2xl md:text-3xl";
  const badgeClassMuted = compact
    ? "px-1.5 py-0.5 text-[9px]"
    : stageMode
      ? isFullscreen
        ? "px-6 sm:px-8 py-3 sm:py-3.5 text-xl sm:text-2xl md:text-3xl lg:text-4xl"
        : "px-4 sm:px-6 py-2 sm:py-2.5 text-base sm:text-lg md:text-xl lg:text-2xl"
      : "px-5 sm:px-6 py-2.5 sm:py-3 text-lg sm:text-xl md:text-2xl";

  const isClickable = compact && !!currentSong && !!onScrollToCurrent;

  return (
    <motion.div
      layout="position"
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onScrollToCurrent : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onScrollToCurrent?.();
              }
            }
          : undefined
      }
      whileTap={isClickable ? APPLE_TAP : undefined}
      transition={{ layout: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } }}
      title={isClickable ? "Tap to scroll to song in list" : undefined}
      className={cn(
        "relative w-full overflow-hidden will-change-transform",
        compact && "bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        !compact && "bg-white flex-1 min-h-0 flex flex-col items-center justify-center",
        isClickable && "cursor-pointer touch-manipulation active:bg-gray-50/80"
      )}
    >
      <AnimatePresence>
        {isBlinking && !reducedMotion && (
          <motion.div
            key={`blink-${blinkCount}`}
            initial={{ backgroundColor: BLINK_COLORS[0] }}
            animate={{ backgroundColor: [...BLINK_ANIMATE_COLORS] }}
            transition={{ duration: 2.2, times: [...BLINK_TIMES], ease: APPLE_EASE }}
            exit={{ opacity: 0, transition: { duration: 0.35, ease: APPLE_EASE } }}
            className={cn(
              "absolute inset-0 z-0",
              compact ? "rounded-t-lg" : "rounded-lg"
            )}
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          "relative z-10 w-full",
          compact && "min-h-[48px] border-b border-gray-100 text-left",
          !compact && "text-center",
          !compact && stageMode && "min-h-[200px] sm:min-h-[240px]",
          !compact && !stageMode && "min-h-[140px] sm:min-h-[180px]",
          containerClass
        )}
      >
        <AnimatePresence mode="sync">
          {currentSong ? (
            <motion.div
              key={currentSong.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className={cn(
                "absolute inset-0 w-full flex items-center gap-2.5 sm:gap-3",
                compact
                  ? "flex-row justify-start text-left px-5 sm:px-6"
                  : "flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-20"
              )}
            >
              {compact ? (
                <>
                  <span className="relative flex shrink-0 h-2 w-2">
                    {!reducedMotion && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                    )}
                    <span className="relative inline-flex rounded-full h-full w-full bg-emerald-600 ring-2 ring-emerald-500/20" />
                  </span>
                  <motion.h1
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    style={{ willChange: "transform, opacity" }}
                    className="font-serif font-black text-gray-950 truncate flex-1 min-w-0 text-[18px] sm:text-[20px] leading-tight tracking-tight drop-shadow-sm"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {currentSong.title}
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: 0.05, ease: [0.32, 0.72, 0, 1] }}
                    style={{ willChange: "transform, opacity" }}
                    className="flex items-center gap-2 shrink-0"
                  >
                    {currentSong.key && (
                      <span className="rounded-lg bg-gray-900 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-white tabular-nums shadow-sm">
                        {currentSong.key}
                      </span>
                    )}
                    {currentSong.bpm && (
                      <span className="text-[11px] sm:text-xs font-medium text-gray-500 tabular-nums">
                        {currentSong.bpm}
                      </span>
                    )}
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: 1
                    }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    style={{ willChange: "transform, opacity" }}
                    className={cn("inline-flex items-center gap-1.5", labelClass)}
                  >
                    <span className={cn("relative flex", dotClass)}>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-full w-full bg-emerald-600" />
                    </span>
                    <span
                      className={cn(
                        "text-emerald-700 font-bold uppercase tracking-[0.15em]",
                        labelTextClass
                      )}
                    >
                      Now Playing
                    </span>
                  </motion.div>

                  <motion.h1
                    key={`title-${isFullscreen}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, delay: 0.05, ease: [0.32, 0.72, 0, 1] }}
                    style={{ willChange: "transform, opacity" }}
                    className={cn(
                      "font-serif font-black text-gray-950 leading-[1.1] tracking-tight transition-all duration-450",
                      titleClass
                    )}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {currentSong.title}
                  </motion.h1>

                  {currentSong.artist && (
                    <motion.p
                      key={`artist-${isFullscreen}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
                      style={{ willChange: "transform, opacity" }}
                      className={cn("text-gray-500 transition-all duration-450", artistClass)}
                    >
                      {currentSong.artist}
                    </motion.p>
                  )}

                  <motion.div
                    key={`badges-${isFullscreen}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
                    style={{ willChange: "transform, opacity" }}
                    className={cn("flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap transition-all duration-450", badgesClass)}
                  >
                    {currentSong.key && (
                      <span
                        className={cn(
                          "rounded-full bg-gray-900 text-white font-bold transition-all duration-450",
                          badgeClass
                        )}
                      >
                        {currentSong.key}
                      </span>
                    )}
                    {currentSong.bpm && (
                      <span
                        className={cn(
                          "rounded-full bg-gray-100 text-gray-600 font-semibold transition-all duration-450",
                          badgeClassMuted
                        )}
                      >
                        {currentSong.bpm} BPM
                      </span>
                    )}
                    {currentSong.tempo && (
                      <span
                        className={cn(
                          "rounded-full bg-amber-400 text-amber-950 font-bold transition-all duration-450",
                          badgeClassMuted
                        )}
                      >
                        {currentSong.tempo}
                      </span>
                    )}
                  </motion.div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className={cn(
                "absolute inset-0 flex items-center w-full will-change-transform",
                compact ? "flex-row gap-2.5 justify-start px-5 sm:px-6" : "flex-col justify-center px-6 sm:px-10"
              )}
            >
              <Music
                className={cn(
                  "text-gray-300 shrink-0",
                  compact ? "w-5 h-5" : "mb-1 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
                )}
              />
              <p className={cn("text-gray-400 font-medium", compact ? "text-sm" : "text-base sm:text-lg font-serif")}>
                {compact ? "Tap a song below" : "Select a song from the setlist"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});
CurrentSongDisplay.displayName = "CurrentSongDisplay";

const LyricsFontToolbar = memo(
  ({
    fontSize,
    isBold,
    onAdjustFontSize,
    onToggleBold,
    className,
  }: {
    fontSize: LyricsFontSize;
    isBold: boolean;
    onAdjustFontSize: (delta: 1 | -1) => void;
    onToggleBold: () => void;
    className?: string;
  }) => (
    <div className={cn("flex items-center justify-end gap-2 sm:gap-3", className)}>
      <div className="flex items-center rounded-xl border border-gray-200/80 overflow-hidden bg-gray-50/50 shadow-[0_1px_2px_rgba(0,0,0,0.03)]" role="group" aria-label="Font size">
        <Type className="w-3.5 h-3.5 text-gray-400 ml-3 shrink-0" aria-hidden />
        <motion.button
          type="button"
          onClick={() => onAdjustFontSize(-1)}
          disabled={fontSize === "small"}
          whileTap={APPLE_TAP}
          transition={APPLE_SPRING}
          aria-label="Decrease font size"
          title="Smaller text"
          className={cn(
            "min-w-[36px] min-h-[36px] sm:min-w-[32px] sm:min-h-[32px] text-base font-medium transition-colors touch-manipulation",
            fontSize === "small"
              ? "text-gray-300 cursor-default"
              : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-800"
          )}
        >
          −
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onAdjustFontSize(1)}
          disabled={fontSize === "large"}
          whileTap={APPLE_TAP}
          transition={APPLE_SPRING}
          aria-label="Increase font size"
          title="Larger text"
          className={cn(
            "min-w-[36px] min-h-[36px] sm:min-w-[32px] sm:min-h-[32px] text-base font-medium transition-colors touch-manipulation border-l border-gray-200/80",
            fontSize === "large"
              ? "text-gray-300 cursor-default"
              : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-800"
          )}
        >
          +
        </motion.button>
      </div>
      <motion.button
        type="button"
        onClick={onToggleBold}
        whileTap={APPLE_TAP}
        transition={APPLE_SPRING}
        aria-pressed={isBold}
        aria-label={isBold ? "Bold text (click to disable)" : "Bold text (click to enable)"}
        title={isBold ? "Bold text" : "Normal text"}
        className={cn(
          "min-w-[36px] min-h-[36px] sm:min-w-[32px] sm:min-h-[32px] rounded-xl text-sm font-semibold transition-all duration-200 touch-manipulation",
          isBold
            ? "bg-amber-100 text-amber-800 border border-amber-200/60"
            : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-700 border border-gray-200/80"
        )}
      >
        B
      </motion.button>
    </div>
  )
);
LyricsFontToolbar.displayName = "LyricsFontToolbar";

const LyricsModal = memo(
  ({ song, open, onOpenChange }: { song: Song | null; open: boolean; onOpenChange: (open: boolean) => void }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { fontSize, isBold, adjustFontSize, toggleBold } = useLyricsFontSettings(open);

    useEffect(() => {
      if (open && scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "instant" });
      }
    }, [open, song?.id]);

    if (!song) return null;
    const hasLyrics = !!song.lyrics?.trim();
    const ariaDescription = hasLyrics
      ? `Lyrics for ${song.title}${song.artist ? ` by ${song.artist}` : ""}`
      : `No lyrics available for ${song.title}`;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          overlayClassName="backdrop-blur-md bg-black/50 dialog-overlay-fullbleed"
          aria-describedby={hasLyrics ? "lyrics-content" : undefined}
          className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] max-w-none sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[calc(100dvh-2rem)] my-4 p-0 gap-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white shadow-2xl shadow-black/10 duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 [&>button]:text-gray-500 [&>button]:hover:text-gray-800 [&>button]:hover:bg-gray-100/80 [&>button]:rounded-full [&>button]:p-2.5 sm:[&>button]:p-3 [&>button]:right-4 [&>button]:top-4 [&>button]:text-lg [&>button]:focus-visible:ring-2 [&>button]:focus-visible:ring-gray-300 [&>button]:focus-visible:ring-offset-2"
        >
          <DialogHeader className="px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 pb-4 border-b border-gray-100 bg-gray-50/30 shrink-0 text-left min-w-0 space-y-2">
            <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 pr-12 sm:pr-14 min-w-0 break-words leading-tight">
              {song.title}
            </DialogTitle>
            {song.artist && (
              <p className="text-base sm:text-lg lg:text-xl text-gray-500 font-medium pr-12 sm:pr-14 min-w-0 break-words leading-snug">
                {song.artist}
              </p>
            )}
            <DialogDescription className="sr-only">{ariaDescription}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-shrink-0 px-5 sm:px-8 lg:px-10 py-2 border-b border-gray-100">
              <LyricsFontToolbar
                fontSize={fontSize}
                isBold={isBold}
                onAdjustFontSize={adjustFontSize}
                onToggleBold={toggleBold}
              />
            </div>
            {hasLyrics ? (
              <div
                ref={scrollRef}
                id="lyrics-content"
                role="region"
                aria-label="Song lyrics"
                tabIndex={0}
                className="lyrics-scroll h-[80dvh] sm:h-[85dvh] lg:h-[88dvh] w-full overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-inset"
              >
                <div className={cn("px-5 sm:px-8 lg:px-10 py-6 sm:py-8 text-gray-700 leading-loose", LYRICS_FONT_CLASSES[fontSize], isBold && "font-bold")}>
                  <MemoizedLyricsContent lyrics={song.lyrics!} songId={song.id} />
                </div>
              </div>
            ) : (
              <div className={cn("px-8 py-12 text-center text-gray-400", LYRICS_FONT_CLASSES[fontSize], isBold && "font-bold")}>
                No lyrics available for this song.
              </div>
            )}
            <p className="block sm:hidden px-5 py-3 text-center text-xs text-gray-400 border-t border-gray-100">
              Tap outside to close
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
LyricsModal.displayName = "LyricsModal";

const SingerLyricsView = memo(({ song }: { song: Song | null }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { fontSize, isBold, adjustFontSize, toggleBold } = useLyricsFontSettings();

  useEffect(() => {
    if (song?.id && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [song?.id]);

  if (!song) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 py-12 bg-[#fafafa]">
        <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4" strokeWidth={1.5} />
        <p className="text-gray-600 text-sm sm:text-base text-center font-medium">
          Select a song to view lyrics
        </p>
        <p className="text-gray-400 text-xs sm:text-sm text-center mt-1.5">
          Tap a song from the setlist, then switch to Lyrics view
        </p>
      </div>
    );
  }

  const hasLyrics = !!song.lyrics?.trim();

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
        <LyricsFontToolbar
          fontSize={fontSize}
          isBold={isBold}
          onAdjustFontSize={adjustFontSize}
          onToggleBold={toggleBold}
        />
      </div>
      <div
        ref={scrollRef}
        role="region"
        aria-label={`Lyrics for ${song.title}`}
        tabIndex={0}
        className="lyrics-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
      >
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {song.title}
          </h2>
          {song.artist && (
            <p
              className={cn(
                "text-base sm:text-lg text-gray-500",
                (song.key || song.bpm || song.tempo) ? "mb-2" : "mb-6 sm:mb-8"
              )}
            >
              {song.artist}
            </p>
          )}
          {(song.key || song.bpm || song.tempo) && (
            <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
              {song.key && (
                <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-bold text-white">
                  {song.key}
                </span>
              )}
              {song.bpm && (
                <span className="text-sm text-gray-500 tabular-nums">{song.bpm} BPM</span>
              )}
              {song.tempo && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  {song.tempo}
                </span>
              )}
            </div>
          )}
          {!song.artist && !song.key && !song.bpm && !song.tempo && <div className="mb-6 sm:mb-8" />}
          {hasLyrics ? (
            <div className={cn(LYRICS_FONT_CLASSES[fontSize], isBold && "font-bold", "text-gray-700 leading-relaxed sm:leading-loose")}>
              <MemoizedLyricsContent lyrics={song.lyrics!} songId={song.id} />
            </div>
          ) : (
            <div className={cn("py-12 sm:py-16 text-center text-gray-400", LYRICS_FONT_CLASSES[fontSize], isBold && "font-bold")}>
              No lyrics available for this song.
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
});
SingerLyricsView.displayName = "SingerLyricsView";

const SongItem = memo(
  ({
    song,
    isActive,
    onSelect,
    onAISuggest,
    onShowLyrics,
    isAILoading,
    isRecentlySuggested,
    isSingerView,
  }: {
    song: Song;
    isActive: boolean;
    onSelect: (song: Song) => void;
    onAISuggest?: (song: Song) => void;
    onShowLyrics?: (song: Song) => void;
    isAILoading?: boolean;
    isRecentlySuggested?: boolean;
    isSingerView?: boolean;
  }) => {
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest("[data-ai-suggest]")) return;
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(10);
        }
        onSelect(song);
      },
      [song, onSelect]
    );
    const handleDoubleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onShowLyrics?.(song);
      },
      [song, onShowLyrics]
    );
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate(10);
          }
          onSelect(song);
        }
      },
      [song, onSelect]
    );
    const handleAIClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onAISuggest?.(song);
      },
      [song, onAISuggest]
    );
    const songCategory = getSongCategory(song);
    const ribbonColor = songCategory ? CATEGORY_COLORS[songCategory].ribbon : null;

    return (
      <motion.div
        layout="position"
        transition={{ layout: LAYOUT_TWEEN }}
        initial={false}
        className="relative setlist-item"
        data-song-id={song.id}
      >
        {isRecentlySuggested && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-amber-400/10 pointer-events-none -z-[1]"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: APPLE_EASE }}
          />
        )}
        <motion.div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          whileTap={APPLE_TAP}
          transition={APPLE_SPRING_TIGHT}
          title="Double-tap for lyrics"
          className={cn(
            "w-full text-left rounded-xl transition-all duration-200 ease-out flex items-center justify-between gap-1.5 touch-manipulation relative overflow-hidden",
            isSingerView
              ? ribbonColor
                ? "pl-4 pr-3.5 py-3 sm:py-2.5 min-h-[50px] sm:min-h-[47px]"
                : "px-3.5 py-3 sm:py-2.5 min-h-[50px] sm:min-h-[47px]"
              : ribbonColor
                ? "pl-3.5 pr-3 py-2.5 sm:py-2 min-h-[47px] sm:min-h-[44px]"
                : "px-3 py-2.5 sm:py-2 min-h-[47px] sm:min-h-[44px]",
            isActive
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-white text-gray-900 border border-gray-100/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] active:bg-gray-50/80 cursor-pointer hover:border-gray-200/80"
          )}
        >
        {ribbonColor && (
          <span
            className={cn("absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg shrink-0", ribbonColor)}
            aria-hidden
          />
        )}
        <span
          className={cn(
            "font-semibold truncate flex-1 leading-tight",
            isSingerView ? "text-[16px] sm:text-[15px]" : "text-[15px] sm:text-[14px]",
            isActive ? "text-white" : "text-gray-900"
          )}
        >
          {song.title}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {song.tempo && (
            <span
              className={cn(
                "rounded font-bold leading-none",
                isSingerView ? "px-1.5 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-[9px]",
                isActive ? "bg-amber-400 text-amber-900" : "bg-amber-50 text-amber-600"
              )}
            >
              {song.tempo[0]}
            </span>
          )}
          {isActive && onAISuggest && (
            <motion.button
              type="button"
              data-ai-suggest
              onClick={handleAIClick}
              disabled={isAILoading}
              whileTap={!isAILoading ? APPLE_TAP : undefined}
              transition={APPLE_SPRING_TIGHT}
              aria-label="Suggest next songs"
              title="Suggest 3 next songs based on key, tempo, and feel"
              className={cn(
                "rounded-xl transition-all duration-200 touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center",
                isSingerView ? "p-2 sm:p-1.5" : "p-2 sm:p-1.5",
                isAILoading
                  ? "text-amber-400/70 cursor-wait"
                  : "text-amber-500 hover:bg-amber-100/80 hover:text-amber-600 active:scale-95"
              )}
            >
              <motion.span
                animate={isAILoading ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1.2, repeat: isAILoading ? Infinity : 0, ease: "linear" }}
                className="block"
              >
                <Sparkles className={isSingerView ? "w-4 h-4" : "w-3.5 h-3.5"} strokeWidth={2} />
              </motion.span>
            </motion.button>
          )}
          {song.key && (
            <span
              className={cn(
                "rounded font-bold leading-none text-center",
                isSingerView ? "px-2 py-0.5 text-[11px] min-w-[26px]" : "px-1.5 py-0.5 text-[10px] min-w-[24px]",
                isActive ? "bg-white/20 text-white" : "bg-gray-900 text-white"
              )}
            >
              {song.key}
            </span>
          )}
        </div>
        </motion.div>
      </motion.div>
    );
  }
);
SongItem.displayName = "SongItem";

const SetlistSection = memo(
  ({
    searchQuery,
    categoryFilter,
    authRole,
    scrollToCurrentSongRef,
  }: {
    searchQuery: string;
    categoryFilter: RepertoireCategory;
    authRole: BandAuth["role"];
    scrollToCurrentSongRef?: React.MutableRefObject<(() => void) | null>;
  }) => {
    const deferredQuery = useDeferredValue(searchQuery);
    const { state, setCurrentSong, reorderSetlistWithSuggestions } = useBandState();
    const { setlist, currentSong } = state;
    const [isAILoading, setIsAILoading] = useState(false);
    const [recentlySuggestedIds, setRecentlySuggestedIds] = useState<Set<string>>(new Set());
    const recentlySuggestedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [lyricsSong, setLyricsSong] = useState<Song | null>(null);
    const [lyricsOpen, setLyricsOpen] = useState(false);
    const storedScroll = useMemo(() => readStoredScrollState(categoryFilter), [categoryFilter]);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const visibleCountRef = useRef(visibleCount);
    visibleCountRef.current = visibleCount;
    const [scrollTarget, setScrollTarget] = useState<{ type: "song"; id: string } | { type: "ai"; currentId: string; lastSuggestedId: string } | null>(null);
    const loadMoreThrottleRef = useRef<number | null>(null);

  const filteredSongs = useMemo(() => {
    let list = setlist.filter((s) => matchesCategory(s, categoryFilter));
    const q = deferredQuery.trim();
    if (!q) return list;
    const qNorm = normalizeForSearch(q);
    return list.filter(
      (s) =>
        normalizeForSearch(s.title ?? "").includes(qNorm) ||
        normalizeForSearch(s.artist ?? "").includes(qNorm) ||
        normalizeForSearch(s.key ?? "").includes(qNorm)
    );
  }, [setlist, deferredQuery, categoryFilter]);

  const filteredLengthRef = useRef(filteredSongs.length);
  filteredLengthRef.current = filteredSongs.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [deferredQuery, categoryFilter]);

  // Restore scroll position from localStorage on mount (page refresh)
  useEffect(() => {
    const saved = storedScroll;
    if (!saved) return;
    setVisibleCount(saved.visibleCount);
    const id = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = saved.scrollTop;
      }
    }, 150);
    return () => clearTimeout(id);
  }, [storedScroll]);

  useEffect(() => {
    return () => {
      if (recentlySuggestedTimeoutRef.current) clearTimeout(recentlySuggestedTimeoutRef.current);
    };
  }, []);

  const loadAll = useCallback(() => {
    setVisibleCount(filteredLengthRef.current);
  }, []);

  useEffect(() => {
    const el = loadMoreRef.current;
    const root = scrollRef.current;
    const maxLen = filteredLengthRef.current;
    if (!root || maxLen <= visibleCount) return;

    const doLoadMore = () => {
      if (loadMoreThrottleRef.current) return;
      loadMoreThrottleRef.current = window.requestAnimationFrame(() => {
        loadMoreThrottleRef.current = null;
        setVisibleCount((prev) => {
          const next = Math.min(prev + PAGE_SIZE, filteredLengthRef.current);
          return next > prev ? next : prev;
        });
      });
    };

    let observer: IntersectionObserver | null = null;
    if (el) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) doLoadMore();
        },
        { root, rootMargin: "200px", threshold: 0 }
      );
      observer.observe(el);
    }

    let saveTimeout: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = root;
      if (scrollHeight - scrollTop - clientHeight < 150) doLoadMore();
      if (!saveTimeout) {
        saveTimeout = setTimeout(() => {
          saveTimeout = null;
          try {
            localStorage.setItem(
              SETLIST_SCROLL_STORAGE_KEY,
              JSON.stringify({
                scrollTop: root.scrollTop,
                visibleCount: visibleCountRef.current,
                categoryFilter,
              })
            );
          } catch {
            /* ignore */
          }
        }, 150);
      }
    };
    root.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer?.disconnect();
      root.removeEventListener("scroll", onScroll);
      if (loadMoreThrottleRef.current) cancelAnimationFrame(loadMoreThrottleRef.current);
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [filteredSongs.length, visibleCount, categoryFilter]);

  // Scroll after layout animation settles (LAYOUT_SPRING ~550ms)
  useEffect(() => {
    if (!scrollTarget || !scrollRef.current) return;
    const container = scrollRef.current;
    const delay = scrollTarget.type === "ai" ? 650 : 120;
    const id = setTimeout(() => {
      const scrollToInView = (el: Element) => {
        const containerRect = container.getBoundingClientRect();
        const elRect = (el as HTMLElement).getBoundingClientRect();
        const elTop = container.scrollTop + (elRect.top - containerRect.top);
        const elBottom = container.scrollTop + (elRect.bottom - containerRect.top);
        let targetTop: number;
        if (elRect.top < containerRect.top) {
          targetTop = elTop;
        } else if (elRect.bottom > containerRect.bottom) {
          targetTop = Math.max(0, elBottom - container.clientHeight);
        } else {
          return;
        }
        animateScrollTo(container, targetTop);
      };

      if (scrollTarget.type === "song") {
        const el = document.querySelector(`[data-song-id="${scrollTarget.id}"]`);
        if (el) scrollToInView(el);
      } else {
        const currentEl = document.querySelector(`[data-song-id="${scrollTarget.currentId}"]`);
        const lastEl = document.querySelector(`[data-song-id="${scrollTarget.lastSuggestedId}"]`);
        if (currentEl && lastEl) {
          const containerRect = container.getBoundingClientRect();
          const currentRect = (currentEl as HTMLElement).getBoundingClientRect();
          const lastRect = (lastEl as HTMLElement).getBoundingClientRect();
          const currentScrollTop = container.scrollTop + (currentRect.top - containerRect.top);
          const lastScrollBottom = container.scrollTop + (lastRect.bottom - containerRect.top);
          const blockHeight = lastScrollBottom - currentScrollTop;
          const targetScrollTop =
            blockHeight <= container.clientHeight
              ? currentScrollTop
              : lastScrollBottom - container.clientHeight;
          container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: "instant" });
        } else if (currentEl) {
          scrollToInView(currentEl);
        }
      }
      setScrollTarget(null);
    }, delay);
    return () => clearTimeout(id);
  }, [scrollTarget, setlist]);

  const handleAISuggest = useCallback(
    async (song: Song) => {
      if (setlist.length < 4) {
        const { toast } = await import("sonner");
        toast.info("Need at least 4 songs for suggestions");
        return;
      }
      setIsAILoading(true);
      try {
        const { fetchAISuggestions, hasAIApi } = await import("@/lib/bandApi");
        if (!hasAIApi()) {
          throw new Error("Suggestions require server connection (set VITE_WS_URL or VITE_API_URL)");
        }
        const { suggestedIds } = await fetchAISuggestions(song.id, setlist);
        if (suggestedIds.length > 0) {
          if (recentlySuggestedTimeoutRef.current) clearTimeout(recentlySuggestedTimeoutRef.current);
          setRecentlySuggestedIds(new Set(suggestedIds));
          recentlySuggestedTimeoutRef.current = setTimeout(() => {
            setRecentlySuggestedIds(new Set());
            recentlySuggestedTimeoutRef.current = null;
          }, 1500);
          reorderSetlistWithSuggestions(suggestedIds, song);
          setScrollTarget({
            type: "ai",
            currentId: song.id,
            lastSuggestedId: suggestedIds[suggestedIds.length - 1],
          });
        } else {
          const { toast } = await import("sonner");
          toast.info("No suitable suggestions found");
        }
      } catch (err) {
        console.error("Suggestions failed:", err);
        const { toast } = await import("sonner");
        toast.error(err instanceof Error ? err.message : "Failed to get suggestions");
      } finally {
        setIsAILoading(false);
      }
    },
    [setlist, reorderSetlistWithSuggestions]
  );

  const handleShowLyrics = useCallback((song: Song) => {
    setLyricsSong(song);
    setLyricsOpen(true);
  }, []);

  const handleSelectSong = useCallback(
    (song: Song) => {
      // Prevent deselect when clicking the same song twice (keeps selection stable)
      if (currentSong?.id === song.id) return;
      setCurrentSong(song);
      setScrollTarget({ type: "song", id: song.id });
    },
    [setCurrentSong, currentSong?.id]
  );

  const scrollToCurrentSong = useCallback(() => {
    if (!currentSong) return;
    const index = filteredSongs.findIndex((s) => s.id === currentSong.id);
    if (index < 0) return;
    if (index >= visibleCount) {
      setVisibleCount((prev) => Math.max(prev, index + 1));
    }
    setScrollTarget({ type: "song", id: currentSong.id });
  }, [currentSong, filteredSongs, visibleCount]);

  useEffect(() => {
    if (scrollToCurrentSongRef) {
      scrollToCurrentSongRef.current = scrollToCurrentSong;
      return () => {
        scrollToCurrentSongRef.current = null;
      };
    }
  }, [scrollToCurrentSong, scrollToCurrentSongRef]);

  if (filteredSongs.length === 0) {
    const isSearch = deferredQuery.trim().length > 0;
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
        <p className="text-gray-400 text-sm text-center">
          {isSearch ? "No songs match your search" : "No songs in setlist"}
        </p>
        {isSearch && (
          <p className="text-gray-400 text-xs text-center max-w-[200px]">
            Try a different term or clear the search
          </p>
        )}
      </div>
    );
  }

  const visibleSongs = filteredSongs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSongs.length;

  const isSinger = authRole === "singer";

  return (
    <motion.div
      ref={scrollRef}
      layoutScroll
      className="flex-1 min-h-0 overflow-y-auto px-2 py-1.5 pb-safe hide-scrollbar relative"
    >
      <AnimatePresence>
        {isAILoading && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={APPLE_SPRING}
            className="sticky top-0 z-10 mb-1.5 h-[2px] origin-left overflow-hidden rounded-full bg-amber-200/20"
          >
            <motion.div
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-amber-400/90 to-transparent"
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <LayoutGroup>
        <motion.div layout="position" transition={{ layout: LAYOUT_TWEEN }} className={cn("space-y-0.5", isSinger && "space-y-1")}>
          {visibleSongs.map((song) => (
            <SongItem
              key={song.id}
              song={song}
              isActive={currentSong?.id === song.id}
              onSelect={handleSelectSong}
              onAISuggest={isSinger ? handleAISuggest : undefined}
              onShowLyrics={handleShowLyrics}
              isAILoading={isAILoading}
              isRecentlySuggested={recentlySuggestedIds.has(song.id)}
              isSingerView={isSinger}
            />
          ))}
        </motion.div>
      </LayoutGroup>
      {hasMore ? (
        <div ref={loadMoreRef} className="py-3 flex flex-col items-center gap-2">
          <p className="text-xs text-gray-400">
            Showing {visibleCount} of {filteredSongs.length} songs
          </p>
            <motion.button
              type="button"
              onClick={loadAll}
              whileTap={APPLE_TAP}
              transition={APPLE_SPRING}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200/90 active:bg-gray-300/90 touch-manipulation transition-colors"
            >
            Load all {filteredSongs.length} songs
          </motion.button>
        </div>
      ) : (
        <p className="py-2 text-center text-xs text-gray-400">
          All {filteredSongs.length} songs loaded
        </p>
      )}
      <div className="h-4" />
      <LyricsModal
        song={lyricsSong}
        open={lyricsOpen}
        onOpenChange={(open) => {
          setLyricsOpen(open);
          if (!open) setLyricsSong(null);
        }}
      />
    </motion.div>
  );
  }
);
SetlistSection.displayName = "SetlistSection";

type SingerViewMode = "setlist" | "lyrics";

const METRONOME_STORAGE_KEY = "band-app-metronome";
const METRONOME_VISIBLE_STORAGE_KEY = "band-app-metronome-visible";
const CATEGORY_FILTER_STORAGE_KEY = "band-app-category-filter";
const FULLSCREEN_MODE_STORAGE_KEY = "band-app-fullscreen-mode";

const VALID_CATEGORIES: RepertoireCategory[] = ["all", "stranski", "ex-yu", "makedonski", "turbo", "extras"];

function readStoredCategory(): RepertoireCategory {
  try {
    const stored = localStorage.getItem(CATEGORY_FILTER_STORAGE_KEY);
    return stored && VALID_CATEGORIES.includes(stored as RepertoireCategory) ? (stored as RepertoireCategory) : "all";
  } catch {
    return "all";
  }
}

const BandAppContent = memo(({ authRole, onLogout }: { authRole: BandAuth["role"]; onLogout: () => void }) => {
  const { isSinger, setIsSinger, hasUpdate, isConnected, isOffline } = useBandUI();
  const { state } = useBandState();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<RepertoireCategory>(readStoredCategory);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [singerViewMode, setSingerViewMode] = useState<SingerViewMode>("setlist");
  const [metronomeEnabled, setMetronomeEnabled] = useState(() => {
    try {
      return localStorage.getItem(METRONOME_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [metronomeVisible, setMetronomeVisible] = useState(() => {
    try {
      const stored = localStorage.getItem(METRONOME_VISIBLE_STORAGE_KEY);
      return stored === null || stored === "true";
    } catch {
      return true;
    }
  });
  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (authRole !== "member") return false;
    try {
      return localStorage.getItem(FULLSCREEN_MODE_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const scrollToCurrentSongRef = useRef<(() => void) | null>(null);
  const lastTapRef = useRef<number>(0);
  const doubleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(METRONOME_STORAGE_KEY, String(metronomeEnabled));
    } catch {
      /* ignore */
    }
  }, [metronomeEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(METRONOME_VISIBLE_STORAGE_KEY, String(metronomeVisible));
    } catch {
      /* ignore */
    }
  }, [metronomeVisible]);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORY_FILTER_STORAGE_KEY, categoryFilter);
    } catch {
      /* ignore */
    }
  }, [categoryFilter]);

  useEffect(() => {
    if (authRole !== "member") return;
    try {
      localStorage.setItem(FULLSCREEN_MODE_STORAGE_KEY, String(isFullscreen));
    } catch {
      /* ignore */
    }
  }, [isFullscreen, authRole]);

  useEffect(() => {
    return () => {
      if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
    };
  }, []);

  const handleSingerViewToggle = useCallback(() => {
    setSingerViewMode((prev) => (prev === "setlist" ? "lyrics" : "setlist"));
  }, []);
  const handleScrollToCurrentFromNowPlaying = useCallback(() => {
    if (authRole !== "singer") return;
    if (singerViewMode !== "setlist") {
      setSingerViewMode("setlist");
      // Wait for view switch frame before performing list scroll.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToCurrentSongRef.current?.();
        });
      });
      return;
    }
    scrollToCurrentSongRef.current?.();
  }, [authRole, singerViewMode]);
  const handleSearchChange = useCallback((v: string) => setSearchQuery(v), []);
  const handleSearchClear = useCallback(() => setSearchQuery(""), []);
  const handleCategoryChange = useCallback((v: RepertoireCategory) => setCategoryFilter(v), []);
  const handleCloseLogout = useCallback(() => setShowLogoutDialog(false), []);
  const handleConfirmLogout = useCallback(() => {
    setShowLogoutDialog(false);
    onLogout();
  }, [onLogout]);

  const handleDoubleTap = useCallback(() => {
    if (authRole !== "member") return;
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300) {
      // Double tap detected
      if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
      setIsFullscreen((prev) => !prev);
      lastTapRef.current = 0;
    } else {
      // First tap
      lastTapRef.current = now;
      if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
      doubleTapTimeoutRef.current = setTimeout(() => {
        lastTapRef.current = 0;
      }, 300);
    }
  }, [authRole]);

  return (
    <div className="band-app-font h-[100dvh] min-h-[100dvh] bg-[#f5f5f7] flex flex-col overflow-hidden relative">
      <AnimatePresence>
        {(!isFullscreen || authRole !== "member") && (
          <motion.header
            key="header"
            initial={false}
            animate={{ 
              y: 0, 
              opacity: 1,
            }}
            exit={{ 
              y: -80, 
              opacity: 0,
              transition: { 
                duration: 0.45, 
                ease: [0.32, 0.72, 0, 1],
                opacity: { duration: 0.3 }
              }
            }}
            transition={{ 
              y: { duration: 0.45, ease: [0.32, 0.72, 0, 1] },
              opacity: { duration: 0.35 }
            }}
            style={{ willChange: "transform, opacity" }}
            className={cn(
              "px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between gap-2 min-h-[44px] sm:min-h-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 safe-area-top shadow-[0_1px_0_rgba(0,0,0,0.03)] z-50",
              authRole === "singer" ? "flex-shrink-0" : "absolute top-0 left-0 right-0"
            )}>
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-start">
          <motion.button
            type="button"
            onClick={() => setShowTutorial(true)}
            whileTap={APPLE_TAP}
            transition={APPLE_SPRING}
            className="flex items-center gap-2 min-w-0 text-left touch-manipulation group shrink-0"
            aria-label="How to use the app"
            title="How to use"
          >
            <span
              className={cn(
                "relative inline-flex",
                hasWebSocket() && "insync-status-dot",
                hasWebSocket() &&
                  (isConnected ? "insync-status--connected" : isOffline ? "insync-status--offline" : "insync-status--connecting")
              )}
              title={
                hasWebSocket()
                  ? isConnected
                    ? "Connected to server"
                    : isOffline
                      ? "Server unreachable. App works offline with local data."
                      : "Connecting to server…"
                  : undefined
              }
              aria-live={hasWebSocket() ? "polite" : undefined}
            >
              <Music className="w-4 h-4 text-primary shrink-0 group-hover:opacity-80 transition-opacity" aria-hidden />
            </span>
          </motion.button>
          <AnimatePresence>
            {hasUpdate && (
              <motion.span
                key="synced"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={APPLE_SPRING}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200/60 shrink-0"
              >
                Synced
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end min-w-0">
          {authRole === "singer" && (
            <motion.button
              type="button"
              onClick={handleSingerViewToggle}
              whileTap={APPLE_TAP}
              transition={APPLE_SPRING}
              aria-pressed={singerViewMode === "lyrics"}
              aria-label={
                singerViewMode === "setlist"
                  ? state.currentSong
                    ? "Switch to lyrics view (song selected)"
                    : "Switch to lyrics view"
                  : "Switch to setlist view"
              }
              title={
                singerViewMode === "setlist"
                  ? state.currentSong
                    ? "Show lyrics for selected song"
                    : "Show lyrics"
                  : "Show setlist"
              }
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 h-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-9 justify-center touch-manipulation overflow-visible",
                singerViewMode === "lyrics"
                  ? "bg-amber-500 text-amber-950 shadow-[0_2px_8px_rgba(245,158,11,0.25)]"
                  : "bg-gray-100/90 text-gray-600 hover:bg-gray-200/90 hover:text-gray-800 active:scale-[0.98]"
              )}
            >
              {singerViewMode === "setlist" ? (
                <FileText className="w-3.5 h-3.5 sm:w-3 sm:h-3" strokeWidth={2} />
              ) : (
                <List className="w-3.5 h-3.5 sm:w-3 sm:h-3" strokeWidth={2} />
              )}
              <span className="sm:inline">{singerViewMode === "setlist" ? "Lyrics" : "Setlist"}</span>
              {singerViewMode === "setlist" && state.currentSong && (
                <span
                  className={cn(
                    "absolute top-0 right-0 w-2.5 h-2.5 rounded-full shadow-sm border-2 border-white",
                    state.currentSong.lyrics?.trim()
                      ? "bg-amber-500"
                      : "bg-gray-400"
                  )}
                  aria-hidden
                />
              )}
            </motion.button>
          )}
          {authRole === "member" && (
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                onClick={() => {
                  setMetronomeVisible((v) => {
                    const next = !v;
                    if (next) setMetronomeEnabled(true);
                    return next;
                  });
                }}
                whileTap={APPLE_TAP}
                transition={APPLE_SPRING}
                aria-label={metronomeVisible ? "Hide metronome" : "Show metronome"}
                aria-pressed={metronomeVisible}
                title={metronomeVisible ? "Hide metronome" : "Show metronome"}
                className={cn(
                  "flex items-center justify-center w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl touch-manipulation transition-all duration-200 ease-out",
                  metronomeVisible
                    ? "bg-red-50 text-red-600 border border-red-200/60 shadow-sm"
                    : "bg-gray-100/90 text-gray-400 hover:bg-gray-200/90 hover:text-gray-600"
                )}
              >
                <Timer size={18} className="shrink-0" strokeWidth={2} aria-hidden />
              </motion.button>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200/80 shrink-0">
                <Users className="w-3 h-3 shrink-0" />
                <span className="hidden sm:inline">Member</span>
              </span>
            </div>
          )}
          <motion.button
            type="button"
            onClick={() => setShowLogoutDialog(true)}
            whileTap={APPLE_TAP}
            transition={APPLE_SPRING}
            aria-label="Log out"
            className="p-2.5 sm:p-1.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/90 transition-all duration-200 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center touch-manipulation active:scale-95"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: APPLE_EASE }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
            onClick={handleCloseLogout}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={APPLE_SPRING_GENTLE}
              className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl shadow-black/10"
              onClick={(e) => e.stopPropagation()}
            >
            <p className="text-sm font-medium text-gray-900">Log out?</p>
            <p className="mt-1 text-xs text-gray-500">You’ll need your PIN to sign in again.</p>
            <div className="mt-4 flex gap-2">
              <motion.button
                type="button"
                onClick={handleCloseLogout}
                whileTap={APPLE_TAP}
                transition={APPLE_SPRING}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                onClick={handleConfirmLogout}
                whileTap={APPLE_TAP}
                transition={APPLE_SPRING}
                className="flex-1 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors shadow-sm"
              >
                Log out
              </motion.button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BandAppTutorial
        open={showTutorial}
        onOpenChange={setShowTutorial}
        authRole={authRole}
      />

      {!(authRole === "singer" && singerViewMode === "lyrics") && (
        <div className={cn(
          "flex flex-col",
          isSinger ? "flex-shrink-0" : "flex-1 min-h-0",
          authRole === "member" && !isFullscreen && "pt-[60px]"
        )}>
        <motion.div
          onClick={authRole === "member" ? handleDoubleTap : undefined}
          animate={{
            margin: isFullscreen ? 0 : isSinger ? "0.375rem 0.375rem" : "0.5rem 0.75rem",
            borderRadius: isFullscreen ? 0 : 16,
            padding: isFullscreen ? 0 : isSinger ? "3px" : "3px",
          }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          style={{ willChange: "transform, opacity" }}
          className={cn(
            "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-[0_4px_24px_rgba(245,158,11,0.25)]",
            isSinger ? "flex-shrink-0" : "flex-1 min-h-0 flex flex-col",
            authRole === "member" && "touch-manipulation"
          )}
        >
          <motion.div
            animate={{
              borderRadius: isFullscreen ? 0 : 13,
            }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            style={{ willChange: "transform" }}
            className={cn(
              "overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col shadow-inner",
              isSinger ? "min-h-0" : "flex-1 min-h-0"
            )}
          >
          <motion.div
            animate={{
              borderRadius: isFullscreen ? 0 : 12,
              margin: isFullscreen ? 0 : 4,
            }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            style={{ willChange: "transform" }}
            className={cn(
              "overflow-hidden bg-white flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
              isSinger ? "min-h-0" : "flex-1 min-h-0"
            )}
          >
            {authRole === "member" && (
              <AnimatePresence mode="sync">
                {metronomeVisible && (
                  <motion.div
                    key="metronome"
                    initial={{ opacity: 0, maxHeight: 0 }}
                    animate={{ opacity: 1, maxHeight: 120 }}
                    exit={{ opacity: 0, maxHeight: 0 }}
                    transition={{ duration: FADE_DURATION, ease: APPLE_EASE }}
                    className="overflow-hidden"
                  >
                    <VisualMetronome
                      bpm={state.currentSong?.bpm ?? DEFAULT_METRONOME_BPM}
                      songId={state.currentSong?.id ?? null}
                      enabled={metronomeEnabled}
                      onEnabledChange={setMetronomeEnabled}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <CurrentSongDisplay
              compact={isSinger}
              stageMode={authRole === "member"}
              isFullscreen={isFullscreen}
              onScrollToCurrent={
                authRole === "singer"
                  ? handleScrollToCurrentFromNowPlaying
                  : undefined
              }
            />
          </motion.div>
          </motion.div>
        </motion.div>
        </div>
      )}

      {authRole === "singer" && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#fafafa] relative overflow-hidden">
          {/* Keep both views mounted to preserve setlist scroll position when switching */}
          <motion.div
            initial={false}
            animate={{
              opacity: singerViewMode === "setlist" ? 1 : 0,
              pointerEvents: singerViewMode === "setlist" ? "auto" : "none",
              zIndex: singerViewMode === "setlist" ? 10 : 0,
            }}
            transition={{ duration: 0 }}
            className="absolute inset-0 flex flex-col"
          >
            <div className="flex-shrink-0 px-3 py-2 bg-gray-50/80 border-b border-gray-100 space-y-2">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
              />
              <CategoryFilter
                value={categoryFilter}
                onChange={handleCategoryChange}
              />
            </div>
            <SetlistSection
              searchQuery={searchQuery}
              categoryFilter={categoryFilter}
              authRole={authRole}
              scrollToCurrentSongRef={scrollToCurrentSongRef}
            />
          </motion.div>
          <motion.div
            initial={false}
            animate={{
              opacity: singerViewMode === "lyrics" ? 1 : 0,
              pointerEvents: singerViewMode === "lyrics" ? "auto" : "none",
              zIndex: singerViewMode === "lyrics" ? 10 : 0,
            }}
            transition={{ duration: 0 }}
            className="absolute inset-0 flex flex-col"
          >
            <SingerLyricsView song={state.currentSong} />
          </motion.div>
        </div>
      )}
    </div>
  );
});
BandAppContent.displayName = "BandAppContent";

const BandApp = () => {
  const [auth, setAuth] = useState<BandAuth | null>(() => getStoredAuth());

  const handleAuth = useCallback((newAuth: BandAuth) => {
    setStoredAuth(newAuth);
    setAuth(newAuth);
  }, []);

  const handleLogout = useCallback(() => {
    clearStoredAuth();
    setAuth(null);
  }, []);

  if (!auth) {
    return <PinGate onAuth={handleAuth} />;
  }

  return (
    <BandProvider authRole={auth.role}>
      <BandAppContent authRole={auth.role} onLogout={handleLogout} />
    </BandProvider>
  );
};

export default BandApp;
