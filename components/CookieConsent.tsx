"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "bt-cookie-consent";

// Quiet, non-invasive consent notice — a small card bottom-left, no overlay,
// no scroll lock. Privacy-preserving: nothing tracks until "Accept".
export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* storage blocked — stay quiet */
    }
  }, []);

  const decide = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="reveal-cookie fixed bottom-4 left-4 z-[55] w-[min(22rem,calc(100vw-2rem))] border border-line bg-shell/95 p-5 shadow-[0_30px_70px_-32px_rgba(25,27,23,0.5)] backdrop-blur-md"
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold-soft via-gold-soft/60 to-transparent" />
      <p className="text-sm leading-relaxed text-ink/80">
        We use a few cookies to understand how the site is used and to improve your visit. You decide.
      </p>
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => decide("accepted")}
          className="btn-sheen inline-flex min-h-[2.5rem] items-center justify-center bg-ink px-5 text-[0.85rem] font-medium text-pure transition-colors duration-300 hover:bg-forest"
        >
          Accept
        </button>
        <button
          onClick={() => decide("declined")}
          className="link-underline text-[0.85rem] text-ink/65 transition-colors hover:text-ink"
        >
          Decline
        </button>
        <Link
          href="/legal/privacy/"
          className="ml-auto text-[0.78rem] text-ink/45 underline-offset-2 hover:text-ink/70 hover:underline"
        >
          Privacy
        </Link>
      </div>
    </div>
  );
}
