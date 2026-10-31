/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FILE CONTRACT                                    │
 * │  ──────────────────────────────────────────────────────────────────  │
 * │  File      : src/sentry/diegetic.ts                                  │
 * │  Purpose   : Diegetic telemetry — errors as narrative messages       │
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

import type * as SentryType from '@sentry/node';

export const DIEGETIC_MESSAGES = {
  RATE_LIMIT_ETHER: 'The ether is turbulent. Too many prayers from this terminal. Wait a moment.',
  MODEL_FALLBACK_TRIGGERED: 'The psychic connection wavered; low-frequency harmonics were used.',
  SEANCE_SEVERED: 'The ghost severed the thread midway through conjuration.',
  GHOST_MUTE: 'The ghost has lost its voice. Its message will remain in text only.',
  GHOST_UNRECORDED: 'No one recorded its birth. No one recorded its death.',
  GHOST_FORGOTTEN: 'The archive has no memory of this ghost.',
  GHOST_SILENT: 'The signal reached the other side. Something there chose not to answer.',
  BACKBOARD_FADED: 'The echo faded before it could be recorded.',
} as const;

export const DIEGETIC = {
  ECONNREFUSED: DIEGETIC_MESSAGES.GHOST_SILENT,
  ETIMEDOUT: 'The signal reached the other side. Something there chose not to answer.',
  ENOTFOUND: 'This name no longer exists in the register of the dead.',
  EHOSTUNREACH: 'The route to this machine collapsed into the void.',
  WHOIS_EMPTY: DIEGETIC_MESSAGES.GHOST_UNRECORDED,
  WAYBACK_404: DIEGETIC_MESSAGES.GHOST_FORGOTTEN,
  GEMMA_429: 'The other side is busy. Even spirits need rest.',
  GEMMA_500: 'The other side broke. Some doors should stay closed.',
  ELEVEN_QUOTA: DIEGETIC_MESSAGES.GHOST_MUTE,
  DEFAULT: 'Something between worlds failed. The ghost is not answering.',
} as const;

export function diegeticFor(code?: string): string {
  if (!code) return DIEGETIC.DEFAULT;
  const key = code.toUpperCase().replace(/[^A-Z_]/g, '') as keyof typeof DIEGETIC;
  return DIEGETIC[key] || DIEGETIC.DEFAULT;
}

export function logParanormalTelemetry(
  Sentry: typeof SentryType | null,
  message: string,
  ctx: {
    system: string;
    errorCode: string;
    domain?: string;
    details?: unknown;
    level?: 'warning' | 'error' | 'info';
  }
) {
  if (!Sentry) return;
  Sentry.captureMessage(message, {
    level: ctx.level ?? 'warning',
    tags: { kind: 'paranormal', system: ctx.system, code: ctx.errorCode },
    extra: { domain: ctx.domain, details: ctx.details },
  });
}
