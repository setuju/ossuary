/**
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FILE CONTRACT                                         │
 * │  ──────────────────────────────────────────────────────────────────────── │
 * │  File      : api/recon.ts                                                 │
 * │  Purpose   : DNS + WHOIS + Wayback + Wikipedia reconnaissance with Refuse │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                             │
 * │  GitHub    : https://github.com/setuju                                    │
 * │  Website   : https://saturumah.net                                        │
 * │  Created   : 2026-10-26                                                   │
 * │  License   : MIT                                                          │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   2026-10-26
 * @package   ossuary
 * @license   MIT
 */

export const maxDuration = 30;

import type { IncomingMessage, ServerResponse } from 'node:http';
import * as dns from 'node:dns/promises';
import * as net from 'node:net';
import * as Sentry from '@sentry/node';
import {
  DIEGETIC_MESSAGES,
  diegeticFor,
  logParanormalTelemetry,
} from '../src/sentry/diegetic.ts';

try {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.VERCEL_ENV || 'production',
    });
  }
} catch (err) {
  console.error('[SENTRY] init failed:', err);
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) return false;
  record.count += 1;
  return true;
}

// ── FAIL-SAFE WRAPPER: race a promise against a timeout ──
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// ── DNS resolution with hard timeout ──
async function resolveDns(domain: string): Promise<{ resolved: boolean; addresses: string[]; error: string | null }> {
  try {
    const result = await withTimeout(
      dns.resolve4(domain).catch(() => dns.resolve6(domain)),
      3500,
      [] as string[],
    );
    if (Array.isArray(result) && result.length > 0) {
      return { resolved: true, addresses: result, error: null };
    }
    return { resolved: false, addresses: [], error: 'NO_A_RECORD' };
  } catch (e: any) {
    return { resolved: false, addresses: [], error: e?.code || 'DNS_FAIL' };
  }
}

// ── Ping with timeout ──
async function probePing(domain: string, timeoutMs = 3000): Promise<{ alive: boolean; latencyMs: number | null; errorCode: string | null }> {
  const start = Date.now();
  try {
    const socket = new net.Socket();
    return await new Promise((resolve) => {
      const timer = setTimeout(() => {
        socket.destroy();
        resolve({ alive: false, latencyMs: null, errorCode: 'TIMEOUT' });
      }, timeoutMs);
      socket.connect(443, domain, () => {
        clearTimeout(timer);
        const latency = Date.now() - start;
        socket.destroy();
        resolve({ alive: true, latencyMs: latency, errorCode: null });
      });
      socket.on('error', (err: any) => {
        clearTimeout(timer);
        socket.destroy();
        resolve({ alive: false, latencyMs: null, errorCode: err?.code || 'CONN_REFUSED' });
      });
    });
  } catch {
    return { alive: false, latencyMs: null, errorCode: 'PROBE_FAIL' };
  }
}

// ── WHOIS / RDAP with timeout ──
async function fetchWhois(domain: string, timeoutMs = 4000): Promise<{ status: string; rawSnippet?: string }> {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: 'application/rdap+json' },
    });
    if (res.ok) return { status: 'active' };
    if (res.status === 404) return { status: 'not_found' };
    return { status: 'error', rawSnippet: `RDAP HTTP ${res.status}` };
  } catch {
    return { status: 'error', rawSnippet: 'RDAP timeout/network' };
  }
}

