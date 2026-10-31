/**
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FILE CONTRACT                                         │
 * │  ───────────────────────────────────────────────────────────────────────  │
 * │  File      : lib/persist.ts                                               │
 * │  Purpose   : Persist ghost profiles + narratives + audio to MongoDB GridF │
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

import { getDb, getGridFSBucket } from './mongodb.ts';
import { Readable } from 'stream';

export async function saveGhostRecord(record: any): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    await db.collection('ghost_profiles').insertOne(record);
    console.log(`[persist] ghost saved: ${record.domain}`);
    return true;
  } catch (err: any) {
    console.error('[persist] save failed:', err?.message);
    return false;
  }
}

export async function saveGhostAudio(domain: string, audioBase64: string, timestamp: number): Promise<boolean> {
  try {
    const bucket = await getGridFSBucket();
    if (!bucket) return false;
    const matches = audioBase64.match(/^data:audio\/mp3;base64,(.+)$/);
    if (!matches) return false;
    const buffer = Buffer.from(matches[1], 'base64');
    const filename = `${domain}_${timestamp}.mp3`;
    const uploadStream = bucket.openUploadStream(filename, { metadata: { domain, timestamp, mimeType: 'audio/mpeg' } });
    Readable.from(buffer).pipe(uploadStream);
    await new Promise<void>((resolve, reject) => {
      uploadStream.on('finish', () => resolve());
      uploadStream.on('error', reject);
    });
    console.log(`[persist] audio saved: ${filename}`);
    return true;
  } catch (err: any) {
    console.error('[persist] audio save failed:', err?.message);
    return false;
  }
}
