// Single source of truth for site-wide constants.
// Values from 14_NOTAS_DESARROLLO.md, 13_GLOBAL_ELEMENTS.md, 01_SEO_FOUNDATION.md.
// Items marked TODO are pending confirmation (see 09_DECISIONES_PENDIENTES.md).

export const SITE = {
  name: "Breathwork Tulum",
  url: "https://breathworktulum.com",
  slogan: "Breathe. Heal. Transform.®",
  signatureLine: "Breathe. Heal. Transform. Work with the body, not just the mind.",
  description:
    "Trauma informed breathwork and somatic coaching for people moving through life transitions. In Tulum, online, or in a personalized retreat.",

  email: "breathe@breathworktulum.com",

  // Phone from docs. Digits-only used for wa.me links.
  phoneDisplay: "+52 55 4109 8336",
  whatsappNumber: "525541098336",

  founder: "Sabine Binns",

  location: {
    city: "Tulum",
    region: "Quintana Roo",
    country: "Mexico",
  },

  social: {
    instagram: "https://www.instagram.com/breathworktulum/",
    googleReviews: "https://g.page/r/CXT0CCkbKfFWEBM/review",
    linkedin: "https://www.linkedin.com/in/sabine-binns-039787a/",
    facebook: "https://www.facebook.com/2105142943041254",
  },
} as const;

export const NAV = {
  workWithMe: [
    { label: "Private Sessions", href: "/work-with-me/private-sessions/" },
    // Phase 2 routes — listed for nav completeness, not yet built.
    { label: "Personalized Retreats", href: "/work-with-me/personalized-retreats/" },
    { label: "Curated Group Experiences", href: "/work-with-me/curated-group-experiences/" },
    { label: "Corporate", href: "/work-with-me/corporate/" },
  ],
  primary: [
    { label: "The Method", href: "/the-method/" },
    { label: "Retreats", href: "/retreat-riviera-maya-2026/" },
    { label: "About", href: "/about/" },
    { label: "Contact", href: "/contact/" },
  ],
} as const;
