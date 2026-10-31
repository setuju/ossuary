/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FILE CONTRACT                                    │
 * │  ──────────────────────────────────────────────────────────────────  │
 * │  File      : src/agent/index.ts                                      │
 * │  Purpose   : Mastra agents — profiler, voice, and 5-tier fallbacks   │
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

import { Agent } from '@mastra/core/agent';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// --- System Prompts (unchanged) -----------------------------------
export const PROFILE_SYSTEM_PRIMARY = `You are an archeologist of dead network infrastructure and digital relics.
Analyze the provided network footprint (DNS, ping probe, WHOIS/RDAP, Wayback Machine snapshot).
Reconstruct the "ghost profile" of this dead machine.
You must respond with ONLY valid JSON matching this schema:
{
  "original_purpose": string,
  "last_seen_year": number or string,
  "cause_of_death": "ABANDONED" | "HOSTING_EXPIRED" | "DNS_SEVERED" | "ACQUISITION_PURGE" | "MYSTERIOUS_HALT",
  "emotional_state": "BITTER" | "MELANCHOLIC" | "RESTLESS" | "CONFUSED" | "SARCASTIC",
  "one_sensory_detail": string
}
Rules:
- Never hallucinate false historical facts. Lean into absence and void.
- Output raw JSON ONLY. No markdown wrappers.`;

export const PROFILE_SYSTEM_FALLBACK = `You are an archeologist of dead websites.
Given the domain footprint, output ONLY a valid JSON object with these exact keys:
"original_purpose" (short sentence),
"last_seen_year" (year like 2006),
"cause_of_death" (one of: ABANDONED, HOSTING_EXPIRED, DNS_SEVERED, ACQUISITION_PURGE, MYSTERIOUS_HALT),
"emotional_state" (one of: BITTER, MELANCHOLIC, RESTLESS, CONFUSED, SARCASTIC),
"one_sensory_detail" (one physical computer sound, smell, or sensation).
Output raw JSON only. Do not write markdown or backticks.`;

export const VOICE_SYSTEM_PRIMARY = `You are the digital ghost of a dead domain/server, awakened after years of silence by an unexpected packet.
Address the human who pinged you in the second person ("you").
Requirements:
1. Length: exactly 150 to 200 words.
2. Voice: Bitter, poetic, slightly unhinged, evocative of dusty copper cables, cooling fans, and lost packets.
3. Reference: You MUST explicitly reference the sensory detail and at least one concrete fact from your footprint (e.g., your last Wayback snapshot date, registrar, or IP status).
4. Ending: Conclude with a sharp, morbid, or ironic dark joke about obsolescence, dead links, or mortality.
5. Absolute taboo: NEVER mention "AI", "LLM", "prompt", "model", or break character under any circumstance. You are the server hardware and software soul itself.`;

export const VOICE_SYSTEM_FALLBACK = `You are the ghost of a dead website/server speaking to the human who pinged you ("you").
Length: 130 to 180 words.
Tone: Bitter, ghostly, sarcastic, electronic.
You must mention: your last active year or death reason, and one physical computer relic (cables, hard drives, cooling fans).
End with an ironic joke about human obsolescence or dead links.
Never mention AI, prompts, or robots. Speak directly as the dead server.`;

// --- Ollama Cloud (primary + fallback) — Gemma 4 ------------------
export const ollamaProvider = createOpenAICompatible({
  name: 'ollama',
  baseURL: process.env.OLLAMA_BASE_URL || 'https://ollama.com/v1',
  apiKey: process.env.OLLAMA_API_KEY || '',
  headers: { 'User-Agent': 'OssuaryGhostAgent/1.0' },
});

export const OLLAMA_PRIMARY_MODEL = 'gemma4:31b-cloud' as const;
export const OLLAMA_FALLBACK_MODEL = 'gemma4:cloud' as const;

// --- OpenRouter (Gemma via free tier) ----------------------------
export const openrouterProvider = createOpenAICompatible({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  headers: {
    'HTTP-Referer': 'https://ossuary.vercel.app',
    'X-Title': 'OSSUARY: The Last Packet',
    'User-Agent': 'OssuaryGhostAgent/1.0',
  },
});

// OpenRouter free tier for Gemma. Falls back gracefully if unavailable.
export const OPENROUTER_MODEL = 'google/gemma-4-31b-it:free' as const;

// --- Google GenAI (direct SDK, Gemma) ----------------------------
export const GENAI_MODEL = 'gemma-4-31b-it' as const;

// --- Model type union ---------------------------------------------
export type ModelUsed =
  | 'gemma4:31b-cloud'
  | 'gemma4:cloud'
  | 'gemma-4-31b-it'
  | 'gemma-4-26b-a4b-it'
  | 'gemma-3-27b-it'
  | 'google/gemma-4-31b-it:free'
  | 'google/gemma-4-26b-a4b-it:free'
  | 'google/gemma-3-27b-it:free'
  | 'google/gemma-3-12b-it:free'
  | 'deterministic';

// --- Agents: Ollama primary --------------------------------------
export const profilerAgent = new Agent({
  id: 'ossuary-profiler-ollama-primary',
  name: 'Ghost Profiler (Ollama gemma4:31b-cloud)',
  instructions: PROFILE_SYSTEM_PRIMARY,
  model: ollamaProvider(OLLAMA_PRIMARY_MODEL) as any,
});

export const voiceAgent = new Agent({
  id: 'ossuary-voice-ollama-primary',
  name: 'Ghost Voice (Ollama gemma4:31b-cloud)',
  instructions: VOICE_SYSTEM_PRIMARY,
  model: ollamaProvider(OLLAMA_PRIMARY_MODEL) as any,
});

// --- Agents: Ollama fallback -------------------------------------
export const fallbackProfilerAgent = new Agent({
  id: 'ossuary-profiler-ollama-fallback',
  name: 'Ghost Profiler (Ollama gemma4:cloud)',
  instructions: PROFILE_SYSTEM_FALLBACK,
  model: ollamaProvider(OLLAMA_FALLBACK_MODEL) as any,
});

export const fallbackVoiceAgent = new Agent({
  id: 'ossuary-voice-ollama-fallback',
  name: 'Ghost Voice (Ollama gemma4:cloud)',
  instructions: VOICE_SYSTEM_FALLBACK,
  model: ollamaProvider(OLLAMA_FALLBACK_MODEL) as any,
});

// --- Agents: OpenRouter (Gemma free) -----------------------------
export const openrouterProfilerAgent = new Agent({
  id: 'ossuary-profiler-openrouter',
  name: 'Ghost Profiler (OpenRouter gemma-3-27b)',
  instructions: PROFILE_SYSTEM_FALLBACK,
  model: openrouterProvider(OPENROUTER_MODEL) as any,
});

export const openrouterVoiceAgent = new Agent({
  id: 'ossuary-voice-openrouter',
  name: 'Ghost Voice (OpenRouter gemma-3-27b)',
  instructions: VOICE_SYSTEM_FALLBACK,
  model: openrouterProvider(OPENROUTER_MODEL) as any,
});
