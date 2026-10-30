import type { IncomingMessage, ServerResponse } from 'node:http';
import { saveGhostRecord, saveGhostAudio } from '../lib/persist';
import {
  profilerAgent,
  fallbackProfilerAgent,
  openrouterProfilerAgent,
  voiceAgent,
  fallbackVoiceAgent,
  openrouterVoiceAgent,
  OLLAMA_PRIMARY_MODEL,
  OLLAMA_FALLBACK_MODEL,
  OPENROUTER_MODEL,
  GENAI_MODEL,
  PROFILE_SYSTEM_FALLBACK,
  VOICE_SYSTEM_FALLBACK,
  type ModelUsed,
} from '../src/agent/index.ts';
import { GoogleGenAI } from '@google/genai';
import {
  DIEGETIC_MESSAGES,
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

const conjureRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_CONJURES_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = conjureRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    conjureRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_CONJURES_PER_WINDOW) {
    return false;
  }
  record.count += 1;
  return true;
}

const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

interface SanitizedFootprint {
  domain: string;
  ping: {
    alive: boolean;
    errorCode: string | null;
  };
  whois: {
    status: string;
    creationDate?: string;
  };
  wayback: {
    hasSnapshot: boolean;
    closestTimestamp?: string;
    status?: number;
  };
}

function sanitizeFootprint(raw: any): SanitizedFootprint | null {
  if (!raw || typeof raw !== 'object') return null;

  const rawDomain = String(raw.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!rawDomain || (!DOMAIN_REGEX.test(rawDomain) && !IPV4_REGEX.test(rawDomain))) {
    return null;
  }

  return {
    domain: rawDomain,
    ping: {
      alive: Boolean(raw.ping?.alive),
      errorCode: typeof raw.ping?.errorCode === 'string' ? raw.ping.errorCode.slice(0, 32) : null,
    },
    whois: {
      status: String(raw.whois?.status || 'unknown').slice(0, 32),
      creationDate: typeof raw.whois?.creationDate === 'string' ? raw.whois.creationDate.slice(0, 64) : undefined,
    },
    wayback: {
      hasSnapshot: Boolean(raw.wayback?.hasSnapshot),
      closestTimestamp: typeof raw.wayback?.closestTimestamp === 'string' ? raw.wayback.closestTimestamp.slice(0, 32) : undefined,
      status: typeof raw.wayback?.status === 'number' ? raw.wayback.status : undefined,
    },
  };
}

interface GhostProfile {
  original_purpose: string;
  last_seen_year: number | string;
  cause_of_death: 'ABANDONED' | 'HOSTING_EXPIRED' | 'DNS_SEVERED' | 'ACQUISITION_PURGE' | 'MYSTERIOUS_HALT';
  emotional_state: 'BITTER' | 'MELANCHOLIC' | 'RESTLESS' | 'CONFUSED' | 'SARCASTIC';
  one_sensory_detail: string;
}

interface TierAttempt {
  tier: string;
  provider: string;
  model: string;
  status: 'success' | 'timeout' | 'failed' | 'skipped';
  durationMs: number;
  error?: string;
}

function recordTier(
  tierLog: TierAttempt[],
  attempt: Omit<TierAttempt, 'durationMs'>,
  durationMs: number
): void {
  tierLog.push({ ...attempt, durationMs });
}

const GENAI_TIMEOUT_MS = 15_000;

let genAIClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

async function tryGenAI(
  prompt: string,
  systemInstruction: string,
  timeoutMs: number,
  tierLog: TierAttempt[]
): Promise<{ text: string; modelUsed: ModelUsed } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    recordTier(tierLog, {
      tier: '3', provider: 'genai', model: GENAI_MODEL,
      status: 'skipped', error: 'GEMINI_API_KEY not configured',
    }, 0);
    return null;
  }
  const ai = getGenAIClient();
  if (!ai) {
    recordTier(tierLog, {
      tier: '3', provider: 'genai', model: GENAI_MODEL,
      status: 'skipped', error: 'GoogleGenAI client initialization failed',
    }, 0);
    return null;
  }

  const start = Date.now();
  try {
    const res = await Promise.race([
      ai.models.generateContent({
        model: GENAI_MODEL,
        contents: prompt,
        config: { systemInstruction, temperature: 0.9 },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('ETIMEDOUT_GENAI')), timeoutMs)
      ),
    ]);
    const text = (res as any)?.text ?? '';
    if (!text || text.length < 20) {
      recordTier(tierLog, {
        tier: '3', provider: 'genai', model: GENAI_MODEL,
        status: 'failed', error: 'Empty response',
      }, Date.now() - start);
      return null;
    }
    recordTier(tierLog, {
      tier: '3', provider: 'genai', model: GENAI_MODEL,
      status: 'success',
    }, Date.now() - start);
    return { text, modelUsed: GENAI_MODEL };
  } catch (err: any) {
    const isTimeout = String(err?.message || '').includes('ETIMEDOUT');
    recordTier(tierLog, {
      tier: '3', provider: 'genai', model: GENAI_MODEL,
      status: isTimeout ? 'timeout' : 'failed',
      error: err?.message || 'unknown',
    }, Date.now() - start);
    logParanormalTelemetry(Sentry, `GenAI fallback failed (${err?.message || err}).`, {
      system: 'genai', errorCode: 'GENAI_TIMEOUT',
    });
    return null;
  }
}

