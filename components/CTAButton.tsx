import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "whatsapp";

// Editorial buttons — rectangular, not pill. Primary/WhatsApp are sharp filled
// blocks with a tactile press; secondary is a text link with a gold underline
// that draws on hover (delicate, not a boxed AI button).
const filledBase =
  "group relative inline-flex min-h-[3.25rem] items-center justify-center gap-2.5 px-8 text-[0.92rem] font-medium tracking-[0.01em] transition-[background-color,transform] duration-300 active:translate-y-px";

// Light variants pop on dark photography (no dark-on-dark).
// Each carries a sheen glint (color matched to its fill); the primary also glows.
function filledVariant(variant: "primary" | "whatsapp", onDark: boolean) {
  if (variant === "whatsapp") return `${filledBase} btn-sheen-gold bg-gold-soft text-ink hover:bg-[#b7975f]`;
  return onDark
    ? `${filledBase} btn-sheen-gold btn-glow bg-shell text-ink hover:bg-champagne`
    : `${filledBase} btn-sheen btn-glow bg-ink text-pure hover:bg-forest`;
}

function Arrow() {
  return (
    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
      &rarr;
    </span>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.31-.02-.47-.02-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.74 2.65 4.2 3.72.59.25 1.04.4 1.4.52.59.18 1.12.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

export default function CTAButton({
  href,
  variant = "primary",
  children,
  external,
  onDark = false,
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  external?: boolean;
  onDark?: boolean;
}) {
  const isExternal = external ?? (href.startsWith("http") || href.startsWith("mailto:"));
  const linkProps = isExternal
    ? {
        href,
        target: href.startsWith("http") ? "_blank" : undefined,
        rel: href.startsWith("http") ? "noopener noreferrer" : undefined,
      }
    : null;

  const Anchor = ({ className, content }: { className: string; content: ReactNode }) =>
    linkProps ? (
      <a {...linkProps} className={className}>
        {content}
      </a>
    ) : (
      <Link href={href} className={className}>
        {content}
      </Link>
    );

  if (variant === "secondary") {
    return (
      <Anchor
        className={`group link-underline inline-flex min-h-[3.25rem] items-center gap-2 pb-1 text-[0.95rem] ${
          onDark ? "text-cream-dim hover:text-pure" : "text-ink"
        }`}
        content={
          <>
            {children}
            <Arrow />
          </>
        }
      />
    );
  }

  return (
    <Anchor
      className={filledVariant(variant, onDark)}
      content={
        <>
          {variant === "whatsapp" && <WhatsAppGlyph />}
          {children}
        </>
      }
    />
  );
}
