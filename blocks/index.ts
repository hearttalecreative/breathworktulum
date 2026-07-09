import type { Block } from "payload";
import { ctaArray, ctaGroup, ctaFields } from "../fields/cta";

const tone = {
  name: "tone",
  type: "select" as const,
  label: "Color de fondo",
  defaultValue: "cream",
  admin: { description: "Fondo de la sección. Alterná claro/arena para dar ritmo; «noche» para tramos oscuros." },
  options: [
    { label: "Claro (crema)", value: "cream" },
    { label: "Arena", value: "sand" },
    { label: "Noche (oscuro)", value: "night" },
  ],
};

const width = {
  name: "width",
  type: "select" as const,
  label: "Ancho del contenido",
  defaultValue: "default",
  admin: { description: "Qué tan ancho se ve el texto. Estrecho = más cómodo de leer." },
  options: [
    { label: "Estrecho", value: "narrow" },
    { label: "Normal", value: "default" },
    { label: "Ancho", value: "wide" },
  ],
};

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Portada (encabezado)", plural: "Portadas" },
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
  labels: { singular: "Texto", plural: "Bloques de texto" },
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
  labels: { singular: "Tres fases (método)", plural: "Tres fases" },
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
  labels: { singular: "Lista de situaciones", plural: "Listas de situaciones" },
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
  labels: { singular: "Banda de foto", plural: "Bandas de foto" },
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
  labels: { singular: "Cuadrícula de tarjetas", plural: "Cuadrículas de tarjetas" },
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
  labels: { singular: "Testimonios", plural: "Testimonios" },
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
  labels: { singular: "Imagen + texto", plural: "Imagen + texto" },
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
  labels: { singular: "Banda destacada (foto + texto)", plural: "Bandas destacadas" },
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
  labels: { singular: "Llamada a la acción", plural: "Llamadas a la acción" },
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
  labels: { singular: "Detalle de servicio o formato", plural: "Detalles de servicio" },
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
  labels: { singular: "Preguntas frecuentes", plural: "Preguntas frecuentes" },
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
  labels: { singular: "Lista", plural: "Listas" },
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
  labels: { singular: "Dos listas en columnas", plural: "Dos listas en columnas" },
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
  labels: { singular: "Tarjetas de contacto", plural: "Tarjetas de contacto" },
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
  labels: { singular: "Formulario de contacto", plural: "Formularios de contacto" },
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