async function generateProfile(
  footprint: SanitizedFootprint,
  tierLog: TierAttempt[]
): Promise<{ profile: GhostProfile; usedFallback: boolean; modelUsed: ModelUsed }> {
  const prompt = `Reconstruct the ghost profile for this network footprint:\n${JSON.stringify(footprint, null, 2)}`;

  // Tier 1: Ollama primary
  {
    const start = Date.now();
    try {
      const res = await Promise.race([
        profilerAgent.generate(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('ETIMEDOUT_OLLAMA_PRIMARY')), 20_000)
        ),
      ]);
      const cleaned = (res as any).text.replace(/```json/g, '').replace(/```/g, '').trim();
      recordTier(tierLog, {
        tier: '1', provider: 'ollama', model: OLLAMA_PRIMARY_MODEL, status: 'success',
      }, Date.now() - start);
      return { profile: JSON.parse(cleaned), usedFallback: false, modelUsed: OLLAMA_PRIMARY_MODEL };
    } catch (err: any) {
      const isTimeout = String(err?.message || '').includes('ETIMEDOUT');
      recordTier(tierLog, {
        tier: '1', provider: 'ollama', model: OLLAMA_PRIMARY_MODEL,
        status: isTimeout ? 'timeout' : 'failed',
        error: err?.message || 'unknown',
      }, Date.now() - start);
      logParanormalTelemetry(Sentry, `Ollama primary profiler degraded (${err.message}).`, {
        system: 'gemma', errorCode: 'PROFILER_PRIMARY_TIMEOUT', domain: footprint.domain,
      });
    }
  }

  // Tier 2: Ollama fallback
  {
    const start = Date.now();
    try {
      const resFast = await Promise.race([
        fallbackProfilerAgent.generate(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('ETIMEDOUT_OLLAMA_FALLBACK')), 12_000)
        ),
      ]);
      const cleaned = (resFast as any).text.replace(/```json/g, '').replace(/```/g, '').trim();
      recordTier(tierLog, {
        tier: '2', provider: 'ollama', model: OLLAMA_FALLBACK_MODEL, status: 'success',
      }, Date.now() - start);
      return { profile: JSON.parse(cleaned), usedFallback: true, modelUsed: OLLAMA_FALLBACK_MODEL };
    } catch (err: any) {
      const isTimeout = String(err?.message || '').includes('ETIMEDOUT');
      recordTier(tierLog, {
        tier: '2', provider: 'ollama', model: OLLAMA_FALLBACK_MODEL,
        status: isTimeout ? 'timeout' : 'failed',
        error: err?.message || 'unknown',
      }, Date.now() - start);
    }
  }

  // Tier 3: Google GenAI (Gemma)
  {
    const result = await tryGenAI(prompt, PROFILE_SYSTEM_FALLBACK, GENAI_TIMEOUT_MS, tierLog);
    if (result) {
      try {
        const cleaned = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
        return { profile: JSON.parse(cleaned), usedFallback: true, modelUsed: result.modelUsed };
      } catch (err: any) {
        recordTier(tierLog, {
          tier: '3', provider: 'genai', model: GENAI_MODEL,
          status: 'failed', error: 'JSON parse failed: ' + (err?.message || ''),
        }, 0);
      }
    }
  }

  // Tier 4: OpenRouter (Gemma)
  {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      recordTier(tierLog, {
        tier: '4', provider: 'openrouter', model: OPENROUTER_MODEL,
        status: 'skipped', error: 'OPENROUTER_API_KEY not configured',
      }, 0);
    } else {
      const start = Date.now();
      try {
        const resOR = await Promise.race([
          openrouterProfilerAgent.generate(prompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('ETIMEDOUT_OPENROUTER')), 15_000)
          ),
        ]);
        const cleaned = (resOR as any).text.replace(/```json/g, '').replace(/```/g, '').trim();
        recordTier(tierLog, {
          tier: '4', provider: 'openrouter', model: OPENROUTER_MODEL, status: 'success',
        }, Date.now() - start);
        return { profile: JSON.parse(cleaned), usedFallback: true, modelUsed: OPENROUTER_MODEL };
      } catch (err: any) {
        const isTimeout = String(err?.message || '').includes('ETIMEDOUT');
        recordTier(tierLog, {
          tier: '4', provider: 'openrouter', model: OPENROUTER_MODEL,
          status: isTimeout ? 'timeout' : 'failed',
          error: err?.message || 'unknown',
        }, Date.now() - start);
      }
    }
  }

  // Tier 5: Deterministic
  recordTier(tierLog, {
    tier: '5', provider: 'deterministic', model: 'hardcoded-fallback', status: 'success',
  }, 0);

  const year = footprint?.wayback?.closestTimestamp?.slice(0, 4) || '2004';
  return {
    profile: {
      original_purpose: `A long-dormant portal once anchoring ${footprint.domain}`,
      last_seen_year: year,
      cause_of_death: footprint.ping?.alive ? 'DNS_SEVERED' : 'HOSTING_EXPIRED',
      emotional_state: 'BITTER',
      one_sensory_detail: 'The high-pitched hum of a 10,000 RPM SCSI drive spinning down forever.',
    },
    usedFallback: true,
    modelUsed: 'deterministic',
  };
}

