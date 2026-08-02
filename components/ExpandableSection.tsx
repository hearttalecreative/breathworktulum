"use client";

import { useState, type ReactNode } from "react";

// "Read more" that expands in place (brief G-2). The content is rendered on the
// server and passed in as children, so only the toggle ships to the client and
// the full text stays in the DOM for search engines. Same grid-rows 0fr→1fr
// motion as the FAQ accordion, so the page keeps one expand language.
export default function ExpandableSection({
  label = "Read more",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        id="story-more"
        aria-hidden={!open}
        className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className={`overflow-hidden transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}>
          {children}
        </div>
      </div>

      {open ? null : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-controls="story-more"
          className="group link-underline mt-7 inline-flex items-center gap-2 text-sm font-medium text-gold-ink"
        >
          {label}
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5">
            &darr;
          </span>
        </button>
      )}
    </div>
  );
}
