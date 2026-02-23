import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, memo, type ReactNode } from "react";
import type { BandRole } from "@/components/PinGate";
import { hasWebSocket, useBandWebSocket } from "@/hooks/useBandWebSocket";
import REPERTOIRE_SONGS from "@band-songs";

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
const CURRENT_SONG_ID_KEY = "band-app-current-song-id";
const idEq = (a?: { id: string } | null, b?: { id: string } | null) =>
  String(a?.id) === String(b?.id);

function restoreCurrentSongFromStorage(setlist: Song[], currentSong: Song | null): Song | null {
  if (currentSong) return currentSong;
  try {
    const savedId = localStorage.getItem(CURRENT_SONG_ID_KEY);
    if (!savedId) return null;
    return setlist.find((s) => String(s.id) === String(savedId)) ?? null;
  } catch {
    return null;
  }
}

/** Deduplicate setlist by title+artist (keep first occurrence). Used for all state sources. */
export function deduplicateSetlist(state: BandState): BandState {
  const keyToFirstId = new Map<string, string>();
  const setlist = state.setlist.filter((s) => {
    const key = `${(s.title || "").toLowerCase()}|${(s.artist || "").toLowerCase()}`;
    if (keyToFirstId.has(key)) return false;
    keyToFirstId.set(key, s.id);
    return true;
  });

  // Always enforce currentSong invariant, even when no dedup happened.
  if (setlist.length === state.setlist.length) {
    const restored = restoreCurrentSongFromStorage(setlist, state.currentSong);
    if (restored && !idEq(restored, state.currentSong)) {
      return { ...state, currentSong: restored };
    }
    return state;
  }
  let currentSong = state.currentSong;
  if (currentSong && !setlist.some((s) => idEq(s, currentSong))) {
    const key = `${(currentSong.title || "").toLowerCase()}|${(currentSong.artist || "").toLowerCase()}`;
    const firstId = keyToFirstId.get(key);
    currentSong = firstId ? setlist.find((s) => String(s.id) === String(firstId)) ?? null : null;
  }
  currentSong = restoreCurrentSongFromStorage(setlist, currentSong);
  return { ...state, setlist, currentSong: currentSong ?? state.currentSong };
}

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
      let setlist: Song[];
      let currentSong: Song | null = parsed.currentSong ?? null;

      if (parsed.setlist.length < REPERTOIRE.length) {
        setlist = [...REPERTOIRE];
      } else {
        const repertoireMap = new Map(REPERTOIRE.map((s) => [s.id, s]));
        setlist = parsed.setlist.map((s) => {
          const full = repertoireMap.get(s.id);
          return full ? { ...full } : s;
        });
      }

      // Resolve currentSong from setlist; fallback to CURRENT_SONG_ID_KEY (saved immediately on select)
      if (currentSong) {
        const found = setlist.find((s) => s.id === currentSong!.id);
        currentSong = found ?? null;
      }
      if (!currentSong) {
        const savedId = localStorage.getItem(CURRENT_SONG_ID_KEY);
        if (savedId) {
          const found = setlist.find((s) => s.id === savedId);
          currentSong = found ?? null;
        }
      }

      if (parsed.setlist.length < REPERTOIRE.length) {
        return {
          currentSong,
          setlist,
          lastUpdate: Date.now(),
        };
      }
      return deduplicateSetlist({ ...parsed, setlist, currentSong });
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
  try {
    if (state.currentSong) {
      localStorage.setItem(CURRENT_SONG_ID_KEY, state.currentSong.id);
    } else {
      localStorage.removeItem(CURRENT_SONG_ID_KEY);
    }
  } catch {
    /* ignore */
  }
};

interface BandProviderProps {
  children: ReactNode;
  authRole: BandRole;
}

export const BandProvider = memo(function BandProvider({ children, authRole }: BandProviderProps) {
  const [state, setStateRaw] = useState<BandState>(loadState);
  const setState = useCallback(
    (action: React.SetStateAction<BandState>) => {
      setStateRaw((prev) => deduplicateSetlist(typeof action === "function" ? action(prev) : action));
    },
    []
  );
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
    if (hasWebSocket()) return;
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
    if (hasWebSocket()) return;
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

  // Safety net: if currentSong is dropped by an external sync race, restore it from persisted selection.
  useEffect(() => {
    if (state.currentSong) return;
    try {
      const savedId = localStorage.getItem(CURRENT_SONG_ID_KEY);
      if (!savedId) return;
      const found = state.setlist.find((s) => String(s.id) === String(savedId));
      if (found) {
        const now = Date.now();
        setState((prev) => ({ ...prev, currentSong: found, lastUpdate: now }));
      } else {
        localStorage.removeItem(CURRENT_SONG_ID_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [state.currentSong, state.setlist, setState]);

  const setCurrentSong = useCallback(
    (song: Song | null) => {
      if (authRole !== "singer") return;
      try {
        if (song) {
          localStorage.setItem(CURRENT_SONG_ID_KEY, song.id);
        } else {
          localStorage.removeItem(CURRENT_SONG_ID_KEY);
        }
      } catch {
        /* ignore */
      }
      const now = Date.now();
      setState((prev) => {
        const next = { ...prev, currentSong: song, lastUpdate: now };
        sendUpdate(next, prev);
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
        sendUpdate(next, prev);
        return next;
      });
    },
    [authRole, sendUpdate]
  );

  const removeSong = useCallback(
    (id: string) => {
      if (authRole !== "singer") return;
      setState((prev) => {
        const clearingCurrent = prev.currentSong?.id === id;
        if (clearingCurrent) {
          try {
            localStorage.removeItem(CURRENT_SONG_ID_KEY);
          } catch {
            /* ignore */
          }
        }
        const now = Date.now();
        const next = {
          ...prev,
          setlist: prev.setlist.filter((s) => s.id !== id),
          currentSong: clearingCurrent ? null : prev.currentSong,
          lastUpdate: now,
        };
        sendUpdate(next, prev);
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
        const next = { ...prev, setlist: newSetlist, currentSong: effectiveCurrent, lastUpdate: now };
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
