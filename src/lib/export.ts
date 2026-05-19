import { tokenize } from './tokenize';

const MIN_WIDTH = 1200;

export async function exportCanvas(element: HTMLElement, source: string, deleted: Set<number>): Promise<void> {
  const dataUrl = await renderPng(element);
  download(dataUrl, buildFilename(source, deleted, 'png'));
}

/**
 * Renders the redaction to a single-page PDF whose page dimensions match the
 * captured PNG. Going through PDF instead of window.print() bypasses the
 * browser's print dialog and the URL/page-number header it adds.
 */
export async function exportPdf(element: HTMLElement, source: string, deleted: Set<number>): Promise<void> {
  const dataUrl = await renderPng(element);
  const pngBytes = dataUrlToBytes(dataUrl);

  const { PDFDocument } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  const png = await pdf.embedPng(pngBytes);

  // 1 PDF point = 1/72 inch. Treat the captured pixels as 144 dpi (since we
  // render at 2× pixelRatio) so the page is sized at the redaction's natural
  // on-screen footprint.
  const dpi = 144;
  const pageWidth = (png.width / dpi) * 72;
  const pageHeight = (png.height / dpi) * 72;

  const page = pdf.addPage([pageWidth, pageHeight]);
  page.drawImage(png, { x: 0, y: 0, width: pageWidth, height: pageHeight });

  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  try {
    download(url, buildFilename(source, deleted, 'pdf'));
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

async function renderPng(element: HTMLElement): Promise<string> {
  const { toPng } = await import('html-to-image');
  const rect = element.getBoundingClientRect();
  // Render with a margin of cream space around the redaction. html-to-image
  // computes the SVG viewport from the dimensions we pass, then applies our
  // style overrides to the cloned node; we must declare both ourselves or the
  // viewport is sized to the original (unpadded) element and clips the last
  // line of glyphs.
  const pad = 48;
  const targetWidth = rect.width + pad * 2;
  const targetHeight = rect.height + pad * 2;
  const ratio = Math.max(2, MIN_WIDTH / Math.max(targetWidth, 1));
  return toPng(element, {
    pixelRatio: ratio,
    backgroundColor: '#FAF7F2',
    width: targetWidth,
    height: targetHeight,
    style: { padding: `${pad}px`, boxSizing: 'content-box' },
  });
}

function download(href: string, filename: string): void {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(',');
  const bin = atob(dataUrl.slice(comma + 1));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function buildFilename(source: string, deleted: Set<number>, ext: 'png' | 'pdf'): string {
  const tokens = tokenize(source);
  const survivors: string[] = [];
  for (const t of tokens) {
    if (t.kind !== 'word') continue;
    if (deleted.has(t.eraseIndex)) continue;
    survivors.push(t.text);
    if (survivors.length === 3) break;
  }
  if (survivors.length === 0) return `coax-redaction.${ext}`;
  const slug = survivors
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug ? `coax-${slug}.${ext}` : `coax-redaction.${ext}`;
}
