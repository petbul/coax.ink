import { useCallback, useEffect, useMemo, useState } from 'react';
import { Home } from './components/Home';
import { Canvas } from './components/Canvas';
import { countWords, tokenize } from './lib/tokenize';
import { decodeState, encodeState } from './lib/url';
import { exportCanvas } from './lib/export';

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

  const wordCount = useMemo(
    () => (source === null ? 0 : countWords(tokenize(source))),
    [source],
  );

  // Mirror state into the URL whenever it changes (and we're past the home view).
  useEffect(() => {
    if (source === null) return;
    const encoded = encodeState(source, deleted, wordCount);
    const url = `${window.location.pathname}?r=${encoded}`;
    window.history.replaceState(null, '', url);
  }, [source, deleted, wordCount]);

  const handleBegin = useCallback((text: string) => {
    setSource(text);
    setDeleted(new Set());
  }, []);

  const handleToggle = useCallback((wordIndex: number) => {
    setDeleted((prev) => {
      const next = new Set(prev);
      if (next.has(wordIndex)) next.delete(wordIndex);
      else next.add(wordIndex);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setDeleted(new Set());
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

  if (source === null) {
    return <Home onBegin={handleBegin} />;
  }

  return (
    <Canvas
      source={source}
      deleted={deleted}
      onToggle={handleToggle}
      onReset={handleReset}
      onShare={handleShare}
      onExport={handleExport}
      onPrint={() => window.print()}
      shareLabel={shareLabel}
    />
  );
}
