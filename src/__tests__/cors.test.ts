import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { withCors, applyCorsHeaders } from '../../dist/index.js';

function makeReq(method: string, origin = 'https://app.example.com', headers: Record<string, string> = {}): any {
  const headerMap = new Map<string, string>([['origin', origin], ...Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v] as [string, string])]);
  return {
    method,
    headers: {
      get: (name: string) => headerMap.get(name.toLowerCase()) ?? null,
    },
  };
}

describe('withCors', () => {
  it('returns 204 for OPTIONS preflight with allowed origin', () => {
    const cors = withCors({ origin: 'https://app.example.com' });
    const res = cors(makeReq('OPTIONS')) as Response;
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://app.example.com');
    assert.match(res.headers.get('Access-Control-Allow-Methods')!, /GET/);
    assert.equal(res.headers.get('Vary'), 'Origin');
  });

  it('echoes Access-Control-Request-Headers when present', () => {
    const cors = withCors({ origin: '*' });
    const res = cors(makeReq('OPTIONS', 'https://x.example.com', { 'access-control-request-headers': 'X-Foo, X-Bar' })) as Response;
    assert.equal(res.headers.get('Access-Control-Allow-Headers'), 'X-Foo, X-Bar');
  });

  it('does not return a response for non-preflight requests', () => {
    const cors = withCors({ origin: '*' });
    const res = cors(makeReq('GET'));
    assert.equal(res, undefined);
  });

  it('rejects disallowed origin by omitting Allow-Origin header on preflight', () => {
    const cors = withCors({ origin: ['https://allowed.example.com'] });
    const res = cors(makeReq('OPTIONS', 'https://other.example.com')) as Response;
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
  });

  it('supports credentials flag', () => {
    const cors = withCors({ origin: 'https://app.example.com', credentials: true });
    const res = cors(makeReq('OPTIONS')) as Response;
    assert.equal(res.headers.get('Access-Control-Allow-Credentials'), 'true');
  });

  it('honors regex origin', () => {
    const cors = withCors({ origin: /\.example\.com$/ });
    const res = cors(makeReq('OPTIONS', 'https://app.example.com')) as Response;
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://app.example.com');
  });
});

describe('applyCorsHeaders', () => {
  it('decorates a response with CORS headers', () => {
    const original = new Response(JSON.stringify({ ok: true }), { status: 200 });
    const decorated = applyCorsHeaders(original, makeReq('GET'), { origin: '*' });
    assert.equal(decorated.headers.get('Access-Control-Allow-Origin'), '*');
    assert.equal(decorated.status, 200);
  });

  it('passes through unchanged when origin not allowed', () => {
    const original = new Response('hi', { status: 200 });
    const decorated = applyCorsHeaders(original, makeReq('GET', 'https://blocked.example.com'), {
      origin: ['https://allowed.example.com'],
    });
    assert.equal(decorated.headers.get('Access-Control-Allow-Origin'), null);
  });
});
