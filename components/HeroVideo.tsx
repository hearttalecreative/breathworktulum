"use client";

import Player from "@vimeo/player";
import { useEffect, useRef, useState } from "react";

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

    const player = new Player(el, {
      url: url as never,
      background: true, // autoplay + muted + loop + cover, no UI
      muted: true,
      autoplay: true,
      loop: true,
      responsive: false,
      dnt: true,
      quality: "auto",
    });

    let seeking = false;
    const onTime = (data: { seconds: number }) => {
      if (data.seconds >= loopEnd && !seeking) {
        seeking = true;
        player.setCurrentTime(0).finally(() => {
          seeking = false;
        });
      }
    };

    player.on("timeupdate", onTime);
    player.on("play", () => setReady(true));
    player.ready().then(() => setReady(true)).catch(() => {});

    return () => {
      player.off("timeupdate", onTime);
      player.destroy().catch(() => {});
    };
  }, [url, loopEnd]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      {/* The SDK injects the iframe here; background mode fills + covers. */}
      <div ref={wrap} className="vimeo-cover absolute inset-0" />
      {/* Poster while the player warms up; fades once playing. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
