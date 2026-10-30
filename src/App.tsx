import React, { useState, useRef, useEffect } from 'react';
import { DIEGETIC_MESSAGES } from './sentry/diegetic.ts';
import { parseWikiExtract, extractWikiEra } from './utils/wikiParser.ts';

// API base — empty string = relative (Vercel). Set VITE_API_URL for Render.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';


// ─── Types ─────────────────────────────────────────────────────────
interface ReconFootprint {
  domain: string;
  target: string;
  dns: { resolved: boolean; addresses: string[]; error: string | null };
  ping: { alive: boolean; latencyMs: number | null; errorCode: string | null; diegeticStatus: string };
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

interface GhostProfile {
  original_purpose: string;
  last_seen_year: number | string;
  cause_of_death: string;
  emotional_state: string;
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

interface ConjureResult {
  profile: GhostProfile;
  narrative: string;
  audio: string | null;
  audioError?: string | null;
  models?: { profile: string; narrative: string };
  tiers?: TierAttempt[];
  notices: string[];
  continuity: { remembered: boolean };
  timestamp: string;
}

interface VisitedGhost {
  domain: string;
  year: string;
  state: string;
}

const PRESET_RELICS = [
  { domain: 'geocities.com', era: '1994–2009', epitaph: 'neighborhoods of raw HTML' },
  { domain: 'friendster.com', era: '2002–2015', epitaph: 'the first social ghost' },
  { domain: 'vine.co', era: '2012–2017', epitaph: 'six seconds, looping forever' },
  { domain: 'pets.com', era: '1998–2000', epitaph: 'the sock puppet martyr' },

    { domain: 'myspace.com', label: 'myspace', era: '2003–now' },
    { domain: 'clubpenguin.com', label: 'club penguin', era: '2005–2017' },
    { domain: 'megaupload.com', label: 'megaupload', era: '2005–2012' },
    { domain: 'grooveshark.com', label: 'grooveshark', era: '2006–2015' },
    { domain: 'sixdegrees.com', label: 'sixdegrees', era: '1997–2001' },
    { domain: 'boo.com', label: 'boo.com', era: '1998–2000' },
    { domain: 'angelfire.com', label: 'angelfire', era: '1996–now' },
    { domain: 'thepiratebay.org', label: 'pirate bay', era: '2003–now' },
];

// ─── Ambient hum (Web Audio, no asset) ─────────────────────────────
function useAmbientHum() {
  const ctxRef = useRef<AudioContext | null>(null);
  const startedRef = useRef(false);

  const start = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new Ctx();
      ctxRef.current = ctx;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 38;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0;
      oscGain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 4);
      osc.connect(oscGain).connect(ctx.destination);
      osc.start();

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 600;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0;
      noiseGain.gain.linearRampToValueAtTime(0.006, ctx.currentTime + 5);
      noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
      noise.start();
    } catch {}
  };

  return { start };
}

// ─── Typewriter reveal ─────────────────────────────────────────────
function useTypewriter(text: string, speedMs = 9) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    setShown('');
    setDone(false);
    idxRef.current = 0;
    if (!text) return;
    const id = setInterval(() => {
      idxRef.current += 1;
      setShown(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs]);

  const skip = () => {
    setShown(text);
    setDone(true);
  };
  return { shown, done, skip };
}

// ─── Wikipedia archive fragment hook ───────────────────────────────
interface WikiFragment {
  title: string;
  description?: string;
  extract: string;
  paragraphs: string[];
  url: string;
  thumbnail?: string;
  era?: string | null;
}

function useWikiFragment(domain: string, enabled: boolean) {
  const [fragment, setFragment] = useState<WikiFragment | null>(null);
  const [whoisData, setWhoisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!enabled || !domain) return;
    setTried(false);
    setFragment(null);
    setLoading(true);

    const cleanDomain = domain.replace(/^www\./, '');

    (async () => {
      try {
        const res = await fetch(API_BASE + '/api/wiki?title=' + encodeURIComponent(cleanDomain));
        if (!res.ok) { setTried(true); return; }
        const data = await res.json();
        if (!data || !data.ok || !data.extract) { setTried(true); return; }

        const rawText: string = data.extract;
        const parsedParagraphs = parseWikiExtract(rawText);
        const derivedEra = extractWikiEra(rawText);
        if (!rawText || parsedParagraphs.length === 0) { setTried(true); return; }

        setFragment({
          title: data.title || cleanDomain,
          description: data.description || 'Defunct Internet Service & Historical Archive',
          extract: rawText,
          paragraphs: parsedParagraphs,
          url: data.url || ('https://en.wikipedia.org/wiki/' + encodeURIComponent(cleanDomain)),
          thumbnail: data.thumbnail,
          era: derivedEra,
        });
      } catch { /* silent */ }
      finally { setLoading(false); setTried(true); }
    })();
  }, [domain, enabled]);

  return { fragment, loading, tried };
}

