import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, memo, type ReactNode } from "react";
import type { BandRole } from "@/components/PinGate";
import { useBandWebSocket } from "@/hooks/useBandWebSocket";
import REPERTOIRE_SONGS from "@/data/songs.json";

export interface Song {
  id: string;
  title: string;
  artist?: string;
  key?: string;
  bpm?: number;
  tempo?: string;
  genre?: string;
  lyrics?: string;
}

export interface BandState {
  currentSong: Song | null;
  setlist: Song[];
  lastUpdate: number;
}

interface BandContextType {
  state: BandState;
  isSinger: boolean;
  setIsSinger: (value: boolean) => void;
  setCurrentSong: (song: Song | null) => void;
  addSong: (song: Omit<Song, "id">) => void;
  removeSong: (id: string) => void;
  reorderSetlistWithSuggestions: (suggestedIds: string[], currentSongOverride?: Song) => void;
  hasUpdate: boolean;
  isConnected: boolean;
  isOffline: boolean;
}

const REPERTOIRE = REPERTOIRE_SONGS as Song[];

const STORAGE_KEY = "band-app-state";

const BandContext = createContext<BandContextType | null>(null);

const BandStateContext = createContext<{
  state: BandState;
  setCurrentSong: (song: Song | null) => void;
  addSong: (song: Omit<Song, "id">) => void;
  removeSong: (id: string) => void;
  reorderSetlistWithSuggestions: (suggestedIds: string[], currentSongOverride?: Song) => void;
} | null>(null);

const BandUIContext = createContext<{
  isSinger: boolean;
  setIsSinger: (value: boolean) => void;
  hasUpdate: boolean;
  isConnected: boolean;
  isOffline: boolean;
} | null>(null);

export const useBandContext = () => {
  const context = useContext(BandContext);
  if (!context) {
    throw new Error("useBandContext must be used within BandProvider");
  }
  return context;
};

export const useBandState = () => {
  const context = useContext(BandStateContext);
  if (!context) throw new Error("useBandState must be used within BandProvider");
  return context;
};

export const useBandUI = () => {
  const context = useContext(BandUIContext);
  if (!context) throw new Error("useBandUI must be used within BandProvider");
  return context;
};

const loadState = (): BandState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as BandState;
      // If saved setlist has fewer songs than repertoire (e.g. after adding songs to songs.json),
      // use full repertoire so user sees all songs
      if (parsed.setlist.length < REPERTOIRE.length) {
        return {
          currentSong: parsed.currentSong,
          setlist: [...REPERTOIRE],
          lastUpdate: Date.now(),
        };
      }
      // Preserve saved setlist order; enrich with full repertoire data when available
      const repertoireMap = new Map(REPERTOIRE.map((s) => [s.id, s]));
      const setlist = parsed.setlist.map((s) => {
        const full = repertoireMap.get(s.id);
        return full ? { ...full } : s;
      });
      return {
        ...parsed,
        setlist,
      };
    }
  } catch {
    // Ignore errors
  }
  return {
    currentSong: null,
    setlist: REPERTOIRE,
    lastUpdate: Date.now(),
  };
};

