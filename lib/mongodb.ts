/**
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FILE CONTRACT                                         │
 * │  ───────────────────────────────────────────────────────────────────────  │
 * │  File      : lib/mongodb.ts                                               │
 * │  Purpose   : MongoDB Atlas client with serverless-safe connection caching │
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

import { MongoClient, Db, GridFSBucket } from 'mongodb';
const uri = process.env.MONGODB_URI;
if (!uri) { console.warn('[mongodb] MONGODB_URI not set — persistence disabled'); }
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri) return null;
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000 });
  await client.connect();
  cachedClient = client;
  return client;
}

export async function getDb(): Promise<Db | null> {
  if (cachedDb) return cachedDb;
  const client = await getMongoClient();
  if (!client) return null;
  cachedDb = client.db('ossuary');
  return cachedDb;
}

export async function getGridFSBucket(): Promise<GridFSBucket | null> {
  const db = await getDb();
  if (!db) return null;
  return new GridFSBucket(db, { bucketName: 'ghost_audio' });
}
