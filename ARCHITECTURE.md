<!--
┌──────────────────────────────────────────────────────────────────────┐
│  ⌂  SATURUMAH.NET · FILE CONTRACT                                    │
│  ──────────────────────────────────────────────────────────────────  │
│  File      : ARCHITECTURE.md                                         │
│  Purpose   : Deep dive into each layer of the stack                  │
│  Author    : Jack — Jack[at]SatuRumah[dot]Net                        │
│  GitHub    : https://github.com/setuju                               │
│  Website   : https://saturumah.net                                   │
│  Created   : 2026-10-26                                              │
│  License   : MIT                                                     │
└──────────────────────────────────────────────────────────────────────┘
-->

# Architecture

This document dives deeper into how OSSUARY is built, layer by layer.

```text
ossuary/
│
├── 📄 API LAYER (Serverless handlers — Render backend)
│   ├── api/
│   │   ├── recon.ts              # DNS + WHOIS + Wayback + Wikipedia — reconnaissance
│   │   │                         # Gate Refuse-to-Lie: return 422 for living domains
│   │   │                         # Failsafe: KNOWN_DEAD_DOMAINS for Wikipedia-timeout cases
│   │   │
│   │   ├── conjure.ts            # 5-tier LLM cascade (Gemma → GenAI → OpenRouter → fallback)
│   │   │                         # + ElevenLabs TTS + MongoDB persist + TigerData log
│   │   │                         # Orchestrated by Mastra agents
│   │   │
│   │   ├── echoes.ts             # SerpApi search echoes — grounds the ghost in reality
│   │   │                         # Returns top 3 Google results for the domain
│   │   │
│   │   ├── whois.ts              # 3-layer WHOIS fallback: IP2WHOIS → RDAP → WhoisXMLAPI
│   │   │                         # Returns registrar, created/expires dates
│   │   │
│   │   └── wiki.ts               # Wikipedia proxy (bypasses browser CORS)
│   │                             # Filters disambiguation pages ("Vine" ≠ plant)
│
├── 📚 LIB LAYER (Shared utilities — persistence & analytics)
│   ├── lib/
│   │   ├── mongodb.ts            # MongoDB Atlas client (serverless-safe caching)
│   │   │                         # maxPoolSize: 5 to avoid connection exhaustion
│   │   │
│   │   ├── persist.ts            # saveGhostRecord() → ghost_profiles collection
│   │   │                         # saveGhostAudio() → GridFS bucket (255KB chunks)
│   │   │                         # Non-blocking: Promise.allSettled — narrative always returns
│   │   │
│   │   └── tigerdata.ts          # TigerData (TimescaleDB) hypertable client
│   │                             # logEvent() writes summon events to ghost_events
│   │                             # SSL: rejectUnauthorized=false (self-signed cert bypass)
│
├── 🎨 FRONTEND (React SPA — Vercel)
│   ├── src/
│   │   ├── App.tsx               # Main component (~1300 lines)
│   │   │                         # State machine: idle → recon → conjure → summoned
│   │   │                         # Contains: IdleAltar, GhostScreen, TimelineOfDecay,
│   │   │                         # WikiMemorial, TechStackFooter, ErrorScreen
│   │   │
│   │   ├── main.tsx              # React 19 entry point + Sentry SDK initialization
│   │   │                         # Mounts App to #root, sets up ErrorBoundary
│   │   │
│   │   ├── index.css             # All styles (~2100 lines)
│   │   │                         # WCAG AA overrides at bottom, ASCII footer CSS,
│   │   │                         # typewriter animations, glitch effects, theme toggle
│   │   │
│   │   ├── agent/
│   │   │   └── index.ts          # Mastra agent definitions
│   │   │                         # profilerAgent (Gemma 4 via Ollama)
│   │   │                         # voiceAgent, fallbackProfilerAgent, openrouterVoiceAgent
│   │   │
│   │   ├── sentry/
│   │   │   └── diegetic.ts       # Diegetic telemetry — errors as narrative messages
│   │   │                         # DIEGETIC_MESSAGES map + logParanormalTelemetry()
│   │   │                         # Tagged kind:paranormal for every subsystem failure
│   │   │
│   │   ├── utils/
│   │   │   ├── wikiParser.ts     # Parse Wikipedia extracts into ghost narrative material
│   │   │   │                     # Strips citation markers, splits paragraphs
│   │   │   │
│   │   │   └── wikiParser.test.ts # Unit tests for wikiParser paragraph extraction
│   │   │
│   │   └── vite-env.d.ts         # Vite type definitions (auto-generated)
│   │                             # Declares import.meta.env.VITE_* types
│
├── ⚙️ CONFIG & ENTRY POINTS
│   ├── index.html                # SPA entry point + SEO meta
│   │                             # OpenGraph + Twitter cards + Schema.org WebApplication
│   │                             # Inline SVG favicon
│   │
│   ├── server.ts                 # Local dev server (Express + Vite middleware, port 3000)
│   │                             # Only used for `bun run dev`, not production
│   │
│   ├── server-production.ts      # Production Express wrapper (Render)
│   │                             # Wraps Vercel-style handlers → single Express app
│   │                             # CORS: allowlist for ossuary.saturumah.net
│   │                             # Access-Control-Allow-Headers: includes baggage, sentry-trace
│   │
│   ├── vite.config.ts            # Vite 8 build config for React + Tailwind v4
│   │                             # Uses @vitejs/plugin-react + @tailwindcss/vite
│   │
│   ├── tsconfig.json             # TypeScript config (strict mode, ESM, allowImportingTsExtensions)
│   │                             # Path aliases: none (relative imports only)
│   │
│   ├── package.json              # Dependencies, scripts (dev, build, start)
│   │                             # 21 tech dependencies — all documented in README
│   │
│   ├── render.yaml               # Render deployment blueprint
│   │                             # Express service, Singapore region, env vars, /health check
│   │
│   ├── vercel.json               # Vercel function config (maxDuration per API route)
│   │                             # Note: production backend on Render, not Vercel functions
│   │
│   └── bun.lock                  # Bun lockfile (equivalent to package-lock.json)
│
└── 📖 DOCUMENTATION
    ├── README.md                 # Main project docs (476 lines)
    │                             # Hero badges, ASCII footer, tech lore, quick start
    │
    ├── ARCHITECTURE.md           # Deep dive into each layer (235 lines)
    │                             # Layer-by-layer explanation, data models, deployment topology
    │
    ├── CHANGELOG.md              # SemVer history from v0.1.0 to v0.9.0
    │                             # Following Keep a Changelog format
    │
    ├── CONTRIBUTING.md           # Contributor guide (96 lines)
    │                             # "Add a dead domain" guide, style guide, PR process
    │
    ├── CODE_OF_CONDUCT.md        # Contributor Covenant 2.1
    │                             # Includes special note about respecting deceased people's domains
    │
    ├── SECURITY.md               # Vulnerability reporting + security best practices
    │                             # 48-hour response SLA, in-scope vs out-of-scope
    │
    └── LICENSE                   # MIT License + dedication ("The dead belong to everyone")
```

