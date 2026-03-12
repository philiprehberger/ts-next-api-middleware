# @philiprehberger/ts-next-api-middleware

Next.js API route middleware: compose, validation, CSRF protection, rate limiting, and security headers.

## Installation

```bash
npm install @philiprehberger/ts-next-api-middleware
```

## Usage

### Compose Middleware

```ts
import { compose, withMethod, withValidation } from '@philiprehberger/ts-next-api-middleware';
import { z } from 'zod';

const schema = z.object({ name: z.string(), email: z.string().email() });

export const POST = compose(
  withMethod('POST'),
  withValidation(schema),
  async (req, ctx) => {
    const data = ctx.data.validated;
    return Response.json({ success: true, data });
  }
);
```

### CSRF Protection

```ts
import { compose, csrfProtection } from '@philiprehberger/ts-next-api-middleware';

export const POST = compose(
  csrfProtection({ allowedOrigins: ['https://example.com'] }),
  async (req, ctx) => {
    return Response.json({ ok: true });
  }
);
```

### Security Headers

```ts
import { applySecurityHeaders } from '@philiprehberger/ts-next-api-middleware';
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  applySecurityHeaders(response.headers);
  return response;
}
```

### Rate Limiting

```ts
import { compose, rateLimit } from '@philiprehberger/ts-next-api-middleware';

export const GET = compose(
  rateLimit({ windowMs: 60000, maxRequests: 30 }),
  async (req) => Response.json({ data: 'ok' })
);
```

## API Reference

### Composition

| Function | Signature | Description |
|----------|-----------|-------------|
| `compose` | `(...middlewares: MiddlewareHandler[]) => (req, params?) => Promise<Response>` | Chain middlewares. Returns 404 if none return a Response. |
| `pipe` | `(...middlewares: MiddlewareHandler[]) => (handler: MiddlewareHandler) => composed` | Create a reusable middleware pipeline, then attach a handler. |

### Validation

| Function | Signature | Description |
|----------|-----------|-------------|
| `withValidation` | `(schema: { parse(data): T }, source?: 'body' \| 'query' \| 'params') => MiddlewareHandler` | Validate request data. Parsed result stored in `ctx.data.validated`. |
| `withMethod` | `(...methods: string[]) => MiddlewareHandler` | Restrict to specified HTTP methods. Returns 405 if not allowed. |

### CSRF Protection

| Function | Signature | Description |
|----------|-----------|-------------|
| `csrfProtection` | `(options?: CsrfOptions) => MiddlewareHandler` | Validates CSRF token on unsafe methods (POST, PUT, DELETE, PATCH). |
| `generateCsrfToken` | `(options?: CsrfOptions) => { token, cookieName, headerName }` | Generate a CSRF token and config for client-side usage. |

**CsrfOptions:** `headerName` (default: `"x-csrf-token"`), `cookieName` (default: `"__csrf"`), `tokenLength` (default: 32), `allowedOrigins` (skip token check for trusted origins).

### Security Headers

| Function | Signature | Description |
|----------|-----------|-------------|
| `applySecurityHeaders` | `(headers: Headers, options?: SecurityHeadersOptions) => void` | Apply security headers to a Headers object. |
| `createSecurityHeadersConfig` | `(overrides?: SecurityHeadersOptions) => Record<string, string>` | Get a plain object of security headers for manual use. |

### Rate Limiting

| Function | Signature | Description |
|----------|-----------|-------------|
| `rateLimit` | `(options?: RateLimitOptions) => MiddlewareHandler` | In-memory rate limiter. Returns 429 when exceeded. |

**RateLimitOptions:** `windowMs` (default: 60000), `maxRequests` (default: 60), `keyGenerator` (default: x-forwarded-for), `message`.

## Limitations

- **Rate limiting is in-memory only** — request counts are not shared across processes or server restarts. For distributed rate limiting, use an external store like Redis.
- **CSRF `allowedOrigins`** — when set, requests from listed origins skip token validation entirely (trusted origin bypass). Requests from other origins still require a valid CSRF token.

## License

MIT
