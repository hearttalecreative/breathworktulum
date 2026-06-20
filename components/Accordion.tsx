"use client";

import { useState } from "react";

export type QA = { q: string; a: string };

// Native <details>-style accordion, keyboard accessible, no aggressive motion.
export default function Accordion({ items }: { items: QA[] }) {
  return (
    <div className="divide-y divide-sand-deep border-y border-sand-deep">
      {items.map((item, i) => (
        <Item key={i} {...item} />
      ))}
    </div>
  );
}

function Item({ q, a }: QA) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-sans font-medium text-lg text-ink">{q}</span>
        <span aria-hidden className="text-gold">{open ? "–" : "+"}</span>
      </button>
      {open && <p className="pb-5 pr-8 text-muted">{a}</p>}
    </div>
  );
}
