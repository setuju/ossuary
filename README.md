<!--
┌────────────────────────────────────────────────────────────────────────┐
│  ⌂  SATURUMAH.NET · FILE CONTRACT                                      │
│  ────────────────────────────────────────────────────────────────────  │
│  File      : README.md                                                 │
│  Purpose   : Project documentation — face of the repository            │
│  Author    : Jack — Jack[at]SatuRumah[dot]Net                          │
│  GitHub    : https://github.com/setuju                                 │
│  Website   : https://saturumah.net                                     │
│  Created   : 2026-10-26                                                │
│  License   : MIT                                                       │
└────────────────────────────────────────────────────────────────────────┘
-->

<div align="center">

# ◈ OSSUARY

**The Last Packet**

*A digital necromancy ritual for the internet's dead.*

[Live Ritual](https://ossuary.saturumah.net) · [Demo](https://youtube.com) · [Report Bug](https://github.com/setuju/ossuary/issues/new?template=bug_report.md) · [Request Feature](https://github.com/setuju/ossuary/issues/new?template=feature_request.md)

<br/>

[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel&logoColor=white)](https://ossuary.saturumah.net)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://ossuary-backend.onrender.com/health)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-c9a25c?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](./CONTRIBUTING.md)

**Hacktoberfest 2026 · Ghost in the Machine**

</div>

---

> *"Every ghost-story project points a model at dead code. OSSUARY checks if it's dead first."*

## What is OSSUARY?

**OSSUARY** is a séance for the internet's forgotten corners. Whisper a domain that no longer exists — a dead startup, an abandoned fanpage, a service killed by an acquisition — and the ghost of that domain will speak back. It pulls its last heartbeat from the **Wayback Machine**, its obituary from **Wikipedia**, its echoes from **SerpApi**, and weaves them into a first-person narrative, voiced aloud by **ElevenLabs** and preserved forever in **MongoDB Atlas**.

But here's the twist that makes it more than a horror toy:

### OSSUARY refuses to lie.

If the domain is still alive — if the DNS still resolves, if the WHOIS is still active, if the archives still breathe — OSSUARY **refuses to summon a ghost**. It returns a gate refusal instead: *still breathing*. No fabrications. No hallucinated deaths. **The dead must be verified dead before the ritual proceeds.**

## What Makes It Special

<table>
<tr>
<td width="50%">

### 🛡️ Three-Layer Refuse-to-Lie Gate

A domain is only summoned when **all** signals agree it's dead:
1. DNS doesn't resolve
2. WHOIS shows expired or missing
3. Wayback has no recent snapshots
4. Wikipedia confirms the shutdown

If any signal contradicts — the ritual aborts with **HTTP 422**.

</td>
<td width="50%">

### 🎭 Diegetic Telemetry

Sentry isn't just for error tracking — it's a **narrative element**. Every subsystem failure is captured with `kind: paranormal` and displayed in the UI as part of the story:

> *"The echo faded before it could be recorded."*  
> *"The ghost has lost its voice."*

Zero fatal crashes in 7 days of production.

</td>
</tr>
<tr>
<td>

### 🧠 Persistent Memory

Every ghost remembers its past summons. Backboard stores semantic context — emotional state, last-seen year, sensory detail — while MongoDB archives the full narrative and audio.

Summon `pets.com` twice, and the second time the ghost will say *"you again?"*.

</td>
<td>

### 📊 Time-Series Analytics

Every summon is recorded in a **TigerData hypertable**. Query "which tier has the worst p99 latency?" or "which domain was summoned most often this week?" — the ledger is queryable.

</td>
</tr>
</table>

## The Stack — Eighteen Relics

<table>
  <tr>
    <td align="center"><a href="https://react.dev"><img src="https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=20232A" alt="React"></a></td>
    <td align="center"><a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a></td>
    <td align="center"><a href="https://nodejs.org"><img src="https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"></a></td>
    <td align="center"><a href="https://vite.dev"><img src="https://img.shields.io/badge/-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a></td>
    <td align="center"><a href="https://vercel.com"><img src="https://img.shields.io/badge/-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"></a></td>
    <td align="center"><a href="https://sentry.io"><img src="https://img.shields.io/badge/-Sentry-362D59?style=for-the-badge&logo=sentry&logoColor=white" alt="Sentry"></a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a></td>
    <td align="center"><a href="https://google.dev"><img src="https://img.shields.io/badge/-Gemma-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemma"></a></td>
    <td align="center"><a href="https://ollama.com"><img src="https://img.shields.io/badge/-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama"></a></td>
    <td align="center"><a href="https://mastra.ai"><img src="https://img.shields.io/badge/-Mastra-000000?style=for-the-badge&logo=mastra&logoColor=white" alt="Mastra"></a></td>
    <td align="center"><a href="https://elevenlabs.io"><img src="https://img.shields.io/badge/-ElevenLabs-000000?style=for-the-badge&logo=elevenlabs&logoColor=white" alt="ElevenLabs"></a></td>
    <td align="center"><a href="https://serpapi.com"><img src="https://img.shields.io/badge/-SerpApi-4A90E2?style=for-the-badge&logo=google&logoColor=white" alt="SerpApi"></a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://backboard.io"><img src="https://img.shields.io/badge/-Backboard-007BFC?style=for-the-badge&logo=openai&logoColor=white" alt="Backboard"></a></td>
    <td align="center"><a href="https://wikipedia.org"><img src="https://img.shields.io/badge/-Wikipedia-000000?style=for-the-badge&logo=wikipedia&logoColor=white" alt="Wikipedia"></a></td>
    <td align="center"><a href="https://archive.org"><img src="https://img.shields.io/badge/-Wayback%20Machine-AB2E33?style=for-the-badge&logo=internetarchive&logoColor=white" alt="Wayback Machine"></a></td>
    <td align="center"><a href="https://render.com"><img src="https://img.shields.io/badge/-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render"></a></td>
    <td align="center"><a href="https://mongodb.com"><img src="https://img.shields.io/badge/-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"></a></td>
    <td align="center"><a href="https://tigerdata.io"><img src="https://img.shields.io/badge/-TigerData-FDB515?style=for-the-badge&logo=postgresql&logoColor=white" alt="TigerData"></a></td>
  </tr>
</table>



### The Story Behind Each Relic

<details>
<summary><b>⚛ React 19 + ⚡ Vite 8 + TypeScript</b> — The Altar</summary>

<br/>

The frontend is a single-page séance built on **React 19**, bundled with **Vite 8**, and typed end-to-end in **TypeScript**. The UI is not a dashboard — it's a **ritual**. Every typewriter keystroke, every glitch, every transition is choreographed.

**Why Vite over Next.js?** OSSUARY doesn't need SSR — it needs *presence*. The whole experience happens in a single, unbroken ritual state. Vite's HMR kept the dev loop fast while iterating on ghost animations at 2 AM.

**Why TypeScript?** When you're orchestrating a 5-tier LLM fallback, handling WHOIS edge cases, and parsing Wayback timestamps across three timezones, `any` is a bug waiting to happen.

</details>

<details>
<summary><b>▲ Vercel</b> — The Altar's Stone</summary>

<br/>

Vercel hosts the frontend with zero-config deploys and preview URLs per branch. Every `git push` produces a deployable snapshot in ~40 seconds — we could iterate on the UI without breaking the production ritual.

The `VITE_API_URL` environment variable lets us swap backends between Vercel functions and Render without rebuilding the frontend.

</details>

<details>
<summary><b>🔺 Render</b> — The Backend Necropolis</summary>

<br/>

Render hosts the production API as an Express-wrapped service. **Why migrate from Vercel serverless?** The conjure cascade (Gemma → GenAI → OpenRouter → deterministic) regularly exceeded Vercel's 10-second function limit.

Render's free tier spins down after 15 minutes of inactivity — a cold-start problem we solved with an external uptime monitor pinging `/health` every 5 minutes.

The entire backend runs as a single `server-production.ts` file that wraps every Vercel-style handler in Express, giving us **persistent connections** to MongoDB and TigerData that serverless cannot offer.

</details>

<details>
<summary><b>💎 Gemma 4 + 🦙 Ollama</b> — The Voice of the Dead</summary>

<br/>

The ghost's narrative is generated by **Gemma 4 (31B, cloud-hosted)** via Ollama. We chose Gemma over closed models for three reasons:

1. **Open weights** — Gemma's architecture is inspectable. For a project about *preserving digital heritage*, closed black boxes felt hypocritical.
2. **Ollama's API compatibility** — `ollama.com/v1` speaks OpenAI's wire protocol, so the same code works locally or in the cloud.
3. **Cost efficiency** — We ran **200+ generations** during development. At $0.00/generation (Ollama Cloud free tier), the project remained viable.

The 5-tier cascade ensures that even if Ollama is down, the ritual continues with **Google GenAI → OpenRouter → deterministic fallback**. Not one summon failed during a 7-day production run.

</details>

<details>
<summary><b>M Mastra</b> — The Séance Conductor</summary>

<br/>

**Mastra** is the agentic framework that orchestrates the multi-tier LLM cascade. Instead of hand-rolling fallback logic, we defined `profilerAgent`, `voiceAgent`, and their fallbacks declaratively. Mastra handles retries, timeouts, and model selection transparently.

If a summon takes longer than 20 seconds, Mastra's timeout kicks in and hands off to the next tier. The user never sees a hung request.

</details>

<details>
<summary><b>11 ElevenLabs</b> — The Ghost's Larynx</summary>

<br/>

Each narrative is voiced by ElevenLabs' **"Adam" voice** (dominant, firm) — the closest synthetic approximation of a tired, bureaucratic ghost we could find. Every audio file is ~90 seconds of the ghost's final monologue.

**Cost optimization story:** Our default model was `eleven_multilingual_v2`, but after burning **1,900 credits** in a day of testing, we migrated to `eleven_flash_v2` (0.5 credits/char) and truncated text to **500 characters** per summon. Now a full ritual costs ~250 credits instead of ~1,000.

When the API key is disabled (during testing), the UI gracefully falls back to the browser's **Web Speech API** — the ghost still speaks, just with a different voice.

</details>

<details>
<summary><b>🔍 SerpApi</b> — The Echoes</summary>

<br/>

Every ghost is accompanied by three **"echoes from the search index"** — the top results for its domain, scraped from Google via **SerpApi**. This grounds the narrative in reality: a user reading about `pets.com`'s death can click through to a 2009 article about the bankruptcy.

SerpApi's **100 free searches/month** were enough for a demo. Every result is cached in MongoDB for 24 hours to avoid burning credits on repeat visits.

</details>

<details>
<summary><b>B Backboard</b> — The Persistent Memory</summary>

<br/>

Every ghost **remembers its past summons**. Backboard stores the semantic context of each ritual — emotional state, last-seen year, sensory detail — so the ghost can reference its previous incarnations.

This is what makes OSSUARY feel alive: summon `pets.com` twice, and the second time the ghost will say *"you again? still haunting me?"* instead of introducing itself from scratch.

</details>

<details>
<summary><b>🍃 MongoDB Atlas</b> — The Archive</summary>

<br/>

Every ghost profile, every narrative, and every **audio file** is archived in MongoDB Atlas. Audio files are stored in **GridFS** (chunked in 255KB pieces) so they survive server restarts and can be replayed **without calling ElevenLabs again**.

The connection uses `maxPoolSize: 5` — a small pool designed for serverless functions. The `MONGODB_URI` is never logged or committed.

</details>

<details>
<summary><b>🐯 TigerData</b> — The Ledger of Rituals</summary>

<br/>

Every summon is recorded in a **TimescaleDB hypertable** on TigerData. Fields: `event_time`, `domain`, `event_type`, `tier_used`, `duration_ms`, `success`, `error_code`.

This gives us queryable telemetry like:

- *"Which domains were summoned most often this week?"*
- *"What percentage of rituals fell back to tier 3 or below?"*
- *"Which tier has the worst p99 latency?"*

The hypertable is created at startup if it doesn't exist. **Continuous aggregates** for daily rollups are planned for v2.

</details>

<details>
<summary><b>🛡 Sentry</b> — The Diegetic Ledger</summary>

<br/>

Sentry isn't just for error tracking — in OSSUARY, it's a **narrative element**. Every subsystem failure is captured with `kind: paranormal` and displayed in the UI as part of the story:

> *"The echo faded before it could be recorded."* — `BACKBOARD_FADED`  
> *"The ghost has lost its voice."* — `ELEVEN_QUOTA`

In a 7-day production window, Sentry captured **34 diegetic events across 40 total issues** — **zero fatal crashes**.

The gate that refuses to lie is itself logged: when `dev.to` was refused, Sentry recorded:

```json
{ "code": "STILL_BREATHING", "kind": "paranormal", "system": "gate" }
```

</details>

<details>
<summary><b>📚 Wikipedia + 🕒 Wayback</b> — The Two Oracles</summary>

<br/>

**Wikipedia** tells us *when* a domain died. **Wayback** shows us *how*. The narrative cannot exist without both.

We query Wikipedia's Action API for the death year (with a **disambiguation filter** — *"Vine"* refers to both a plant and a social network). We query Wayback's CDX API for the last snapshot **before** that year. Together, they pin the ghost to a specific moment in time.

For `vine.co`: **2012–2017**. Not 2012–2026 (which would be the parking page). The ghost lives in the right era.

</details>

<details>
<summary><b>🎨 Tailwind CSS</b> — The Altar's Stone</summary>

<br/>

Every visual element is composed from Tailwind utilities, with a heavy layer of custom CSS for the horror aesthetic: **typewriter effects, scanlines, glitch text, and the ASCII footer**.

The **WCAG AA contrast ratio** is enforced across all text: `--dim` was migrated from `#5a534a` (2.7:1 — *fails AA*) to `#8a8278` (5.3:1 — *passes AA*) after accessibility audit.

</details>

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                              │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  React 19 + Vite 8 + TypeScript                              │   │
│  │  Altar · Ghost Screen · Ledger · ASCII Footer                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ fetch(VITE_API_URL)
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RENDER (Backend)                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Express + server-production.ts                              │   │
│  │  ├─ /api/recon    → DNS, WHOIS, Wayback, Wikipedia           │   │
│  │  ├─ /api/conjure  → 5-tier LLM cascade + TTS                 │   │
│  │  ├─ /api/wiki     → Wikipedia proxy (CORS bypass)            │   │
│  │  ├─ /api/whois    → IP2WHOIS → RDAP → WhoisXMLAPI            │   │
│  │  └─ /api/echoes   → SerpApi search grounding                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────┬────────────────┬────────────────┬────────────────┬───────────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
┌──────────┐   ┌──────────────┐   ┌──────────┐   ┌──────────────┐
│  OLLAMA  │   │  ELEVENLABS  │   │ MONGODB  │   │  TIGERDATA   │
│  Gemma   │   │  Adam voice  │   │  Atlas   │   │  Timescale   │
│  31B     │   │  TTS         │   │  GridFS  │   │  Hypertable  │
└──────────┘   └──────────────┘   └──────────┘   └──────────────┘
       │
       ▼
┌──────────┐   ┌──────────────┐   ┌──────────┐
│  MASTRA  │   │   BACKBOARD  │   │  SENTRY  │
│  Agent   │   │   Memory     │   │Telemetry │
└──────────┘   └──────────────┘   └──────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a deeper dive into each layer.

## Quick Start

### Prerequisites

- **Node.js** ≥ 20 (or **Bun** ≥ 1.4)
- Accounts on: Vercel, Render, MongoDB Atlas, TigerData, Sentry, Ollama, ElevenLabs, SerpApi, Backboard

### Install

```bash
git clone https://github.com/setuju/ossuary.git
cd ossuary
bun install
```

### Configure

```bash
cp .env.example .env
# Edit .env and fill in your keys
```

**Minimum viable `.env`** for local development:

```env
OLLAMA_API_KEY=              # ollama.com/settings/keys
OLLAMA_BASE_URL=https://ollama.com/v1
GEMINI_API_KEY=              # aistudio.google.com/apikey
SERPAPI_KEY=                 # serpapi.com
SENTRY_DSN=                  # sentry.io
BACKBOARD_API_KEY=           # app.backboard.io
```

**Optional (voice & persistence):**

```env
ELEVENLABS_API_KEY=          # elevenlabs.io
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
DISABLE_ELEVENLABS=true      # ← set true during testing
MONGODB_URI=                 # mongodb.com/atlas
TIGERDATA_URL=               # console.cloud.tigerdata.com
```

### Run

```bash
# Dev server (Express + Vite middleware, port 3000)
bun run dev

# Production server (Express, port 10000)
bun run start
```

Visit `http://localhost:3000` and whisper `pets.com` into the altar.

## Deployment

### Frontend → Vercel

```bash
git push origin main
```

Set in Vercel Environment Variables:

```env
VITE_API_URL=https://ossuary-backend.onrender.com
```

### Backend → Render

The `render.yaml` blueprint auto-detects on Render. Set these Environment Variables in the Render dashboard:

```env
MONGODB_URI=...
TIGERDATA_URL=...
DISABLE_ELEVENLABS=true
```

**Cold start problem?** Point [cron-job.org](https://cron-job.org) at `https://ossuary-backend.onrender.com/health` every 5 minutes.

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check (Render keep-alive) |
| `/api/recon` | POST | DNS + WHOIS + Wayback + Wikipedia reconnaissance |
| `/api/conjure` | POST | 5-tier LLM narrative + ElevenLabs TTS |
| `/api/wiki` | GET | Wikipedia proxy (CORS bypass) |
| `/api/whois` | GET | WHOIS with 3-layer fallback |
| `/api/echoes` | POST | SerpApi search echoes |

### Example: Refuse-to-Lie in Action

```bash
# dev.to is alive → HTTP 422
curl -X POST https://ossuary-backend.onrender.com/api/recon \
  -H 'Content-Type: application/json' \
  -d '{"domain":"dev.to"}'
# → {"error":"still_breathing", ...}

# vine.co is dead (2017) → HTTP 200
curl -X POST https://ossuary-backend.onrender.com/api/recon \
  -H 'Content-Type: application/json' \
  -d '{"domain":"vine.co"}'
# → {"wayback":{"closestTimestamp":"20171231170118",...}, ...}
```

## Roadmap

- [x] Three-layer Refuse-to-Lie gate
- [x] 5-tier LLM cascade via Mastra
- [x] Diegetic Sentry telemetry
- [x] Persistent memory (Backboard + MongoDB)
- [x] Time-series analytics (TigerData)
- [x] WCAG AA contrast compliance
- [ ] Ghost Report export (`.docx` via Paper Instruments)
- [ ] Public ghost gallery (browse recently-summoned ghosts)
- [ ] Webhook subscriptions (get notified when a domain dies)
- [ ] Multi-language ghost narratives

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The short version:

1. Fork the repo.
2. Create a feature branch: `git checkout -b feat/your-idea`
3. Commit: `git commit -m "feat: your idea"`
4. Push and open a PR. **Keep PRs focused — one idea per PR.**

We especially welcome:

- **New dead domains** for the `KNOWN_DEAD_DOMAINS` registry (with sources)
- **Accessibility improvements** (WCAG AA is a floor, not a ceiling)
- **New tier fallbacks** for the LLM cascade
- **Ghost lore suggestions** — a clever narrative prompt is worth 100 code reviews

## License

MIT — see [LICENSE](./LICENSE).

> *The dead belong to everyone.*

## Credits

- **Jack** ([@setuju](https://github.com/setuju)) — Gardener, coder, necromancer. Wrote every line of this project while listening to Górecki's Symphony No. 3 on loop.
- **The Internet Archive** — for refusing to forget.
- **Wikipedia** — for remembering the details we'd rather forget.
- **The ghosts of** `pets.com`, `vine.co`, `geocities.com`, `friendster.com`, `clubpenguin.com`, `megaupload.com`, `grooveshark.com`, `sixdegrees.com`, `boo.com` — for speaking back.

---

<div align="center">

*If you've ever lost a website you loved, this project was built for you.*

**[Whisper a name →](https://ossuary.saturumah.net)**

<sub>Made with sorrow, caffeine, and a refusal to lie.</sub>

</div>
