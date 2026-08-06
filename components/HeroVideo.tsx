"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type PlayerType from "@vimeo/player";

// Full-bleed Vimeo background video for the hero. Background mode autoplays
// muted on every device, fills + covers the section, no controls. The poster
// (IMG_5306) shows until the player is ready, then fades. We cap the loop at
// `loopEnd` seconds via the Player SDK — it never plays past that point.
export default function HeroVideo({
  url,
  poster,
  loopEnd,
}: {
  url: string;
  poster: string;
  /** Corta el loop en este segundo. Sin valor, el video corre entero. */
  loopEnd?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerType | null>(null);
  const [ready, setReady] = useState(false);
  // Browsers block autoplay with sound, and Vimeo background mode is muted by
  // design, so audio can only ever start from a user gesture. The video plays
  // muted and this toggle hands the choice to the visitor.
  const [muted, setMuted] = useState(true);
  const [canControlSound, setCanControlSound] = useState(false);

  async function toggleSound() {
    const player = playerRef.current;
    if (!player) return;
    const next = !muted;
    try {
      await player.setMuted(next);
      if (!next) await player.setVolume(1);
      setMuted(next);
    } catch {
      /* player not ready yet */
    }
  }

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let player: PlayerType | null = null;
    let cancelled = false;
    let seeking = false;

    // Lazy-load the SDK so it stays out of the initial homepage bundle; the
    // poster already covers the hero while it loads.
    import("@vimeo/player").then(({ default: Player }) => {
      if (cancelled || !wrap.current) return;
      player = new Player(el, {
        url: url as never,
        background: true, // autoplay + muted + loop + cover, no UI
        muted: true,
        autoplay: true,
        loop: true,
        responsive: false,
        dnt: true,
        quality: "auto",
      });
      const onTime = (data: { seconds: number }) => {
        if (loopEnd != null && data.seconds >= loopEnd && !seeking && player) {
          seeking = true;
          player.setCurrentTime(0).finally(() => {
            seeking = false;
          });
        }
      };
      player.on("timeupdate", onTime);
      player.on("play", () => setReady(true));
      playerRef.current = player;
      player
        .ready()
        .then(() => {
          setReady(true);
          setCanControlSound(true);
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
      playerRef.current = null;
      player?.destroy().catch(() => {});
    };
  }, [url, loopEnd]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      {/* The SDK injects the iframe here; background mode fills + covers. */}
      <div ref={wrap} className="vimeo-cover absolute inset-0" />
      {/* Poster = LCP. Server-optimized + priority so it paints fast and
          responsive; fades out once the player is playing. */}
      <Image
        src={poster}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className={`object-cover transition-opacity duration-700 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />
      {canControlSound ? (
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          className="absolute bottom-5 right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-pure/40 bg-night/35 text-pure backdrop-blur-sm transition-colors hover:bg-night/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="m22 9-6 6M16 9l6 6" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="M16 8.5a5 5 0 0 1 0 7M19 6a9 9 0 0 1 0 12" />
            </svg>
          )}
        </button>
      ) : null}
    </div>
  );
}
