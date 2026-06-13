import type { ReactNode } from "react";

type Tone = "cream" | "sand" | "night";

const tones: Record<Tone, string> = {
  cream: "bg-cream text-ink",
  sand: "bg-sand text-ink",
  night: "bg-night text-cream-dim",
};

/** Vertical section wrapper with generous, slow rhythm and a centered measure. */
export default function Section({
  children,
  tone = "cream",
  id,
  className = "",
  width = "default",
}: {
  children: ReactNode;
  tone?: Tone;
  id?: string;
  className?: string;
  width?: "default" | "narrow" | "wide";
}) {
  const measure =
    width === "narrow"
      ? "max-w-2xl"
      : width === "wide"
        ? "max-w-6xl"
        : "max-w-5xl";
  return (
    <section
      id={id}
      className={`${tones[tone]} px-6 py-20 sm:py-28 lg:py-32 ${className}`}
    >
      <div className={`mx-auto ${measure}`}>{children}</div>
    </section>
  );
}