## High-Level Flow

```text
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║    ██████╗ ███████╗███████╗██╗   ██╗ █████╗ ██████╗ ██╗   ██╗            ║
║   ██╔═══██╗██╔════╝██╔════╝██║   ██║██╔══██╗██╔══██╗╚██╗ ██╔╝            ║
║   ██║   ██║███████╗███████╗██║   ██║███████║██████╔╝ ╚████╔╝             ║
║   ██║   ██║╚════██║╚════██║██║   ██║██╔══██║██╔══██╗  ╚██╔╝              ║
║   ╚██████╔╝███████║███████║╚██████╔╝██║  ██║██║  ██║   ██║               ║
║    ╚═════╝ ╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝               ║
║                                                                          ║
║                     ── THE LAST PACKET ──                                ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝

                        ▲
                        │  https://ossuary.saturumah.net
                        │
┌───────────────────────┴──────────────────────────────────────────────────┐
│                                                                          │
│                    VERCEL · THE ALTAR (Frontend)                         │
│                    ─────────────────────────────                         │
│                                                                          │
│  ┌────────────┐   ┌──────────────┐   ┌─────────────┐   ┌─────────────┐   │
│  │  React 19  │→→→|  TypeScript  │→→→│  Vite 8     │→→→│ Tailwind v4 │   │
│  └────────────┘   └──────────────┘   └─────────────┘   └─────────────┘   │
│                                                                          │
│  [ Idle Altar ]  →  [ Boot Screen ]  →  [ Ghost Screen ]  →  [ Ledger ]  │
│         │                   │                  │                │        │
│         └───────────────────┴──────────────────┴────────────────┘        │
│                                                                          │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                                │  fetch( VITE_API_URL + '/api/*' )
                                │
┌───────────────────────────────▼──────────────────────────────────────────┐
│                                                                          │
│                    RENDER · THE NECROPOLIS (Backend)                     │
│                    ─────────────────────────────────                     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │            server-production.ts  (Express + tsx)                   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐       │
│   │  /recon   │    │ /conjure  │    │   /wiki   │    │  /echoes  │       │
│   └─────┬─────┘    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘       │
│         │                │                │                │             │
└─────────┼────────────────┼────────────────┼────────────────┼─────────────┘
          │                │                │                │
          │         ┌──────▼──────┐         │                │
          │         │  REFUSE-    │         │                │
          │         │  TO-LIE     │         │                │
          │         │  GATE       │         │                │
          │         │  ─────────  │         │                │
          │         │  HTTP 422   │         │                │
          │         │  still_     │         │                │
          │         │  breathing  │         │                │
          │         └──────┬──────┘         │                │
          │                │                │                │
          ▼                ▼                ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │  PARALLEL  │   │ 5-TIER LLM │   │ WIKIPEDIA  │   │  SERPAPI   │
   │  FETCH     │   │  CASCADE   │   │   PROXY    │   │  ECHOES    │
   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
         │                │                │                │
    ┌────┴────┐      ┌────┴────┐      ┌────┴────┐      ┌────┴────┐
    ▼    ▼    ▼      ▼    ▼    ▼      ▼    ▼    ▼      ▼    ▼    ▼
  ┌──┐ ┌──┐ ┌──┐    ┌──┐ ┌──┐ ┌──┐   ┌──┐ ┌──┐ ┌──┐   ┌──┐ ┌──┐ ┌──┐
  │DN│ │WH│ │WB│    │Ge│ │Ge│ │OR│   │Wi│ │Di│ │Ex│   │S1│ │S2│ │S3│
  │S │ │O │ │M │    │mm│ │nA│ │  │   │ki│ │sa│ │tr│   │  │ │  │ │  │
  └──┘ └──┘ └──┘    └──┘ └──┘ └──┘   └──┘ └──┘ └──┘   └──┘ └──┘ └──┘
   ▲     ▲    ▲      ▲    ▲    ▲
   │     │    │      │    │    │
   │     │    │      │    │    └──── OpenRouter (free tier)
   │     │    │      │    └───────── Google GenAI
   │     │    │      └────────────── Ollama · Gemma 4 31B (primary)
   │     │    └───────────────────── Wayback CDX API
   │     └────────────────────────── WHOIS (IP2WHOIS → RDAP → XML)
   └─────────────────────────────── DNS (A/AAAA record)

                    ┌─────────────────────────┐
                    │   THE SPIRIT PERSISTS   │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
  ┌───────────┐            ┌───────────┐            ┌───────────┐
  │  MONGODB  │            │ TIGERDATA │            │ BACKBOARD │
  │  ───────  │            │  ───────  │            │  ───────  │
  │  ghost_   │            │  ghost_   │            │  semantic │
  │  profiles │            │  events   │            │  memory   │
  │  (GridFS  │            │  (hyper-  │            │  (recall  │
  │   audio)  │            │   table)  │            │   across  │
  │           │            │           │            │   summons │
  └───────────┘            └───────────┘            └───────────┘

        ┌──────────────────────────────────────────────────┐
        │              SENTRY · DIEGETIC LEDGER            │
        │  ─────────────────────────────────────────────   │
        │  kind:paranormal · system:gate · STILL_BREATHING │
        │  BACKBOARD_FADED · ELEVEN_QUOTA · GENAI_TIMEOUT  │
        └──────────────────────────────────────────────────┘

                  ┌────────────────────────────┐
                  │    ELEVENLABS · THE VOICE  │
                  │    ──────────────────────  │
                  │    Adam · flash_v2 model   │
                  │    truncated ≤ 500 chars   │
                  │    audio archived → GridFS │
                  └────────────────────────────┘
```

