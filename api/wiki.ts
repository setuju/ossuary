// Server-side Wikipedia proxy — bypasses browser CORS.
// GET /api/wiki?title=pets.com
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const MAX_REQ = 30;
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const r = rateLimitMap.get(ip);
  if (!r || now > r.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS }); return true; }
  if (r.count >= MAX_REQ) return false;
  r.count += 1;
  return true;
}
async function fetchJson(url: string, timeoutMs = 5000): Promise<any | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'User-Agent': 'OSSUARY/1.0 (https://ossuary.saturumah.net)' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
export default async function handler(req: any, res: any) {
  const ip = (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).json({ ok: false, reason: 'rate_limited' });
  let rawTitle = '';
  if (req.query && typeof req.query.title === 'string') rawTitle = req.query.title;
  else { try { rawTitle = new URL(req.url || '/', 'http://localhost').searchParams.get('title') || ''; } catch { rawTitle = ''; } }
  if (!rawTitle) return res.status(400).json({ ok: false, reason: 'missing_title' });
  const cleanDomain = rawTitle.replace(/^www\./, '').trim();
  const prefix = cleanDomain.split('.')[0] || cleanDomain;
  const cap = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  const base = 'https://en.wikipedia.org/w/api.php';
  let hitTitle: string | null = null;
  const exactCandidates = [cap + '.com', cap, cleanDomain, cap + ' (website)', cap + ' (service)'];
  for (const cand of exactCandidates) {
    const data = await fetchJson(base + '?action=query&titles=' + encodeURIComponent(cand) + '&format=json&redirects=1');
    const pages = data?.query?.pages || {};
    const pageObj: any = Object.values(pages)[0];
    if (pageObj && !pageObj.missing && pageObj.pageid) { hitTitle = pageObj.title; break; }
  }
  if (!hitTitle) {
    const searchCandidates = [cleanDomain, prefix + ' website', prefix];
    for (const cand of searchCandidates) {
      const data = await fetchJson(base + '?action=query&list=search&srsearch=' + encodeURIComponent(cand) + '&format=json&srlimit=10');
      const hits = data?.query?.search || [];
      if (hits.length > 0) {
        const best = hits.find((h: any) =>
          h.title.toLowerCase() === prefix.toLowerCase() ||
          h.title.toLowerCase() === cleanDomain.toLowerCase() ||
          h.title.toLowerCase().includes(prefix.toLowerCase())
        ) || hits[0];
        hitTitle = best.title; break;
      }
    }
  }
  if (!hitTitle) return res.status(200).json({ ok: false, reason: 'not_found' });
  const extractData = await fetchJson(
    base + '?action=query&prop=extracts|pageimages|description&explaintext=1&exintro=1' +
    '&titles=' + encodeURIComponent(hitTitle) + '&pithumbsize=600&format=json&redirects=1'
  );
  const pages = extractData?.query?.pages || {};
  const pageObj: any = Object.values(pages)[0];
  if (!pageObj || pageObj.missing) return res.status(200).json({ ok: false, reason: 'not_found' });
  const extract: string = pageObj.extract || '';
  if (!extract) return res.status(200).json({ ok: false, reason: 'no_extract' });
  const finalTitle = pageObj.title || hitTitle;
  return res.status(200).json({
    ok: true,
    title: finalTitle,
    description: pageObj.description || 'Defunct Internet Service & Historical Archive',
    extract,
    url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(finalTitle.replace(/ /g, '_')),
    thumbnail: pageObj.thumbnail?.source,
  });
}
