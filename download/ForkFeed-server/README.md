# ForkFeed — full stack (app + backend)

TikTok-style recipe app with an AI chef layer, plus a zero-dependency Node.js backend.
Accounts, recipes, likes, saves, follows, comments, meal plans and notifications are
stored server-side in SQLite. AI chat, YouTube search and link-extraction run through
the server so API keys never touch the browser.

## Requirements
- Node.js 22+ with `node:sqlite` (built and tested on Node 24)
- No npm install needed. No dependencies at all.

## Run it
```bash
cd ForkFeed-server
node server.js            # http://localhost:3000
# or a custom port:
PORT=8080 node server.js
```

Open http://localhost:3000 in a browser (phone or desktop). On first visit you get the
login/register screen — or continue as guest for local-only mode.

## Admin (API keys)
The server prints a random **admin token** in the console on first boot (also stored in
`data/config.json`). Use it to configure provider keys server-side:

```bash
TOKEN=<admin token from console>
curl -X POST http://localhost:3000/admin/keys \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"openrouter":"sk-or-v1-...", "youtube":"AIza...", "openai":"sk-...", "gemini":"AIza..."}'

curl http://localhost:3000/admin/stats -H "Authorization: Bearer $TOKEN"   # usage stats
curl -X POST http://localhost:3000/admin/seed -H "Authorization: Bearer $TOKEN"  # re-seed demo recipes
```

With server keys set, everyone using the app gets real AI replies (provider chosen in
the AI Chef ⚙️ settings), real YouTube search in the ▶️ feed, and real link extraction
in ✨ AI Search — without ever seeing the keys.

Ollama needs no key, just a running local Ollama: `ollama serve` + `ollama pull llama3.2`.

## API (quick reference)
- `GET  /api/health` — server info
- `POST /api/auth/register|login|logout` · `GET/PATCH /api/auth/me`
- `GET  /api/recipes` (+`?q=&cuisine=&sort=&mine=1`) · `GET/POST/DELETE /api/recipes/:id`
- `POST /api/recipes/:id/like|save|rate|comments`
- `POST /api/users/:handle/follow`
- `GET  /api/cookbook` · `GET /api/notifications` · `POST /api/notifications/read`
- `GET/PUT /api/mealplan`
- `POST /api/ai/chat` · `POST /api/ai/extract` · `GET /api/youtube/search?q=`

## Files
- `server.js` — HTTP server, router, SQLite, AI proxy, extractor, admin
- `seed.js` — 19 demo recipes (auto-seeds a fresh database)
- `public/ForkFeed.html` — the full app (same single file as the offline version)
- `data/forkfeed.db` — SQLite database (created at first boot)
- `data/config.json` — admin token + provider keys

## Data & privacy
Passwords are scrypt-hashed with per-user salts. Sessions are random 32-byte bearer
tokens (30-day expiry) stored in SQLite. Provider keys live only in `data/config.json`
on the machine running the server. Delete `data/forkfeed.db` to reset everything.
