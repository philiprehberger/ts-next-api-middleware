import type { NextRequest } from 'next/server';

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: NextRequest) => string;
  message?: string;
}

const store = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 60_000,
    maxRequests = 60,
    keyGenerator = (req) => req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    message = 'Too many requests, please try again later.',
  } = options;

  return function rateLimitMiddleware(req: NextRequest): Response | void {
    const key = keyGenerator(req);
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return;
    }

    entry.count++;
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return Response.json(
        { error: message },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(entry.resetTime),
          },
        }
      );
    }
  };
}
