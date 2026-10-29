/**
 * Vercel Serverless Function Entry Point
 * Bundled to /api/index.js via esbuild so @vercel/node runs pure ESM JavaScript
 * without TypeScript extension resolution issues or body-stream deadlocks.
 */
import fs from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';
import { app } from './expressApp.ts';
import { db } from './db.ts';

const STATE_FILE = '/tmp/smart_grocery_oracle_state.json';
let hydratedFromTmp = false;

function hydrateStateIfNeeded(): void {
  if (hydratedFromTmp) return;
  hydratedFromTmp = true;
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf8');
      if (raw) {
        db.importState(raw);
      }
    }
  } catch {
    // Ignore /tmp read errors in restricted environments
  }
}

function persistStateToTmp(): void {
  try {
    fs.writeFileSync(STATE_FILE, db.exportState(), 'utf8');
  } catch {
    // Ignore /tmp write errors in read-only environments
  }
}

type VercelRequest = IncomingMessage & {
  url?: string;
  method?: string;
  body?: unknown;
  _body?: boolean;
};

export default function handler(req: VercelRequest, res: ServerResponse) {
  hydrateStateIfNeeded();

  // Normalize rewritten URLs on Vercel (supports both preserved /api/... and ?__path=...)
  if (req.url) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      const rewrittenSubpath = parsed.searchParams.get('__path');
      if (
        rewrittenSubpath !== null &&
        (parsed.pathname === '/api' || parsed.pathname === '/api/' || parsed.pathname === '/api/index' || parsed.pathname === '/api/index.js')
      ) {
        parsed.searchParams.delete('__path');
        const cleanSubpath = rewrittenSubpath.replace(/^\/+/, '');
        const qs = parsed.searchParams.toString();
        req.url = `/api/${cleanSubpath}${qs ? `?${qs}` : ''}`;
      } else if (!parsed.pathname.startsWith('/api')) {
        req.url = `/api${parsed.pathname.startsWith('/') ? '' : '/'}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      if (!req.url.startsWith('/api')) {
        req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
      }
    }
  }

  // Prevent express.json() from hanging if @vercel/node already consumed stream into req.body
  if (req.body !== undefined && req.body !== null && typeof req.body === 'object') {
    req._body = true;
  }

  const method = (req.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        persistStateToTmp();
      }
    });
  }

  return app(req as unknown as Parameters<typeof app>[0], res as unknown as Parameters<typeof app>[1]);
}
