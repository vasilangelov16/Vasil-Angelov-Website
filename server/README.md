# Band App WebSocket Server

Express.js + WebSocket server for real-time setlist sync across devices.

## Quick Start

```bash
cd server
npm install
npm run dev
```

- HTTP: http://localhost:3001
- WebSocket: ws://localhost:3001/ws

## API

### WebSocket (`/ws`)

**On connect**: Server sends current state:
```json
{ "type": "state", "payload": { "currentSong": null, "setlist": [...], "lastUpdate": 1234567890 } }
```

**Singer update** (client → server):
```json
{ "type": "update", "role": "singer", "payload": { "currentSong": {...}, "setlist": [...], "lastUpdate": 1234567890 } }
```

Server broadcasts the new state to all connected clients.

### HTTP

- `GET /health` – `{ ok: true, clients: N }`
- `GET /api/state` – Current setlist state (JSON)

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `CORS_ORIGIN` | * | Allowed CORS origin |

## Deploy (Railway / Render / Fly.io)

Set `PORT` (usually auto-set). The WebSocket runs on the same server at path `/ws`.

Frontend: Set `VITE_WS_URL` to your deployed URL, e.g. `wss://your-app.railway.app`
