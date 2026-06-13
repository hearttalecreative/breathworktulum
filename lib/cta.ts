// Resolve a CMS CTA into props for <CTAButton>. Server-side pure helpers.

type SettingsLike = {
  whatsappNumber?: string | null;
  email?: string | null;
  whatsappMessages?: { context: string; message: string }[] | null;
};

export type RawCta = {
  label?: string | null;
  variant?: "primary" | "secondary" | "whatsapp" | null;
  action?: "whatsapp" | "internal" | "email" | "external" | null;
  whatsappContext?: string | null;
  href?: string | null;
  enabled?: boolean | null;
};

export type ResolvedCta = {
  label: string;
  href: string;
  variant: "primary" | "secondary" | "whatsapp";
  external: boolean;
};

const FALLBACK_WA = "Hi Sabine, I saw your website. I'd like to learn more.";

export function whatsappHref(settings: SettingsLike, context = "general"): string {
  const number = settings.whatsappNumber || "525541098336";
  const msg =
    settings.whatsappMessages?.find((m) => m.context === context)?.message || FALLBACK_WA;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

export function resolveCta(cta: RawCta | null | undefined, settings: SettingsLike): ResolvedCta | null {
  if (!cta || !cta.label) return null;
  if (cta.enabled === false) return null;

  const variant = cta.variant || "primary";

  switch (cta.action) {
    case "whatsapp":
      return {
        label: cta.label,
        href: whatsappHref(settings, cta.whatsappContext || "general"),
        variant: "whatsapp",
        external: true,
      };
    case "email":
      return {
        label: cta.label,
        href: `mailto:${settings.email || "breathe@breathworktulum.com"}`,
        variant,
        external: true,
      };
    case "external":
      return { label: cta.label, href: cta.href || "#", variant, external: true };
    case "internal":
    default:
      return { label: cta.label, href: cta.href || "#", variant, external: false };
  }
}

export function resolveCtas(
  ctas: RawCta[] | null | undefined,
  settings: SettingsLike
): ResolvedCta[] {
  return (ctas || []).map((c) => resolveCta(c, settings)).filter(Boolean) as ResolvedCta[];
}
