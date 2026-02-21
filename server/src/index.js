import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../../.env") });

import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const SONGS_PATH = join(__dirname, "../data/songs.json");
const REPERTOIRE = JSON.parse(readFileSync(SONGS_PATH, "utf-8"));
const repertoireIds = new Set(REPERTOIRE.map((s) => s.id));

let state = {
  currentSong: null,
  setlist: [...REPERTOIRE],
  lastUpdate: Date.now(),
};

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const server = createServer(app);

const wss = new WebSocketServer({ server, path: "/ws" });

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg);
  });
}

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "state", payload: state }));

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type !== "update" || msg.role !== "singer") return;

      const payload = msg.payload;
      if (!payload || typeof payload !== "object") return;

      const now = Date.now();
      const next = { ...state, lastUpdate: now };
      const repertoireMap = new Map(REPERTOIRE.map((s) => [String(s.id), s]));

      if (payload.currentSong !== undefined) {
        const cs = payload.currentSong;
        if (cs && typeof cs === "object" && cs.id != null) {
          const fromRep = repertoireMap.get(String(cs.id));
          next.currentSong = fromRep ? { ...fromRep } : { ...cs };
        } else {
          next.currentSong = cs;
        }
      }
      if (Array.isArray(payload.setlist)) {
        next.setlist = payload.setlist.map((s) => {
          const id = s && typeof s === "object" ? String(s.id) : null;
          const fromRep = id ? repertoireMap.get(id) : null;
          return fromRep ? { ...fromRep } : s;
        });
      }

      state = next;
      broadcast({ type: "state", payload: state });
    } catch {
      // ignore invalid messages
    }
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, clients: wss.clients.size });
});

app.get("/api/state", (req, res) => {
  res.json(state);
});

console.log("[AI] Rule-based song suggestions enabled");

// Circle of fifths (clockwise = dominant direction)
const CIRCLE_OF_FIFTHS = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];
const RELATIVE_PAIRS = [
  ["C", "Am"], ["G", "Em"], ["D", "Bm"], ["A", "F#m"], ["E", "C#m"], ["B", "G#m"],
  ["F#", "D#m"], ["Db", "Bbm"], ["Ab", "Fm"], ["Eb", "Cm"], ["Bb", "Gm"], ["F", "Dm"],
];
const RELATIVE_MAP = new Map();
RELATIVE_PAIRS.forEach(([maj, min]) => {
  RELATIVE_MAP.set(maj, min);
  RELATIVE_MAP.set(min, maj);
});

function parseKey(k) {
  if (!k || typeof k !== "string") return null;
  const s = k.trim();
  const isMinor = s.endsWith("m") || s.toLowerCase().endsWith("min");
  const base = s.replace(/m$|min$/i, "").replace("sharp", "#").replace("flat", "b").trim();
  const root = base.charAt(0).toUpperCase() + (base.slice(1) || "");
  return { root, isMinor, raw: s };
}

function keyIndex(root) {
  const i = CIRCLE_OF_FIFTHS.findIndex((x) => root.startsWith(x) || x.startsWith(root));
  return i >= 0 ? i : CIRCLE_OF_FIFTHS.indexOf(root.charAt(0));
}

function keyDistance(key1, key2) {
  const k1 = parseKey(key1);
  const k2 = parseKey(key2);
  if (!k1 || !k2) return 99;
  const i1 = keyIndex(k1.root);
  const i2 = keyIndex(k2.root);
  if (i1 < 0 || i2 < 0) return 99;
  return Math.min(Math.abs(i1 - i2), CIRCLE_OF_FIFTHS.length - Math.abs(i1 - i2));
}

function normalizeKeyForMatch(k) {
  if (!k) return null;
  const p = parseKey(k);
  if (!p) return null;
  const alt = { "F#": "Gb", Gb: "F#", "C#": "Db", Db: "C#", "D#": "Eb", "G#": "Ab", "A#": "Bb" };
  const root = alt[p.root] || p.root;
  return p.isMinor ? root + "m" : root;
}

