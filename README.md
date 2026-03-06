# @philiprehberger/next-api-middleware

Next.js API route middleware: compose, validation, CSRF protection, rate limiting, and security headers.

## Installation

```bash
npm install @philiprehberger/next-api-middleware
```

## Usage

### Compose Middleware

```ts
import { compose, withMethod, withValidation } from '@philiprehberger/next-api-middleware';
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
import { compose, csrfProtection } from '@philiprehberger/next-api-middleware';

export const POST = compose(
  csrfProtection({ allowedOrigins: ['https://example.com'] }),
  async (req, ctx) => {
    return Response.json({ ok: true });
  }
);
```

### Security Headers

```ts
import { applySecurityHeaders } from '@philiprehberger/next-api-middleware';
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  applySecurityHeaders(response.headers);
  return response;
}
```

### Rate Limiting

```ts
import { compose, rateLimit } from '@philiprehberger/next-api-middleware';

export const GET = compose(
  rateLimit({ windowMs: 60000, maxRequests: 30 }),
  async (req) => Response.json({ data: 'ok' })
);
```

## License

MIT
