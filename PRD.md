# coax.ink — PRD

## Product

**Name:** coax.ink
**One-line:** A tool for coaxing poems out of any text by subtraction.
**Audience:** Writers, designers, students of erasure poetry, anyone who wants
to make found art from existing language.

## Core hypothesis

Erasure is composition, not destruction. A tool that allows only subtraction —
never addition, never rearrangement — produces a stronger creative artifact
and a more interesting interaction than a full editor. The poem is already in
the text; the user's job is to coax it out.

## Design philosophy

- **One primitive: deletion.** No typing, no formatting, no rearrangement, no
  styling. The only operation a user performs is making a word disappear.
- **Subtraction reveals.** Deleted words become blank space in their original
  position. Line breaks and proportions are preserved. The whitespace is the
  design.
- **Friction is intentional.** No undo. Only Reset. Each click is a weighed
  decision.
- **No accounts, no backend, no telemetry.** Every redaction lives entirely
  in its URL.
- **Typography is the UI.** No icons, no modals, no settings, no panels. The
  page is the canvas. Controls are sparse and textual.
- **Open by default.** The codebase is MIT-licensed and public from day one
  — the same gesture as the design.

## v1 scope

### Input
- Homepage: a single textarea, generous, beautifully typeset.
- A single button labeled **Begin**.
- Maximum source length: ~10,000 characters.
- Once committed, the source is immutable for the session.

### Tokenization
- Split source into tokens: words, whitespace, punctuation.
- Words are runs of letters and digits. Whitespace is inert structure.
- Every other character — comma, period, hyphen, quote, em-dash, apostrophe,
  even the inner mark in "don't" or "well-known" — is its own erasable token.
  Each mark can be removed or kept independently of the words around it.

### Interaction
- Click a word to delete it. The word becomes blank space the width it
  occupied.
- Click the blank space to restore it. Toggle behavior.
- Subtle hover affordance on desktop.
- No drag-select, no shift-click ranges, no keyboard shortcuts, no batch
  operations.

### Render
- Single column, max width ~640px, centered.
- Warm off-white background (~#FAF7F2), deep ink black text (~#1A1A1A).
- Typeface: **Newsreader**, self-hosted. Variable font preferred.
- Body: 18–20px, line-height ~1.7.
- Deleted words: blank space, exact width of the original word, line breaks
  preserved, other words do not reflow.

### Controls
Four controls only, rendered as text links at the bottom:
- **Reset** — restores all words.
- **Share** — copies the current state's URL to clipboard.
- **Export** — downloads a PNG of the current redaction.
- **PDF** — downloads a single-page PDF of the redaction. We generate the PDF
  ourselves rather than calling `window.print()` so the output has no browser
  chrome — no URL header, no page-number footer.

### Sharing
- Source text + deletion mask encoded into the URL via `lz-string`.
- URL format: `coax.ink/?r={compressed_payload}`.
- Recipient can continue redacting from that state or Reset to the original.

### Export
- PNG via `html-to-image` at 2x pixel ratio, minimum 1200px wide.
- Filename: `coax-{first-three-surviving-words}.png` or `coax-redaction.png`.

### PDF
- Rendered client-side via `html-to-image` → `pdf-lib`.
- Single-page PDF sized to the redaction's natural footprint.
- Cream background preserved (the artifact carries its own paper).
- Lazy-loaded chunk — `pdf-lib` only ships if the user requests a PDF.

## Out of scope for v1

URL-fetch, accounts, backend, gallery, multiple sources, undo, keyboard
shortcuts, settings, analytics, SEO beyond homepage, mobile-specific layouts.

## Technical architecture

- **Stack:** Vite + React + TypeScript. Tailwind for layout utilities.
- **State:** All client-side. No persistence beyond the URL.
- **Encoding:** `lz-string.compressToEncodedURIComponent` over
  `{ s: source, m: mask_base64 }`. Mask is a packed bit array.
- **Image export:** `html-to-image` rendered at 2x.

## Licensing & openness

MIT-licensed and public from day one.

- No analytics, telemetry, tracking pixels, or third-party SDKs.
- No environment variables or secrets in the repo, ever.
- Pinned, minimal dependencies. Under ten runtime deps.

## Acceptance criteria

1. User pastes text and clicks Begin; text renders as a tokenized canvas.
2. Clicking a word makes it disappear into blank space; layout unaffected.
3. Clicking empty space restores the word.
4. Reset restores all words.
5. Share copies a URL with brief inline confirmation.
6. Opening a shared URL renders the exact same redaction.
7. Recipient can continue redacting from the shared state.
8. Export downloads a PNG matching the screen at 2× resolution.
9. PDF downloads a single-page document carrying only the redaction —
   no browser-added URL header, page number, or footer.
10. Works on mobile Safari and desktop Chrome.
11. No network requests after page load except fonts.

## Naming and tone

- Product name lowercase everywhere: coax.ink.
- "Coax" is a verb, never a noun.
- Tone: literary, quiet, never cute. No emoji. No exclamation marks.
- Restoration control: **Reset** or **Begin again**, never Undo or Clear.

## Future / not in v1

- v1.1: URL-fetch via a Cloudflare Worker running Mozilla Readability.
- v2+: longer sources, custom typography, version history.
