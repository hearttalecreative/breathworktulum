"use client";

import { useState } from "react";

// Share row for blog articles (brief B-7). WhatsApp / Facebook / LinkedIn take
// a share URL. Instagram has no public share-a-link endpoint, so that button
// copies the link and opens Instagram — the only route it supports. Where the
// browser exposes the native share sheet (mostly mobile) we surface that too,
// since it lists Instagram and everything else the device has installed.
// Static — hoisted so it isn't rebuilt on every render.
const BTN =
  "inline-flex min-h-[2.5rem] items-center rounded-full border border-line px-4 text-[0.82rem] font-medium text-ink-soft transition-colors hover:border-gold-soft hover:text-gold-ink";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the visible URL is still selectable */
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user dismissed */
      }
    }
  }

  const links: { label: string; href: string }[] = [
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  ];

  return (
    <div className="mt-12 border-t border-line pt-6">
      <p className="eyebrow text-gold-ink/80">Share this article</p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={copy} className={BTN}>
          {copied ? "Link copied" : "Copy link"}
        </button>
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={BTN}>
            {l.label}
          </a>
        ))}
        <button
          type="button"
          onClick={async () => {
            await copy();
            window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
          }}
          className={BTN}
          title="Instagram doesn't allow sharing a link directly — we copy it so you can paste it into your story or bio."
        >
          Instagram
        </button>
        <button type="button" onClick={nativeShare} className={`${BTN} sm:hidden`}>
          More…
        </button>
      </div>
    </div>
  );
}
