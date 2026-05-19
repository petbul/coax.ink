import { describe, it, expect } from 'vitest';
import { tokenize, countWords } from './tokenize';

describe('tokenize', () => {
  it('handles a simple sentence', () => {
    const t = tokenize('Hello world');
    expect(t).toEqual([
      { kind: 'word', text: 'Hello', wordIndex: 0 },
      { kind: 'space', text: ' ' },
      { kind: 'word', text: 'world', wordIndex: 1 },
    ]);
  });

  it('attaches trailing punctuation to the word', () => {
    const t = tokenize('Hello, world.');
    expect(t.map((x) => x.text)).toEqual(['Hello,', ' ', 'world.']);
    expect(t.filter((x) => x.kind === 'word').map((x) => x.text)).toEqual([
      'Hello,',
      'world.',
    ]);
  });

  it('attaches a run of trailing punctuation', () => {
    const t = tokenize('really?!');
    expect(t).toEqual([{ kind: 'word', text: 'really?!', wordIndex: 0 }]);
  });

  it('keeps apostrophes inside words', () => {
    const t = tokenize("don't worry, it's fine");
    expect(t.filter((x) => x.kind === 'word').map((x) => x.text)).toEqual([
      "don't",
      'worry,',
      "it's",
      'fine',
    ]);
  });

  it('keeps hyphens inside words', () => {
    const t = tokenize('well-known co-author');
    expect(t.filter((x) => x.kind === 'word').map((x) => x.text)).toEqual([
      'well-known',
      'co-author',
    ]);
  });

  it('treats em-dash as standalone punctuation', () => {
    const t = tokenize('hello — world');
    expect(t.map((x) => ({ k: x.kind, t: x.text }))).toEqual([
      { k: 'word', t: 'hello' },
      { k: 'space', t: ' ' },
      { k: 'punct', t: '—' },
      { k: 'space', t: ' ' },
      { k: 'word', t: 'world' },
    ]);
  });

  it('treats leading quote as standalone punctuation', () => {
    const t = tokenize('"Hello," she said');
    expect(t.map((x) => ({ k: x.kind, t: x.text }))).toEqual([
      { k: 'punct', t: '"' },
      { k: 'word', t: 'Hello,"' },
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
    const words = t.filter((x) => x.kind === 'word').map((x) => x.text);
    expect(words).toEqual(['It’s', 'fine,”', 'he', 'said']);
  });

  it('assigns sequential wordIndex values', () => {
    const t = tokenize('one two three four');
    const indices = t.filter((x): x is Extract<typeof t[number], { kind: 'word' }> => x.kind === 'word').map((x) => x.wordIndex);
    expect(indices).toEqual([0, 1, 2, 3]);
  });

  it('countWords returns the number of word tokens', () => {
    expect(countWords(tokenize('the quick brown fox'))).toBe(4);
    expect(countWords(tokenize('   '))).toBe(0);
    expect(countWords(tokenize(''))).toBe(0);
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
