import { useEffect, useRef, useCallback, useState } from "react";
import type { BandState, Song } from "@/context/BandContext";
import REPERTOIRE_SONGS from "@band-songs";
import { ENV } from "@/lib/env";

const REPERTOIRE = REPERTOIRE_SONGS as Song[];
const REPERTOIRE_MAP = new Map(REPERTOIRE.map((s) => [s.id, s]));

/** Strip lyrics to reduce payload (~80% smaller) */
function stripLyrics(s: Song): Song {
  if (!s) return s;
  const { lyrics: _l, ...rest } = s;
  return rest as Song;
}

function stripStateForSync(st: BandState): BandState {
  return {
    ...st,
    currentSong: st.currentSong ? stripLyrics(st.currentSong) : st.currentSong,
    setlist: st.setlist.map(stripLyrics),
  };
}

/** Build delta payload for minimal upload (~200B vs ~45KB for song change) */
function buildDeltaPayload(prev: BandState, next: BandState): { currentSong?: Song | null; setlistIds?: string[]; lastUpdate: number } {
  const delta: { currentSong?: Song | null; setlistIds?: string[]; lastUpdate: number } = {
    lastUpdate: next.lastUpdate,
  };
  const currentId = (s: Song | null) => (s?.id ? String(s.id) : null);
  if (currentId(next.currentSong) !== currentId(prev.currentSong)) {
    delta.currentSong = next.currentSong ? stripLyrics(next.currentSong) : null;
  }
  const prevIds = (prev.setlist || []).map((s) => String(s.id)).join(",");
  const nextIds = (next.setlist || []).map((s) => String(s.id)).join(",");
  if (nextIds !== prevIds) {
    delta.setlistIds = (next.setlist || []).map((s) => s.id);
  }
  return delta;
}

/** Enrich received state with lyrics from local repertoire */
function enrichWithLyrics(st: BandState): BandState {
  return {
    ...st,
    currentSong: st.currentSong
      ? (REPERTOIRE_MAP.get(st.currentSong.id) ?? st.currentSong)
      : null,
    setlist: st.setlist.map((s) => REPERTOIRE_MAP.get(s.id) ?? s),
  };
}

/** Apply delta to state and enrich with lyrics */
function applyDelta(prev: BandState, delta: DeltaPayload): BandState {
  let next: BandState = { ...prev };
  if (delta.lastUpdate !== undefined && delta.lastUpdate >= prev.lastUpdate) {
    next.lastUpdate = delta.lastUpdate;
  }
  if (delta.currentSong !== undefined) {
    const full = delta.currentSong
      ? (REPERTOIRE_MAP.get(delta.currentSong.id) ?? delta.currentSong)
      : null;
    next.currentSong = full;
  }
  if (delta.setlistIds !== undefined) {
    next.setlist = delta.setlistIds
      .map((id) => REPERTOIRE_MAP.get(String(id)) ?? prev.setlist.find((s) => String(s.id) === String(id)))
      .filter((s): s is Song => !!s);
    if (delta.currentSong === undefined && prev.currentSong) {
      const found = next.setlist.find((s) => String(s.id) === String(prev.currentSong!.id));
      if (found) next.currentSong = found;
    }
  }
  return next;
}

const rawWsUrl = ENV.wsUrl;

