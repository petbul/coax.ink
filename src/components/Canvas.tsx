import { useMemo } from 'react';
import { tokenize } from '../lib/tokenize';

export type CanvasProps = {
  source: string;
  deleted: Set<number>;
  onToggle: (wordIndex: number) => void;
  onReset: () => void;
  onShare: () => void;
  onExport: () => void;
  onPrint: () => void;
  shareLabel: string;
};

export function Canvas({
  source,
  deleted,
  onToggle,
  onReset,
  onShare,
  onExport,
  onPrint,
  shareLabel,
}: CanvasProps) {
  const tokens = useMemo(() => tokenize(source), [source]);

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-16">
      <article
        id="coax-canvas"
        className="canvas w-full max-w-[640px] font-serif text-[19px] leading-[1.7] text-ink whitespace-pre-wrap"
      >
        {tokens.map((t, i) => {
          if (t.kind === 'word') {
            const isDeleted = deleted.has(t.wordIndex);
            return (
              <button
                key={i}
                type="button"
                onClick={() => onToggle(t.wordIndex)}
                aria-pressed={isDeleted}
                aria-label={isDeleted ? `Restore ${t.text}` : `Remove ${t.text}`}
                className={
                  'p-0 m-0 bg-transparent border-0 font-serif text-[inherit] leading-[inherit] align-baseline cursor-text transition-colors focus:outline-none focus-visible:underline focus-visible:underline-offset-4 ' +
                  (isDeleted
                    ? 'text-transparent selection:bg-transparent'
                    : 'text-ink hover:text-ink/55')
                }
              >
                {t.text}
              </button>
            );
          }
          return <span key={i}>{t.text}</span>;
        })}
      </article>

      <footer className="no-print mt-16 mb-8 w-full max-w-[640px] flex flex-wrap justify-center gap-x-8 gap-y-3 font-serif italic text-sm text-ink/55">
        <button type="button" onClick={onReset} className="hover:text-ink transition-colors">
          Reset
        </button>
        <button type="button" onClick={onShare} className="hover:text-ink transition-colors">
          {shareLabel}
        </button>
        <button type="button" onClick={onExport} className="hover:text-ink transition-colors">
          Export
        </button>
        <button type="button" onClick={onPrint} className="hover:text-ink transition-colors">
          Print
        </button>
      </footer>
    </main>
  );
}
