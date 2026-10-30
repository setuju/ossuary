// Express wrapper — runs all Vercel API handlers on Render.
// Deploy: render.yaml in root, start command `tsx server-production.ts`.
import express from 'express';
import reconHandler from './api/recon.ts';
import conjureHandler from './api/conjure.ts';
import wikiHandler from './api/wiki.ts';
import whoisHandler from './api/whois.ts';
import echoesHandler from './api/echoes.ts';

const app = express();

// CORS — allow ossuary domain + localhost
app.use((req, res, next) => {
  const allowed = ['https://ossuary.saturumah.net', 'http://localhost:3000', 'http://localhost:5173'];
  const origin = (req.headers.origin as string) || '';
  if (!origin || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, baggage, sentry-trace, x-requested-with, authorization, x-sentry-auth');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// Conjure: raw stream (handler reads body manually via for-await)
app.post('/api/conjure', (req, res) => {
  Promise.resolve(conjureHandler(req, res)).catch((err: any) => {
    console.error('[conjure err]', err?.message || err);
    if (!res.headersSent) res.status(500).json({ error: 'internal_error' });
  });
});

// JSON body parser for remaining routes
app.use(express.json({ limit: '2mb' }));

const adapt = (handler: any) => async (req: express.Request, res: express.Response) => {
  try { await handler(req, res); }
  catch (err: any) {
    console.error('[handler err]', err?.message || err);
    if (!res.headersSent) res.status(500).json({ error: 'internal_error', message: err?.message });
  }
};

app.post('/api/recon', adapt(reconHandler));
app.get('/api/wiki', adapt(wikiHandler));
app.get('/api/whois', adapt(whoisHandler));
app.post('/api/echoes', adapt(echoesHandler));
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'ossuary-backend' }));

const port = Number(process.env.PORT) || 10000;
app.listen(port, '0.0.0.0', () => console.log(`[ossuary] listening on 0.0.0.0:${port}`));
