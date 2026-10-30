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
