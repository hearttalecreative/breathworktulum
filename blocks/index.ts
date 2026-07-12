import type { Block } from "payload";
import { ctaArray, ctaGroup, ctaFields } from "../fields/cta";

const tone = {
  name: "tone",
  type: "select" as const,
  label: "Background color",
  defaultValue: "cream",
  admin: { description: "Section background. Alternate light/sand for rhythm; use “night” for darker stretches." },
  options: [
    { label: "Light (cream)", value: "cream" },
    { label: "Sand", value: "sand" },
    { label: "Night (dark)", value: "night" },
  ],
};

const width = {
  name: "width",
  type: "select" as const,
  label: "Content width",
  defaultValue: "default",
  admin: { description: "How wide the text appears. Narrow = easier to read." },
  options: [
    { label: "Narrow", value: "narrow" },
    { label: "Default", value: "default" },
    { label: "Wide", value: "wide" },
  ],
};

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero (header)", plural: "Heroes" },
  fields: [
    {
      name: "variant",
      type: "select",
      defaultValue: "split",
      options: [
        { label: "Split (image beside text)", value: "split" },
        { label: "Full-bleed (immersive photo)", value: "fullBleed" },
      ],
    },
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "textarea", required: true },
    { name: "lede", type: "textarea" },
    { name: "image", type: "upload", relationTo: "media" },
    {
      name: "imageSide",
      type: "select",
      defaultValue: "right",
      admin: { condition: (_, s) => s?.variant !== "fullBleed" },
      options: [
        { label: "Right", value: "right" },
        { label: "Left", value: "left" },
      ],
    },
    ctaArray("ctas", 2),
  ],
};

export const RichTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Text", plural: "Text blocks" },
  fields: [
    { name: "heading", type: "text" },
    { name: "body", type: "richText" },
    ctaGroup("cta"),
    tone,
    width,
  ],
};

export const ThreePhasesBlock: Block = {
  slug: "threePhases",
  labels: { singular: "Three phases (method)", plural: "Three phases" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    { name: "lede", type: "textarea" },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "body", type: "richText" },
    ctaGroup("cta"),
    tone,
  ],
};

export const SituationsBlock: Block = {
  slug: "situations",
  labels: { singular: "Situations list", plural: "Situations lists" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "image", type: "upload", relationTo: "media" },
    {
      name: "items",
      type: "array",
      fields: [{ name: "text", type: "textarea", required: true }],
    },
    { name: "closing", type: "text" },
    tone,
  ],
};

// Full-bleed photographic band — a breath between sections (doc 18 §6.1).
export const PhotoBandBlock: Block = {
  slug: "photoBand",
  labels: { singular: "Photo band", plural: "Photo bands" },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "eyebrow", type: "text" },
    { name: "caption", type: "text", admin: { description: "Optional short line over the photo." } },
    {
      name: "height",
      type: "select",
      defaultValue: "tall",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Tall", value: "tall" },
      ],
    },
  ],
};

export const WaysGridBlock: Block = {
  slug: "waysGrid",
  labels: { singular: "Card grid", plural: "Card grids" },
  fields: [
    { name: "heading", type: "text", required: true },
    {
      name: "cards",
      type: "array",
      fields: [
        { name: "image", type: "upload", relationTo: "media" },
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
        { name: "ctaLabel", type: "text" },
        { name: "href", type: "text" },
      ],
    },
    tone,
  ],
};

export const TestimonialsBlock: Block = {
  slug: "testimonialsBlock",
  labels: { singular: "Testimonials", plural: "Testimonials" },
  fields: [
    { name: "heading", type: "text" },
    { name: "items", type: "relationship", relationTo: "testimonials", hasMany: true },
    { name: "reviewsLabel", type: "text" },
    { name: "reviewsUrl", type: "text" },
    tone,
  ],
};

export const SplitImageTextBlock: Block = {
  slug: "splitImageText",
  labels: { singular: "Image + text", plural: "Image + text" },
  fields: [
    { name: "image", type: "upload", relationTo: "media" },
    {
      name: "imageSide",
      type: "select",
      defaultValue: "left",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
    { name: "heading", type: "text", required: true },
    { name: "body", type: "richText" },
    ctaGroup("cta"),
    tone,
  ],
};

export const SignatureBandBlock: Block = {
  slug: "signatureBand",
  labels: { singular: "Feature band (photo + text)", plural: "Feature bands" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "textarea", required: true },
    { name: "body", type: "textarea" },
    { name: "image", type: "upload", relationTo: "media" },
    ctaGroup("cta"),
  ],
};

