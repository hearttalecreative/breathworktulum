"use client";

import Link from "next/link";
import { useState } from "react";

type NavLink = { label: string; href: string };

export default function Header({
  brandName = "Breathwork Tulum",
  workWithMe = [],
  primary = [],
  whatsappHref = "#",
  email = "",
}: {
  brandName?: string;
  workWithMe?: NavLink[];
  primary?: NavLink[];
  whatsappHref?: string;
  email?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-sand-deep/60 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-lg tracking-tight text-ink" onClick={() => setMenuOpen(false)}>
          {brandName}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {workWithMe.length > 0 && (
            <div className="group relative">
              <button className="flex items-center gap-1 py-2 text-sm text-ink/80 transition-colors hover:text-ink">
                Work With Me
                <span aria-hidden className="text-[0.6rem]">▾</span>
              </button>
              <div className="invisible absolute left-1/2 top-full w-60 -translate-x-1/2 pt-2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="rounded-xl border border-sand-deep bg-cream p-2 shadow-lg shadow-ink/5">
                  {workWithMe.map((item) => (
                    <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-ink/80 transition-colors hover:bg-sand hover:text-ink">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {primary.map((item) => (
            <Link key={item.href} href={item.href} className="link-underline py-2 text-sm text-ink/80 transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}

          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Message on WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-cream transition-colors hover:bg-ink">
            <WaIcon />
          </a>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Message on WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-cream">
            <WaIcon />
          </a>
          <button onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} className="flex h-10 w-10 items-center justify-center rounded-full text-ink">
            <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-sand-deep bg-cream px-6 py-6 lg:hidden" aria-label="Mobile">
          {workWithMe.length > 0 && (
            <>
              <p className="eyebrow mb-2">Work With Me</p>
              <div className="mb-4 flex flex-col gap-1 pl-1">
                {workWithMe.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="py-1.5 text-ink/80">
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          )}
          <div className="flex flex-col gap-1">
            {primary.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="py-1.5 text-lg text-ink">
                {item.label}
              </Link>
            ))}
          </div>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-sage px-6 py-3 text-cream">
            <WaIcon /> Message me on WhatsApp
          </a>
          {email ? <p className="mt-4 text-sm text-faint">{email}</p> : null}
        </nav>
      )}
    </header>
  );
}

function WaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm4.52 11.99c-.25-.12-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.31-.02-.47-.02-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.74 2.65 4.2 3.72.59.25 1.04.4 1.4.52.59.18 1.12.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}
