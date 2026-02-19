import { useState, useMemo, useEffect, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BandProvider, useBandContext, type Song } from "@/context/BandContext";
import {
  PinGate,
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth,
  type BandAuth,
} from "@/components/PinGate";
import { Music, X, Mic2, Users, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const BLINK_DURATION = 2800;

const BLINK_COLORS = ["#fbbf24", "#ffffff"] as const;
const BLINK_TIMES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9] as const;

const CurrentSongDisplay = memo(({ compact = false }: { compact?: boolean }) => {
  const { state } = useBandContext();
  const { currentSong } = state;
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
    ? "px-3 sm:px-6 py-2 sm:py-2.5"
    : "px-4 sm:px-8 md:px-12 py-4 sm:py-8 md:py-12 lg:py-16";
  const labelClass = compact ? "mb-1.5 sm:mb-2" : "mb-2 sm:mb-3 md:mb-4";
  const dotClass = compact ? "h-2 w-2" : "h-2.5 w-2.5 sm:h-3 sm:w-3";
  const labelTextClass = compact ? "text-[9px]" : "text-xs sm:text-sm md:text-base";
  const titleClass = compact
    ? "text-xl sm:text-2xl md:text-3xl"
    : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl";
  const artistClass = compact ? "mt-1 text-xs sm:text-sm" : "mt-2 sm:mt-3 text-base sm:text-xl md:text-2xl lg:text-3xl";
  const badgesClass = compact ? "mt-2" : "mt-4 sm:mt-6 md:mt-8";
  const badgeClass = compact
    ? "px-2.5 py-0.5 text-sm"
    : "px-5 sm:px-6 py-2.5 sm:py-3 text-xl sm:text-2xl md:text-3xl";
  const badgeClassMuted = compact
    ? "px-2.5 py-0.5 text-xs"
    : "px-5 sm:px-6 py-2.5 sm:py-3 text-lg sm:text-xl md:text-2xl";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-white",
        !compact && "flex-1 min-h-0 flex flex-col items-center justify-center"
      )}
    >
      <AnimatePresence>
        {isBlinking && (
          <motion.div
            key={`blink-${blinkCount}`}
            initial={{ backgroundColor: BLINK_COLORS[0] }}
            animate={{
              backgroundColor: [
                ...BLINK_COLORS,
                ...BLINK_COLORS,
                ...BLINK_COLORS,
                ...BLINK_COLORS,
                ...BLINK_COLORS,
              ],
            }}
            transition={{ duration: 2.5, times: [...BLINK_TIMES], ease: "easeOut" }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0"
          />
        )}
      </AnimatePresence>

      <div className={cn("relative z-10 text-center w-full", containerClass)}>
        <AnimatePresence mode="wait">
          {currentSong ? (
            <motion.div
              key={currentSong.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <div className={cn("inline-flex items-center gap-1.5", labelClass)}>
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
              </div>

              <h1
                className={cn(
                  "font-serif font-black text-gray-950 leading-[1.1] tracking-tight",
                  titleClass
                )}
              >
                {currentSong.title}
              </h1>

              {currentSong.artist && (
                <p className={cn("text-gray-500", artistClass)}>{currentSong.artist}</p>
              )}

              <div className={cn("flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap", badgesClass)}>
                {currentSong.key && (
                  <span
                    className={cn(
                      "rounded-full bg-gray-900 text-white font-bold",
                      badgeClass
                    )}
                  >
                    {currentSong.key}
                  </span>
                )}
                {currentSong.bpm && (
                  <span
                    className={cn(
                      "rounded-full bg-gray-100 text-gray-600 font-semibold",
                      badgeClassMuted
                    )}
                  >
                    {currentSong.bpm} BPM
                  </span>
                )}
                {currentSong.tempo && (
                  <span
                    className={cn(
                      "rounded-full bg-amber-400 text-amber-950 font-bold",
                      badgeClassMuted
                    )}
                  >
                    {currentSong.tempo}
                  </span>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={compact ? "py-4" : "py-12 sm:py-16"}
            >
              <Music
                className={cn(
                  "mx-auto text-gray-300 mb-1",
                  compact ? "w-6 h-6" : "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
                )}
              />
              <p className={cn("text-gray-400 font-serif", compact ? "text-sm" : "text-base sm:text-lg")}>
                Select a song
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
CurrentSongDisplay.displayName = "CurrentSongDisplay";

const SearchBar = memo(
  ({
    value,
    onChange,
    onClear,
  }: {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
  }) => (
    <div className="relative">
      <Search
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        aria-label="Search songs"
        autoComplete="off"
        className="w-full pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors text-base"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
);
SearchBar.displayName = "SearchBar";

const SongItem = memo(
  ({ song, isActive, onSelect }: { song: Song; isActive: boolean; onSelect: (song: Song) => void }) => {
    const handleClick = useCallback(() => onSelect(song), [song, onSelect]);
    return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full text-left px-2.5 py-1.5 rounded-lg transition-colors duration-100 flex items-center justify-between gap-2",
        isActive
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-900 border border-gray-100 active:bg-gray-50 cursor-pointer"
      )}
    >
      <span
        className={cn(
          "font-semibold truncate flex-1 leading-tight text-[13px]",
          isActive ? "text-white" : "text-gray-900"
        )}
      >
        {song.title}
      </span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {song.tempo && (
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[9px] font-bold leading-none",
              isActive ? "bg-amber-400 text-amber-900" : "bg-amber-50 text-amber-600"
            )}
          >
            {song.tempo[0]}
          </span>
        )}
        {song.key && (
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold leading-none min-w-[24px] text-center",
              isActive ? "bg-white/20 text-white" : "bg-gray-900 text-white"
            )}
          >
            {song.key}
          </span>
        )}
      </div>
    </button>
  );
  }
);
SongItem.displayName = "SongItem";

