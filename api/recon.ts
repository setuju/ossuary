import type { IncomingMessage, ServerResponse } from 'node:http';
import * as dns from 'node:dns/promises';
import * as net from 'node:net';
import {
  DIEGETIC_MESSAGES,
  diegeticFor,
  logParanormalTelemetry,
} from '../src/sentry/diegetic.ts';
import * as Sentry from '@sentry/node';

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
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  record.count += 1;
  return true;
}

const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

export interface ReconFootprint {
  domain: string;
  target: string;
  dns: {
    resolved: boolean;
    addresses: string[];
    error: string | null;
  };
  ping: {
    alive: boolean;
    latencyMs: number | null;
    errorCode: string | null;
    diegeticStatus: string;
  };
  whois: {
    status: 'active' | 'expired' | 'unregistered' | 'error';
    registrar?: string;
    creationDate?: string;
    expirationDate?: string;
    rawSnippet?: string;
    diegeticNotice?: string;
  };
  wayback: {
    hasSnapshot: boolean;
    closestTimestamp?: string;
    earliestTimestamp?: string;
    snapshotUrl?: string;
    status?: number;
    error?: string | null;
    diegeticNotice?: string;
  };
  memory?: {
    remembered: boolean;
    lastSeen?: string;
  };
  timestamp: string;
}

async function probeHost(host: string, port = 80, timeoutMs = 3500): Promise<{ alive: boolean; latencyMs: number | null; errorCode: string | null }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({ alive: false, latencyMs: null, errorCode: 'ETIMEDOUT' });
      }
    }, timeoutMs);

    socket.connect(port, host, () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        const latencyMs = Date.now() - startTime;
        socket.end();
        resolve({ alive: true, latencyMs, errorCode: null });
      }
    });

    socket.on('error', (err: any) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        socket.destroy();
        resolve({ alive: false, latencyMs: null, errorCode: err.code || 'ECONNREFUSED' });
      }
    });
  });
}