function keyCompatibilityScore(currentKey, candidateKey) {
  if (!currentKey || !candidateKey) return 0;
  const cNorm = normalizeKeyForMatch(currentKey);
  const sNorm = normalizeKeyForMatch(candidateKey);
  if (!cNorm || !sNorm) return 0;
  if (cNorm === sNorm) return 18; // Same key — strongest
  const cRel = RELATIVE_MAP.get(cNorm) || RELATIVE_MAP.get(cNorm.replace("m", ""));
  const sRel = RELATIVE_MAP.get(sNorm) || RELATIVE_MAP.get(sNorm.replace("m", ""));
  if (cNorm === sRel || sNorm === cRel) return 14; // Relative (Am–C)
  const cRoot = cNorm.replace("m", "");
  const sRoot = sNorm.replace("m", "");
  if (cRoot === sRoot) return 10; // Parallel (C vs Cm)
  const dist = keyDistance(currentKey, candidateKey);
  if (dist === 1) return 12; // Circle of fifths adjacent (V–I, IV–I)
  if (dist === 2) return 7;
  if (dist <= 3) return 4;
  return Math.max(0, 3 - dist);
}

function normalizeTempo(t) {
  if (!t) return "Medium";
  const s = String(t).trim();
  if (/^slow$/i.test(s)) return "Slow";
  if (/^fast$/i.test(s)) return "Fast";
  return "Medium";
}

function tempoScore(current, candidate) {
  const order = { Slow: 0, Medium: 1, Fast: 2 };
  const c = normalizeTempo(current?.tempo);
  const s = normalizeTempo(candidate?.tempo);
  const diff = Math.abs(order[c] - order[s]);
  if (diff === 0) return 10; // Same tempo
  if (diff === 1) return 6;  // Adjacent — smooth
  return 0;                  // Slow→Fast or vice versa — jarring
}

function bpmScore(current, candidate) {
  const b1 = current?.bpm ?? 100;
  const b2 = candidate?.bpm ?? 100;
  const diff = Math.abs(b1 - b2);
  if (diff <= 8) return 8;   // Same groove
  if (diff <= 18) return 6;
  if (diff <= 35) return 4;
  if (diff <= 55) return 2;
  return 0;
}

function artistDiversityScore(artist, pickedArtists, lastArtist) {
  if (!artist) return 0;
  const a = artist.toLowerCase();
  const count = pickedArtists.filter((x) => x && x.toLowerCase() === a).length;
  let score = 0;
  if (count === 0) score += 4;           // New artist — strong bonus
  else if (count === 1) score += 0;
  else score -= 6;                       // Same artist 3+ times — strong penalty
  if (lastArtist && lastArtist.toLowerCase() === a) score -= 5; // Back-to-back same artist
  return score;
}

function energyFlowScore(context, candidate, positionInSequence) {
  const order = { Slow: 0, Medium: 1, Fast: 2 };
  const ctxVal = order[normalizeTempo(context?.tempo)] ?? 1;
  const songVal = order[normalizeTempo(candidate?.tempo)] ?? 1;
  const diff = songVal - ctxVal;
  if (diff === 0) return 4;              // Same energy
  if (diff === 1) return 5;              // Build energy (+1)
  if (diff === -1 && positionInSequence >= 2) return 2; // Cool-down after peak
  if (diff === -1) return 0;              // Early drop
  return -2;                              // Big jump or drop
}

