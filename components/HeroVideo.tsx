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
  loopEnd = 25.8,
}: {
  url: string;
  poster: string;
  loopEnd?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

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
        if (data.seconds >= loopEnd && !seeking && player) {
          seeking = true;
          player.setCurrentTime(0).finally(() => {
            seeking = false;
          });
        }
      };
      player.on("timeupdate", onTime);
      player.on("play", () => setReady(true));
      player.ready().then(() => setReady(true)).catch(() => {});
    });

    return () => {
      cancelled = true;
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
    </div>
  );
}
