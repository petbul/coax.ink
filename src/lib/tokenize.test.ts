import { describe, it, expect } from 'vitest';
import { tokenize, countErasable } from './tokenize';

describe('tokenize', () => {
  it('handles a simple sentence', () => {
    const t = tokenize('Hello world');
    expect(t).toEqual([
      { kind: 'word', text: 'Hello', eraseIndex: 0 },
      { kind: 'space', text: ' ' },
      { kind: 'word', text: 'world', eraseIndex: 1 },
    ]);
  });

  it('separates trailing punctuation into its own token', () => {
    const t = tokenize('Hello, world.');
    expect(t.map((x) => ({ k: x.kind, t: x.text }))).toEqual([
      { k: 'word', t: 'Hello' },
      { k: 'punct', t: ',' },
      { k: 'space', t: ' ' },
      { k: 'word', t: 'world' },
      { k: 'punct', t: '.' },
    ]);
  });

  it('splits each punctuation character separately', () => {
    const t = tokenize('really?!');
    expect(t.map((x) => ({ k: x.kind, t: x.text }))).toEqual([
      { k: 'word', t: 'really' },
      { k: 'punct', t: '?' },
      { k: 'punct', t: '!' },
    ]);
  });

  it('separates apostrophes inside contractions', () => {
    const t = tokenize("don't");
    expect(t.map((x) => ({ k: x.kind, t: x.text }))).toEqual([
      { k: 'word', t: 'don' },
      { k: 'punct', t: "'" },
      { k: 'word', t: 't' },
    ]);
  });

  it('separates hyphens inside compound words', () => {
    const t = tokenize('well-known');
    expect(t.map((x) => ({ k: x.kind, t: x.text }))).toEqual([
      { k: 'word', t: 'well' },
      { k: 'punct', t: '-' },
      { k: 'word', t: 'known' },
    ]);
  });

  it('treats each em-dash as one punct token', () => {
    const t = tokenize('hello — world');
    expect(t.map((x) => ({ k: x.kind, t: x.text }))).toEqual([
      { k: 'word', t: 'hello' },
      { k: 'space', t: ' ' },
      { k: 'punct', t: '—' },
      { k: 'space', t: ' ' },
      { k: 'word', t: 'world' },
    ]);
  });

  it('separates quote marks around words', () => {
    const t = tokenize('"Hello," she said');
    expect(t.map((x) => ({ k: x.kind, t: x.text }))).toEqual([
      { k: 'punct', t: '"' },
      { k: 'word', t: 'Hello' },
      { k: 'punct', t: ',' },
      { k: 'punct', t: '"' },
      { k: 'space', t: ' ' },
      { k: 'word', t: 'she' },
      { k: 'space', t: ' ' },
      { k: 'word', t: 'said' },
    ]);
  });

  it('preserves newlines as whitespace tokens', () => {
    const t = tokenize('one\ntwo\n\nthree');
    expect(t.map((x) => ({ k: x.kind, t: x.text }))).toEqual([
      { k: 'word', t: 'one' },
      { k: 'space', t: '\n' },
      { k: 'word', t: 'two' },
      { k: 'space', t: '\n\n' },
      { k: 'word', t: 'three' },
    ]);
  });

  it('preserves runs of spaces', () => {
    const t = tokenize('a  b   c');
    expect(t.map((x) => x.text)).toEqual(['a', '  ', 'b', '   ', 'c']);
  });

  it('handles empty input', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('handles whitespace-only input', () => {
    expect(tokenize('   \n  ')).toEqual([{ kind: 'space', text: '   \n  ' }]);
  });

  it('handles unicode letters', () => {
    const t = tokenize('café résumé');
    expect(t.filter((x) => x.kind === 'word').map((x) => x.text)).toEqual([
      'café',
      'résumé',
    ]);
  });

  it('handles smart quotes and curly apostrophes', () => {
    const t = tokenize('“It’s fine,” he said');
    expect(t.map((x) => ({ k: x.kind, t: x.text }))).toEqual([
      { k: 'punct', t: '“' },
      { k: 'word', t: 'It' },
      { k: 'punct', t: '’' },
      { k: 'word', t: 's' },
      { k: 'space', t: ' ' },
      { k: 'word', t: 'fine' },
      { k: 'punct', t: ',' },
      { k: 'punct', t: '”' },
      { k: 'space', t: ' ' },
      { k: 'word', t: 'he' },
      { k: 'space', t: ' ' },
      { k: 'word', t: 'said' },
    ]);
  });

  it('assigns sequential eraseIndex values across words and punct', () => {
    const t = tokenize('a, b.');
    const indices = t
      .filter((x) => x.kind !== 'space')
      .map((x) => (x as { eraseIndex: number }).eraseIndex);
    expect(indices).toEqual([0, 1, 2, 3]);
  });

  it('countErasable returns the number of word + punct tokens', () => {
    expect(countErasable(tokenize('the quick brown fox'))).toBe(4);
    expect(countErasable(tokenize('Hello, world.'))).toBe(4);
    expect(countErasable(tokenize('"Hi!"'))).toBe(4);
    expect(countErasable(tokenize('   '))).toBe(0);
    expect(countErasable(tokenize(''))).toBe(0);
  });

  it('does not lose any characters', () => {
    const sources = [
      'Hello, world.',
      "It's a beautiful day — really!",
      'Multiple\n\nlines\nhere',
      '“Quoted,” and well-known.',
    ];
    for (const src of sources) {
      const reconstructed = tokenize(src)
        .map((t) => t.text)
        .join('');
      expect(reconstructed).toBe(src);
    }
  });
});
