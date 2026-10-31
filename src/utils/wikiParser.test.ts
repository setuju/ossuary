/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FILE CONTRACT                                      │
 * │  ──────────────────────────────────────────────────────────────────  │
 * │  File      : src/utils/wikiParser.test.ts                              │
 * │  Purpose   : Unit tests for wikiParser paragraph extraction            │
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

import { test } from 'node:test';
import assert from 'node:assert';
import { parseWikiExtract, extractWikiEra } from './wikiParser.ts';

test('parseWikiExtract splits multi-line extracts correctly', () => {
  const sample = `GeoCities, later Yahoo! GeoCities [1], was a web hosting service that allowed users to create websites.
In its original form, site users selected a "city" in which to list hyperlinks.

== Demise ==
In April 2009, the company announced that it would end the United States GeoCities service on October 26, 2009 [citation needed].
At least 38 million pages were displayed by GeoCities before it was terminated.`;

  const paragraphs = parseWikiExtract(sample);
  assert.strictEqual(paragraphs.length, 4);
  assert.ok(paragraphs[0].includes('GeoCities, later Yahoo! GeoCities, was a web hosting service'));
  assert.ok(!paragraphs[0].includes('[1]'), 'Removes [1]');
  assert.ok(paragraphs[1].includes('In its original form'));
  assert.ok(!paragraphs.some((p) => p.includes('== Demise ==')), 'Filters section headings');
  assert.ok(!paragraphs[2].includes('[citation needed]'), 'Removes citation tags');
  assert.ok(paragraphs[3].includes('At least 38 million pages'));
});

test('parseWikiExtract cleans citation brackets like [1], [a], [b], and [note 1]', () => {
  const sample = `Yahoo! Inc. [a] announced the shutdown [1] of GeoCities [b] across the U.S. [note 1]. Further details followed.`;
  const [p1] = parseWikiExtract(sample);
  assert.ok(!p1.includes('[a]'), 'Removes [a]');
  assert.ok(!p1.includes('[1]'), 'Removes [1]');
  assert.ok(!p1.includes('[b]'), 'Removes [b]');
  assert.ok(!p1.includes('[note 1]'), 'Removes [note 1]');
  assert.ok(p1.includes('Yahoo! Inc. announced the shutdown of GeoCities across the U.S.'));
});

test('parseWikiExtract joins lines split mid-sentence without breaking paragraph', () => {
  const sample = `GeoCities was founded in November 1994 by David Bohnett and
John Rezner, and was originally named Beverly Hills Internet
before being renamed.

On January 28, 1999, it was acquired by Yahoo! for billions.`;

  const paragraphs = parseWikiExtract(sample);
  assert.strictEqual(paragraphs.length, 2);
  assert.ok(
    paragraphs[0].includes('David Bohnett and John Rezner, and was originally named Beverly Hills Internet before being renamed.'),
    'Joined mid-sentence wraps into a continuous sentence'
  );
  assert.ok(paragraphs[1].startsWith('On January 28, 1999'));
});

test('parseWikiExtract handles HTML paragraphs and reference tags', () => {
  const sample = `<p>GeoCities was an online community<sup class="reference">[1]</sup> founded in 1994.</p><p>It closed in 2009.</p>`;
  const paragraphs = parseWikiExtract(sample);
  assert.strictEqual(paragraphs.length, 2);
  assert.ok(paragraphs[0].includes('GeoCities was an online community founded in 1994.'));
  assert.ok(!paragraphs[0].includes('[1]'));
  assert.ok(!paragraphs[0].includes('<p>'));
  assert.strictEqual(paragraphs[1], 'It closed in 2009.');
});

test('parseWikiExtract cleans phonetic pronunciations', () => {
  const sample = `GeoCities (/ˌdʒiː.oʊˈsɪt.iz/ (listen)) was a popular website. It spanned many topics.`;
  const [p1] = parseWikiExtract(sample);
  assert.ok(!p1.includes('/ˌdʒiː.oʊˈsɪt.iz/'), 'Pronunciation stripped');
  assert.ok(p1.startsWith('GeoCities was a popular website.'));
});

test('extractWikiEra extracts year range or founding year', () => {
  const text1 = 'GeoCities was active from 1994 to 2009.';
  assert.strictEqual(extractWikiEra(text1), '1994–2009');

  const text2 = 'The platform was founded in November 1998 by enthusiasts.';
  assert.strictEqual(extractWikiEra(text2), 'est. 1998');
});