export const CtaSectionBlock: Block = {
  slug: "ctaSection",
  labels: { singular: "Call to action", plural: "Calls to action" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "body", type: "textarea" },
    ctaArray("ctas", 3),
    {
      name: "align",
      type: "select",
      defaultValue: "center",
      options: [
        { label: "Center", value: "center" },
        { label: "Left", value: "left" },
      ],
    },
    tone,
    width,
  ],
};

export const FormatDetailBlock: Block = {
  slug: "formatDetail",
  labels: { singular: "Service or format detail", plural: "Service details" },
  fields: [
    { name: "anchor", type: "text", admin: { description: "Anchor id, e.g. immersive" } },
    { name: "title", type: "text", required: true },
    { name: "tag", type: "text", admin: { description: 'e.g. "Signature"' } },
    { name: "tagline", type: "text" },
    { name: "body", type: "richText" },
    {
      name: "included",
      type: "array",
      labels: { singular: "Item", plural: "Included items" },
      fields: [{ name: "text", type: "text", required: true }],
    },
    { name: "investment", type: "text" },
    { name: "cta", type: "group", fields: ctaFields },
    tone,
  ],
};

export const FaqBlock: Block = {
  slug: "faq",
  labels: { singular: "FAQ", plural: "FAQs" },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "items",
      type: "array",
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
    tone,
  ],
};

export const ListBlock: Block = {
  slug: "list",
  labels: { singular: "List", plural: "Lists" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "intro", type: "textarea" },
    {
      name: "items",
      type: "array",
      fields: [{ name: "text", type: "textarea", required: true }],
    },
    { name: "note", type: "textarea" },
    ctaGroup("cta"),
    tone,
    width,
  ],
};

export const TwoColumnListsBlock: Block = {
  slug: "twoColumnLists",
  labels: { singular: "Two-column lists", plural: "Two-column lists" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "intro", type: "textarea" },
    { name: "leftTitle", type: "text" },
    { name: "left", type: "array", fields: [{ name: "text", type: "textarea", required: true }] },
    { name: "rightTitle", type: "text" },
    { name: "right", type: "array", fields: [{ name: "text", type: "textarea", required: true }] },
    tone,
  ],
};

export const ContactTilesBlock: Block = {
  slug: "contactTiles",
  labels: { singular: "Contact cards", plural: "Contact cards" },
  fields: [
    {
      name: "tiles",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "line", type: "textarea" },
        { name: "value", type: "text" },
        { name: "ctaLabel", type: "text" },
        ...ctaFields.filter((f) => "name" in f && f.name !== "label" && f.name !== "variant"),
      ],
    },
    tone,
  ],
};

export const ContactFormBlock: Block = {
  slug: "contactForm",
  labels: { singular: "Contact form", plural: "Contact forms" },
  fields: [
    { name: "heading", type: "text" },
    { name: "intro", type: "textarea" },
    tone,
  ],
};

export const NewsletterBlock: Block = {
  slug: "newsletter",
  labels: { singular: "Newsletter signup", plural: "Newsletter signups" },
  fields: [
    { name: "heading", type: "text" },
    { name: "intro", type: "textarea" },
    tone,
  ],
};

export const allBlocks: Block[] = [
  HeroBlock,
  RichTextBlock,
  ThreePhasesBlock,
  SituationsBlock,
  PhotoBandBlock,
  WaysGridBlock,
  TestimonialsBlock,
  SplitImageTextBlock,
  SignatureBandBlock,
  CtaSectionBlock,
  FormatDetailBlock,
  FaqBlock,
  ListBlock,
  TwoColumnListsBlock,
  ContactTilesBlock,
  ContactFormBlock,
  NewsletterBlock,
];

// Give every block an optional `anchor` (for in-page #links). FormatDetail
// already defines one. This drives the DOM id in RenderBlocks.
const anchorField = {
  name: "anchor",
  type: "text" as const,
  admin: { position: "sidebar" as const, description: "Optional anchor id for #links (e.g. inquiry)." },
};
for (const b of allBlocks) {
  if (!b.fields.some((f) => "name" in f && f.name === "anchor")) {
    b.fields.push(anchorField);
  }
}
