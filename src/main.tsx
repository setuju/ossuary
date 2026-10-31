/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FILE CONTRACT                                    │
 * │  ──────────────────────────────────────────────────────────────────  │
 * │  File      : src/main.tsx                                            │
 * │  Purpose   : React entry point + Sentry SDK initialization           │
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

import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const SENTRY_DSN =
  import.meta.env.VITE_SENTRY_DSN ||
  'https://e01cd7033f2cb29ec780f6de0773e098@o4512340682997760.ingest.us.sentry.io/4512340701216768';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: import.meta.env.MODE || 'production',
  release: 'ossuary@0.1.0',
  tracesSampleRate: 1.0,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracePropagationTargets: ["localhost", /^\/api/, /^https:\/\/.*\/api/],
  beforeSend(event) {
    const messages = (event.exception?.values ?? []).map((v) => String(v.value ?? '')).join(' ');
    const noisyPatterns = [
      'ResizeObserver',
      'WebSocket closed',
      'WebSocket is closed',
      'ws://localhost',
      'ws://127.0.0.1',
      '[vite] connecting',
      '[vite] disconnected',
    ];
    if (noisyPatterns.some((p) => messages.includes(p))) {
      return null;
    }
    return event;
  },
});

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(container).render(<App />);

/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FILE CONTRACT                                    │
 * │  ──────────────────────────────────────────────────────────────────  │
 * │  File      : src/main.tsx                                            │
 * │  Purpose   : React entry point + Sentry SDK initialization           │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                        │
 * │  GitHub    : https://github.com/setuju                               │
 * │  Website   : https://saturumah.net                                   │
 * │  Created   : 2026-10-26                                              │
 * │  License   : MIT                                                     │
 * └──────────────────────────────────────────────────────────────────────┘
 */