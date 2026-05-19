import { useCallback, useEffect, useMemo, useState } from 'react';
import { Home } from './components/Home';
import { Canvas } from './components/Canvas';
import { countErasable, tokenize } from './lib/tokenize';
import { decodeState, encodeState } from './lib/url';
import { exportCanvas, exportPdf } from './lib/export';

function readInitialState(): { source: string | null; deleted: Set<number> } {
  if (typeof window === 'undefined') return { source: null, deleted: new Set() };
  const r = new URLSearchParams(window.location.search).get('r');
  if (!r) return { source: null, deleted: new Set() };
  const state = decodeState(r);
  if (!state) return { source: null, deleted: new Set() };
  return state;
}

export default function App() {
  const initial = useMemo(readInitialState, []);
  const [source, setSource] = useState<string | null>(initial.source);
  const [deleted, setDeleted] = useState<Set<number>>(initial.deleted);
  const [shareLabel, setShareLabel] = useState('Share');
  const [pdfLabel, setPdfLabel] = useState('PDF');

  const erasableCount = useMemo(
    () => (source === null ? 0 : countErasable(tokenize(source))),
    [source],
  );

  // Mirror state into the URL whenever it changes (and we're past the home view).
  useEffect(() => {
    if (source === null) return;
    const encoded = encodeState(source, deleted, erasableCount);
    const url = `${window.location.pathname}?r=${encoded}`;
    window.history.replaceState(null, '', url);
  }, [source, deleted, erasableCount]);

  const handleBegin = useCallback((text: string) => {
    setSource(text);
    setDeleted(new Set());
  }, []);

  const handleToggle = useCallback((eraseIndex: number) => {
    setDeleted((prev) => {
      const next = new Set(prev);
      if (next.has(eraseIndex)) next.delete(eraseIndex);
      else next.add(eraseIndex);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setDeleted(new Set());
  }, []);

  const handleBeginAgain = useCallback(() => {
    setSource(null);
    setDeleted(new Set());
    setShareLabel('Share');
    setPdfLabel('PDF');
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareLabel('Copied');
      window.setTimeout(() => setShareLabel('Share'), 1600);
    } catch {
      setShareLabel('Copy failed');
      window.setTimeout(() => setShareLabel('Share'), 1600);
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (source === null) return;
    const el = document.getElementById('coax-canvas');
    if (!el) return;
    await exportCanvas(el, source, deleted);
  }, [source, deleted]);

  const handlePdf = useCallback(async () => {
    if (source === null) return;
    const el = document.getElementById('coax-canvas');
    if (!el) return;
    setPdfLabel('Preparing…');
    try {
      await exportPdf(el, source, deleted);
      setPdfLabel('PDF');
    } catch {
      setPdfLabel('PDF failed');
      window.setTimeout(() => setPdfLabel('PDF'), 1600);
    }
  }, [source, deleted]);

  if (source === null) {
    return <Home onBegin={handleBegin} />;
  }

  return (
    <Canvas
      source={source}
      deleted={deleted}
      onToggle={handleToggle}
      onReset={handleReset}
      onBeginAgain={handleBeginAgain}
      onShare={handleShare}
      onExport={handleExport}
      onPdf={handlePdf}
      shareLabel={shareLabel}
      pdfLabel={pdfLabel}
    />
  );
}
