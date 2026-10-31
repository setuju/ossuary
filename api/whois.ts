/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FILE CONTRACT                                    │
 * │  ──────────────────────────────────────────────────────────────────  │
 * │  File      : api/whois.ts                                            │
 * │  Purpose   : 3-layer WHOIS fallback: IP2WHOIS → RDAP → WhoisXMLAPI   │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                        │
 * │  GitHub    : https://github.com/setuju                               │
 * │  Website   : https://saturumah.net                                   │
 * │  Created   : 2026-10-26                                              │
 * │  License   : MIT                                                     │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   2026-10-26
 * @package   ossuary
 * @license   MIT
 */

// WHOIS proxy with 3-layer fallback:
// 1. IP2WHOIS (if key available)
// 2. RDAP (free, no key)
// 3. WHOISXMLAPI (if key available)
const cache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function tryIP2WHOIS(domain: string): Promise<any | null> {
  const key = process.env.IP2WHOIS_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.ip2whois.com/v2?key=${encodeURIComponent(key)}&domain=${encodeURIComponent(domain)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return {
      registrar: data.registrar?.name,
      create_date: data.create_date,
      expire_date: data.expire_date,
      update_date: data.update_date,
      domain_age: data.domain_age,
    };
  } catch { return null; }
}

async function tryRDAP(domain: string): Promise<any | null> {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(5000),
      headers: { 'Accept': 'application/rdap+json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const events = data.events || [];
    const find = (action: string) => events.find((e: any) => e.eventAction === action)?.eventDate;
    return {
      registrar: data.entities?.find((e: any) => e.roles?.includes('registrar'))?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3],
      create_date: find('registration'),
      expire_date: find('expiration'),
      update_date: find('last changed'),
    };
  } catch { return null; }
}

async function tryWhoisXMLAPI(domain: string): Promise<any | null> {
  const key = process.env.WHOISXMLAPI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://whois-history.whoisxmlapi.com/api/v1?apiKey=${encodeURIComponent(key)}&domainName=${encodeURIComponent(domain)}&mode=purchase`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const rec = data?.whoisRecords?.[0];
    if (!rec) return null;
    return {
      registrar: rec.registrarName,
      create_date: rec.createdDate,
      expire_date: rec.expiresDate,
      update_date: rec.updatedDate,
    };
  } catch { return null; }
}

export default async function handler(req: any, res: any) {
  let domain = '';
  if (req.query && typeof req.query.domain === 'string') domain = req.query.domain;
  else {
    try { domain = new URL(req.url || '/', 'http://localhost').searchParams.get('domain') || ''; }
    catch { domain = ''; }
  }
  if (!domain) return res.status(400).json({ ok: false, reason: 'missing_domain' });

  const clean = domain.replace(/^www\./, '').trim().toLowerCase();
  const hit = cache.get(clean);
  if (hit && Date.now() < hit.expiresAt) return res.status(200).json({ ok: true, cached: true, ...hit.data });

  let data = await tryIP2WHOIS(clean);
  if (!data) data = await tryRDAP(clean);
  if (!data) data = await tryWhoisXMLAPI(clean);

  if (data) {
    cache.set(clean, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return res.status(200).json({ ok: true, cached: false, ...data });
  }

  return res.status(200).json({ ok: false, reason: 'all_sources_failed' });
}