// ─── SerpApi web echoes hook ──────────────────────────────────────
interface EchoItem {
  title: string;
  link: string;
  snippet: string;
  source?: string;
}

function useEchoes(domain: string, enabled: boolean) {
  const [echoes, setEchoes] = useState<EchoItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !domain) return;
    setLoading(true);
    fetch(API_BASE + '/api/echoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain }),
    })
      .then((res) => (res.ok ? res.json() : { echoes: [] }))
      .then((data) => setEchoes(data.echoes || []))
      .catch(() => setEchoes([]))
      .finally(() => setLoading(false));
  }, [domain, enabled]);

  return { echoes, loading };
}

const BOOT_LINES = [
  'opening the ossuary…',
  'walking the wire, looking for a heartbeat…',
  'none found.',
  'establishing a séance channel…',
  'ready.',
];

// ─── App ──────────────────────────────────────────────────────────
export default function App() {
  const [booted, setBooted] = useState(false);
  const [bootLine, setBootLine] = useState(0);
  const [domainInput, setDomainInput] = useState('');
  const [isSummoning, setIsSummoning] = useState(false);
  const [stage, setStage] = useState<'idle' | 'recon' | 'conjure' | 'summoned' | 'error'>('idle');
  const [streamLines, setStreamLines] = useState<string[]>([]);
  const [footprint, setFootprint] = useState<ReconFootprint | null>(null);
  const [conjureResult, setConjureResult] = useState<ConjureResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLedger, setShowLedger] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [visitedGhosts, setVisitedGhosts] = useState<VisitedGhost[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isThemeAnimating, setIsThemeAnimating] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const ambient = useAmbientHum();
  const { shown, done: typingDone, skip } = useTypewriter(conjureResult?.narrative || '', 9);

  const toggleTheme = () => {
    if (isThemeAnimating) return;
    setIsThemeAnimating(true);
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    setTimeout(() => setIsThemeAnimating(false), 1400);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ossuary_visited');
      if (stored) {
        setVisitedGhosts(JSON.parse(stored));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (booted) return;
    if (bootLine >= BOOT_LINES.length) {
      const t = setTimeout(() => setBooted(true), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setBootLine((n) => n + 1), 340);
    return () => clearTimeout(t);
  }, [bootLine, booted]);

  useEffect(() => {
    if (stage === 'recon') {
      document.title = `seeking ${footprint?.domain || domainInput}… · OSSUARY`;
    } else if (stage === 'conjure') {
      document.title = `🕯️ conjuring ${footprint?.domain || domainInput}… · OSSUARY`;
    } else if (stage === 'summoned') {
      document.title = `${footprint?.domain || 'ghost'} · last packet · OSSUARY`;
    } else {
      document.title = 'OSSUARY: The Last Packet';
    }
  }, [stage, footprint?.domain, domainInput]);

  const pushStream = (line: string) => setStreamLines((prev) => [...prev.slice(-5), line]);
  const triggerGlitch = () => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 380);
  };

  const handleSummon = async (targetDomain?: string, force = false) => {
    const cleanTarget = targetDomain || domainInput;
    const domain = cleanTarget
      .trim().toLowerCase()
      .replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!domain) return;

    const isPreset = PRESET_RELICS.some((r) => r.domain === domain);
    const shouldForce = force || isPreset;

    ambient.start();
    if (isSummoning) return;
    setIsSummoning(true);
    setStage('recon');
    setErrorMessage(null);
    setFootprint(null);
    setConjureResult(null);
    setStreamLines([]);
    setIsPlayingAudio(false);
    pushStream(`opening channel: ${domain}`);

    try {
      let reconData: ReconFootprint;
      try {
        const res = await fetch(API_BASE + '/api/recon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (res.status === 400) {
            throw new Error(errData.error || 'Invalid domain or IP address format.');
          }
          if (res.status === 429) {
            throw new Error(errData.error || DIEGETIC_MESSAGES.RATE_LIMIT_ETHER);
          }
          throw new Error(errData.error || errData.details || `recon ${res.status}`);
        }
        reconData = await res.json();
      } catch (err: any) {
        throw err;
      }

      setFootprint(reconData);
      pushStream(reconData.dns.resolved ? 'dns: resolved' : 'dns: severed');
      pushStream(reconData.ping.alive ? 'probe: ack' : `probe: ${reconData.ping.errorCode || 'refused'}`);
      pushStream(reconData.wayback.hasSnapshot ? `archive: ${reconData.wayback.closestTimestamp?.slice(0, 4)}` : 'archive: no tombstone');

      setStage('conjure');
      pushStream('invoking the ghost…');

      let conjuredData: ConjureResult;
      try {
        const res = await fetch(API_BASE + '/api/conjure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ footprint: reconData, force: shouldForce }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          let fullMsg = errData.error || errData.details || `conjure ${res.status}: the ghost did not answer`;
          if (errData?.evidence) {
            fullMsg += ` [WHOIS: ${errData.evidence.whoisStatus}, Wayback: ${errData.evidence.waybackYear}]`;
          }
          throw new Error(fullMsg);
        }
        conjuredData = await res.json();
      } catch (err: any) {
        throw err;
      }

      setConjureResult(conjuredData);
      setStage('summoned');
      setIsSummoning(false);

      try {
        const year = String(reconData.wayback.closestTimestamp?.slice(0, 4) || conjuredData.profile.last_seen_year || '????');
        const state = conjuredData.profile.emotional_state || 'unknown';
        setVisitedGhosts((prev) => {
          const filtered = prev.filter((g) => g.domain !== domain);
          const updated = [{ domain, year, state }, ...filtered].slice(0, 6);
          localStorage.setItem('ossuary_visited', JSON.stringify(updated));
          return updated;
        });
      } catch {}
    } catch (err: any) {
      triggerGlitch();
      setStage('error');
      setIsSummoning(false);
      setErrorMessage(err?.message || DIEGETIC_MESSAGES.SEANCE_SEVERED);
      pushStream(`! ${err?.message || 'séance severed.'}`);
    }
  };

  const reset = () => {
    setStage('idle');
    setConjureResult(null);
    setFootprint(null);
    setErrorMessage(null);
    setStreamLines([]);
    setDomainInput('');
    setIsPlayingAudio(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className={`ossuary-root theme-${theme} ${isThemeAnimating ? 'theme-transitioning' : ''} ${glitchActive ? 'glitch' : ''}`} data-stage={stage}>
      <div className="grain" aria-hidden />
      <div className="scanlines" aria-hidden />
      <div className="vignette" aria-hidden />
      <FloatingSpirits active={stage === 'conjure' || stage === 'summoned'} />

      <header className="top-strip">
        <span className="brand-mark">◈</span>
        <span className="brand">ossuary</span>
        <span className="sep">·</span>
        <span className="tag">last packet</span>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          disabled={isThemeAnimating}
          aria-label={theme === 'dark' ? 'switch to light theme' : 'switch to dark theme'}
          title={theme === 'dark' ? 'let the light in' : 'return to darkness'}
        >
          {theme === 'dark' ? '¤' : '☾'}
        </button>
      </header>

      {!booted ? (
        <BootScreen lines={BOOT_LINES.slice(0, bootLine)} onSkip={() => setBooted(true)} />
      ) : stage === 'idle' ? (
        <IdleAltar
          domainInput={domainInput}
          setDomainInput={setDomainInput}
          onSubmit={() => handleSummon(domainInput, false)}
          onPreset={(d) => {
            setDomainInput(d);
            handleSummon(d, true);
          }}
          inputRef={inputRef}
          visitedGhosts={visitedGhosts}
        />
      ) : stage === 'recon' || stage === 'conjure' ? (
        <ConjuringScreen stage={stage} lines={streamLines} />
      ) : stage === 'summoned' && conjureResult ? (
        <GhostScreen
          domain={footprint?.domain || ''}
          result={conjureResult}
          footprint={footprint}
          shownNarrative={shown}
          typingDone={typingDone}
          onSkipTyping={skip}
          isPlaying={isPlayingAudio}
          toggleAudio={toggleAudio}
          audioRef={audioRef}
          setIsPlayingAudio={setIsPlayingAudio}
          showLedger={showLedger}
          setShowLedger={setShowLedger}
          onReset={reset}
        />
      ) : stage === 'error' ? (
        <ErrorScreen message={errorMessage || ''} onRetry={reset} />
      ) : null}

      <footer className="bottom-strip">
        <span>hacktoberfest 2026</span>
        <span className="sep">·</span>
        <span>ghost in the machine</span>
      </footer>
    </div>
  );
}