async function fetchWaybackEarliest(domain: string, timeoutMs = 4000): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=1&filter=statuscode:200`,
      {
        signal: AbortSignal.timeout(timeoutMs),
        headers: { 'User-Agent': 'OssuaryGhostRecon/1.0' },
      }
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1]) && data[1][1]) {
      return String(data[1][1]);
    }
    return undefined;
  } catch {
    return undefined;
  }
}

async function fetchWayback(domain: string, timeoutMs = 4500) {
  try {
    const res = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'User-Agent': 'OssuaryGhostRecon/1.0 (+https://ossuary.dev)',
      },
    });

    if (!res.ok) {
      logParanormalTelemetry(Sentry, `Wayback HTTP ${res.status}`, {
        system: 'wayback',
        errorCode: 'WAYBACK_404',
        domain,
        details: { status: res.status },
      });
      return {
        hasSnapshot: false,
        error: `Wayback returned HTTP ${res.status}`,
        diegeticNotice: DIEGETIC_MESSAGES.GHOST_FORGOTTEN,
      };
    }

    const data = await res.json();
    const closest = data.archived_snapshots?.closest;

    if (closest && closest.available) {
      return {
        hasSnapshot: true,
        closestTimestamp: closest.timestamp,
        snapshotUrl: closest.url,
        status: Number.parseInt(closest.status, 10),
      };
    }

    return {
      hasSnapshot: false,
      diegeticNotice: DIEGETIC_MESSAGES.GHOST_FORGOTTEN,
    };
  } catch (error: any) {
    const isTimeout = error?.name === 'TimeoutError';
    const errorCode = isTimeout ? 'ETIMEDOUT' : 'WAYBACK_404';

    logParanormalTelemetry(Sentry, `Wayback query exception: ${error?.message || error}`, {
      system: 'wayback',
      errorCode,
      domain,
      details: error,
    });

    return {
      hasSnapshot: false,
      error: isTimeout ? 'ETIMEDOUT' : (error?.message || 'UNKNOWN'),
      diegeticNotice: DIEGETIC_MESSAGES.GHOST_FORGOTTEN,
    };
  }
}

async function fetchWhoisRdap(domain: string, timeoutMs = 4500) {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: 'application/rdap+json' },
    });

    if (res.status === 404) {
      return {
        status: 'unregistered' as const,
        diegeticNotice: DIEGETIC_MESSAGES.GHOST_UNRECORDED,
      };
    }

    if (!res.ok) {
      logParanormalTelemetry(Sentry, `RDAP status ${res.status}`, {
        system: 'whois',
        errorCode: 'WHOIS_EMPTY',
        domain,
      });
      return {
        status: 'error' as const,
        rawSnippet: `RDAP HTTP ${res.status}`,
        diegeticNotice: DIEGETIC_MESSAGES.GHOST_UNRECORDED,
      };
    }

    const rdap = await res.json();
    const registrarEvent = rdap.events?.find((e: any) => e.eventAction === 'registration');
    const expirationEvent = rdap.events?.find((e: any) => e.eventAction === 'expiration');

    return {
      status: 'active' as const,
      registrar: rdap.entities?.[0]?.vcardArray?.[1]?.[1]?.[3] || rdap.handle || 'Unknown Registrar',
      creationDate: registrarEvent?.eventDate,
      expirationDate: expirationEvent?.eventDate,
    };
  } catch (error: any) {
    const isTimeout = error?.name === 'TimeoutError';
    const errorCode = isTimeout ? 'ETIMEDOUT' : 'WHOIS_EMPTY';

    logParanormalTelemetry(Sentry, `WHOIS lookup failed: ${error?.message || error}`, {
      system: 'whois',
      errorCode,
      domain,
      details: error,
    });

    return {
      status: 'error' as const,
      rawSnippet: isTimeout ? 'ETIMEDOUT' : (error?.message || 'LOOKUP_FAILED'),
      diegeticNotice: DIEGETIC_MESSAGES.GHOST_UNRECORDED,
    };
  }
}

async function fetchBackboardMemory(domain: string): Promise<{ remembered: boolean; lastSeen?: string }> {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) return { remembered: false };
  try {
    const res = await fetch(`https://app.backboard.io/api/threads?domain=${encodeURIComponent(domain)}`, {
      headers: { 'X-API-Key': apiKey },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return { remembered: false };
    const data = await res.json();
    return { remembered: true, lastSeen: data.last_seen };
  } catch {
    return { remembered: false };
  }
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  const sendJson = (status: number, data: any) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  if (req.method !== 'POST') {
    return sendJson(405, { error: 'Method Not Allowed' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
  if (!checkRateLimit(clientIp)) {
    return sendJson(429, { error: DIEGETIC_MESSAGES.RATE_LIMIT_ETHER });
  }

  let body = req.body;
  if (!body && typeof req.on === 'function') {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
    } catch {
      return sendJson(400, { error: 'Malformed JSON payload.' });
    }
  }

  const rawDomain = (body?.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!rawDomain || (!DOMAIN_REGEX.test(rawDomain) && !IPV4_REGEX.test(rawDomain))) {
    return sendJson(400, { error: 'Invalid domain or IP address format.' });
  }

  try {
    let addresses: string[] = [];
    let dnsError: string | null = null;
    try {
      addresses = await dns.resolve4(rawDomain);
    } catch (err: any) {
      dnsError = err.code || 'ENOTFOUND';
    }

    const [probeResult, whoisResult, waybackResult, earliestWayback] = await Promise.all([
      probeHost(addresses[0] || rawDomain, 80, 3500),
      fetchWhoisRdap(rawDomain, 4500),
      fetchWayback(rawDomain, 4500),
      fetchWaybackEarliest(rawDomain, 4000),
    ]);

    const memory = await fetchBackboardMemory(rawDomain);

    const code = probeResult.errorCode || (probeResult.alive ? 'SUCCESS' : (dnsError || 'ECONNREFUSED'));
    const diegeticStatus = diegeticFor(code);

    if (Sentry && !probeResult.alive) {
      logParanormalTelemetry(Sentry, `Probe severed: ${code}`, {
        system: 'socket',
        errorCode: code,
        domain: rawDomain,
      });
      await Sentry.flush(1500).catch(() => {});
    }

    const footprint: ReconFootprint = {
      domain: rawDomain,
      target: addresses[0] || rawDomain,
      dns: {
        resolved: addresses.length > 0,
        addresses,
        error: dnsError,
      },
      ping: {
        alive: probeResult.alive,
        latencyMs: probeResult.latencyMs,
        errorCode: probeResult.errorCode,
        diegeticStatus,
      },
      whois: whoisResult,
      wayback: {
        ...waybackResult,
        earliestTimestamp: earliestWayback,
        ...((!waybackResult.hasSnapshot && earliestWayback) ? {
          hasSnapshot: true,
          closestTimestamp: earliestWayback,
          snapshotUrl: `https://web.archive.org/web/${earliestWayback}/http://${rawDomain}/`,
          status: 200,
        } : {}),
      },
      memory,
      timestamp: new Date().toISOString(),
    };

    if (Sentry) {
      await Sentry.flush(1000).catch(() => {});
    }

    return sendJson(200, footprint);
  } catch (error: any) {
    if (Sentry) {
      logParanormalTelemetry(Sentry, `Recon exception: ${error?.message || error}`, {
        system: 'socket',
        errorCode: 'SEANCE_SEVERED',
        domain: rawDomain,
        details: error,
        level: 'error',
      });
      await Sentry.flush(2000).catch(() => {});
    }

    return sendJson(500, {
      error: DIEGETIC_MESSAGES.SEANCE_SEVERED,
      details: error?.message || 'UNKNOWN_ERROR',
    });
  }
}
