import type { NextRequest } from 'next/server';

export type MiddlewareHandler = (
  req: NextRequest,
  ctx: MiddlewareContext
) => Promise<Response | void> | Response | void;

export interface MiddlewareContext {
  params?: Record<string, string>;
  data: Record<string, unknown>;
}

export function compose(...middlewares: MiddlewareHandler[]) {
  return async function handler(req: NextRequest, params?: Record<string, string>): Promise<Response> {
    const ctx: MiddlewareContext = { params, data: {} };

    for (const mw of middlewares) {
      const result = await mw(req, ctx);
      if (result instanceof Response) return result;
    }

    return new Response('Not Found', { status: 404 });
  };
}

export function pipe(...middlewares: MiddlewareHandler[]) {
  return function withHandler(handler: MiddlewareHandler) {
    return compose(...middlewares, handler);
  };
}