Simply like this :
```
User Input → Recon → Gate Check → Conjure (LLM) → TTS → Persist → Display
```

Each step is described below.

## Layer 1 — Recon

**File:** `api/recon.ts`

Runs in parallel with hard timeouts:

| Signal | Method | Timeout | Source |
|---|---|---|---|
| DNS | `dns.promises.resolve4/6` | 3.5s | System resolver |
| Ping | TCP connect to :443 | 3.2s | Direct socket |
| WHOIS | RDAP + IP2WHOIS + WhoisXMLAPI | 4.2s | 3-layer fallback |
| Wayback | CDX API (`limit=-1` for latest) | 4.2s | Internet Archive |
| Wikipedia | Action API with disambiguation filter | 4.7s | Wikipedia |

**All fetches** wrapped in `withTimeout(promise, ms, fallback)` — if one hangs, the others still complete.

**Output:** a `Footprint` object:

```typescript
{
  domain: string,
  target: string,           // IP or domain
  dns: { resolved, addresses, error },
  ping: { alive, latencyMs, errorCode },
  whois: { status, rawSnippet },
  wayback: { hasSnapshot, closestTimestamp, lastAliveTimestamp, snapshotUrl },
  lifeStatus: 'alive' | 'deceased'
}
```

## Layer 2 — Gate (Refuse-to-Lie)