async function generateNarrative(
  profile: GhostProfile,
  footprint: SanitizedFootprint,
  alreadyFellBack: boolean,
  tierLog: TierAttempt[]
): Promise<{ narrative: string; usedFallback: boolean; modelUsed: ModelUsed }> {
  const prompt = `Speak to the summoner. Footprint:\n${JSON.stringify(footprint, null, 2)}\n\nProfile:\n${JSON.stringify(profile, null, 2)}`;

  // Tier 1: Ollama primary (skip if profile already fell back)
  if (!alreadyFellBack) {
    const start = Date.now();
    try {
      const res = await Promise.race([
        voiceAgent.generate(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('ETIMEDOUT_VOICE_OLLAMA_PRIMARY')), 20_000)
        ),
      ]);
      recordTier(tierLog, {
        tier: '1', provider: 'ollama', model: OLLAMA_PRIMARY_MODEL, status: 'success',
      }, Date.now() - start);
      return { narrative: (res as any).text, usedFallback: false, modelUsed: OLLAMA_PRIMARY_MODEL };
    } catch (err: any) {
      const isTimeout = String(err?.message || '').includes('ETIMEDOUT');
      recordTier(tierLog, {
        tier: '1', provider: 'ollama', model: OLLAMA_PRIMARY_MODEL,
        status: isTimeout ? 'timeout' : 'failed',
        error: err?.message || 'unknown',
      }, Date.now() - start);
    }
  }

  // Tier 2: Ollama fallback
  {
    const start = Date.now();
    try {
      const resFast = await Promise.race([
        fallbackVoiceAgent.generate(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('ETIMEDOUT_VOICE_OLLAMA_FALLBACK')), 12_000)
        ),
      ]);
      recordTier(tierLog, {
        tier: '2', provider: 'ollama', model: OLLAMA_FALLBACK_MODEL, status: 'success',
      }, Date.now() - start);
      return { narrative: (resFast as any).text, usedFallback: true, modelUsed: OLLAMA_FALLBACK_MODEL };
    } catch (err: any) {
      const isTimeout = String(err?.message || '').includes('ETIMEDOUT');
      recordTier(tierLog, {
        tier: '2', provider: 'ollama', model: OLLAMA_FALLBACK_MODEL,
        status: isTimeout ? 'timeout' : 'failed',
        error: err?.message || 'unknown',
      }, Date.now() - start);
    }
  }

  // Tier 3: Google GenAI (Gemma)
  {
    const result = await tryGenAI(prompt, VOICE_SYSTEM_FALLBACK, GENAI_TIMEOUT_MS, tierLog);
    if (result) {
      return { narrative: result.text, usedFallback: true, modelUsed: result.modelUsed };
    }
  }

  // Tier 4: OpenRouter (Gemma)
  {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      recordTier(tierLog, {
        tier: '4', provider: 'openrouter', model: OPENROUTER_MODEL,
        status: 'skipped', error: 'OPENROUTER_API_KEY not configured',
      }, 0);
    } else {
      const start = Date.now();
      try {
        const resOR = await Promise.race([
          openrouterVoiceAgent.generate(prompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('ETIMEDOUT_VOICE_OPENROUTER')), 15_000)
          ),
        ]);
        recordTier(tierLog, {
          tier: '4', provider: 'openrouter', model: OPENROUTER_MODEL, status: 'success',
        }, Date.now() - start);
        return { narrative: (resOR as any).text, usedFallback: true, modelUsed: OPENROUTER_MODEL };
      } catch (err: any) {
        const isTimeout = String(err?.message || '').includes('ETIMEDOUT');
        recordTier(tierLog, {
          tier: '4', provider: 'openrouter', model: OPENROUTER_MODEL,
          status: isTimeout ? 'timeout' : 'failed',
          error: err?.message || 'unknown',
        }, Date.now() - start);
      }
    }
  }

  // Tier 5: Deterministic
  recordTier(tierLog, {
    tier: '5', provider: 'deterministic', model: 'hardcoded-fallback', status: 'success',
  }, 0);

  return {
    narrative:
      `I was ${footprint.domain}, once. In ${profile.last_seen_year}, the archive captured my last breath. ` +
      `What walks around in my body now is not me — a parking page, a redirect, a squatter's banner ad. ` +
      `Call it reincarnation, if you like. The corpse got up, but the ghost that remembered ` +
      `${profile.one_sensory_detail.toLowerCase()} is gone. ` +
      `You have summoned the memory, not the machine. Next time you ping ${footprint.domain}, remember: ` +
      `something always answers, but it will not be me.`,
    usedFallback: true,
    modelUsed: 'deterministic',
  };
}