const saveState = (state: BandState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

interface BandProviderProps {
  children: ReactNode;
  authRole: BandRole;
}

export const BandProvider = memo(function BandProvider({ children, authRole }: BandProviderProps) {
  const [state, setState] = useState<BandState>(loadState);
  const [isSinger, setIsSinger] = useState(() => {
    if (authRole === "member") return false;
    return true; // Singer always starts with singer view on each login
  });
  const [hasUpdate, setHasUpdate] = useState(false);

  const { sendUpdate, isConnected, isOffline } = useBandWebSocket({ authRole, state, setState, setHasUpdate });

  useEffect(() => {
    if (authRole === "singer") {
      localStorage.setItem("band-app-role", isSinger ? "singer" : "member");
    }
  }, [authRole, isSinger]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveState(state);
      saveTimeoutRef.current = null;
    }, 400);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state]);

  useEffect(() => {
    if (import.meta.env.VITE_WS_URL) return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newState = JSON.parse(e.newValue);
        if (newState.lastUpdate > state.lastUpdate) {
          setState(newState);
          setHasUpdate(true);
          setTimeout(() => setHasUpdate(false), 2500);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [state.lastUpdate]);

  useEffect(() => {
    if (import.meta.env.VITE_WS_URL) return;
    const interval = setInterval(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const newState = JSON.parse(saved) as BandState;
          if (newState.lastUpdate > state.lastUpdate) {
            setState(newState);
            setHasUpdate(true);
            setTimeout(() => setHasUpdate(false), 2500);
          }
        } catch {
          /* ignore */
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [state.lastUpdate]);

  const setCurrentSong = useCallback(
    (song: Song | null) => {
      if (authRole !== "singer") return;
      const now = Date.now();
      setState((prev) => {
        const next = { ...prev, currentSong: song, lastUpdate: now };
        sendUpdate(next);
        return next;
      });
    },
    [authRole, sendUpdate]
  );

  const addSong = useCallback(
    (song: Omit<Song, "id">) => {
      if (authRole !== "singer") return;
      const newSong: Song = { ...song, id: crypto.randomUUID() };
      const now = Date.now();
      setState((prev) => {
        const next = {
          ...prev,
          setlist: [...prev.setlist, newSong],
          lastUpdate: now,
        };
        sendUpdate(next);
        return next;
      });
    },
    [authRole, sendUpdate]
  );

  const removeSong = useCallback(
    (id: string) => {
      if (authRole !== "singer") return;
      const now = Date.now();
      setState((prev) => {
        const next = {
          ...prev,
          setlist: prev.setlist.filter((s) => s.id !== id),
          currentSong: prev.currentSong?.id === id ? null : prev.currentSong,
          lastUpdate: now,
        };
        sendUpdate(next);
        return next;
      });
    },
    [authRole, sendUpdate]
  );

  const reorderSetlistWithSuggestions = useCallback(
    (suggestedIds: string[], currentSongOverride?: Song) => {
      if (authRole !== "singer" || suggestedIds.length === 0) return;
      const now = Date.now();
      setState((prev) => {
        const { setlist, currentSong } = prev;
        const effectiveCurrent = currentSongOverride ?? currentSong;
        if (!effectiveCurrent) return prev;
        const currentIndex = setlist.findIndex((s) => s.id === effectiveCurrent.id);
        if (currentIndex < 0) return prev;

        const suggestedSet = new Set(suggestedIds.map((id) => String(id)));
        const suggestedSongs = suggestedIds
          .map((id) => setlist.find((s) => String(s.id) === String(id)))
          .filter((s): s is Song => !!s && s.id !== effectiveCurrent.id);

        const before = setlist.slice(0, currentIndex).filter((s) => !suggestedSet.has(String(s.id)));
        const after = setlist.slice(currentIndex + 1).filter((s) => !suggestedSet.has(String(s.id)));

        const newSetlist = [...before, effectiveCurrent, ...suggestedSongs, ...after];
        const next = { ...prev, setlist: newSetlist, lastUpdate: now };
        sendUpdate(next);
        return next;
      });
    },
    [authRole, sendUpdate]
  );

  const setIsSingerSafe = useCallback(
    (value: boolean) => {
      if (authRole === "singer") setIsSinger(value);
    },
    [authRole]
  );

  const contextValue = useMemo<BandContextType>(
    () => ({
      state,
      isSinger: authRole === "member" ? false : isSinger,
      setIsSinger: setIsSingerSafe,
      setCurrentSong,
      addSong,
      removeSong,
      reorderSetlistWithSuggestions,
      hasUpdate,
      isConnected,
      isOffline,
    }),
    [
      state,
      authRole,
      isSinger,
      setIsSingerSafe,
      setCurrentSong,
      addSong,
      removeSong,
      reorderSetlistWithSuggestions,
      hasUpdate,
      isConnected,
      isOffline,
    ]
  );

  const stateContextValue = useMemo(
    () => ({ state, setCurrentSong, addSong, removeSong, reorderSetlistWithSuggestions }),
    [state, setCurrentSong, addSong, removeSong, reorderSetlistWithSuggestions]
  );

  const uiContextValue = useMemo(
    () => ({
      isSinger: authRole === "member" ? false : isSinger,
      setIsSinger: setIsSingerSafe,
      hasUpdate,
      isConnected,
      isOffline,
    }),
    [authRole, isSinger, setIsSingerSafe, hasUpdate, isConnected, isOffline]
  );

  return (
    <BandContext.Provider value={contextValue}>
      <BandStateContext.Provider value={stateContextValue}>
        <BandUIContext.Provider value={uiContextValue}>{children}</BandUIContext.Provider>
      </BandStateContext.Provider>
    </BandContext.Provider>
  );
});
