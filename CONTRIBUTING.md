# Contributing to OSSUARY

First off — thank you. This project is built by a single gardener-turned-coder, and every contribution, no matter how small, keeps the graveyard warm.

## Code of Conduct

By participating, you agree to our [Code of Conduct](./CODE_OF_CONDUCT.md). **Be kind. Be patient. Be curious.**

## Ways to Contribute

### 🪦 Add a Dead Domain

The `KNOWN_DEAD_DOMAINS` registry in `api/recon.ts` is our failsafe when Wikipedia times out. To add a domain:

1. Verify with **two independent sources** that the domain is dead (Wikipedia + a news article, or WHOIS + Wayback).
2. Find the **year of death** (used for the timeline).
3. Submit a PR with:
   - The new entry in the `KNOWN_DEAD_DOMAINS` object
   - A comment with your two sources
   - A test in `tests/dead-domains.test.ts` (coming soon)

### 🎨 Improve the UI

The WCAG AA contrast ratio is a **floor, not a ceiling**. If you see text that's hard to read, or an animation that feels off — please open an issue first, then a PR.

### 🧠 Enhance the Cascade

The 5-tier LLM fallback in `api/conjure.ts` can always be improved. New tiers, better timeouts, smarter fallback heuristics — all welcome.

### 📖 Ghost Lore

The narrative prompt (in `api/conjure.ts`, `SYSTEM_PROMPT` constant) is where the ghost gets its voice. If you have a clever idea that makes the ghosts sound more human, we want to hear it.

## Development Setup

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/ossuary.git
cd ossuary

# 2. Install dependencies
bun install

# 3. Configure environment
cp .env.example .env
# Edit .env with your keys

# 4. Run dev server
bun run dev
# → http://localhost:3000
```

## Pull Request Process

1. **Open an issue first** for non-trivial changes. This avoids wasted work.
2. **Fork the repo** and create a branch: `git checkout -b feat/your-idea`
3. **Write clear commit messages** using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add support for subdomains`
   - `fix: correct whois timeout on expired domains`
   - `docs: update deployment instructions for Render`
4. **Run checks locally:**
   ```bash
   bunx tsc --noEmit    # Type check
   bun run build        # Build check
   ```
5. **Keep PRs focused** — one idea per PR. If your change is 500 lines, split it.
6. **Describe your change** in the PR body. Include:
   - What problem does it solve?
   - How did you test it?
   - Screenshots if UI changed.

## Style Guide

- **TypeScript strict mode** — no `any` unless absolutely necessary (and comment why).
- **2-space indentation**, semicolons **required**.
- **Tailwind utilities** in JSX, custom CSS in `src/index.css` only when Tailwind can't express it.
- **Comments in English.**
- **No `console.log` in production code** — use `console.error` for errors, Sentry for telemetry.

## Areas That Need Help

Looking for a starting point? These are open:

- [ ] **Ghost Report export** — generate a `.docx` memorial for each summon (using Paper Instruments)
- [ ] **Public ghost gallery** — browse recently-summoned ghosts
- [ ] **Webhook subscriptions** — get notified when a domain dies
- [ ] **Multi-language** — ghost narratives in Indonesian, Spanish, Japanese
- [ ] **Mobile refinement** — the footer overflow on small screens needs attention

## Questions?

Open an issue with the `question` label. I respond within 24 hours, unless I'm in the ossuary.

---

*Thank you for helping keep the dead speaking.*
