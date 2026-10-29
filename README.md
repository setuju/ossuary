# OSSUARY — The Last Packet

> Digital necromancy tool that summons the ghosts of dead domains and servers.

## Development

OSSUARY pairs a Vite frontend with serverless API functions located in `/api`. In local development, you can run both sides with a two-terminal workflow:

### Terminal 1: Serverless APIs (Port 3001)

```bash
vercel dev --listen 3001
```

### Terminal 2: Vite Frontend (Port 3000)

```bash
bun run dev
# or: npm run dev
```

The Vite dev server proxies `/api/*` calls directly to `http://localhost:3001`.

Alternatively, run everything through Vercel CLI directly:

```bash
vercel dev
```
