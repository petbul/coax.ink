import { useMemo } from 'react';
import { tokenize } from '../lib/tokenize';

export type CanvasProps = {
  source: string;
  deleted: Set<number>;
  onToggle: (eraseIndex: number) => void;
  onReset: () => void;
  onBeginAgain: () => void;
  onShare: () => void;
  onExport: () => void;
  onPdf: () => void;
  shareLabel: string;
  pdfLabel: string;
};

export function Canvas({
  source,
  deleted,
  onToggle,
  onReset,
  onBeginAgain,
  onShare,
  onExport,
  onPdf,
  shareLabel,
  pdfLabel,
}: CanvasProps) {
  const tokens = useMemo(() => tokenize(source), [source]);

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-16">
      <button
        type="button"
        onClick={onBeginAgain}
        aria-label="Begin again with new text"
        className="self-start font-serif italic text-sm text-ink/40 hover:text-ink/70 transition-colors mb-10"
      >
        coax.ink
      </button>
      <article
        id="coax-canvas"
        className="w-full max-w-[640px] font-serif text-[19px] leading-[1.7] text-ink whitespace-pre-wrap"
      >
        {tokens.map((t, i) => {
          if (t.kind === 'space') {
            return <span key={i}>{t.text}</span>;
          }
          const isDeleted = deleted.has(t.eraseIndex);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(t.eraseIndex)}
              aria-pressed={isDeleted}
              aria-label={isDeleted ? `Restore ${t.text}` : `Remove ${t.text}`}
              className={
                'p-0 m-0 bg-transparent border-0 font-serif text-[inherit] leading-[inherit] align-baseline cursor-default transition-colors focus:outline-none focus-visible:underline focus-visible:underline-offset-4 ' +
                (isDeleted
                  ? 'text-transparent selection:bg-transparent'
                  : 'text-ink hover:text-ink/55')
              }
            >
              {t.text}
            </button>
          );
        })}
      </article>

      <footer className="mt-16 mb-8 w-full max-w-[640px] flex flex-wrap justify-center gap-x-8 gap-y-3 font-serif italic text-sm text-ink/55">
        <button type="button" onClick={onReset} className="hover:text-ink transition-colors">
          Reset
        </button>
        <button type="button" onClick={onShare} className="hover:text-ink transition-colors">
          {shareLabel}
        </button>
        <button type="button" onClick={onExport} className="hover:text-ink transition-colors">
          Export
        </button>
        <button type="button" onClick={onPdf} className="hover:text-ink transition-colors">
          {pdfLabel}
        </button>
      </footer>
    </main>
  );
}
