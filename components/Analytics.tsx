"use client";

import { useEffect } from "react";

// Google Analytics 4, held back until the visitor accepts the cookie notice.
//
// Nothing loads without NEXT_PUBLIC_GA_ID, so the site runs untracked until a
// Measurement ID (G-XXXXXXXXXX) is set in the environment. With the ID set,
// nothing loads until "Accept": no script, no cookie, no request to Google.
// A visitor who declines is never measured.
//
// Page views between pages need no code here. GA4 follows browser-history
// changes on its own (Enhanced measurement, on by default in every web stream).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const CONSENT_KEY = "bt-cookie-consent";
export const CONSENT_EVENT = "bt-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    __btAnalytics?: boolean;
  }
}

function start(id: string) {
  if (window.__btAnalytics) return;
  window.__btAnalytics = true;
  window.dataLayer = window.dataLayer || [];
  // gtag's queue expects the raw `arguments` object, not an array.
  function gtag(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", id);
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

export default function Analytics() {
  useEffect(() => {
    if (!GA_ID) return;
    try {
      if (localStorage.getItem(CONSENT_KEY) === "accepted") start(GA_ID);
    } catch {
      /* storage blocked: treated as no consent */
    }
    const onDecision = (e: Event) => {
      if ((e as CustomEvent<string>).detail === "accepted") start(GA_ID);
    };
    window.addEventListener(CONSENT_EVENT, onDecision);
    return () => window.removeEventListener(CONSENT_EVENT, onDecision);
  }, []);
  return null;
}