**File:** `api/recon.ts`, function `determineLifeStatus()`

Rule hierarchy (highest priority first):

1. **`KNOWN_DEAD_DOMAINS` registry** — if domain is in the hardcoded list, `deceased` immediately. This is the failsafe.
2. **Wikipedia confirmation** — if `lastAliveTimestamp` is set, `deceased`.
3. **No snapshot** — `deceased`.
4. **Recent snapshot (< 2 years)** — `alive` → **HTTP 422 refusal**.
5. **Old snapshot** — `deceased`.

The gate is enforced at **two** layers:

- **Recon layer** — returns HTTP 422 if `alive`
- **Conjure layer** — checks `req.body.footprint.ping.alive` and refuses if true

## Layer 3 — Conjure

**File:** `api/conjure.ts`

### 5-Tier LLM Cascade

```
Tier 1: Ollama (gemma4:31b-cloud)     ─┐
Tier 2: Ollama (gemma4:cloud)          │
Tier 3: Google GenAI (gemma-4-31b-it)  ├─ 20s timeout each
Tier 4: OpenRouter (gemma-4-31b-it)    │
Tier 5: Deterministic fallback        ─┘
```

Each tier is wrapped in `Sentry.startSpan()` for telemetry. If a tier fails, its `durationMs` and error code are logged in `notices[]`.

### Narrative Prompt

The ghost's voice is generated by a system prompt that includes:

- The `Footprint` (domain, death year, cause of death)
- Optional Wikipedia extract (first 500 chars)
- Optional SerpApi echoes (top 3 snippets)
- A "voice spec" that varies by `emotional_state`

### TTS

```typescript
async function generateSpeechAudio(text) {
  if (!apiKey || DISABLE_ELEVENLABS === 'true') return null;
  const safeText = text.slice(0, 500);  // credit saver
  const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/...');
  // ...
}
```

Audio is returned as `data:audio/mp3;base64,...` and stored in MongoDB GridFS.

### Persistence

After the narrative is generated, a `Promise.allSettled` block runs:

1. `saveGhostRecord()` — profile + narrative → MongoDB `ghost_profiles`
2. `saveGhostAudio()` — base64 → GridFS bucket `ghost_audio`
3. `logEvent()` — summon event → TigerData hypertable
4. `recordBackboardMemory()` — semantic memory → Backboard

