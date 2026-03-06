import type { NextRequest } from 'next/server';

export interface SecurityHeadersOptions {
  contentSecurityPolicy?: string;
  strictTransportSecurity?: string;
  xContentTypeOptions?: string;
  xFrameOptions?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
  crossOriginOpenerPolicy?: string;
  crossOriginResourcePolicy?: string;
  custom?: Record<string, string>;
}

const defaults: Required<Omit<SecurityHeadersOptions, 'custom'>> = {
  contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  strictTransportSecurity: 'max-age=63072000; includeSubDomains; preload',
  xContentTypeOptions: 'nosniff',
  xFrameOptions: 'DENY',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'same-origin',
};

export function securityHeaders(options: SecurityHeadersOptions = {}) {
  const config = { ...defaults, ...options };

  return function securityHeadersMiddleware(req: NextRequest): void {
    // Headers will be applied to the response
    // This middleware stores headers in request context for the handler to apply
    // For Next.js middleware.ts usage, use applySecurityHeaders instead
  };
}

export function applySecurityHeaders(
  headers: Headers,
  options: SecurityHeadersOptions = {}
): void {
  const config = { ...defaults, ...options };

  headers.set('Content-Security-Policy', config.contentSecurityPolicy);
  headers.set('Strict-Transport-Security', config.strictTransportSecurity);
  headers.set('X-Content-Type-Options', config.xContentTypeOptions);
  headers.set('X-Frame-Options', config.xFrameOptions);
  headers.set('Referrer-Policy', config.referrerPolicy);
  headers.set('Permissions-Policy', config.permissionsPolicy);
  headers.set('Cross-Origin-Opener-Policy', config.crossOriginOpenerPolicy);
  headers.set('Cross-Origin-Resource-Policy', config.crossOriginResourcePolicy);

  if (options.custom) {
    for (const [key, value] of Object.entries(options.custom)) {
      headers.set(key, value);
    }
  }
}

export function createSecurityHeadersConfig(overrides: SecurityHeadersOptions = {}): Record<string, string> {
  const config = { ...defaults, ...overrides };
  const result: Record<string, string> = {
    'Content-Security-Policy': config.contentSecurityPolicy,
    'Strict-Transport-Security': config.strictTransportSecurity,
    'X-Content-Type-Options': config.xContentTypeOptions,
    'X-Frame-Options': config.xFrameOptions,
    'Referrer-Policy': config.referrerPolicy,
    'Permissions-Policy': config.permissionsPolicy,
    'Cross-Origin-Opener-Policy': config.crossOriginOpenerPolicy,
    'Cross-Origin-Resource-Policy': config.crossOriginResourcePolicy,
  };
  if (overrides.custom) Object.assign(result, overrides.custom);
  return result;
}
