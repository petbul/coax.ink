import { describe, it, expect } from 'vitest';
import { encodeState, decodeState } from './url';

describe('url state', () => {
  it('round-trips empty state', () => {
    const encoded = encodeState('hello world', new Set(), 2);
    const decoded = decodeState(encoded);
    expect(decoded?.source).toBe('hello world');
    expect(Array.from(decoded?.deleted ?? [])).toEqual([]);
  });

  it('round-trips a populated mask', () => {
    const source = 'one two three four five six seven eight nine ten';
    const deleted = new Set([0, 3, 5, 9]);
    const encoded = encodeState(source, deleted, 10);
    const decoded = decodeState(encoded);
    expect(decoded?.source).toBe(source);
    expect(Array.from(decoded?.deleted ?? []).sort((a, b) => a - b)).toEqual([0, 3, 5, 9]);
  });

  it('handles erasableCount > 8 (multi-byte mask)', () => {
    const deleted = new Set([0, 8, 15, 16, 23]);
    const encoded = encodeState('source', deleted, 24);
    const decoded = decodeState(encoded);
    expect(Array.from(decoded?.deleted ?? []).sort((a, b) => a - b)).toEqual([0, 8, 15, 16, 23]);
  });

  it('handles long unicode sources', () => {
    const source = 'Café — résumé. “It’s a long day,” she said. ' .repeat(40);
    const deleted = new Set([1, 4, 7]);
    const encoded = encodeState(source, deleted, 200);
    const decoded = decodeState(encoded);
    expect(decoded?.source).toBe(source);
    expect(Array.from(decoded?.deleted ?? []).sort((a, b) => a - b)).toEqual([1, 4, 7]);
  });

  it('returns null on garbage input', () => {
    expect(decodeState('not a valid payload!!!')).toBeNull();
  });

  it('returns null on valid lz-string but non-JSON payload', async () => {
    const LZString = (await import('lz-string')).default;
    const encoded = LZString.compressToEncodedURIComponent('not json');
    expect(decodeState(encoded)).toBeNull();
  });

  it('produces URL-safe strings', () => {
    const encoded = encodeState('test source', new Set([0, 1]), 2);
    expect(encoded).toMatch(/^[A-Za-z0-9_\-$+]+$/);
  });
});
