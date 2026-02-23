import type { Song } from "@/context/BandContext";

const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const rawWsUrl = import.meta.env.VITE_WS_URL as string | undefined;

function getApiBase(): string | null {
  if (typeof window === "undefined") {
    return rawApiUrl ? rawApiUrl.replace(/\/$/, "") : null;
  }
  let base: string;
  if (rawApiUrl) {
    base = rawApiUrl.replace(/\/$/, "");
  } else if (rawWsUrl) {
    const protocol = rawWsUrl.startsWith("wss") ? "https" : "http";
    let host = rawWsUrl.replace(/^wss?:\/\//, "").replace(/\/ws\/?$/, "");
    if (/^localhost|127\.0\.0\.1/.test(host)) {
      const port = host.includes(":") ? host.split(":")[1] : "3001";
      host = `${window.location.hostname}:${port}`;
    }
    base = `${protocol}://${host}`;
  } else {
    // Same-origin fallback: only when on prod port (80/443), i.e. deployed with reverse proxy
    const port = window.location.port;
    const isProdPort = !port || port === "80" || port === "443";
    if (!isProdPort) return null; // Dev (e.g. :8080): API on different port, need VITE_WS_URL or VITE_API_URL
    base = window.location.origin;
  }
  // On LAN (e.g. phone), replace localhost with current hostname so we reach the dev machine
  if (/localhost|127\.0\.0\.1/.test(base)) {
    base = base.replace(/localhost|127\.0\.0\.1/g, window.location.hostname);
  }
  return base;
}

const API_BASE = getApiBase();

const FETCH_TIMEOUT_MS = 15_000;

export async function fetchAISuggestions(
  currentSongId: string,
  setlist: Song[]
): Promise<{ suggestedIds: string[] }> {
  const base = API_BASE;
  if (!base) throw new Error("AI API URL not configured (set VITE_WS_URL or VITE_API_URL)");
  const url = `${base}/api/ai-suggestions`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentSongId, setlistIds: setlist.map((s) => s.id) }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to get suggestions (${res.status})`);
    }
    return res.json();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out. Check your connection.");
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (err instanceof TypeError || /fetch|load failed|network|failed to load/i.test(msg)) {
      throw new Error(
        "Cannot reach server. Start it with: cd server && npm run dev"
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const hasAIApi = () =>
  !!API_BASE || !!rawApiUrl || !!rawWsUrl || (typeof window !== "undefined" && !!window.location?.origin);