// ─── Sub-screens ──────────────────────────────────────────────────
function BootScreen({ lines, onSkip }: { lines: string[]; onSkip: () => void }) {
  return (
    <main className="centered" onClick={onSkip} style={{ cursor: 'pointer' }}>
      <div className="sigil-wrap">
        <span className="sigil">◈</span>
      </div>
      <div className="boot-lines">
        {lines.map((l, i) => (
          <div key={i} className="boot-line">
            <span className="boot-arrow">›</span> {l}
          </div>
        ))}
        <span className="cursor">▌</span>
      </div>
    </main>
  );
}

function IdleAltar({
  domainInput, setDomainInput, onSubmit, onPreset, inputRef, visitedGhosts,
}: {
  domainInput: string;
  setDomainInput: (v: string) => void;
  onSubmit: () => void;
  onPreset: (d: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  visitedGhosts: VisitedGhost[];
}) {
  return (
    <main className="centered">
      <div className="sigil-wrap">
        <span className="sigil">◈</span>
      </div>

      <h1 className="title">Speak a name<br />that no longer answers.</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="ritual-form"
      >
        <span className="prompt">›</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="geocities.com"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </form>

      <div className="relics">
        <span className="relic-label">known relics</span>
        {PRESET_RELICS.map((r) => (
          <button key={r.domain} className="relic" onClick={() => onPreset(r.domain)}>
            <span className="relic-domain">{r.domain}</span>
            <span className="relic-era">{r.era}</span>
          </button>
        ))}
      </div>

      {visitedGhosts.length > 0 && (
        <div className="visited-relics">
          <span>spirits previously visited in this terminal:</span>
          <div className="visited-chips">
            {visitedGhosts.map((g) => (
              <button
                key={g.domain}
                className="visited-chip"
                onClick={() => {
                  setDomainInput(g.domain);
                  onPreset(g.domain);
                }}
              >
                {g.domain} ({g.year})
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function ConjuringScreen({ stage, lines }: { stage: string; lines: string[] }) {
  return (
    <main className="centered">
      <div className="sigil-wrap spin">
        <span className="sigil">◈</span>
      </div>
      <div className="stream">
        {lines.map((l, i) => (
          <div key={i} className="stream-line">
            <span className="stream-arrow">›</span> {l}
          </div>
        ))}
        <span className="cursor">▌</span>
      </div>
      <p className="phase">{stage === 'recon' ? 'listening' : 'channeling'}</p>
    </main>
  );
}

// ─── Timeline of Decay ─────────────────────────────────────────────
function TimelineOfDecay({ bornYear, lastSeen }: { bornYear?: string; lastSeen: string | number }) {
  const currentYear = new Date().getFullYear();
  return (
    <div className="timeline-decay" aria-label="Timeline of digital decay">
      <div className="timeline-track">
        <div className="timeline-progress" style={{ width: '50%' }} />
        <div className="timeline-node active">
          <span className="timeline-dot" />
          <div className="timeline-meta">
            <span className="timeline-year">{bornYear || 'pre-archive'}</span>
            <span className="timeline-label">first captured</span>
          </div>
        </div>
        <div className="timeline-node active">
          <span className="timeline-dot" />
          <div className="timeline-meta">
            <span className="timeline-year">{lastSeen}</span>
            <span className="timeline-label">last archived</span>
          </div>
        </div>
        <div className="timeline-node current">
          <span className="timeline-dot" />
          <div className="timeline-meta">
            <span className="timeline-year">{currentYear}</span>
            <span className="timeline-label">now</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WikiMemorial Component ────────────────────────────────────────
function WikiMemorial({
  domain, fragment, loading, tried,
}: {
  domain: string;
  fragment: WikiFragment | null;
  loading: boolean;
  tried: boolean;
}) {
  if (!tried && !loading) return null;

  return (
    <section className="wiki-memorial-reliquary" aria-label="Encyclopedic Memorial Record">
      <div className="wiki-reliquary-divider">
        <span className="wiki-divider-line" />
        <span className="wiki-divider-sigil">◈ 📜 ◈</span>
        <span className="wiki-divider-line" />
      </div>

      <div className="wiki-reliquary-card">
        <div className="wiki-reliquary-header">
          <span className="wiki-eyebrow">the encyclopedia remembers</span>
          <span className="wiki-chronicle-tag">historical chronicle</span>
        </div>

        {loading && (
          <div className="wiki-loading">
            <span className="wiki-dot" />
            <span className="wiki-dot" />
            <span className="wiki-dot" />
            <span className="wiki-loading-text">unrolling the historical scrolls for {domain}…</span>
          </div>
        )}

        {!loading && fragment && (
          <article className="wiki-reliquary-content">
            {fragment.thumbnail && (
              <div className="wiki-thumb-wrap">
                <img
                  src={fragment.thumbnail}
                  alt={fragment.title}
                  className="wiki-thumb"
                  loading="lazy"
                />
              </div>
            )}

            <div className="wiki-reliquary-body">
              <h3 className="wiki-title">{fragment.title}</h3>

              {fragment.description && (
                <div className="wiki-badge">{fragment.description}</div>
              )}

              <div className="wiki-facts-grid">
                <div className="wiki-fact-item">
                  <span className="wiki-fact-label">chronicle era</span>
                  <span className="wiki-fact-value">{fragment.era || 'archived era'}</span>
                </div>
                <div className="wiki-fact-item">
                  <span className="wiki-fact-label">relic status</span>
                  <span className="wiki-fact-value">defunct / preserved</span>
                </div>
                <div className="wiki-fact-item">
                  <span className="wiki-fact-label">source repository</span>
                  <span className="wiki-fact-value">wikipedia archives</span>
                </div>
              </div>

              <div className="wiki-extract-full">
                {fragment.paragraphs.map((para, idx) => (
                  <p key={idx} className="wiki-paragraph">
                    {para}
                  </p>
                ))}
              </div>

              <div className="wiki-action-wrap">
                <a
                  href={fragment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="wiki-full-link"
                >
                  <span>read unabridged chronicle on wikipedia</span>
                  <span className="wiki-arrow">↗</span>
                </a>
              </div>
            </div>
          </article>
        )}

        {!loading && tried && !fragment && (
          <div className="wiki-empty-wrap">
            <p className="wiki-empty">
              the encyclopedia holds no tombstone for {domain}.
              <br />
              it lived in quiet obscurity and vanished into unindexed static.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

interface GhostScreenProps {
  domain: string;
  result: ConjureResult;
  footprint: ReconFootprint | null;
  shownNarrative: string;
  typingDone: boolean;
  onSkipTyping: () => void;
  isPlaying: boolean;
  toggleAudio: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  setIsPlayingAudio: (v: boolean) => void;
  showLedger: boolean;
  setShowLedger: React.Dispatch<React.SetStateAction<boolean>>;
  onReset: () => void;
}

function GhostScreen({
  domain, result, footprint, shownNarrative, typingDone, onSkipTyping,
  isPlaying, toggleAudio, audioRef, setIsPlayingAudio,
  showLedger, setShowLedger, onReset,
}: GhostScreenProps) {
  const iframeSrc = footprint?.wayback?.closestTimestamp
    ? `https://web.archive.org/web/${footprint.wayback.closestTimestamp}if_/http://${domain}/`
    : null;

  const bornYear =
    footprint?.wayback?.earliestTimestamp?.slice(0, 4) ||
    footprint?.whois?.creationDate?.slice(0, 4);
  const firstSeen = bornYear;
  const lastArchived = footprint?.wayback?.closestTimestamp?.slice(0, 4) || String(result.profile.last_seen_year);
  const hasVisage = footprint?.wayback?.hasSnapshot && iframeSrc;

  
  const [whoisData, setWhoisData] = useState<any>(null);
  useEffect(() => {
    if (!domain) { setWhoisData(null); return; }
    let active = true;
    const clean = domain.replace(/^www\./, '').trim();
    if (!clean) return;
    fetch(`${API_BASE}/api/whois?domain=${encodeURIComponent(clean)}`)
      .then(r => r.json())
      .then(d => { if (active && d && d.ok) setWhoisData(d); })
      .catch(() => {});
    return () => { active = false; };
  }, [domain]);

const { fragment, loading: wikiLoading, tried: wikiTried } = useWikiFragment(domain, true);
  const { echoes } = useEchoes(domain, true);

  const scrollToRecord = () => {
    document.querySelector('.wiki-memorial-reliquary')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="ghost-main">
      <div className="sigil-wrap summoned" style={{ margin: '0 auto' }}>
        <span className="sigil">◈</span>
      </div>

      <div style={{ textAlign: 'center', marginTop: '-36px' }}>
        <button className="link-btn scroll-to-record-btn" onClick={scrollToRecord}>
          scroll to record
        </button>
      </div>

      <header className="ghost-header">
        <div className="ghost-domain">{domain}</div>
        <div className="ghost-dates">
          {bornYear ? (
            <>
              <span>{bornYear}</span>
              <span className="dash">—</span>
              <span>{lastArchived}</span>
            </>
          ) : (
            <span className="unknown">dates unknown</span>
          )}
        </div>
        <div className="ghost-state">{result.profile.emotional_state.toLowerCase()}</div>
      </header>

      <TimelineOfDecay bornYear={firstSeen} lastSeen={lastArchived} />

      {hasVisage ? (
        <section className="visage">
          <div className="visage-label">
            <span className="visage-eyebrow">the last visage</span>
            <span className="visage-caption">
              captured {footprint?.wayback?.closestTimestamp?.slice(0, 4)}
            </span>
          </div>
          <div className="visage-frame">
            <iframe
              src={iframeSrc!}
              title={`last visage of ${domain}`}
              sandbox="allow-scripts allow-popups"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="visage-iframe"
            />
            <div className="visage-overlay" aria-hidden />
            <div className="visage-wisps" aria-hidden>
              <span className="wisp wisp-a" />
              <span className="wisp wisp-b" />
              <span className="wisp wisp-c" />
            </div>
          </div>
          <div className="visage-footnote">
            rendered by the internet archive. the ghost still remembers how it looked.
          </div>
        </section>
      ) : (
        <section className="visage visage-empty">
          <div className="visage-label">
            <span className="visage-eyebrow">the last visage</span>
            <span className="visage-caption">— none —</span>
          </div>
          <div className="visage-frame empty">
            <div className="empty-text">
              <span className="empty-icon">◌</span>
              no one saved this ghost.<br />
              the archive has forgotten what it looked like.
            </div>
          </div>
        </section>
      )}

      <article
        className="narrative"
        onClick={() => !typingDone && onSkipTyping()}
        style={{ cursor: typingDone ? 'default' : 'pointer' }}
      >
        <span className="quote-mark">“</span>
        {shownNarrative}
        {!typingDone && <span className="cursor">▌</span>}
        {typingDone && <span className="quote-mark">”</span>}
      </article>

      <section className="memorial">
        <h2 className="memorial-title">what the archive remembers</h2>
        <dl className="memorial-list">
          <div className="memorial-row">
            <dt>it was</dt>
            <dd>{result.profile.original_purpose}</dd>
          </div>
          {footprint?.whois?.registrar && (
            <div className="memorial-row">
              <dt>registered by</dt>
              <dd>{footprint.whois.registrar}</dd>
            </div>
          )}
          <div className="memorial-row">
            <dt>cause of death</dt>
            <dd>{result.profile.cause_of_death.toLowerCase().replace(/_/g, ' ')}</dd>
          </div>
          {footprint?.wayback?.hasSnapshot && (
            <div className="memorial-row">
              <dt>archived</dt>
              <dd>
                {footprint.wayback.closestTimestamp?.slice(0, 4)}
                {footprint.wayback.snapshotUrl && (
                  <>
                    {' · '}
                    <a
                      href={footprint.wayback.snapshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="memorial-link"
                    >
                      witness →
                    </a>
                  </>
                )}
              </dd>
            </div>
          )}
          <div className="memorial-row">
            <dt>the machine remembers</dt>
            <dd className="italic">{result.profile.one_sensory_detail}</dd>
          </div>
        </dl>
      </section>

      <WikiMemorial
        domain={domain}
        fragment={fragment}
        loading={wikiLoading}
        tried={wikiTried}
      />

      {echoes.length > 0 && (
        <section className="echoes-section">
          <div className="echoes-label">
            <span>echoes from the search index</span>
            <span className="echoes-tag">serpapi</span>
          </div>
          <div className="echoes-list">
            {echoes.map((e, idx) => (
              <a key={idx} href={e.link} target="_blank" rel="noreferrer" className="echo-item">
                <span className="echo-title">{e.title}</span>
                <span className="echo-snippet">{e.snippet}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="voice">
        {result.audio ? (
          <>
            <button className="play-btn" onClick={toggleAudio}>
              <span className="play-icon">{isPlaying ? '❚❚' : '▶'}</span>
              <span>{isPlaying ? 'silence the ghost' : 'hear the ghost'}</span>
            </button>
            <div className={`waveform ${isPlaying ? 'active' : ''}`} aria-hidden>
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} style={{ animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
            <audio
              ref={audioRef}
              src={result.audio}
              onEnded={() => setIsPlayingAudio(false)}
              className="hidden"
            />
          </>
        ) : (
          <span className="muted">{result.audioError || DIEGETIC_MESSAGES.GHOST_MUTE}</span>
        )}
      </section>

      {result.tiers && result.tiers.length > 0 && (
        <section className="ledger-section">
          <button className="link-btn" onClick={() => setShowLedger((v) => !v)}>
            {showLedger ? '▾' : '▸'} conjuration tier log
          </button>
          {showLedger && (
            <div className="ledger">
              {result.tiers.map((t, i) => (
                <div key={i} className="ledger-row">
                  <span className="ledger-k">
                    tier {t.tier} · {t.provider}
                  </span>
                  <span
                    className="ledger-v"
                    style={{
                      color:
                        t.status === 'success' ? '#7ac47a'
                        : t.status === 'skipped' ? 'var(--dim)'
                        : t.status === 'timeout' ? 'var(--amber)'
                        : 'var(--blood)',
                    }}
                  >
                    {t.status} · {t.durationMs}ms
                    {t.error ? ` · ${t.error.slice(0, 40)}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="ledger-section">
        <button className="link-btn" onClick={() => setShowLedger((v) => !v)}>
          {showLedger ? '▾' : '▸'} footprint ledger
        </button>
        {showLedger && (
          <div className="ledger">
            <div className="ledger-row">
              <span className="ledger-k">dns</span>
              <span className="ledger-v">
                {footprint?.dns?.resolved ? 'resolved' : footprint?.dns?.error || 'severed'}
              </span>
            </div>
            <div className="ledger-row">
              <span className="ledger-k">probe</span>
              <span className="ledger-v">
                {footprint?.ping?.alive ? `${footprint.ping.latencyMs}ms` : footprint?.ping?.errorCode || 'refused'}
              </span>
            </div>
            <div className="ledger-row">
              <span className="ledger-k">whois</span>
              <span className="ledger-v">{footprint?.whois?.status || 'unknown'}</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-k">wayback</span>
              <span className="ledger-v">
                {footprint?.wayback?.hasSnapshot ? footprint.wayback.closestTimestamp?.slice(0, 4) : 'no tombstone'}
              </span>
            </div>
            {whoisData && (
              <div className="whois-panel">
                <div className="whois-row"><span className="whois-label">registrar</span><span className="whois-value">{whoisData.registrar || '—'}</span></div>
                <div className="whois-row"><span className="whois-label">created</span><span className="whois-value">{whoisData.create_date ? whoisData.create_date.slice(0,10) : '—'}</span></div>
                <div className="whois-row"><span className="whois-label">expires</span><span className="whois-value">{whoisData.expire_date ? whoisData.expire_date.slice(0,10) : '—'}</span></div>
              </div>
            )}

            <div className="ledger-row">
              <span className="ledger-k">model</span>
              <span className="ledger-v">{result.models?.narrative || 'unknown'}</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-k">memory</span>
              <span className="ledger-v">{result.continuity?.remembered ? 'remembered' : 'faded'}</span>
            </div>
            {result.notices?.length > 0 && (
              <div className="ledger-notices">
                {result.notices.map((n: string, i: number) => (
                  <div key={i} className="ledger-notice">{n}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <ResetButton onReset={onReset} />

      <GhostFooter />
      <TechStackFooter />
    </main>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="centered error-screen-main">
      <div className="sigil-wrap">
        <span className="sigil" style={{ color: 'var(--blood)', textShadow: '0 0 20px rgba(139, 30, 30, 0.8)' }}>◈</span>
      </div>
      <p className="error-line">{DIEGETIC_MESSAGES.SEANCE_SEVERED}</p>
      <p className="error-detail">{message}</p>
      <button className="link-btn reset" onClick={onRetry}>— return to the altar —</button>
    </main>
  );
}

function FloatingSpirits({ active }: { active: boolean }) {
  return (
    <div className={`spirits ${active ? 'active' : ''}`} aria-hidden>
      {Array.from({ length: 7 }).map((_, i) => (
        <span key={i} className={`spirit spirit-${i}`} />
      ))}
    </div>
  );
}

function GhostFooter() {
  return (
    <footer className="ghost-footer">
      <span className="footer-label">summoned by</span>
      <a href="https://dev.to/ggle_in" target="_blank" rel="noreferrer" className="footer-link">
        Jack
      </a>
      <span className="footer-sep">·</span>
      <a href="https://saturumah.net" target="_blank" rel="noreferrer" className="footer-link">
        homepage
      </a>
      <span className="footer-sep">·</span>
      <a href="https://github.com/setuju" target="_blank" rel="noreferrer" className="footer-link">
        github
      </a>
    </footer>
  );
}

/* ─── ossuary final css ─── */
const FINAL_CSS = `
.tech-stack-footer {
  margin: 2.5rem auto 1.5rem;
  max-width: 720px;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(138,122,90,0.25);
}
.tech-stack-label {
  font-family: var(--font-body);
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(200,180,140,0.55);
  margin-bottom: 0.9rem;
}
.tech-stack-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}
.tech-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.28rem 0.6rem;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(138,122,90,0.18);
  border-radius: 4px;
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: rgba(220,205,175,0.85);
  transition: border-color 0.2s, background 0.2s;
}
.tech-chip:hover { border-color: rgba(200,180,140,0.45); background: rgba(255,255,255,0.04); }
.tech-chip-icon { flex-shrink: 0; opacity: 0.85; color: rgba(200,180,140,0.85); }
.tech-chip-name { white-space: nowrap; }
.tech-stack-footer-meta {
  margin-top: 1rem;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: rgba(180,165,135,0.4);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.tech-stack-dot { margin: 0 0.4rem; }
/* better ledger panel */
.ledger-panel {
  margin: 1.25rem auto;
  max-width: 720px;
  padding: 1rem 1.25rem;
  background: rgba(0,0,0,0.18);
  border: 1px solid rgba(138,122,90,0.15);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: rgba(220,205,175,0.8);
}
.ledger-row {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
  border-bottom: 1px dashed rgba(138,122,90,0.12);
}
.ledger-row:last-child { border-bottom: none; }
.ledger-key { color: rgba(180,165,135,0.6); }
.ledger-val { color: rgba(220,205,175,0.9); }
.ledger-status-ok { color: #7fbf7f; }
.ledger-status-warn { color: #d4a04a; }
.ledger-status-err { color: #c96a5a; }
.lost-voice-note {
  margin-top: 0.85rem;
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: rgba(200,180,140,0.6);
  font-style: italic;
}
/* gantt */
.gantt-wrap { margin: 1.25rem auto; max-width: 720px; }
.gantt-row { display: flex; align-items: center; margin-bottom: 0.4rem; }
.gantt-label {
  flex: 0 0 120px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: rgba(180,165,135,0.65);
  text-align: right;
  padding-right: 0.75rem;
}
.gantt-track {
  flex: 1;
  position: relative;
  height: 14px;
  background: rgba(255,255,255,0.03);
  border-radius: 2px;
  overflow: hidden;
}
.gantt-bar {
  position: absolute;
  top: 2px;
  height: 10px;
  border-radius: 2px;
  background: linear-gradient(90deg, rgba(200,180,140,0.7), rgba(138,122,90,0.45));
}
.gantt-tick {
  position: absolute;
  top: -2px;
  width: 1px;
  height: 18px;
  background: rgba(200,180,140,0.3);
}
.gantt-year {
  position: absolute;
  top: 16px;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: rgba(180,165,135,0.4);
  transform: translateX(-50%);
}
.gantt-legend {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: rgba(180,165,135,0.55);
}
.gantt-legend span::before {
  content: '■ ';
  color: rgba(200,180,140,0.7);
}
`;

function TechStackFooter() {
  const stack = [
    { name: 'React', url: 'https://react.dev', icon: '⚛' },
    { name: 'TypeScript', url: 'https://www.typescriptlang.org', icon: 'TS' },
    { name: 'Node.js', url: 'https://nodejs.org', icon: '⬢' },
    { name: 'Vite', url: 'https://vitejs.dev', icon: '⚡' },
    { name: 'Vercel', url: 'https://vercel.com', icon: '▲' },
    { name: 'Sentry', url: 'https://sentry.io', icon: '🛡' },
    { name: 'Tailwind', url: 'https://tailwindcss.com', icon: '🌊' },
    { name: 'Gemma', url: 'https://ai.google.dev/gemma', icon: '💎' },
    { name: 'Ollama', url: 'https://ollama.com', icon: '🦙' },
    { name: 'Mastra', url: 'https://mastra.ai', icon: 'M' },
    { name: 'ElevenLabs', url: 'https://elevenlabs.io', icon: '11' },
    { name: 'SerpApi', url: 'https://serpapi.com', icon: '🔍' },
    { name: 'Backboard', url: 'https://backboard.io', icon: 'B' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: 'W' },
    { name: 'Wayback', url: 'https://archive.org/web/', icon: '🕒' },
  
    { name: 'Render', url: 'https://render.com', icon: '🔺' },
    { name: 'MongoDB', url: 'https://mongodb.com', icon: '🍃' },
    { name: 'TigerData', url: 'https://tigerdata.com', icon: '🐯' },
    { name: 'OpenRouter', url: 'https://openrouter.ai', icon: '🔀' },
    { name: 'GenAI', url: 'https://ai.google.dev', icon: '✦' },
    { name: 'GitHub', url: 'https://github.com/setuju/ossuary', icon: '🐙' },
];

  return (
    <footer className="ossuary-footer-container">
      <div className="tech-grid-ascii">
        {stack.map((tech) => (
          <a
            key={tech.name}
            href={tech.url}
            target="_blank"
            rel="noopener noreferrer"
            className="tech-box"
            title={tech.name}
          >
            <span className="tech-icon">{tech.icon}</span>
            <span className="tech-name">{tech.name}</span>
          </a>
        ))}
      </div>
      <div className="footer-links-ascii">
        <a href="https://ossuary.saturumah.net" target="_blank" rel="noopener noreferrer">OSSUARY</a>
        <span className="dot">·</span>
        <a href="https://hacktoberfest.com/?utm_source=dev.to&utm_medium=challenge-page&utm_campaign=hacktoberfest-2026&utm_content=week4-home-button" target="_blank" rel="noopener noreferrer">hacktoberfest 2026</a>
        <span className="dot">·</span>
        <a href="https://dev.to/challenges/hacktoberfest-week4-2026-10-26" target="_blank" rel="noopener noreferrer">ghost in the machine</a>
      </div>
    </footer>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  const [leaving, setLeaving] = useState(false);

  const handleClick = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => onReset(), 420);
  };

  return (
    <button
      className={`link-btn reset ${leaving ? 'leaving' : ''}`}
      onClick={handleClick}
      disabled={leaving}
    >
      ← summon another
    </button>
  );
}
