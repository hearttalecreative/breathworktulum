import type { Block } from "payload";
import { ctaArray, ctaGroup, ctaFields } from "../fields/cta";

const tone = {
  name: "tone",
  type: "select" as const,
  defaultValue: "cream",
  options: [
    { label: "Cream", value: "cream" },
    { label: "Sand", value: "sand" },
    { label: "Night (dark)", value: "night" },
  ],
};

const width = {
  name: "width",
  type: "select" as const,
  defaultValue: "default",
  options: [
    { label: "Narrow", value: "narrow" },
    { label: "Default", value: "default" },
    { label: "Wide", value: "wide" },
  ],
};

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Heroes" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "textarea", required: true },
    { name: "lede", type: "textarea" },
    { name: "image", type: "upload", relationTo: "media" },
    {
      name: "imageSide",
      type: "select",
      defaultValue: "right",
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
  labels: { singular: "Rich text", plural: "Rich text" },
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
  labels: { singular: "Three Phases (method)", plural: "Three Phases" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    { name: "lede", type: "textarea" },
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
    {
      name: "items",
      type: "array",
      fields: [{ name: "text", type: "textarea", required: true }],
    },
    { name: "closing", type: "text" },
    tone,
  ],
};

export const WaysGridBlock: Block = {
  slug: "waysGrid",
  labels: { singular: "Ways grid", plural: "Ways grids" },
  fields: [
    { name: "heading", type: "text", required: true },
    {
      name: "cards",
      type: "array",
      fields: [
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
  labels: { singular: "Split image + text", plural: "Split image + text" },
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
  labels: { singular: "Signature band", plural: "Signature bands" },
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
  labels: { singular: "CTA section", plural: "CTA sections" },
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
  labels: { singular: "Format detail", plural: "Format details" },
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
  labels: { singular: "List section", plural: "List sections" },
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
  labels: { singular: "Contact tiles", plural: "Contact tiles" },
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

export const allBlocks: Block[] = [
  HeroBlock,
  RichTextBlock,
  ThreePhasesBlock,
  SituationsBlock,
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
];
