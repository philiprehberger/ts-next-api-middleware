import type { NextRequest } from 'next/server';

export interface CorsOptions {
  /** Allowed origins. `'*'` permits all (incompatible with `credentials: true`). */
  origin?: string | string[] | RegExp | ((origin: string) => boolean) | '*';
  /** Allowed HTTP methods. */
  methods?: string[];
  /** Allowed request headers. */
  allowedHeaders?: string[];
  /** Headers exposed to the browser. */
  exposedHeaders?: string[];
  /** Whether to allow credentials (cookies/auth). */
  credentials?: boolean;
  /** Cache duration for preflight in seconds. */
  maxAge?: number;
}

const defaults: Required<Pick<CorsOptions, 'methods' | 'allowedHeaders' | 'maxAge'>> = {
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86_400,
};

function isOriginAllowed(origin: string, allowed: CorsOptions['origin']): string | null {
  if (allowed === undefined) return origin;
  if (allowed === '*') return '*';
  if (typeof allowed === 'string') return allowed === origin ? origin : null;
  if (Array.isArray(allowed)) return allowed.includes(origin) ? origin : null;
  if (allowed instanceof RegExp) return allowed.test(origin) ? origin : null;
  if (typeof allowed === 'function') return allowed(origin) ? origin : null;
  return null;
}

/**
 * CORS middleware for Next.js App Router routes. Handles `OPTIONS` preflight by
 * returning a 204 response with the appropriate `Access-Control-*` headers, and
 * decorates non-preflight responses by setting CORS headers on the route handler's
 * response (consumers should call `applyCorsHeaders` to apply to a Response, or
 * combine via the framework's middleware response chain).
 */
export function withCors(options: CorsOptions = {}) {
  const merged = { ...defaults, ...options };

  return function corsMiddleware(req: NextRequest): Response | void {
    const origin = req.headers.get('origin') ?? '';
    const resolved = isOriginAllowed(origin, options.origin ?? '*');

    if (req.method.toUpperCase() === 'OPTIONS') {
      const headers = new Headers();
      if (resolved) headers.set('Access-Control-Allow-Origin', resolved);
      if (options.credentials) headers.set('Access-Control-Allow-Credentials', 'true');
      headers.set('Access-Control-Allow-Methods', merged.methods.join(', '));
      const requested = req.headers.get('access-control-request-headers');
      headers.set('Access-Control-Allow-Headers', requested || merged.allowedHeaders.join(', '));
      if (options.exposedHeaders?.length) {
        headers.set('Access-Control-Expose-Headers', options.exposedHeaders.join(', '));
      }
      headers.set('Access-Control-Max-Age', String(merged.maxAge));
      headers.set('Vary', 'Origin');
      return new Response(null, { status: 204, headers });
    }
    // Non-preflight: do nothing here; downstream handler can call applyCorsHeaders.
  };
}

/**
 * Apply CORS headers to a Response (for non-preflight requests). Use after the
 * route handler returns a Response to add the standard CORS headers.
 */
export function applyCorsHeaders(
  response: Response,
  req: NextRequest,
  options: CorsOptions = {},
): Response {
  const origin = req.headers.get('origin') ?? '';
  const resolved = isOriginAllowed(origin, options.origin ?? '*');
  if (!resolved) return response;

  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', resolved);
  if (options.credentials) headers.set('Access-Control-Allow-Credentials', 'true');
  if (options.exposedHeaders?.length) {
    headers.set('Access-Control-Expose-Headers', options.exposedHeaders.join(', '));
  }
  headers.set('Vary', 'Origin');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