// Genre/style inferred from artist (rock, pop, blues, etc.) for flow compatibility
const ARTIST_STYLE = new Map([
  ["Eagles", "rock"], ["Guns N' Roses", "rock"], ["Queen", "rock"], ["Pink Floyd", "rock"],
  ["Led Zeppelin", "rock"], ["AC/DC", "rock"], ["Metallica", "rock"], ["Nirvana", "rock"],
  ["The Beatles", "rock"], ["The Rolling Stones", "rock"], ["The Who", "rock"],
  ["Aerosmith", "rock"], ["Bon Jovi", "rock"], ["Journey", "rock"], ["Def Leppard", "rock"],
  ["Foreigner", "rock"], ["Scorpions", "rock"], ["Heart", "rock"], ["Boston", "rock"],
  ["Kansas", "rock"], ["Yes", "rock"], ["Survivor", "rock"], ["Europe", "rock"],
  ["Eric Clapton", "blues"], ["Stevie Ray Vaughan", "blues"], ["Jimi Hendrix", "blues"],
  ["Cream", "blues"], ["Blues Brothers", "blues"], ["Wilson Pickett", "blues"],
  ["Coldplay", "pop"], ["Ed Sheeran", "pop"], ["Adele", "pop"], ["Bruno Mars", "pop"],
  ["The Weeknd", "pop"], ["OneRepublic", "pop"], ["Lady Gaga", "pop"], ["Billie Eilish", "pop"],
  ["Marshmello", "pop"], ["Don McLean", "folk"], ["Bob Dylan", "folk"], ["Leonard Cohen", "folk"],
]);

function styleCompatibilityScore(currentArtist, candidateArtist) {
  if (!currentArtist || !candidateArtist) return 0;
  const s1 = ARTIST_STYLE.get(currentArtist) || "rock";
  const s2 = ARTIST_STYLE.get(candidateArtist) || "rock";
  if (s1 === s2) return 5;
  if ((s1 === "blues" && s2 === "rock") || (s1 === "rock" && s2 === "blues")) return 3;
  return 0;
}

const BALKAN_GENRES = ["EX-YU", "Makedonski"];

function isBalkan(song) {
  const g = song?.genre;
  if (!g || typeof g !== "string") return false;
  return BALKAN_GENRES.some((b) => g.trim().toLowerCase() === b.toLowerCase());
}

function languageRegionScore(currentSong, candidate) {
  const currentBalkan = isBalkan(currentSong);
  const candidateBalkan = isBalkan(candidate);
  if (currentBalkan && candidateBalkan) return 15; // Balkan → Balkan
  if (!currentBalkan && !candidateBalkan) return 15; // English → English
  return -12; // Cross-over penalty
}

function ruleBasedSuggestions(currentSong, setlist, count = 3) {
  const currentId = currentSong?.id;
  if (!currentId) return [];
  let candidates = setlist.filter((s) => s.id !== currentId);
  if (candidates.length === 0) return [];

  const result = [];
  let context = currentSong;
  const pickedArtists = [];
  let lastArtist = currentSong?.artist;

  for (let i = 0; i < count && candidates.length > 0; i++) {
    const available = candidates.filter((s) => !result.includes(s.id));

    const scored = available.map((song) => {
      let score = 0;
      score += languageRegionScore(context, song);             // English→English, Balkan→Balkan
      score += keyCompatibilityScore(context?.key, song.key);  // Key compatibility
      score += tempoScore(context, song);                      // Tempo match
      score += bpmScore(context, song);                        // BPM/groove
      score += artistDiversityScore(song.artist, pickedArtists, lastArtist);
      score += energyFlowScore(context, song, i);              // Energy flow
      score += styleCompatibilityScore(context?.artist, song.artist);  // Genre/style

      return { song, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0]?.song;
    if (!best) break;

    result.push(best.id);
    context = best;
    pickedArtists.push(best.artist);
    lastArtist = best.artist;
    candidates = candidates.filter((s) => s.id !== best.id);
  }

  return result;
}

app.post("/api/ai-suggestions", (req, res) => {
  try {
    const { currentSongId, setlist } = req.body;
    if (!currentSongId || !Array.isArray(setlist) || setlist.length < 4) {
      return res.status(400).json({ error: "Need currentSongId and setlist with at least 4 songs" });
    }
    const currentSong = setlist.find((s) => s.id === currentSongId);
    if (!currentSong) {
      return res.status(400).json({ error: "Current song not found in setlist" });
    }
    const suggestedIds = ruleBasedSuggestions(currentSong, setlist, 3);
    return res.json({ suggestedIds });
  } catch (err) {
    console.error("ai-suggestions error:", err.message || err);
    return res.status(500).json({ error: "Failed to get suggestions" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Band app server: http://localhost:${PORT} | ws://localhost:${PORT}/ws (also reachable on LAN)`);
});
