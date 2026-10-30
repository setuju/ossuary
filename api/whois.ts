// IP2WHOIS proxy — caches 24h, hides API key from client.
// GET /api/whois?domain=example.com
const cache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export default async function handler(req: any, res: any) {
  let domain = '';
  if (req.query && typeof req.query.domain === 'string') domain = req.query.domain;
  else {
    try { domain = new URL(req.url || '/', 'http://localhost').searchParams.get('domain') || ''; }
    catch { domain = ''; }
  }
  if (!domain) return res.status(400).json({ ok: false, reason: 'missing_domain' });

  const key = process.env.IP2WHOIS_API_KEY;
  if (!key) return res.status(500).json({ ok: false, reason: 'server_misconfigured' });

  const clean = domain.replace(/^www\./, '').trim().toLowerCase();
  const hit = cache.get(clean);
  if (hit && Date.now() < hit.expiresAt) return res.status(200).json({ ok: true, cached: true, ...hit.data });

  try {
    const upstream = await fetch(
      'https://api.ip2whois.com/v2?key=' + encodeURIComponent(key) + '&domain=' + encodeURIComponent(clean),
      { signal: AbortSignal.timeout(5000) }
    );
    if (!upstream.ok) return res.status(200).json({ ok: false, reason: 'upstream_' + upstream.status });
    const data = await upstream.json();
    const slim = {
      domain: data.domain,
      create_date: data.create_date,
      update_date: data.update_date,
      expire_date: data.expire_date,
      domain_age: data.domain_age,
      registrar: data.registrar?.name,
      nameservers: Array.isArray(data.nameservers) ? data.nameservers.slice(0, 4) : [],
    };
    cache.set(clean, { data: slim, expiresAt: Date.now() + CACHE_TTL_MS });
    return res.status(200).json({ ok: true, cached: false, ...slim });
  } catch (err) {
    return res.status(200).json({ ok: false, reason: 'fetch_failed' });
  }
}
