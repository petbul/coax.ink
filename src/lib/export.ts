import { toPng } from 'html-to-image';
import { tokenize } from './tokenize';

const MIN_WIDTH = 1200;

export async function exportCanvas(element: HTMLElement, source: string, deleted: Set<number>): Promise<void> {
  const filename = buildFilename(source, deleted);
  const rect = element.getBoundingClientRect();
  // Compute a pixel ratio that produces at least MIN_WIDTH while keeping retina sharpness.
  const ratio = Math.max(2, MIN_WIDTH / Math.max(rect.width, 1));

  const dataUrl = await toPng(element, {
    pixelRatio: ratio,
    backgroundColor: '#FAF7F2',
    style: {
      // Add some breathing room around the redaction in the exported image.
      padding: '48px',
    },
  });

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function buildFilename(source: string, deleted: Set<number>): string {
  const tokens = tokenize(source);
  const survivors: string[] = [];
  for (const t of tokens) {
    if (t.kind !== 'word') continue;
    if (deleted.has(t.wordIndex)) continue;
    survivors.push(t.text);
    if (survivors.length === 3) break;
  }
  if (survivors.length === 0) return 'coax-redaction.png';
  const slug = survivors
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug ? `coax-${slug}.png` : 'coax-redaction.png';
}
