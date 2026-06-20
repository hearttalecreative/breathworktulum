// The brand wave mark as inline SVG, inherits currentColor. Use for ornaments,
// accents, and watermarks so the identity recurs across the site.
export default function WaveMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 128.55 26.07" fill="currentColor" aria-hidden className={className}>
      <path d="M128.55,6.58c-9.72,14.44-26.22,22.33-43.51,18.53-6.85-1.51-13.04-4.32-19.52-7.01l-16.88-7C29.9,4.97,15.66,8.79,0,20.26,6.99,11.89,17.05,6.72,27.64,5.04c8.31-1.32,16.4,0,24.24,2.69,6.47,2.22,12.23,5.46,18.58,7.88l13.16,5.03c10.55,3.18,21.42,2.02,31.03-3.35,5.2-2.91,9.24-6.7,13.91-10.7Z" />
      <path d="M85.11,13.47c14.14.84,26.45-4.19,37.87-13.47-7.94,12.7-23.86,18.3-37.87,13.47Z" />
    </svg>
  );
}
