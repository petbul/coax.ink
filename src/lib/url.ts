import LZString from 'lz-string';

/**
 * Encodes the source text and deletion mask into a single URL-safe string.
 *
 * The payload is JSON of shape { s: source, m: base64(packed bitmask) }, then
 * compressed with lz-string. Mask is a bit-array indexed by wordIndex, packed
 * little-endian: bit (i & 7) of byte (i >> 3).
 */
export function encodeState(source: string, deleted: Set<number>, wordCount: number): string {
  const m = packMask(deleted, wordCount);
  const payload = JSON.stringify({ s: source, m });
  return LZString.compressToEncodedURIComponent(payload);
}

export function decodeState(r: string): { source: string; deleted: Set<number> } | null {
  const payload = LZString.decompressFromEncodedURIComponent(r);
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload) as { s?: unknown; m?: unknown };
    if (typeof parsed.s !== 'string' || typeof parsed.m !== 'string') return null;
    const deleted = unpackMask(parsed.m);
    return { source: parsed.s, deleted };
  } catch {
    return null;
  }
}

function packMask(deleted: Set<number>, wordCount: number): string {
  if (wordCount === 0) return '';
  const bytes = new Uint8Array(Math.ceil(wordCount / 8));
  for (const i of deleted) {
    if (i < 0 || i >= wordCount) continue;
    bytes[i >> 3]! |= 1 << (i & 7);
  }
  return bytesToBase64(bytes);
}

function unpackMask(b64: string): Set<number> {
  const out = new Set<number>();
  if (!b64) return out;
  const bytes = base64ToBytes(b64);
  for (let byte = 0; byte < bytes.length; byte++) {
    const v = bytes[byte]!;
    if (v === 0) continue;
    for (let bit = 0; bit < 8; bit++) {
      if (v & (1 << bit)) out.add(byte * 8 + bit);
    }
  }
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
