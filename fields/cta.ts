import type { Field } from "payload";

// Shared CTA sub-fields. A CTA resolves to a WhatsApp link (per-context message),
// an internal page/anchor link, or an email. Rendered by components/blocks/cta helper.
export const ctaFields: Field[] = [
  { name: "label", type: "text" },
  {
    name: "variant",
    type: "select",
    defaultValue: "primary",
    options: [
      { label: "Primary (solid)", value: "primary" },
      { label: "Secondary (outline)", value: "secondary" },
      { label: "WhatsApp", value: "whatsapp" },
    ],
  },
  {
    name: "action",
    type: "select",
    required: true,
    defaultValue: "internal",
    options: [
      { label: "WhatsApp", value: "whatsapp" },
      { label: "Internal link / anchor", value: "internal" },
      { label: "Email", value: "email" },
      { label: "External URL", value: "external" },
    ],
  },
  {
    name: "whatsappContext",
    type: "select",
    defaultValue: "general",
    admin: { condition: (_, s) => s?.action === "whatsapp" },
    options: [
      "general",
      "foundation",
      "immersive",
      "oneDayPrivate",
      "couples",
      "personalizedRetreat",
      "curated",
      "corporate",
      "signature",
      "contact",
    ].map((v) => ({ label: v, value: v })),
  },
  {
    name: "href",
    type: "text",
    admin: {
      condition: (_, s) => s?.action === "internal" || s?.action === "external",
      description: "e.g. /the-method/ or #immersive (internal) or full https URL.",
    },
  },
];

/** A repeatable CTA group (max N) for hero/cta blocks. */
export function ctaArray(name = "ctas", maxRows = 2): Field {
  return {
    name,
    type: "array",
    maxRows,
    labels: { singular: "CTA", plural: "CTAs" },
    fields: ctaFields,
  };
}

/** A single optional CTA group. */
export function ctaGroup(name = "cta"): Field {
  return {
    name,
    type: "group",
    fields: [{ name: "enabled", type: "checkbox", defaultValue: true }, ...ctaFields],
  };
}
