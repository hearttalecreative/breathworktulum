// Branded full-screen loader shown while a page is loading (Next route
// suspense). The wave mark breathes; a gold filet inhales below it.
export default function PageLoader() {
  return (
    <div className="loader-screen fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-night">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,rgba(194,168,120,0.10),transparent_60%)]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/icon-white.svg" alt="" aria-hidden className="loader-breathe relative w-20 opacity-90" />
      <span aria-hidden className="loader-filet relative h-px w-16 bg-gold-soft" />
      <span className="relative eyebrow text-gold-soft/80">Breathe</span>
      <span className="sr-only">Loading</span>
    </div>
  );
}
