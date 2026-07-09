"use client";

// Route error boundary. Without this, a stalled or failed dynamic render
// (e.g. a cold page fetch hitting the connection-limited pooler) leaves the
// full-screen loading fallback up forever. This surfaces the failure and
// offers a one-tap retry instead.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/icon-color.svg" alt="" aria-hidden className="w-16 opacity-80" />
      <div className="space-y-2">
        <p className="font-serif text-2xl text-ink">This page didn&apos;t load.</p>
        <p className="max-w-md text-sm text-ink-soft">
          Something interrupted the connection. It&apos;s usually momentary. Please try again.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-[44px] rounded-none bg-ink px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-night-soft"
        >
          Try again
        </button>
        <a
          href="/"
          className="min-h-[44px] rounded-none border border-line px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-sand/60"
        >
          Back home
        </a>
      </div>
    </div>
  );
}
