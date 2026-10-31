/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FILE CONTRACT                                    │
 * │  ──────────────────────────────────────────────────────────────────  │
 * │  File      : api/echoes.ts                                           │
 * │  Purpose   : SerpApi search echoes for ghost narrative grounding     │
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

import type { IncomingMessage, ServerResponse } from 'node:http';
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

const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

const echoesRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const ECHOES_RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_ECHOES_PER_WINDOW = 15;

function checkEchoesRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = echoesRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    echoesRateLimitMap.set(ip, { count: 1, resetAt: now + ECHOES_RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_ECHOES_PER_WINDOW) {
    return false;
  }
  record.count += 1;
  return true;
}

export interface EchoItem {
  title: string;
  link: string;
  snippet: string;
  source?: string;
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
  if (!checkEchoesRateLimit(clientIp)) {
    return sendJson(429, { error: 'The ether is turbulent. Too many prayers from this terminal. Wait a moment.' });
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

  const rawDomain = String(body?.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!rawDomain || (!DOMAIN_REGEX.test(rawDomain) && !IPV4_REGEX.test(rawDomain))) {
    return sendJson(400, { error: 'Invalid domain format.' });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    // SerpApi is optional: return clean empty list without failing the request
    return sendJson(200, { echoes: [], notice: 'SerpApi key not configured in environment.' });
  }

  try {
    const query = `${rawDomain} shutdown OR archive OR discontinued OR demise`;
    const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&num=3&api_key=${apiKey}`;

    const upstreamRes = await fetch(serpUrl, {
      signal: AbortSignal.timeout(4000),
      headers: {
        'User-Agent': 'OssuaryEchoRecon/1.0',
      },
    });

    if (!upstreamRes.ok) {
      throw new Error(`SerpApi returned HTTP ${upstreamRes.status}`);
    }

    const data = await upstreamRes.json();
    const organic = data.organic_results || [];

    const echoes: EchoItem[] = organic.slice(0, 3).map((item: any) => ({
      title: item.title || 'Untitled Archive',
      link: item.link || '',
      snippet: item.snippet || '',
      source: item.displayed_link || item.source || 'Search Index',
    }));

    return sendJson(200, { echoes });
  } catch (error: any) {
    if (Sentry) {
      Sentry.captureMessage(`SerpApi lookup failed for ${rawDomain}: ${error?.message || error}`, {
        tags: { kind: 'paranormal', system: 'serpapi' },
      });
      await Sentry.flush(1000).catch(() => {});
    }
    return sendJson(200, { echoes: [], notice: 'Echoes dissipated into static.' });
  }
}