// ── Wayback CDX with timeout ──
async function fetchWayback(domain: string, timeoutMs = 4000): Promise<{ hasSnapshot: boolean; closestTimestamp?: string }> {
  try {
    const res = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=-1&filter=statuscode:200`,
      { signal: AbortSignal.timeout(timeoutMs) },
    );
    if (!res.ok) return { hasSnapshot: false };
    const data = await res.json();
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1]) && data[1][1]) {
      return { hasSnapshot: true, closestTimestamp: String(data[1][1]) };
    }
    return { hasSnapshot: false };
  } catch {
    return { hasSnapshot: false };
  }
}

// ── Wikipedia death year (with timeout) ──
async function fetchLastAliveSnapshot(domain: string, timeoutMs = 4000): Promise<string | undefined> {
  try {
    const cleanDomain = domain.replace(/^www\./, '').trim();
    const prefix = cleanDomain.split('.')[0] || cleanDomain;
    const cap = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const base = 'https://en.wikipedia.org/w/api.php';
    const headers = { 'User-Agent': 'OssuaryRecon/1.0' };
    const fetchJson = async (url: string): Promise<any | null> => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers });
        if (!res.ok) return null;
        return await res.json();
      } catch { return null; }
    };
    const isDisambiguation = (pageObj: any): boolean => {
      const pp = pageObj?.pageprops;
      return !!(pp && Object.prototype.hasOwnProperty.call(pp, 'disambiguation'));
    };

    let hitTitle: string | null = null;
    const exactCandidates = [
      cleanDomain,
      cap + ' (service)', cap + ' (website)', cap + ' (app)',
      cap + ' (social media)', cap + ' (platform)',
      cap + '.com', cap,
    ];
    for (const cand of exactCandidates) {
      const data = await fetchJson(base + '?action=query&titles=' + encodeURIComponent(cand) + '&format=json&redirects=1&prop=pageprops');
      const pages = data?.query?.pages || {};
      const pageObj: any = Object.values(pages)[0];
      if (!pageObj || pageObj.missing || !pageObj.pageid) continue;
      if (isDisambiguation(pageObj)) continue;
      hitTitle = pageObj.title;
      break;
    }
    if (!hitTitle) {
      const searchCandidates = [cleanDomain, prefix + ' website', prefix + ' service', prefix + ' app', prefix];
      for (const cand of searchCandidates) {
        const data = await fetchJson(base + '?action=query&list=search&srsearch=' + encodeURIComponent(cand) + '&format=json&srlimit=10');
        const hits = data?.query?.search || [];
        for (const hit of hits) {
          const t = String(hit.title || '').toLowerCase();
          if (t.includes('disambiguation')) continue;
          const isRelevant = t.includes('website') || t.includes('service') || t.includes('app') ||
            t.includes('platform') || t.includes('social') || t.includes('video') ||
            t.includes('company') || t.includes('dot-com') || t.includes('internet');
          if (!isRelevant && t !== prefix.toLowerCase() && t !== cleanDomain.toLowerCase()) continue;
          const check = await fetchJson(base + '?action=query&titles=' + encodeURIComponent(hit.title) + '&format=json&prop=pageprops');
          const pages = check?.query?.pages || {};
          const pageObj: any = Object.values(pages)[0];
          if (pageObj && isDisambiguation(pageObj)) continue;
          hitTitle = hit.title;
          break;
        }
        if (hitTitle) break;
      }
    }
    if (!hitTitle) return undefined;

    const extractData = await fetchJson(base + '?action=query&prop=extracts|pageimages&explaintext=1&exintro=1&titles=' + encodeURIComponent(hitTitle) + '&pithumbsize=600&format=json&redirects=1');
    const pages = extractData?.query?.pages || {};
    const pageObj: any = Object.values(pages)[0];
    if (!pageObj || pageObj.missing) return undefined;
    const extract: string = pageObj.extract || '';
    if (!extract) return undefined;

    const patterns = [
      /(?:shut down|closed|discontinued).*?(19\d{2}|20\d{2})/i,

      /(?:closed|shut down|ceased|discontinued|went offline|terminated|ended|defunct)[\s\S]{0,60}?\b(19\d\d|20\d\d)\b/i,
      /\b(19\d\d|20\d\d)\b[\s\S]{0,60}?(?:closed|shut down|ceased|discontinued)/i,
    ];
    let deathYear: number | undefined;
    for (const pat of patterns) {
      const m = extract.match(pat);
      if (m) { deathYear = parseInt(m[1], 10); break; }
    }
    if (!deathYear) {
      const eraMatch = extract.match(/\b(19\d\d|20\d\d)\s*[\u2013-]\s*(19\d\d|20\d\d)\b/);
      if (eraMatch) deathYear = parseInt(eraMatch[2], 10);
    }
    if (!deathYear) return undefined;

    const cdxRes = await fetch(
      'https://web.archive.org/cdx/search/cdx?url=' + encodeURIComponent(domain) + '&output=json&to=' + deathYear + '1231&filter=statuscode:200&limit=-1',
      { signal: AbortSignal.timeout(timeoutMs), headers }
    );
    if (!cdxRes.ok) return undefined;
    const cdxData = await cdxRes.json();
    if (Array.isArray(cdxData) && cdxData.length > 1 && Array.isArray(cdxData[1]) && cdxData[1][1]) {
      return String(cdxData[1][1]);
    }
  } catch {}
  return undefined;
}

// ── MAIN HANDLER ──

// ── Accurate Life/Death Detection ──
function determineLifeStatus(
  lastAliveTimestamp: string | undefined,
  wayback: { hasSnapshot: boolean; closestTimestamp?: string }
): { status: 'alive' | 'deceased'; reason: string } {
  // Wikipedia confirmed death → DECEASED
  if (lastAliveTimestamp) {
    // Wikipedia explicitly confirms the service is dead.
    // This takes absolute priority — do NOT fall through to snapshot check.
    return { status: 'deceased', reason: 'Wikipedia confirms the service shut down.' };
  }
  // No Wayback snapshot → DECEASED
  if (!wayback.hasSnapshot || !wayback.closestTimestamp) {
    return { status: 'deceased', reason: 'No archived snapshot found. The ghost has faded.' };
  }
  // Check if latest snapshot is recent (< 2 years)
  const year = parseInt(wayback.closestTimestamp.slice(0, 4), 10);
  const currentYear = new Date().getFullYear();
  if (year >= currentYear - 2) {
    return { status: 'alive', reason: 'Recent archived snapshot found. The ghost is still breathing.' };
  }
  return { status: 'deceased', reason: 'Last archived snapshot is from ' + year + '. The ghost has faded.' };
}


// ── Failsafe: Known dead domains (bypass Wikipedia timeout) ──
const KNOWN_DEAD_DOMAINS: Record<string, number> = {
  'vine.co': 2017, 'geocities.com': 2009, 'friendster.com': 2015, 'myspace.com': 2011,
  'pets.com': 2000, 'clubpenguin.com': 2017, 'megaupload.com': 2012,
  'grooveshark.com': 2015, 'sixdegrees.com': 2001, 'boo.com': 2000,
};

export default async function handler(req: any, res: any) {
  try {
    // ── Rate limit ──
    const ip = (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'rate_limited' });
    }

    // ── Parse domain ──
    let domain = '';
    if (req.body && typeof req.body.domain === 'string') domain = req.body.domain;
    else if (req.query && typeof req.query.domain === 'string') domain = req.query.domain;
    else {
      try { domain = new URL(req.url || '/', 'http://localhost').searchParams.get('domain') || ''; }
      catch { domain = ''; }
    }
    if (!domain) return res.status(400).json({ error: 'missing_domain' });

    const rawDomain = domain.replace(/^www\./, '').trim().toLowerCase();
    if (!rawDomain) return res.status(400).json({ error: 'empty_domain' });

    // ── Run all lookups in parallel with hard timeouts ──
    const [dnsResult, pingResult, whoisResult, waybackResult, lastAlive] = await Promise.all([
      withTimeout(resolveDns(rawDomain), 3500, { resolved: false, addresses: [], error: 'TIMEOUT' }),
      withTimeout(probePing(rawDomain, 3000), 3200, { alive: false, latencyMs: null, errorCode: 'TIMEOUT' }),
      withTimeout(fetchWhois(rawDomain, 4000), 4200, { status: 'error', rawSnippet: 'TIMEOUT' }),
      withTimeout(fetchWayback(rawDomain, 4000), 4200, { hasSnapshot: false }),
      withTimeout(fetchLastAliveSnapshot(rawDomain, 4500), 4700, undefined),
    ]);

    // ── Build response ──
        // ── GATE REFUSE-TO-LIE ──
    const hardcodedDeathYear = KNOWN_DEAD_DOMAINS[rawDomain];
    const lifeCheck = hardcodedDeathYear
      ? { status: 'deceased' as const, reason: `Known dead domain since ${hardcodedDeathYear}.` }
      : determineLifeStatus(lastAlive, waybackResult);
    if (lifeCheck.status === 'alive') {
      return res.status(422).json({
        error: 'still_breathing',
        reason: lifeCheck.reason,
        domain: rawDomain,
      });
    }

const footprint: any = {
      domain: rawDomain,
      target: dnsResult.addresses[0] || rawDomain,
      dns: dnsResult,
      ping: {
        ...pingResult,
        diegeticStatus: pingResult.alive ? 'The ghost is listening.' : 'The ghost has gone quiet.',
      },
      whois: whoisResult,
      wayback: waybackResult,
    };

    if (lastAlive) {
      footprint.wayback.lastAliveTimestamp = lastAlive;
      footprint.wayback.closestTimestamp = lastAlive;
      footprint.wayback.snapshotUrl = `https://web.archive.org/web/${lastAlive}/http://${rawDomain}/`;
    }

    // ── FAILSAFE UI OVERRIDE: hardcoded death year untuk domain mati ──
    if (hardcodedDeathYear && !lastAlive) {
      const ts = `${hardcodedDeathYear}1231000000`;
      footprint.wayback.hasSnapshot = true;
      footprint.wayback.lastAliveTimestamp = ts;
      footprint.wayback.closestTimestamp = ts;
      footprint.wayback.snapshotUrl = `https://web.archive.org/web/${ts}/http://${rawDomain}/`;
    }

    return res.status(200).json(footprint);
  } catch (err: any) {
    // ── GLOBAL CATCH: Always return a response ──
    console.error('[recon] Unhandled error:', err);
    return res.status(200).json({
      domain: req.body?.domain || req.query?.domain || 'unknown',
      error: 'recon_internal_error',
      message: err?.message || 'Unknown error',
    });
  }
}
