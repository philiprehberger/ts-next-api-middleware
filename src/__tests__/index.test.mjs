import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('next-api-middleware', async () => {
  const mod = await import('../../dist/index.mjs');

  it('exports compose as a function', () => {
    assert.ok(typeof mod.compose === 'function');
  });

  it('exports pipe as a function', () => {
    assert.ok(typeof mod.pipe === 'function');
  });

  it('exports withValidation as a function', () => {
    assert.ok(typeof mod.withValidation === 'function');
  });

  it('exports withMethod as a function', () => {
    assert.ok(typeof mod.withMethod === 'function');
  });
});
