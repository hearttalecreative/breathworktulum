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
  first = false,
}: {
  children: ReactNode;
  tone?: Tone;
  id?: string;
  className?: string;
  width?: "default" | "narrow" | "wide";
  /** Primera sección de una página que no arranca con un hero: suma el alto del
   *  header fixed, si no su contenido queda debajo y no se puede clickear. */
  first?: boolean;
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
      className={`${tones[tone]} ${tone === "night" ? "on-dark" : ""} px-[clamp(20px,5vw,80px)] py-section ${first ? "section-first" : ""} ${className}`}
    >
      <div className={`mx-auto ${measure}`}>{children}</div>
    </section>
  );
}