// Resolve WebSocket URL for all devices and networks:
// - Explicit VITE_WS_URL: use it (replace localhost with current hostname for LAN)
// - No env + production (port 80/443): same-origin fallback for reverse-proxy deployments
function getWsUrl(): string | undefined {
  if (typeof window === "undefined") return rawWsUrl;
  if (rawWsUrl) {
    return /localhost|127\.0\.0\.1/.test(rawWsUrl)
      ? rawWsUrl.replace(/localhost|127\.0\.0\.1/g, window.location.hostname)
      : rawWsUrl;
  }
  const port = window.location.port;
  const isProdPort = !port || port === "80" || port === "443";
  if (!isProdPort) return undefined; // Dev (e.g. :8080): backend on different port, need VITE_WS_URL
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

const WS_URL = typeof window !== "undefined" ? getWsUrl() : rawWsUrl;

type DeltaPayload = { currentSong?: Song | null; setlistIds?: string[]; lastUpdate: number };
type Message =
  | { type: "state"; payload: BandState }
  | { type: "delta"; payload: DeltaPayload }
  | { type: "update"; role: string; payload: BandState };

interface UseBandWebSocketArgs {
  authRole: "singer" | "member";
  state: BandState;
  setState: React.Dispatch<React.SetStateAction<BandState>>;
  setHasUpdate: (v: boolean) => void;
}

const RECONNECT_FAST_MS = 3000;
const RECONNECT_SLOW_MS = 15000;
const OFFLINE_AFTER_FAILURES = 3;

export function useBandWebSocket({ authRole, state: _state, setState, setHasUpdate }: UseBandWebSocketArgs) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setStateRef = useRef<React.Dispatch<React.SetStateAction<BandState>>>(() => {});
  const setHasUpdateRef = useRef<(v: boolean) => void>(() => {});
  const stateRef = useRef<BandState>(_state);
  const failCountRef = useRef(0);
  setStateRef.current = setState;
  setHasUpdateRef.current = typeof setHasUpdate === "function" ? setHasUpdate : () => {};
  stateRef.current = _state;
  const [isConnected, setIsConnected] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const sendUpdate = useCallback(
    (next: BandState, prev?: BandState) => {
      if (authRole !== "singer" || !WS_URL) return;
      const ws = wsRef.current;
      if (ws?.readyState !== WebSocket.OPEN) return;
      const payload = prev ? buildDeltaPayload(prev, next) : stripStateForSync(next);
      ws.send(JSON.stringify({ type: "update", role: "singer", payload }));
    },
    [authRole]
  );

  useEffect(() => {
    if (!WS_URL) return;

    const connect = () => {
      try {
        const url = WS_URL.replace(/^http/, "ws");
        const ws = new WebSocket(url.endsWith("/ws") ? url : `${url}/ws`);
        wsRef.current = ws;

        ws.onopen = () => {
          failCountRef.current = 0;
          setIsOffline(false);
          setIsConnected(true);
          // Singer: push full state on connect (new clients need complete state)
          if (authRole === "singer") {
            sendUpdate(stateRef.current);
          }
        };

        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data) as Message;
            if (msg.type === "state" && msg.payload) {
              const enriched = enrichWithLyrics(msg.payload as BandState);
              setStateRef.current((prev) => {
                if (enriched.lastUpdate >= prev.lastUpdate) {
                  setHasUpdateRef.current(true);
                  setTimeout(() => setHasUpdateRef.current(false), 2500);
                  const currentSong = enriched.currentSong ?? prev.currentSong;
                  const currentSongStartTime =
                    enriched.currentSongStartTime ??
                    (currentSong?.id === prev.currentSong?.id ? prev.currentSongStartTime : currentSong ? Date.now() : null);
                  return { ...enriched, currentSong, currentSongStartTime };
                }
                return prev;
              });
            } else if (msg.type === "delta" && msg.payload) {
              const delta = msg.payload as DeltaPayload;
              setStateRef.current((prev) => {
                if (delta.lastUpdate >= prev.lastUpdate) {
                  setHasUpdateRef.current(true);
                  setTimeout(() => setHasUpdateRef.current(false), 2500);
                  const next = applyDelta(prev, delta);
                  const currentSongStartTime =
                    next.currentSong?.id === prev.currentSong?.id
                      ? prev.currentSongStartTime
                      : next.currentSong
                        ? Date.now()
                        : null;
                  const merged = { ...next, currentSongStartTime };
                  if (authRole === "singer" && !merged.currentSong && prev.currentSong && delta.setlistIds?.some((id) => String(id) === String(prev.currentSong!.id))) {
                    const found = merged.setlist.find((s) => String(s.id) === String(prev.currentSong!.id));
                    return found ? { ...merged, currentSong: found } : merged;
                  }
                  return merged;
                }
                return prev;
              });
            }
          } catch {
            // ignore
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          wsRef.current = null;
          failCountRef.current += 1;
          if (failCountRef.current >= OFFLINE_AFTER_FAILURES) {
            setIsOffline(true);
          }
          const delay = failCountRef.current >= OFFLINE_AFTER_FAILURES ? RECONNECT_SLOW_MS : RECONNECT_FAST_MS;
          reconnectRef.current = setTimeout(connect, delay);
        };

        ws.onerror = () => ws.close();
      } catch {
        reconnectRef.current = setTimeout(connect, 3000);
      }
    };

    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [WS_URL, authRole, sendUpdate]);

  return { sendUpdate, isConnected, isOffline };
}

export const hasWebSocket = () => !!WS_URL;