const SetlistSection = memo(({ searchQuery }: { searchQuery: string }) => {
  const { state, setCurrentSong } = useBandContext();
  const { setlist, currentSong } = state;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredSongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return setlist;
    return setlist.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist?.toLowerCase().includes(q) ||
        s.key?.toLowerCase().includes(q)
    );
  }, [setlist, searchQuery]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  useEffect(() => {
    const el = loadMoreRef.current;
    const root = scrollRef.current;
    if (!el || !root || filteredSongs.length <= visibleCount) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredSongs.length));
        }
      },
      { root, rootMargin: "100px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredSongs.length, visibleCount]);

  if (filteredSongs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">No songs found</p>
      </div>
    );
  }

  const visibleSongs = filteredSongs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSongs.length;

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-y-auto px-2 py-1.5 hide-scrollbar"
    >
      <div className="space-y-0.5">
        {visibleSongs.map((song) => (
          <SongItem
            key={song.id}
            song={song}
            isActive={currentSong?.id === song.id}
            onSelect={setCurrentSong}
          />
        ))}
      </div>
      {hasMore && <div ref={loadMoreRef} className="h-8" />}
      <div className="h-4" />
    </div>
  );
});
SetlistSection.displayName = "SetlistSection";

const BandAppContent = ({ authRole, onLogout }: { authRole: BandAuth["role"]; onLogout: () => void }) => {
  const { isSinger, setIsSinger } = useBandContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleRoleToggle = useCallback(() => setIsSinger(!isSinger), [isSinger, setIsSinger]);
  const handleSearchChange = useCallback((v: string) => setSearchQuery(v), []);
  const handleSearchClear = useCallback(() => setSearchQuery(""), []);

  return (
    <div className="h-[100dvh] bg-gray-50 flex flex-col overflow-hidden">
      <header className="flex-shrink-0 px-3 py-2 flex items-center justify-between bg-white border-b border-gray-200">
        <div className="flex items-center gap-1.5">
          <Music className="w-4 h-4 text-primary" aria-hidden />
          <span className="text-gray-900 font-semibold text-sm">Setlist</span>
        </div>
        <div className="flex items-center gap-2">
          {authRole === "singer" && (
            <button
              type="button"
              onClick={handleRoleToggle}
              aria-pressed={isSinger}
              aria-label={isSinger ? "Singer mode" : "Member mode"}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                isSinger ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
              )}
            >
              {isSinger ? <Mic2 className="w-3 h-3" /> : <Users className="w-3 h-3" />}
              <span>{isSinger ? "Singer" : "Member"}</span>
            </button>
          )}
          {authRole === "member" && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              <Users className="w-3 h-3" />
              Member
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowLogoutDialog(true)}
            aria-label="Log out"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {showLogoutDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowLogoutDialog(false)}
        >
          <div
            className="w-full max-w-xs rounded-xl bg-white p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-gray-900">Log out?</p>
            <p className="mt-1 text-xs text-gray-500">You’ll need your PIN to sign in again.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutDialog(false);
                  onLogout();
                }}
                className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          "relative",
          isSinger ? "mx-3 my-2 flex-shrink-0" : "mx-1.5 sm:mx-2 my-1 sm:my-1.5 flex-1 min-h-0 flex flex-col"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 rounded-2xl" />
        <div
          className={cn(
            "absolute bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
            isSinger ? "inset-[3px] rounded-xl" : "inset-[2px] rounded-[10px]"
          )}
        />
        <div
          className={cn(
            "relative rounded-lg overflow-hidden",
            isSinger ? "m-[6px]" : "m-1 sm:m-1.5 flex-1 min-h-0 flex flex-col"
          )}
        >
          <CurrentSongDisplay compact={isSinger} />
        </div>
      </div>

      {isSinger && (
        <>
          <div className="flex-shrink-0 px-2 py-1.5 bg-gray-50">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
            />
          </div>
          <SetlistSection searchQuery={searchQuery} />
        </>
      )}
    </div>
  );
};

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