**All non-blocking** — if persistence fails, the user still gets their narrative.

## Layer 4 — Frontend

**Files:** `src/App.tsx`, `src/index.css`

### State Machine

```
idle → recon → conjure → summoned
                  ↓
                error
```

### Components

| Component | Purpose |
|---|---|
| `IdleAltar` | Main input form + preset relics |
| `BootScreen` | Typewriter boot sequence |
| `ConjuringScreen` | Loading state during recon+conjure |
| `GhostScreen` | The main ritual result |
| `WikiMemorial` | Wikipedia memorial section |
| `TechStackFooter` | 18-relic ASCII footer |
| `TimelineOfDecay` | Visual timeline (born → last seen → now) |

### API Calls

All fetches go through `API_BASE`:

```typescript
const API_BASE = import.meta.env.VITE_API_URL || '';
fetch(API_BASE + '/api/recon', { ... })
```

- **Local dev** — `VITE_API_URL` unset → relative path (same origin)
- **Production** — `VITE_API_URL=https://ossuary-backend.onrender.com` → Render backend

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_API_URL` | Vercel | Frontend → Render backend URL |
| `OLLAMA_API_KEY` | Render | Ollama Cloud auth |
| `OLLAMA_BASE_URL` | Render | `https://ollama.com/v1` |
| `GEMINI_API_KEY` | Render | Google GenAI fallback |
| `OPENROUTER_API_KEY` | Render | OpenRouter fallback |
| `SERPAPI_KEY` | Render | Search echoes |
| `BACKBOARD_API_KEY` | Render | Semantic memory |
| `ELEVENLABS_API_KEY` | Render | TTS (optional) |
| `ELEVENLABS_VOICE_ID` | Render | `pNInz6obpgDQGcFmaJgB` (Adam) |
| `DISABLE_ELEVENLABS` | Render | Credit saver switch |
| `SENTRY_DSN` | Render + Vercel | Telemetry |
| `MONGODB_URI` | Render | Profile & audio archive |
| `TIGERDATA_URL` | Render | Event analytics |

## Deployment Topology

```
GitHub ─push─▶ Vercel (auto-deploy frontend, ~40s)
   │
   └─push─▶ Render (auto-deploy backend, ~2min)
                │
                └─▶ MongoDB Atlas / TigerData / ElevenLabs / Ollama
```

**Cold starts** — Render Free Tier sleeps after 15min idle. Mitigated by external uptime monitor.

## Data Model

### MongoDB — `ossuary.ghost_profiles`

```json
{
  "_id": "ObjectId",
  "domain": "vine.co",
  "profile": {
    "original_purpose": "...",
    "last_seen_year": 2017,
    "cause_of_death": "ACQUISITION_PURGE",
    "emotional_state": "MELANCHOLIC",
    "one_sensory_detail": "..."
  },
  "narrative": "...",
  "waybackSnapshot": "20171231170118",
  "modelUsed": "gemma4:31b-cloud",
  "summonedAt": "2026-10-30T08:12:29.141Z"
}
```

### MongoDB — `ghost_audio` (GridFS)

```
{
  _id: ObjectId,
  filename: "vine.co_1730307200000.mp3",
  length: 1400000,
  metadata: { domain, timestamp, mimeType: "audio/mpeg" }
}
```

### TigerData — `ghost_events` (Hypertable)

```sql
CREATE TABLE ghost_events (
  id UUID DEFAULT gen_random_uuid(),
  event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  domain TEXT NOT NULL,
  event_type TEXT NOT NULL,
  tier_used TEXT,
  duration_ms INTEGER,
  success BOOLEAN,
  error_code TEXT
);

SELECT create_hypertable('ghost_events', 'event_time');
```

## Design Philosophy

1. **Truth over drama.** A refusal is more valuable than a fabricated death.
2. **Diegetic failure.** Every error is story material, not a stack trace.
3. **Open weights.** Gemma's inspectability matters more than GPT-4's polish.
4. **Persist everything.** A ghost's voice is worth saving.
5. **Accessibility is not optional.** WCAG AA is the floor.

---

*For questions, open an issue or email jack@saturumah.net.*
