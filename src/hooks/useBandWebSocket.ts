import { useEffect, useRef, useCallback, useState } from "react";
import type { BandState } from "@/context/BandContext";

const WS_URL = import.meta.env.VITE_WS_URL as string | undefined;

type Message = { type: "state"; payload: BandState } | { type: "update"; role: string; payload: BandState };

export function useBandWebSocket(
  authRole: "singer" | "member",
  state: BandState,
  setState: React.Dispatch<React.SetStateAction<BandState>>,
  setHasUpdate: (v: boolean) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const sendUpdate = useCallback(
    (payload: BandState) => {
      if (authRole !== "singer" || !WS_URL) return;
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "update", role: "singer", payload }));
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

        ws.onopen = () => setIsConnected(true);

        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data) as Message;
            if (msg.type === "state" && msg.payload) {
              const remote = msg.payload as BandState;
              setState((prev) => {
                if (remote.lastUpdate > prev.lastUpdate) {
                  setHasUpdate(true);
                  setTimeout(() => setHasUpdate(false), 2500);
                  return remote;
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
          reconnectRef.current = setTimeout(connect, 3000);
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
  }, [WS_URL, setState, setHasUpdate]);

  return { sendUpdate, isConnected };
}

export const hasWebSocket = () => !!WS_URL;
