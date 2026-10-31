/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FILE CONTRACT                                      │
 * │  ──────────────────────────────────────────────────────────────────  │
 * │  File      : src/utils/wikiParser.ts                                   │
 * │  Purpose   : Parse Wikipedia extracts into ghost narrative material    │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                          │
 * │  GitHub    : https://github.com/setuju                                 │
 * │  Website   : https://saturumah.net                                     │
 * │  Created   : 2026-10-26                                                │
 * │  License   : MIT                                                       │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   2026-10-26
 * @package   ossuary
 * @license   MIT
 */

/**
 * Wikipedia lead extract and article text parser for OSSUARY memorial.
 * Cleans raw Wikipedia extracts into readable, well-structured paragraphs
 * for the centered encyclopedic memorial reliquary.
 */

export interface ParsedWikiArticle {
  title: string;
  description?: string;
  paragraphs: string[];
  thumbnail?: string;
  url: string;
  era?: string;
  wordCount: number;
}

// Common abbreviations that end with a period but do NOT end a sentence
const ABBREVIATIONS = /\b(?:inc|corp|co|ltd|e\.g|i\.e|etc|vs|mr|mrs|ms|dr|prof|st|u\.s|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec|approx|no)\.$/i;

/**
 * Strips HTML tags and reference sup tags if present in the text
 */
function stripHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/<sup\b[^>]*class="[^"]*reference[^"]*"[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');
}

/**
 * Cleans and parses raw Wikipedia text or HTML into an array of clean,
 * coherent paragraphs without breaking mid-sentence.
 */
export function parseWikiExtract(rawText: string): string[] {
  if (!rawText || typeof rawText !== 'string') return [];

  // 1. Strip HTML tags and reference elements if present
  let cleaned = stripHtml(rawText);

  // 2. Normalize newlines
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 3. Remove wiki section headers like == History == or === Overview ===
  cleaned = cleaned.replace(/^={2,5}[^=]+={2,5}\s*$/gm, '');

  // 4. Strip citation brackets (e.g., [1], [23], [a], [b], [note 1], [citation needed], [1][a], [1, 2])
  cleaned = cleaned.replace(
    /\[(?:\d+|[a-zA-Z]{1,2}|note\s*[\w\d]+|nb\s*[\w\d]+|lower-[a-z]+\s*[\w\d]+|citation needed|dead link|edit|clarification needed)(?:[;,]\s*(?:\d+|[a-zA-Z]{1,2}|note\s*[\w\d]+|citation needed))*\]/gi,
    ''
  );
  // Also clean any lingering bracket numbers or single letter citations
  cleaned = cleaned.replace(/\[\s*(?:\d+|[a-zA-Z])\s*\]/g, '');

  // 5. Remove phonetic pronunciations like (/ˌdʒiː.oʊˈsɪt.iz/ (listen)) often right after title
  cleaned = cleaned.replace(/\s*\(\/[^/]+\/\s*(?:;\s*)?(?:\(listen\))?\)/gi, '');
  cleaned = cleaned.replace(/\s*\(\s*listen\s*\)/gi, '');

  // 6. Clean spaces before punctuation caused by citation removal (e.g. "word [1]," -> "word ,")
  cleaned = cleaned.replace(/\s+([,.;:!?])/g, '$1');

  // 7. Remove multiple consecutive spaces/tabs within lines
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  // 8. Split by lines to analyze paragraph boundaries vs mid-sentence breaks
  const rawLines = cleaned
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const paragraphs: string[] = [];
  let currentBuffer = '';

  for (const line of rawLines) {
    // Skip common Wikipedia meta/section markers
    const lower = line.toLowerCase();
    if (
      lower.startsWith('see also') ||
      lower.startsWith('references') ||
      lower.startsWith('external links') ||
      lower.startsWith('further reading') ||
      lower.startsWith('notes') ||
      lower.startsWith('gallery')
    ) {
      continue;
    }

    if (!currentBuffer) {
      currentBuffer = line;
      continue;
    }

    // Check if currentBuffer ended with true sentence punctuation
    const endsWithSentencePunct = /[.!?]["']?$/.test(currentBuffer);
    const endsWithAbbreviation = ABBREVIATIONS.test(currentBuffer);

    // If it did NOT end with sentence punctuation or ended with an abbreviation,
    // or if the next line starts with lowercase or continuation punctuation,
    // it's a mid-sentence line break: merge with a space.
    const nextStartsLowercase = /^[a-z,;:)\]]/.test(line);

    if (!endsWithSentencePunct || endsWithAbbreviation || nextStartsLowercase) {
      currentBuffer = `${currentBuffer} ${line}`;
    } else {
      // It ended with genuine sentence punctuation and next line starts a new thought
      paragraphs.push(currentBuffer);
      currentBuffer = line;
    }
  }

  if (currentBuffer) {
    paragraphs.push(currentBuffer);
  }

  // Final cleanup: trim and filter out any lingering non-content lines
  return paragraphs
    .map((p) => p.trim())
    .filter((p) => p.length >= 25 || /[.!?]$/.test(p));
}

/**
 * Extracts possible era or founding/closing years mentioned in text.
 */
export function extractWikiEra(text: string): string | null {
  if (!text) return null;
  const rangeMatch = text.match(/\b(19\d\d|20\d\d)\s*(?:–|-|to)\s*(19\d\d|20\d\d)\b/);
  if (rangeMatch) {
    return `${rangeMatch[1]}–${rangeMatch[2]}`;
  }
  const foundedMatch = text.match(/\b(?:founded|started|launched|created|began)\s+(?:in\s+)?(?:[A-Z][a-z]+\s+)?(19\d\d|20\d\d)\b/i);
  if (foundedMatch) {
    return `est. ${foundedMatch[1]}`;
  }
  return null;
}
