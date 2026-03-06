import type { NextRequest } from 'next/server';

export interface CsrfOptions {
  headerName?: string;
  tokenLength?: number;
  cookieName?: string;
  allowedOrigins?: string[];
}

function generateToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join('');
}

export function csrfProtection(options: CsrfOptions = {}) {
  const {
    headerName = 'x-csrf-token',
    cookieName = '__csrf',
    tokenLength = 32,
    allowedOrigins,
  } = options;

  return function csrfMiddleware(req: NextRequest): Response | void {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method.toUpperCase())) return;

    if (allowedOrigins) {
      const origin = req.headers.get('origin');
      if (origin && allowedOrigins.includes(origin)) return;
    }

    const cookieToken = req.cookies.get(cookieName)?.value;
    const headerToken = req.headers.get(headerName);

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return Response.json({ error: 'CSRF validation failed' }, { status: 403 });
    }
  };
}

export function generateCsrfToken(options: CsrfOptions = {}): {
  token: string;
  cookieName: string;
  headerName: string;
} {
  const { headerName = 'x-csrf-token', cookieName = '__csrf', tokenLength = 32 } = options;
  return {
    token: generateToken(tokenLength),
    cookieName,
    headerName,
  };
}
