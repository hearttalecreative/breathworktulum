"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SocialLinks from "./SocialLinks";

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
  // Transparent + light text while sitting over a full-bleed hero; solid after.
  const [overHero, setOverHero] = useState(false);
  // Subtle shrink once the page is scrolled — a modern, lighter bar.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-fullbleed-hero]");
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (hero) setOverHero(window.scrollY < hero.offsetHeight - 90);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll while the full-screen menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const light = overHero && !menuOpen;
  const linkColor = light
    ? "text-pure/90 hover:text-pure [text-shadow:0_1px_10px_rgba(25,27,23,0.5)]"
    : "text-ink/80 hover:text-ink";
  // Bar is chromeless (no fill) while over the hero OR while the menu is open.
  const barBare = light || menuOpen;
  // Wordmark / trigger paint light when over hero or on the dark menu.
  const onLight = light || menuOpen;

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 ${
        barBare
          ? "border-b border-transparent bg-transparent"
          : "border-b border-line/60 bg-shell/85 shadow-[0_1px_30px_-12px_rgba(25,27,23,0.18)] backdrop-blur-xl"
      }`}
    >
      {/* Hairline gold filet — the signature accent, fades in once solid. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-soft/60 to-transparent transition-opacity duration-500 ${
          barBare ? "opacity-0" : "opacity-100"
        }`}
      />

      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-[clamp(20px,5vw,80px)] transition-[padding] duration-500 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <Link
          href="/"
          aria-label={brandName}
          className="group/logo relative z-50 flex items-center transition-transform duration-500 hover:opacity-90"
          onClick={() => setMenuOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={onLight ? "/brand/logo-allb.svg" : "/brand/logo-color.svg"}
            alt={brandName}
            className={`w-auto transition-[height] duration-500 ${scrolled ? "h-7 lg:h-9" : "h-9 lg:h-12"}`}
          />
        </Link>

        <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary">
          {workWithMe.length > 0 && (
            <div className="group relative">
              <button className={`flex items-center gap-1.5 py-2 text-[0.98rem] transition-colors ${linkColor}`}>
                Work With Me
                <span aria-hidden className="text-[0.55rem] transition-transform duration-300 group-hover:rotate-180">
                  ▾
                </span>
              </button>
              {/* Editorial dropdown — numbered, gold-filet, items rise in sequence. */}
              <div className="invisible absolute left-0 top-full w-[336px] origin-top translate-y-2 pt-4 opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="relative overflow-hidden bg-ivory/95 shadow-[0_40px_80px_-36px_rgba(25,27,23,0.45)] ring-1 ring-line backdrop-blur-md">
                  {/* Gold hairline that draws across the top as the panel opens. */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-gold-soft via-gold-soft/70 to-transparent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                  />
                  <p className="eyebrow px-5 pb-1 pt-4 text-gold-ink/80">Ways to work together</p>
                  <div className="px-1.5 pb-2 pt-1">
                    {workWithMe.map((item, i) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{ transitionDelay: `${80 + i * 55}ms` }}
                        className="group/it relative flex translate-y-1 items-center gap-3.5 px-3.5 py-2.5 opacity-0 transition-[opacity,transform,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-sand/60 group-hover:translate-y-0 group-hover:opacity-100"
                      >
                        {/* Gold filet that grows on hover. */}
                        <span
                          aria-hidden
                          className="absolute left-0 top-1/2 h-0 w-[2px] -translate-y-1/2 bg-gold-soft transition-[height] duration-300 group-hover/it:h-7"
                        />
                        <span className="font-serif text-[0.95rem] tabular-nums text-gold-soft/90 transition-colors group-hover/it:text-gold-ink">
                          0{i + 1}
                        </span>
                        <span className="flex-1 text-[0.95rem] text-ink/80 transition-colors group-hover/it:text-ink">
                          {item.label}
                        </span>
                        <span
                          aria-hidden
                          className="-translate-x-1 text-gold-soft opacity-0 transition-all duration-300 group-hover/it:translate-x-0 group-hover/it:opacity-100"
                        >
                          &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {primary.map((item) => (
            <Link key={item.href} href={item.href} className={`link-underline py-2 text-[0.98rem] transition-colors ${linkColor}`}>
              {item.label}
            </Link>
          ))}

          {/* Delicate WhatsApp — outlined ring that fills on hover. */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message on WhatsApp"
            className={`group/wa flex h-9 w-9 items-center justify-center rounded-full border transition-[background-color,border-color,color,transform] duration-300 hover:scale-105 ${
              light
                ? "border-pure/45 text-pure hover:border-pure hover:bg-pure hover:text-forest"
                : "border-ink/20 text-ink/70 hover:border-whatsapp hover:bg-whatsapp hover:text-pure"
            }`}
          >
            <WaIcon size={15} />
          </a>
        </nav>

        {/* Mobile trigger — animated hamburger that morphs to a close glyph. */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className={`relative z-50 flex h-10 w-10 items-center justify-center lg:hidden ${
            onLight ? "text-pure" : "text-ink"
          }`}
        >
          <span className="relative block h-3.5 w-6">
            <span
              className={`absolute left-0 block h-px w-6 bg-current transition-all duration-300 ${
                menuOpen ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-px bg-current transition-all duration-300 ${
                menuOpen ? "w-0 opacity-0" : "w-6 opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-6 bg-current transition-all duration-300 ${
                menuOpen ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>
    </header>

      {/* === Full-screen mobile menu (sibling of header so `fixed` maps to the
          viewport, not the backdrop-blurred bar) === */}
      <div
        data-open={menuOpen}
        className="fixed inset-0 z-40 flex flex-col bg-night text-cream-dim transition-[opacity,visibility] duration-500 data-[open=false]:invisible data-[open=false]:opacity-0 data-[open=true]:visible data-[open=true]:opacity-100 lg:hidden"
      >
        {/* Faint botanical glow + grain so it reads premium, not flat black. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(194,168,120,0.14),transparent_60%)]"
        />
        <div className="menu-stagger relative flex h-full flex-col items-center justify-center gap-0.5 overflow-y-auto px-6 pb-16 pt-24 text-center">
          {workWithMe.length > 0 && (
            <>
              <span className="eyebrow mb-2 text-gold-soft">Work With Me</span>
              {workWithMe.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-1 font-sans text-[0.95rem] text-cream-dim/80 transition-colors hover:text-pure"
                >
                  {item.label}
                </Link>
              ))}
              <span aria-hidden className="my-5 h-px w-10 bg-gold-soft/50" />
            </>
          )}

          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="link-underline py-1.5 font-serif text-[1.7rem] text-cream transition-colors hover:text-pure"
            >
              {item.label}
            </Link>
          ))}

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="mt-8 inline-flex items-center gap-2.5 border border-cream-dim/30 px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:border-pure hover:bg-pure hover:text-forest"
          >
            <WaIcon size={16} /> Message me on WhatsApp
          </a>
          {email ? <p className="mt-4 text-xs tracking-wide text-cream-dim/50">{email}</p> : null}
          <SocialLinks tone="dark" className="mt-5 justify-center" />
        </div>
      </div>
    </>
  );
}

function WaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm4.52 11.99c-.25-.12-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.31-.02-.47-.02-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.74 2.65 4.2 3.72.59.25 1.04.4 1.4.52.59.18 1.12.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

