"use client";

import { useState } from "react";

export type QA = { q: string; a: string };

// Editorial accordion — keyboard accessible, slow soft open (grid-rows
// transition, no layout jump), gold filet that rotates between + and ×.
export default function Accordion({ items }: { items: QA[] }) {
  return (
    <div className="border-y border-gold-soft/30">
      {items.map((item, i) => (
        <Item key={i} {...item} first={i === 0} />
      ))}
    </div>
  );
}

function Item({ q, a, first }: QA & { first?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`group ${first ? "" : "border-t border-gold-soft/20"}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-5 py-6 text-left transition-colors"
      >
        <span
          className={`font-sans font-medium text-lg leading-snug transition-colors duration-300 ${
            open ? "text-ink" : "text-ink-soft group-hover:text-ink"
          }`}
        >
          {q}
        </span>
        {/* A gold hairline cross: the vertical stroke folds away on open. */}
        <span aria-hidden className="relative mt-1.5 size-4 flex-none text-gold-soft">
          <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
          <span
            className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? "scale-y-0" : "scale-y-100"
            }`}
          />
        </span>
      </button>
      {/* grid-rows 0fr→1fr animates height with no max-height guesswork. */}
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="measure pb-6 pr-6 text-muted">{a}</p>
        </div>
      </div>
    </div>
  );
}
