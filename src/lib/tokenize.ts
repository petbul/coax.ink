export type Token =
  | { kind: 'word'; text: string; wordIndex: number }
  | { kind: 'space'; text: string }
  | { kind: 'punct'; text: string };

const WORD_START = /[\p{L}\p{N}]/u;
const WORD_INTERNAL = /[\p{L}\p{N}'’\-]/u;
const TRAILING_PUNCT = /[.,;:!?)\]"”’]/u;
const SPACE = /\s/;

/**
 * Splits source into word, space, and punctuation tokens.
 *
 * Words use Unicode letters and digits. Apostrophes and hyphens are word-internal
 * (so "don't" and "well-known" are single words). Trailing punctuation attaches
 * to its word (so "house," and "Hello!" are single tokens). Anything else —
 * leading quotes, em-dashes, standalone symbols — becomes its own punct token.
 *
 * Word tokens get a stable wordIndex matching their position in the deletion mask.
 */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const n = source.length;
  let i = 0;
  let wordIndex = 0;

  while (i < n) {
    const c = source[i]!;

    if (SPACE.test(c)) {
      let j = i + 1;
      while (j < n && SPACE.test(source[j]!)) j++;
      tokens.push({ kind: 'space', text: source.slice(i, j) });
      i = j;
      continue;
    }

    if (WORD_START.test(c)) {
      let j = i + 1;
      while (j < n && WORD_INTERNAL.test(source[j]!)) j++;
      // Strip dangling apostrophes/hyphens that aren't followed by another letter.
      while (j > i + 1 && /['’\-]/.test(source[j - 1]!)) j--;
      // Attach trailing punctuation up to whitespace.
      while (j < n && TRAILING_PUNCT.test(source[j]!)) j++;
      tokens.push({ kind: 'word', text: source.slice(i, j), wordIndex: wordIndex++ });
      i = j;
      continue;
    }

    // Non-word, non-space: standalone punctuation run.
    let j = i + 1;
    while (j < n && !SPACE.test(source[j]!) && !WORD_START.test(source[j]!)) j++;
    tokens.push({ kind: 'punct', text: source.slice(i, j) });
    i = j;
  }

  return tokens;
}

export function countWords(tokens: Token[]): number {
  let count = 0;
  for (const t of tokens) if (t.kind === 'word') count++;
  return count;
}
