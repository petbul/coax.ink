import { useState } from 'react';

const MAX_LEN = 10_000;

export function Home({ onBegin }: { onBegin: (source: string) => void }) {
  const [text, setText] = useState('');
  const trimmed = text.trim();
  const canBegin = trimmed.length > 0;

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[640px]">
        <header className="mb-12 text-center">
          <h1 className="inline-block font-serif text-2xl md:text-3xl tracking-tight bg-gradient-to-r from-ink to-ink/[0.03] bg-clip-text text-transparent">
            coax.ink
          </h1>
          <p className="mt-3 font-serif text-base md:text-lg text-ink/65">
            Coax a poem from any text.
          </p>
        </header>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
          placeholder="Paste anything. A speech, a contract, a recipe, a letter."
          spellCheck={false}
          className="w-full min-h-[40vh] bg-transparent font-serif text-[19px] leading-[1.7] text-ink placeholder:text-ink/40 outline-none resize-none"
          aria-label="Source text"
        />

        <div className="mt-8 flex items-center justify-between">
          <span className="font-serif text-sm text-ink/40">
            {text.length > 0 ? `${text.length.toLocaleString()} / ${MAX_LEN.toLocaleString()}` : ''}
          </span>
          <button
            type="button"
            onClick={() => canBegin && onBegin(trimmed)}
            disabled={!canBegin}
            className="font-serif text-lg text-ink underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink disabled:text-ink/30 disabled:no-underline disabled:cursor-default transition-colors"
          >
            Begin
          </button>
        </div>
      </div>
    </main>
  );
}
