export type Token =
  | { kind: 'word'; text: string; eraseIndex: number }
  | { kind: 'punct'; text: string; eraseIndex: number }
  | { kind: 'space'; text: string };

const WORD_CHAR = /[\p{L}\p{N}]/u;
const SPACE = /\s/;

/**
 * Splits source into word, space, and punctuation tokens.
 *
 * Words are runs of Unicode letters and digits. Whitespace runs are inert.
 * Every other character — comma, period, hyphen, quote, em-dash, apostrophe,
 * even the inner mark in "don't" or "well-known" — becomes its own erasable
 * token. This gives the poet full control over which marks survive.
 *
 * Word and punct tokens share a single eraseIndex sequence — the deletion
 * mask is one bit per erasable token in document order.
 */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const n = source.length;
  let i = 0;
  let eraseIndex = 0;

  while (i < n) {
    const c = source[i]!;

    if (SPACE.test(c)) {
      let j = i + 1;
      while (j < n && SPACE.test(source[j]!)) j++;
      tokens.push({ kind: 'space', text: source.slice(i, j) });
      i = j;
      continue;
    }

    if (WORD_CHAR.test(c)) {
      let j = i + 1;
      while (j < n && WORD_CHAR.test(source[j]!)) j++;
      tokens.push({ kind: 'word', text: source.slice(i, j), eraseIndex: eraseIndex++ });
      i = j;
      continue;
    }

    // Every other character is its own punct token.
    tokens.push({ kind: 'punct', text: c, eraseIndex: eraseIndex++ });
    i++;
  }

  return tokens;
}

export function countErasable(tokens: Token[]): number {
  let count = 0;
  for (const t of tokens) if (t.kind !== 'space') count++;
  return count;
}
