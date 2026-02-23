import { useEffect, useRef, useCallback, useState } from "react";
import type { BandState, Song } from "@/context/BandContext";
import REPERTOIRE_SONGS from "@band-songs";

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

const rawWsUrl = import.meta.env.VITE_WS_URL as string | undefined;

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

type Message = { type: "state"; payload: BandState } | { type: "update"; role: string; payload: BandState };

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
    (payload: BandState) => {
      if (authRole !== "singer" || !WS_URL) return;
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "update", role: "singer", payload: stripStateForSync(payload) }));
      }
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
          // Singer: push current state so server has it; new devices get correct state on connect
          if (authRole === "singer") {
            ws.send(JSON.stringify({ type: "update", role: "singer", payload: stripStateForSync(stateRef.current) }));
          }
        };

        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data) as Message;
            if (msg.type === "state" && msg.payload) {
              const remote = msg.payload as BandState;
              const enriched = enrichWithLyrics(remote);
              setStateRef.current((prev) => {
                if (enriched.lastUpdate >= prev.lastUpdate) {
                  setHasUpdateRef.current(true);
                  setTimeout(() => setHasUpdateRef.current(false), 2500);
                  return enriched;
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
  }, [WS_URL, authRole]);

  return { sendUpdate, isConnected, isOffline };
}

export const hasWebSocket = () => !!WS_URL;
