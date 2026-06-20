import type { Metadata } from "next";
import { SITE } from "./site";

type PageMetaInput = {
  title: string; // exact <title>, per 01_SEO_FOUNDATION.md
  description: string;
  path: string; // e.g. "/about/"
  ogType?: "website" | "article";
  ogImage?: string; // path under /public, e.g. "/images/og-about.jpg"
};

/** Per-page Metadata, fed from the exact values in 01_SEO_FOUNDATION.md. */
export function pageMeta({
  title,
  description,
  path,
  ogType = "website",
  ogImage = "/images/og-default.jpg",
}: PageMetaInput): Metadata {
  const url = `${SITE.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      type: ogType,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// --- JSON-LD builders (rendered via <script type="application/ld+json">) ---

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    founder: { "@type": "Person", name: SITE.founder },
    logo: `${SITE.url}/brand/icon-512.png`,
    sameAs: [
      SITE.social.instagram,
      SITE.social.facebook,
      SITE.social.linkedin,
      SITE.social.googleReviews,
    ].filter(Boolean),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
  };
}

export function localBusinessLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phoneDisplay,
    priceRange: "$$-$$$",
    areaServed: ["Tulum", "Riviera Maya", "Mexico", "Online worldwide"],
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.location.city,
      addressRegion: SITE.location.region,
      addressCountry: "MX",
    },
  };
}

export function serviceLd(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: "Breathwork",
    provider: { "@type": "Person", name: SITE.founder },
    areaServed: ["Tulum", "Riviera Maya", "Online worldwide"],
  };
}

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.founder,
    jobTitle: "Clarity Breathwork™ Specialist",
    description:
      "Clarity Breathwork™ Specialist with twenty years in wellness and an international corporate background. Based in Tulum, Mexico.",
    knowsAbout: [
      "Breathwork",
      "Somatic coaching",
      "Nervous system regulation",
      "Trauma informed practice",
    ],
    url: `${SITE.url}/about/`,
    sameAs: [SITE.social.instagram, SITE.social.linkedin, SITE.social.facebook].filter(Boolean),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
