import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool | null {
  const url = process.env.TIGERDATA_URL;
  if (!url) {
    console.warn('[tigerdata] TIGERDATA_URL not set — analytics disabled');
    return null;
  }
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false } // TigerData membutuhkan SSL
    });
  }
  return pool;
}

// Fungsi init untuk membuat tabel (dipanggil manual / startup)
export async function initTigerData() {
  const p = getPool();
  if (!p) return false;
  try {
    // 1. Buat tabel utama
    await p.query(`
      CREATE TABLE IF NOT EXISTS ghost_events (
        id UUID DEFAULT gen_random_uuid(),
        event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        domain TEXT NOT NULL,
        event_type TEXT NOT NULL,
        tier_used TEXT,
        duration_ms INTEGER,
        success BOOLEAN,
        error_code TEXT
      );
    `);
    // 2. Ubah menjadi Hypertable (Time-Series)
    await p.query(`
      SELECT create_hypertable('ghost_events', 'event_time', if_not_exists => TRUE);
    `);
    console.log('[tigerdata] schema initialized');
    return true;
  } catch (err: any) {
    console.error('[tigerdata] init failed:', err?.message);
    return false;
  }
}

export async function logEvent(event: {
  domain: string;
  event_type: string;
  tier_used?: string;
  duration_ms?: number;
  success: boolean;
  error_code?: string;
}) {
  const p = getPool();
  if (!p) return false;
  try {
    await p.query(
      `INSERT INTO ghost_events (domain, event_type, tier_used, duration_ms, success, error_code)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [event.domain, event.event_type, event.tier_used, event.duration_ms, event.success, event.error_code]
    );
    return true;
  } catch (err: any) {
    console.error('[tigerdata] logEvent failed:', err?.message);
    return false;
  }
}
