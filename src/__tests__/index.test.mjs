import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const mod = await import('../../dist/index.mjs');
const {
  compose, pipe, withMethod, withValidation,
  csrfProtection, generateCsrfToken,
  applySecurityHeaders, createSecurityHeadersConfig,
  rateLimit,
} = mod;

describe('exports', () => {
  it('exports all expected functions', () => {
    assert.equal(typeof compose, 'function');
    assert.equal(typeof pipe, 'function');
    assert.equal(typeof withMethod, 'function');
    assert.equal(typeof withValidation, 'function');
    assert.equal(typeof csrfProtection, 'function');
    assert.equal(typeof generateCsrfToken, 'function');
    assert.equal(typeof applySecurityHeaders, 'function');
    assert.equal(typeof createSecurityHeadersConfig, 'function');
    assert.equal(typeof rateLimit, 'function');
  });
});

describe('generateCsrfToken', () => {
  it('returns token with default options', () => {
    const result = generateCsrfToken();
    assert.equal(typeof result.token, 'string');
    assert.equal(result.token.length, 32);
    assert.equal(result.cookieName, '__csrf');
    assert.equal(result.headerName, 'x-csrf-token');
  });

  it('respects custom token length', () => {
    const result = generateCsrfToken({ tokenLength: 64 });
    assert.equal(result.token.length, 64);
  });

  it('respects custom names', () => {
    const result = generateCsrfToken({ cookieName: 'my-csrf', headerName: 'x-my-token' });
    assert.equal(result.cookieName, 'my-csrf');
    assert.equal(result.headerName, 'x-my-token');
  });

  it('generates unique tokens', () => {
    const a = generateCsrfToken();
    const b = generateCsrfToken();
    assert.notEqual(a.token, b.token);
  });
});

describe('createSecurityHeadersConfig', () => {
  it('returns default security headers', () => {
    const headers = createSecurityHeadersConfig();
    assert.ok(headers['Content-Security-Policy']);
    assert.ok(headers['Strict-Transport-Security']);
    assert.equal(headers['X-Content-Type-Options'], 'nosniff');
    assert.equal(headers['X-Frame-Options'], 'DENY');
    assert.ok(headers['Referrer-Policy']);
    assert.ok(headers['Permissions-Policy']);
    assert.ok(headers['Cross-Origin-Opener-Policy']);
    assert.ok(headers['Cross-Origin-Resource-Policy']);
  });

  it('allows overrides', () => {
    const headers = createSecurityHeadersConfig({ xFrameOptions: 'SAMEORIGIN' });
    assert.equal(headers['X-Frame-Options'], 'SAMEORIGIN');
  });

  it('supports custom headers', () => {
    const headers = createSecurityHeadersConfig({ custom: { 'X-Custom': 'test' } });
    assert.equal(headers['X-Custom'], 'test');
  });
});

describe('applySecurityHeaders', () => {
  it('applies headers to a Headers object', () => {
    const headers = new Headers();
    applySecurityHeaders(headers);
    assert.equal(headers.get('X-Content-Type-Options'), 'nosniff');
    assert.equal(headers.get('X-Frame-Options'), 'DENY');
    assert.ok(headers.get('Strict-Transport-Security'));
  });
});

describe('withMethod', () => {
  it('returns a function', () => {
    const mw = withMethod('GET', 'POST');
    assert.equal(typeof mw, 'function');
  });
});

describe('csrfProtection', () => {
  it('returns a middleware function', () => {
    const mw = csrfProtection();
    assert.equal(typeof mw, 'function');
  });

  it('returns middleware with custom options', () => {
    const mw = csrfProtection({ allowedOrigins: ['https://example.com'] });
    assert.equal(typeof mw, 'function');
  });
});

describe('rateLimit', () => {
  it('returns a middleware function', () => {
    const mw = rateLimit({ windowMs: 60000, maxRequests: 10 });
    assert.equal(typeof mw, 'function');
  });
});

describe('pipe', () => {
  it('returns a function that takes a handler', () => {
    const piped = pipe();
    assert.equal(typeof piped, 'function');
    const handler = piped(async () => new Response('ok'));
    assert.equal(typeof handler, 'function');
  });
});
