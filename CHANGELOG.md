<!--
┌──────────────────────────────────────────────────────────────────────┐
│  ⌂  SATURUMAH.NET · FILE CONTRACT                                    │
│  ──────────────────────────────────────────────────────────────────  │
│  File      : CHANGELOG.md                                            │
│  Purpose   : SemVer history from v0.1.0 to current                   │
│  Author    : Jack — Jack[at]SatuRumah[dot]Net                        │
│  GitHub    : https://github.com/setuju                               │
│  Website   : https://saturumah.net                                   │
│  Created   : 2026-10-26                                              │
│  License   : MIT                                                     │
└──────────────────────────────────────────────────────────────────────┘
-->

# Changelog

All notable changes to OSSUARY will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] — 2026-10-30

### Added

- **MongoDB Atlas integration** — ghost profiles, narratives, and audio archived in `ossuary.ghost_profiles` collection; audio files stored in GridFS bucket `ghost_audio`
- **TigerData (TimescaleDB) integration** — every summon recorded in `ghost_events` hypertable for analytics
- **Render backend** — migrated from Vercel serverless to Render Express for persistent connections
- **18-relic ASCII footer** — Render, MongoDB, and TigerData added to tech stack showcase
- **Professional documentation** — README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, ARCHITECTURE, CHANGELOG

### Fixed

- **`vine.co` death year** — failsafe `KNOWN_DEAD_DOMAINS` registry forces 2017 timeline when Wikipedia times out (was falling back to 2026 parking page)
- **CORS headers** — `Access-Control-Allow-Headers` expanded to include `baggage` and `sentry-trace` (Sentry tracing headers)
- **ESM imports** — added `.ts` extensions to all local imports for Node 26 compatibility on Render
- **`--dim` WCAG compliance** — migrated from `#5a534a` (2.7:1 contrast) to `#8a8278` (5.3:1, passes WCAG AA)
- **SerpApi readability** — echoes section font size increased, opacity removed, inline styles forced

### Security

- **ElevenLabs credit guard** — `DISABLE_ELEVENLABS=true` env var prevents API calls during testing; model switched to `eleven_flash_v2` (0.5 credits/char); text truncated to 500 chars
- **Rate limiting** — IP-based, 20 req/min, applied to all `/api/*` endpoints
- **Input sanitization** — domain inputs stripped of protocols, paths, and whitespace before processing

## [0.8.0] — 2026-10-29

### Added

- **Refuse-to-Lie gate** — HTTP 422 for living domains, verified via Sentry audit trail
- **5-tier LLM cascade** — Ollama (Gemma 4 31B) → Google GenAI → OpenRouter → deterministic fallback
- **Diegetic Sentry telemetry** — subsystem failures tagged `kind: paranormal` and rendered in UI
- **Wikipedia + Wayback integration** — death year from Wikipedia, last snapshot from CDX API
- **ElevenLabs TTS** — "Adam" voice for ghost narration

### Fixed

- **`dev.to` false positive** — was incorrectly summoned as ghost; now refused with `STILL_BREATHING` gate
- **Sentry duplicate init** — `Sentry.init()` no longer called twice in serverless functions
- **WebSocket noise** — filtered from Sentry with `beforeSend` hook

## [0.1.0] — 2026-10-26

### Added

- **Initial prototype** — boot sequence, preset relics (`geocities.com`, `friendster.com`, `vine.co`, `pets.com`), ghost screen
- **Recon API** — DNS, RDAP/WHOIS, Wayback CDX
- **Mastra agent** — profiler + voice agents for ghost profile generation
- **Diegetic error messages** — narrative-consistent fallbacks

---

## Legend

- **Added** — new features
- **Changed** — changes in existing functionality
- **Deprecated** — soon-to-be-removed features
- **Removed** — removed features
- **Fixed** — bug fixes
- **Security** — vulnerability fixes and security improvements