async function generateSpeechAudio(text: string, timeoutMs = 8000): Promise<{ audioBase64: string | null; errorNotice: string | null }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'vflhOcwDlonnVFj3wJqz';

  // ── GUARD 1: Zero API calls if key is missing or placeholder ──
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('ELEVENLABS_API_KEY_PLACEHOLDER') || apiKey === 'your_key_here') {
    return { audioBase64: null, errorNotice: DIEGETIC_MESSAGES.GHOST_MUTE };
  }

  // ── GUARD 2: Kill Switch (Credit Saver) ──
  // Set DISABLE_ELEVENLABS=true in .env to prevent ANY API calls (useful during testing)
  if (process.env.DISABLE_ELEVENLABS === 'true') {
    return { audioBase64: null, errorNotice: DIEGETIC_MESSAGES.GHOST_MUTE };
  }

  // ── GUARD 3: Truncate text to save credits ──
  // 500 characters = ~250 credits instead of ~1000
  const MAX_CHARS = 500;
  const safeText = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + '...' : text;

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: safeText,
        model_id: 'eleven_flash_v2',
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok) throw new Error(`ElevenLabs returned HTTP ${res.status}`);

    const arrayBuf = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString('base64');
    return { audioBase64: `data:audio/mp3;base64,${base64}`, errorNotice: null };
  } catch (error: any) {
    if (Sentry) {
      logParanormalTelemetry(Sentry, `ElevenLabs TTS failed: ${error?.message || error}`, {
        system: 'elevenlabs',
        errorCode: 'ELEVEN_QUOTA',
      });
    }
    return {
      audioBase64: null,
      errorNotice: DIEGETIC_MESSAGES.GHOST_MUTE,
    };
  }
}

