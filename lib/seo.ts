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
//
// Nodes share stable @ids so Google reads ONE connected entity graph
// (Organization ⇄ LocalBusiness ⇄ Person ⇄ WebSite) instead of four orphans.

const ORG_ID = `${SITE.url}/#organization`;
const BUSINESS_ID = `${SITE.url}/#localbusiness`;
const WEBSITE_ID = `${SITE.url}/#website`;
const PERSON_ID = `${SITE.url}/#sabine`;
const LOGO = `${SITE.url}/brand/icon-512.png`;
const SOCIALS = [
  SITE.social.instagram,
  SITE.social.facebook,
  SITE.social.linkedin,
  SITE.social.googleReviews,
].filter(Boolean);

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    founder: { "@id": PERSON_ID },
    logo: { "@type": "ImageObject", url: LOGO },
    image: `${SITE.url}/images/og-default.jpg`,
    sameAs: SOCIALS,
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE.name,
    url: SITE.url,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

export function localBusinessLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": BUSINESS_ID,
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phoneDisplay,
    image: `${SITE.url}/images/og-default.jpg`,
    logo: LOGO,
    priceRange: "$$-$$$",
    currenciesAccepted: "USD, MXN",
    founder: { "@id": PERSON_ID },
    parentOrganization: { "@id": ORG_ID },
    areaServed: [
      { "@type": "City", name: "Tulum" },
      { "@type": "Place", name: "Riviera Maya" },
      { "@type": "Country", name: "Mexico" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.location.city,
      addressRegion: SITE.location.region,
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.location.latitude,
      longitude: SITE.location.longitude,
    },
    hasMap: SITE.social.googleReviews,
    sameAs: SOCIALS,
  };
}

export function serviceLd(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: "Breathwork",
    provider: { "@id": PERSON_ID },
    areaServed: [
      { "@type": "City", name: "Tulum" },
      { "@type": "Place", name: "Riviera Maya" },
      { "@type": "VirtualLocation", name: "Online worldwide" },
    ],
  };
}

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.founder,
    jobTitle: "Clarity Breathwork™ Specialist",
    worksFor: { "@id": ORG_ID },
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

/** BreadcrumbList from a slug like "work-with-me/private-sessions". */
export function breadcrumbLd(slug: string, leafTitle: string) {
  const segments = slug.split("/");
  const items = [{ name: "Home", path: "/" }];
  let acc = "";
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    const last = i === segments.length - 1;
    items.push({
      name: last
        ? leafTitle
        : seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      path: `${acc}/`,
    });
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.path}`,
    })),
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
