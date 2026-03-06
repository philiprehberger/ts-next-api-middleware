import type { NextRequest } from 'next/server';
import type { MiddlewareContext } from './compose';

export interface ValidationSchema<T = unknown> {
  parse(data: unknown): T;
}

export function withValidation<T>(
  schema: ValidationSchema<T>,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return async function validationMiddleware(
    req: NextRequest,
    ctx: MiddlewareContext
  ): Promise<Response | void> {
    try {
      let data: unknown;

      if (source === 'body') {
        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await req.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await req.formData();
          data = Object.fromEntries(formData.entries());
        } else {
          data = await req.text();
        }
      } else if (source === 'query') {
        data = Object.fromEntries(req.nextUrl.searchParams.entries());
      } else if (source === 'params') {
        data = ctx.params || {};
      }

      const parsed = schema.parse(data);
      ctx.data.validated = parsed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation failed';
      return Response.json({ error: 'Validation Error', details: message }, { status: 400 });
    }
  };
}

export function withMethod(...methods: string[]) {
  const allowed = methods.map((m) => m.toUpperCase());
  return function methodMiddleware(req: NextRequest): Response | void {
    if (!allowed.includes(req.method.toUpperCase())) {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: allowed.join(', ') },
      });
    }
  };
}