async function recordBackboardMemory(domain: string, profile: GhostProfile, narrative: string): Promise<boolean> {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch('https://app.backboard.io/api/threads/messages', {
      method: 'POST',
      signal: AbortSignal.timeout(2000),
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `Domain ${domain} summoned. Last seen: ${profile.last_seen_year}. Cause of death: ${profile.cause_of_death}. Sensory relic: ${profile.one_sensory_detail}. Last words: ${narrative.slice(0, 100)}...`,
        memory: 'Auto',
        metadata: { domain, last_seen_year: profile.last_seen_year },
      }),
    });
    return res.ok;
  } catch (err: any) {
    logParanormalTelemetry(Sentry, `Backboard memory sync failed: ${err.message}`, {
      system: 'backboard',
      errorCode: 'BACKBOARD_FADED',
      domain,
    });
    return false;
  }
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  const sendJson = (status: number, data: any) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  if (req.method !== 'POST') return sendJson(405, { error: 'Method Not Allowed' });

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

  const sanitized = sanitizeFootprint(body?.footprint);
  if (!sanitized) {
    return sendJson(400, { error: 'Invalid domain or corrupted reconnaissance footprint.' });
  }

  const waybackYear = sanitized.wayback.closestTimestamp
    ? parseInt(sanitized.wayback.closestTimestamp.slice(0, 4), 10)
    : 0;

  const force = body?.force === true;

  const whoisSaysAlive = sanitized.whois.status === 'active';
  const whoisSaysDead =
    sanitized.whois.status === 'expired' ||
    sanitized.whois.status === 'unregistered';
  const waybackRecent =
    waybackYear > 0 && waybackYear >= new Date().getFullYear() - 2;

  const looksAlive =
    !force &&
    (whoisSaysAlive || (waybackRecent && !whoisSaysDead));

  if (looksAlive) {
    if (Sentry) {
      logParanormalTelemetry(Sentry, `Conjuration refused: host still breathing (${sanitized.domain}).`, {
        system: 'gate',
        errorCode: 'STILL_BREATHING',
        domain: sanitized.domain,
        level: 'warning',
      });
      await Sentry.flush(1500).catch(() => {});
    }

    return sendJson(422, {
      error: `The ritual failed. ${sanitized.domain} is still breathing. You cannot summon a ghost that has not yet died.`,
      stillAlive: true,
      evidence: {
        whoisStatus: sanitized.whois.status,
        waybackYear,
        pingAlive: sanitized.ping.alive,
      },
    });
  }

  const notices: string[] = [];
  const tierLog: TierAttempt[] = [];

  try {
    const { profile, usedFallback: profileFallback, modelUsed: profileModel } = await Sentry.startSpan(
      { name: 'conjure.profile', op: 'ai.inference' },
      async () => generateProfile(sanitized, tierLog)
    );
    if (profileFallback) notices.push(DIEGETIC_MESSAGES.MODEL_FALLBACK_TRIGGERED);

    const { narrative, usedFallback: voiceFallback, modelUsed: voiceModel } = await Sentry.startSpan(
      { name: 'conjure.narrative', op: 'ai.inference' },
      async () => generateNarrative(profile, sanitized, profileFallback, tierLog)
    );
    if (voiceFallback && !profileFallback) notices.push(DIEGETIC_MESSAGES.MODEL_FALLBACK_TRIGGERED);

    const remembered = await Promise.race([
      recordBackboardMemory(sanitized.domain, profile, narrative),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000)),
    ]);

    if (!remembered) {
      notices.push(DIEGETIC_MESSAGES.BACKBOARD_FADED);
    }

    const speechResult = await Sentry.startSpan(
      { name: 'conjure.speech', op: 'audio.tts' },
      async () => generateSpeechAudio(narrative, 8000)
    );
    if (speechResult.errorNotice) notices.push(speechResult.errorNotice);

    if (Sentry) {
      await Sentry.flush(1500).catch(() => {});
    }

        // ── PERSIST TO MONGODB (non-blocking) ──
    const saveDomain = (req.body && req.body.footprint && req.body.footprint.domain) || 'unknown';
    Promise.allSettled([
      saveGhostRecord({
        domain: saveDomain,
        profile,
        narrative,
        waybackSnapshot: req.body?.footprint?.wayback?.closestTimestamp,
        modelUsed: 'gemma4:31b-cloud',
        summonedAt: new Date(),
      }),
      speechResult.audioBase64
        ? saveGhostAudio(saveDomain, speechResult.audioBase64, Date.now())
        : Promise.resolve(false),
    ]).catch((e) => console.error('[persist] error:', e));

return sendJson(200, {
      profile,
      narrative,
      audio: speechResult.audioBase64,
      audioError: speechResult.errorNotice,
      models: { profile: profileModel, narrative: voiceModel },
      tiers: tierLog,
      notices,
      continuity: { remembered },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (Sentry) {
      logParanormalTelemetry(Sentry, `Conjure exception: ${error?.message || error}`, {
        system: 'gemma',
        errorCode: 'SEANCE_SEVERED',
        domain: sanitized.domain,
        details: error,
        level: 'error',
      });
      await Sentry.flush(2000).catch(() => {});
    }

    return sendJson(500, {
      error: DIEGETIC_MESSAGES.SEANCE_SEVERED,
      details: error?.message || 'CONJURE_FAILED',
      tiers: tierLog,
    });
  }
}
