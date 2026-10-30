# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x     | :white_check_mark: |

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Please report vulnerabilities privately via
[GitHub Security Advisories](https://github.com/setuju/ossuary/security/advisories/new)
or by emailing **security@ossuary.saturumah.net**.

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional but appreciated)

We aim to respond within **48 hours** and provide a timeline for the fix.

## What's In Scope

- **API endpoints** (`/api/*`) — authentication, rate limiting, input validation
- **Environment handling** — secrets leakage, injection
- **Dependencies** — known CVEs in `package.json`
- **Content injection** — potential XSS in domain input or SerpApi echoes
- **Rate limiting bypass** — our current limiter is IP-based and may be bypassable

## What's Out of Scope

- **Free-tier upstream services** (Render, Vercel, MongoDB) — report those to the vendor
- **Local development** without proper `.env` configuration
- **Denial of service** via rate limit exhaustion (expected behavior)
- **Social engineering** of the maintainer (please, be nice)

## Security Best Practices

This project follows:

- **No secrets in code** — all keys via `.env`, never committed
- **Timeout on all upstream fetches** — no unbounded `fetch()` calls
- **Input sanitization** — domain inputs are stripped of protocols, paths, and whitespace
- **CORS allowlist** — only `ossuary.saturumah.net` and `localhost` origins are allowed
- **Rate limiting** — IP-based, 20 requests/minute per endpoint

Thank you for helping keep OSSUARY safe.
