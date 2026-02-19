import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { BandRole } from "@/components/PinGate";
import { useBandWebSocket } from "@/hooks/useBandWebSocket";

export interface Song {
  id: string;
  title: string;
  artist?: string;
  key?: string;
  bpm?: number;
  tempo?: string;
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
  hasUpdate: boolean;
}

const MOCK_SONGS: Song[] = [
  { id: "1", title: "Hotel California", artist: "Eagles", key: "Bm", bpm: 74, tempo: "Medium" },
  { id: "2", title: "Sweet Child O' Mine", artist: "Guns N' Roses", key: "D", bpm: 125, tempo: "Fast" },
  { id: "3", title: "Bohemian Rhapsody", artist: "Queen", key: "Bb", bpm: 72, tempo: "Medium" },
  { id: "4", title: "Comfortably Numb", artist: "Pink Floyd", key: "Bm", bpm: 63, tempo: "Slow" },
  { id: "5", title: "Stairway to Heaven", artist: "Led Zeppelin", key: "Am", bpm: 82, tempo: "Slow" },
  { id: "6", title: "November Rain", artist: "Guns N' Roses", key: "C", bpm: 80, tempo: "Slow" },
  { id: "7", title: "Purple Rain", artist: "Prince", key: "Bb", bpm: 113, tempo: "Medium" },
  { id: "8", title: "Free Bird", artist: "Lynyrd Skynyrd", key: "G", bpm: 60, tempo: "Slow" },
  { id: "9", title: "Back in Black", artist: "AC/DC", key: "E", bpm: 94, tempo: "Fast" },
  { id: "10", title: "Smoke on the Water", artist: "Deep Purple", key: "Gm", bpm: 112, tempo: "Medium" },
  { id: "11", title: "Highway to Hell", artist: "AC/DC", key: "A", bpm: 116, tempo: "Fast" },
  { id: "12", title: "Wonderwall", artist: "Oasis", key: "F#m", bpm: 87, tempo: "Medium" },
  { id: "13", title: "Livin' on a Prayer", artist: "Bon Jovi", key: "E", bpm: 122, tempo: "Fast" },
  { id: "14", title: "Don't Stop Believin'", artist: "Journey", key: "E", bpm: 118, tempo: "Medium" },
  { id: "15", title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd", key: "D", bpm: 95, tempo: "Medium" },
  { id: "16", title: "Born to Run", artist: "Bruce Springsteen", key: "E", bpm: 147, tempo: "Fast" },
  { id: "17", title: "Thunderstruck", artist: "AC/DC", key: "A", bpm: 133, tempo: "Fast" },
  { id: "18", title: "Enter Sandman", artist: "Metallica", key: "Em", bpm: 123, tempo: "Fast" },
  { id: "19", title: "Black", artist: "Pearl Jam", key: "Dm", bpm: 72, tempo: "Slow" },
  { id: "20", title: "Come Together", artist: "The Beatles", key: "E", bpm: 125, tempo: "Medium" },
  { id: "21", title: "Let It Be", artist: "The Beatles", key: "C", bpm: 72, tempo: "Slow" },
  { id: "22", title: "Hey Jude", artist: "The Beatles", key: "F", bpm: 72, tempo: "Slow" },
  { id: "23", title: "Imagine", artist: "John Lennon", key: "C", bpm: 76, tempo: "Slow" },
  { id: "24", title: "Knocking on Heaven's Door", artist: "Bob Dylan", key: "G", bpm: 72, tempo: "Slow" },
  { id: "25", title: "Layla", artist: "Eric Clapton", key: "Dm", bpm: 112, tempo: "Medium" },
  { id: "26", title: "Brown Eyed Girl", artist: "Van Morrison", key: "G", bpm: 148, tempo: "Fast" },
  { id: "27", title: "Take It Easy", artist: "Eagles", key: "G", bpm: 100, tempo: "Medium" },
  { id: "28", title: "Roxanne", artist: "The Police", key: "Am", bpm: 108, tempo: "Medium" },
  { id: "29", title: "Every Breath You Take", artist: "The Police", key: "Ab", bpm: 117, tempo: "Medium" },
  { id: "30", title: "With or Without You", artist: "U2", key: "D", bpm: 110, tempo: "Medium" },
  { id: "31", title: "One", artist: "U2", key: "Dm", bpm: 110, tempo: "Medium" },
  { id: "32", title: "Creep", artist: "Radiohead", key: "G", bpm: 92, tempo: "Medium" },
  { id: "33", title: "Yellow", artist: "Coldplay", key: "Bb", bpm: 87, tempo: "Medium" },
  { id: "34", title: "Fix You", artist: "Coldplay", key: "C", bpm: 68, tempo: "Slow" },
  { id: "35", title: "Champagne Supernova", artist: "Oasis", key: "E", bpm: 160, tempo: "Fast" },
  { id: "36", title: "Don't Look Back in Anger", artist: "Oasis", key: "C", bpm: 88, tempo: "Medium" },
  { id: "37", title: "Zombie", artist: "The Cranberries", key: "Em", bpm: 167, tempo: "Fast" },
  { id: "38", title: "Losing My Religion", artist: "R.E.M.", key: "Am", bpm: 127, tempo: "Medium" },
  { id: "39", title: "Under the Bridge", artist: "Red Hot Chili Peppers", key: "Am", bpm: 84, tempo: "Slow" },
  { id: "40", title: "Californication", artist: "Red Hot Chili Peppers", key: "Am", bpm: 95, tempo: "Medium" },
  { id: "41", title: "Smells Like Teen Spirit", artist: "Nirvana", key: "F", bpm: 117, tempo: "Fast" },
  { id: "42", title: "Nothing Else Matters", artist: "Metallica", key: "Em", bpm: 52, tempo: "Slow" },
  { id: "43", title: "Paradise City", artist: "Guns N' Roses", key: "G", bpm: 87, tempo: "Medium" },
  { id: "44", title: "Sweet Emotion", artist: "Aerosmith", key: "D", bpm: 112, tempo: "Medium" },
  { id: "45", title: "Dream On", artist: "Aerosmith", key: "Dm", bpm: 108, tempo: "Medium" },
  { id: "46", title: "Basket Case", artist: "Green Day", key: "Em", bpm: 189, tempo: "Fast" },
  { id: "47", title: "Good Riddance", artist: "Green Day", key: "G", bpm: 82, tempo: "Slow" },
  { id: "48", title: "Bitter Sweet Symphony", artist: "The Verve", key: "Cm", bpm: 108, tempo: "Medium" },
  { id: "49", title: "Mr. Brightside", artist: "The Killers", key: "F", bpm: 148, tempo: "Fast" },
  { id: "50", title: "Seven Nation Army", artist: "The White Stripes", key: "E", bpm: 123, tempo: "Medium" },
];

const STORAGE_KEY = "band-app-state";

const BandContext = createContext<BandContextType | null>(null);

export const useBandContext = () => {
  const context = useContext(BandContext);
  if (!context) {
    throw new Error("useBandContext must be used within BandProvider");
  }
  return context;
};

const loadState = (): BandState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as BandState;
      // Merge MOCK_SONGS with saved setlist: use all MOCK_SONGS, then append any user-added songs
      const mockIds = new Set(MOCK_SONGS.map((s) => s.id));
      const userAdded = parsed.setlist.filter((s) => !mockIds.has(s.id));
      const setlist = [...MOCK_SONGS, ...userAdded];
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
    setlist: MOCK_SONGS,
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

export const BandProvider = ({ children, authRole }: BandProviderProps) => {
  const [state, setState] = useState<BandState>(loadState);
  const [isSinger, setIsSinger] = useState(() => {
    if (authRole === "member") return false;
    return true; // Singer always starts with singer view on each login
  });
  const [hasUpdate, setHasUpdate] = useState(false);

  const { sendUpdate } = useBandWebSocket(authRole, state, setState, setHasUpdate);

  useEffect(() => {
    if (authRole === "singer") {
      localStorage.setItem("band-app-role", isSinger ? "singer" : "member");
    }
  }, [authRole, isSinger]);

  useEffect(() => {
    saveState(state);
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
        const newState = JSON.parse(saved);
        if (newState.lastUpdate > state.lastUpdate) {
          setState(newState);
          setHasUpdate(true);
          setTimeout(() => setHasUpdate(false), 2500);
        }
      }
    }, 300);

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

  const setIsSingerSafe = useCallback(
    (value: boolean) => {
      if (authRole === "singer") setIsSinger(value);
    },
    [authRole]
  );

  const contextValue: BandContextType = {
    state,
    isSinger: authRole === "member" ? false : isSinger,
    setIsSinger: setIsSingerSafe,
    setCurrentSong,
    addSong,
    removeSong,
    hasUpdate,
  };

  return <BandContext.Provider value={contextValue}>{children}</BandContext.Provider>;
};
