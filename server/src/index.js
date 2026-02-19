import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const MOCK_SONGS = [
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

const mockIds = new Set(MOCK_SONGS.map((s) => s.id));

let state = {
  currentSong: null,
  setlist: [...MOCK_SONGS],
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

      if (payload.currentSong !== undefined) {
        next.currentSong = payload.currentSong;
      }
      if (Array.isArray(payload.setlist)) {
        const userAdded = payload.setlist.filter((s) => !mockIds.has(s.id));
        next.setlist = [...MOCK_SONGS, ...userAdded];
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

server.listen(PORT, () => {
  console.log(`Band app server: http://localhost:${PORT} | ws://localhost:${PORT}/ws`);
});
