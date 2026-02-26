import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
  type ReactNode,
} from "react";
import type { Song } from "@/context/BandContext";

export interface Gig {
  id: string;
  title: string;
  date: string;
  venue?: string;
  notes?: string;
  history: GigHistoryEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface GigHistoryEntry {
  songId: string;
  songTitle: string;
  songArtist?: string;
  screensCount: number;
  addedAt: number;
}

const GIGS_STORAGE_KEY = "band-app-gigs";
const ACTIVE_GIG_KEY = "band-app-active-gig-id";
const SONG_DISPLAY_THRESHOLD_MS = 30_000;

function loadGigs(): Gig[] {
  try {
    const saved = localStorage.getItem(GIGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (g): g is Gig =>
          g &&
          typeof g === "object" &&
          typeof g.id === "string" &&
          typeof g.title === "string" &&
          typeof g.date === "string" &&
          Array.isArray(g.history)
      );
    }
  } catch {
    /* ignore */
  }
  return [];
}

function saveGigs(gigs: Gig[]) {
  try {
    localStorage.setItem(GIGS_STORAGE_KEY, JSON.stringify(gigs));
  } catch (e) {
    if (e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22)) {
      console.warn("[GigContext] Storage quota exceeded, gig data not persisted");
    }
  }
}

interface GigContextType {
  gigs: Gig[];
  activeGigId: string | null;
  setActiveGigId: (id: string | null) => void;
  createGig: (data: Omit<Gig, "id" | "history" | "createdAt" | "updatedAt">) => Gig;
  updateGig: (id: string, data: Partial<Omit<Gig, "id" | "history" | "createdAt">>) => void;
  deleteGig: (id: string) => void;
  recordSongPlayed: (song: Song, durationMs: number) => void;
}

const GigContext = createContext<GigContextType | null>(null);

export function useGigContext() {
  const ctx = useContext(GigContext);
  if (!ctx) throw new Error("useGigContext must be used within GigProvider");
  return ctx;
}

interface GigProviderProps {
  children: ReactNode;
  currentSong: Song | null;
  currentSongStartTime: number | null;
}

export const GigProvider = memo(function GigProvider({
  children,
  currentSong,
  currentSongStartTime,
}: GigProviderProps) {
  const [gigs, setGigs] = useState<Gig[]>(loadGigs);
  const [activeGigId, setActiveGigIdState] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_GIG_KEY);
      if (!saved) return null;
      const gigs = loadGigs();
      return gigs.some((g) => g.id === saved) ? saved : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (activeGigId) {
        localStorage.setItem(ACTIVE_GIG_KEY, activeGigId);
      } else {
        localStorage.removeItem(ACTIVE_GIG_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [activeGigId]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveGigs(gigs);
      saveTimeoutRef.current = null;
    }, 100);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [gigs]);

  const setActiveGigId = useCallback((id: string | null) => {
    setActiveGigIdState(id);
  }, []);

  const createGig = useCallback(
    (data: Omit<Gig, "id" | "history" | "createdAt" | "updatedAt">) => {
      const now = Date.now();
      const gig: Gig = {
        ...data,
        id: crypto.randomUUID(),
        history: [],
        createdAt: now,
        updatedAt: now,
      };
      setGigs((prev) => [...prev, gig].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      return gig;
    },
    []
  );

  const updateGig = useCallback((id: string, data: Partial<Omit<Gig, "id" | "history" | "createdAt">>) => {
    const now = Date.now();
    setGigs((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, ...data, updatedAt: now } : g
      )
    );
  }, []);

  const deleteGig = useCallback((id: string) => {
    setGigs((prev) => prev.filter((g) => g.id !== id));
    setActiveGigIdState((curr) => (curr === id ? null : curr));
  }, []);

  const recordSongPlayed = useCallback(
    (song: Song, durationMs: number) => {
      if (durationMs < SONG_DISPLAY_THRESHOLD_MS || !activeGigId) return;
      const screensCount = Math.floor(durationMs / SONG_DISPLAY_THRESHOLD_MS);
      if (screensCount < 1) return;

      setGigs((prev) =>
        prev.map((g) => {
          if (g.id !== activeGigId) return g;
          const existing = g.history.find((h) => h.songId === song.id);
          const entry: GigHistoryEntry = existing
            ? {
                ...existing,
                screensCount: existing.screensCount + screensCount,
                addedAt: Date.now(),
              }
            : {
                songId: song.id,
                songTitle: song.title,
                songArtist: song.artist,
                screensCount,
                addedAt: Date.now(),
              };
          const history = existing
            ? g.history.map((h) => (h.songId === song.id ? entry : h))
            : [...g.history, entry];
          return { ...g, history, updatedAt: Date.now() };
        })
      );
    },
    [activeGigId]
  );

  const value = useMemo<GigContextType>(
    () => ({
      gigs,
      activeGigId,
      setActiveGigId,
      createGig,
      updateGig,
      deleteGig,
      recordSongPlayed,
    }),
    [gigs, activeGigId, setActiveGigId, createGig, updateGig, deleteGig, recordSongPlayed]
  );

  return <GigContext.Provider value={value}>{children}</GigContext.Provider>;
});
