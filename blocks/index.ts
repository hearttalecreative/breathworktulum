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
    {
      name: "metaLine",
      type: "text",
      label: "Detail line",
      admin: { description: 'Short scannable line under the description, e.g. "Small-group retreat · Tulum · November to April".' },
    },
    { name: "image", type: "upload", relationTo: "media" },
    {
      name: "videoUrl",
      type: "text",
      label: "Video (optional)",
      admin: {
        description:
          "Paste a Vimeo or YouTube address and the video plays instead of the photo above, silently and on a loop. In the full-screen layout it sits behind the headline; in the side-by-side one it fills the shape beside the text. Leave it empty to use the photo.",
      },
    },
    {
      name: "videoTrim",
      type: "number",
      label: "Stop the loop at (seconds)",
      admin: {
        condition: (_, s) => s?.variant === "fullBleed",
        description: "Optional. Cuts the loop short so it never runs past a good moment.",
      },
    },
    {
      name: "imageShape",
      type: "select",
      defaultValue: "arch",
      label: "Image shape",
      admin: {
        condition: (_, s) => s?.variant !== "fullBleed",
        description: "The shape the photo is cut into. Leave the section without a photo and the text simply runs full width, with no empty shape.",
      },
      options: [
        { label: "Arch", value: "arch" },
        { label: "Softly rounded", value: "rounded" },
        { label: "Square", value: "square" },
      ],
    },
    {
      name: "spacing",
      type: "select",
      defaultValue: "normal",
      label: "Space above",
      admin: {
        condition: (_, s) => s?.variant !== "fullBleed",
        description: "How much air sits between the menu and the start of this section.",
      },
      options: [
        { label: "Compact", value: "compact" },
        { label: "Normal", value: "normal" },
        { label: "Generous", value: "generous" },
      ],
    },
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
    {
      name: "textPlacement",
      type: "select",
      defaultValue: "over",
      label: "Headline placement",
      admin: {
        condition: (_, s) => s?.variant === "fullBleed",
        description: "Over the photo, or underneath it so the footage stays clean.",
      },
      options: [
        { label: "Over the photo", value: "over" },
        { label: "Below the photo", value: "below" },
      ],
    },
    ctaArray("ctas", 2),
  ],
};

const alignField = {
  name: "align",
  type: "select" as const,
  defaultValue: "left",
  label: "Text alignment",
  admin: { description: "Centres the heading and the body together." },
  options: [
    { label: "Left", value: "left" },
    { label: "Centered", value: "center" },
  ],
};

export const RichTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Text", plural: "Text blocks" },
  fields: [
    { name: "eyebrow", type: "text", admin: { description: 'Small label above the heading, e.g. "YOUR INVITATION".' } },
    { name: "heading", type: "text" },
    { name: "body", type: "richText" },
    ctaGroup("cta"),
    alignField,
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
    {
      name: "metaLine",
      type: "text",
      label: "Detail line",
      admin: { description: 'Short scannable line under the description, e.g. "Small-group retreat · Tulum · November to April".' },
    },
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
        {
          name: "width",
          type: "select",
          defaultValue: "auto",
          label: "Card width",
          admin: {
            description: "Auto shares the row evenly with the other cards. Use Full width for a card that should stand on its own, like a newsletter sign-up.",
          },
          options: [
            { label: "Auto", value: "auto" },
            { label: "Half width", value: "half" },
            { label: "Full width", value: "full" },
          ],
        },
        {
          name: "overlay",
          type: "select",
          defaultValue: "medium",
          label: "Photo darkening",
          admin: {
            description: "The dark wash over the photo that keeps the white text readable. Lighter shows more of the photo; check the text still reads.",
          },
          options: [
            { label: "Light", value: "light" },
            { label: "Medium", value: "medium" },
            { label: "Strong", value: "strong" },
          ],
        },
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
      name: "includedLabel",
      type: "text",
      defaultValue: "What's included",
      label: "Heading above the list",
      admin: { description: 'e.g. "YOUR RETREAT EXPERIENCE".' },
    },
    {
      name: "included",
      type: "array",
      labels: { singular: "Item", plural: "Included items" },
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "includedNote",
      type: "textarea",
      label: "Note under the list",
      admin: { description: "Small print below the list, e.g. the lunch condition." },
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
      name: "layout",
      type: "select",
      defaultValue: "list",
      label: "Layout",
      admin: {
        description:
          "Simple list is one line per item. Numbered stages gives each item its own card with a big gold number, a headline and a paragraph — for steps that happen in order.",
      },
      options: [
        { label: "Simple list", value: "list" },
        { label: "Numbered stages", value: "stages" },
      ],
    },
    {
      name: "collapseAfter",
      type: "number",
      label: "Show only the first…",
      min: 1,
      admin: {
        condition: (_, s) => (s?.layout || "list") === "list",
        description:
          "Leave empty to show every item. Put a number and the list stops there, with a link underneath that opens the rest. Useful when a list grows long on a phone.",
      },
    },
    {
      name: "moreLabel",
      type: "text",
      label: "Link that opens the rest",
      admin: {
        condition: (_, s) => (s?.layout || "list") === "list" && !!s?.collapseAfter,
        description: "Default: Show more.",
      },
    },
    {
      name: "lessLabel",
      type: "text",
      label: "Link that closes it again",
      admin: {
        condition: (_, s) => (s?.layout || "list") === "list" && !!s?.collapseAfter,
        description: "Default: Show less.",
      },
    },
    {
      name: "items",
      type: "array",
      fields: [
        {
          name: "title",
          type: "text",
          label: "Headline",
          admin: { description: "Only used by the Numbered stages layout. Leave empty for a simple list." },
        },
        { name: "text", type: "textarea", required: true },
      ],
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
    {
      name: "subjectLabel",
      type: "text",
      label: "Label above the dropdown",
      defaultValue: "I'm interested in",
    },
    {
      name: "subjects",
      type: "array",
      label: "Dropdown choices",
      admin: { description: "The options someone can pick. Drag to reorder. Leave empty to use the standard list." },
      fields: [{ name: "label", type: "text", required: true }],
    },
    tone,
  ],
};

export const NewsletterBlock: Block = {
  slug: "newsletter",
  labels: { singular: "Newsletter signup", plural: "Newsletter signups" },
  fields: [
    { name: "heading", type: "text" },
    { name: "intro", type: "textarea" },
    {
      name: "buttonLabel",
      type: "text",
      label: "Button",
      defaultValue: "Receive the Letters",
    },
    {
      name: "finePrint",
      type: "textarea",
      label: "Small print under the form",
      defaultValue:
        "By signing up, you agree to receive occasional emails from Breathwork Tulum. Unsubscribe anytime.",
      admin: { description: "A link to the privacy policy is added automatically at the end." },
    },
    {
      name: "successMessage",
      type: "text",
      label: "Message after signing up",
      defaultValue: "You're in. Thank you for signing up.",
      admin: { description: "What someone sees once they have signed up, in place of the form." },
    },
    {
      name: "successSignature",
      type: "text",
      label: "Signature after signing up",
      defaultValue: "With Love, Sabine.",
      admin: { description: "Shown in italics right after the message." },
    },
    {
      name: "align",
      type: "select",
      defaultValue: "left",
      label: "Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Centered", value: "center" },
      ],
    },
    tone,
  ],
};

export const ExpandableStoryBlock: Block = {
  slug: "expandableStory",
  labels: { singular: "Story with Read more", plural: "Stories" },
  fields: [
    { name: "heading", type: "text", required: true },
    {
      name: "chapters",
      type: "array",
      labels: { singular: "Chapter", plural: "Chapters" },
      admin: {
        description:
          'Chapters show in order. Tick "Hidden behind Read more" to fold one into the expandable part. Leave every box unticked to show them all as plain sections.',
      },
      fields: [
        { name: "title", type: "text" },
        { name: "body", type: "richText" },
        {
          name: "collapsed",
          type: "checkbox",
          label: "Hidden behind Read more",
          defaultValue: false,
        },
      ],
    },
    {
      name: "moreLabel",
      type: "text",
      defaultValue: "Read more",
      admin: { description: 'Text of the expand link, e.g. "Read more".' },
    },
    tone,
    width,
  ],
};

export const DetailsGridBlock: Block = {
  slug: "detailsGrid",
  labels: { singular: "Details grid", plural: "Details grids" },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "rows",
      type: "array",
      labels: { singular: "Detail", plural: "Details" },
      admin: { description: "Compact, scannable facts. Label on the left, value on the right." },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "text", required: true },
      ],
    },
    { name: "note", type: "textarea" },
    ctaGroup("cta"),
    tone,
    width,
  ],
};

export const GalleryBlock: Block = {
  slug: "gallery",
  labels: { singular: "Photo gallery", plural: "Photo galleries" },
  fields: [
    { name: "heading", type: "text" },
    { name: "intro", type: "textarea" },
    {
      name: "images",
      type: "array",
      labels: { singular: "Photo", plural: "Photos" },
      admin: { description: "Add photos. Drag to reorder. They lay out in a responsive grid." },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text", admin: { description: "Optional caption." } },
      ],
    },
    tone,
    width,
  ],
};

export const MediaFeatureBlock: Block = {
  slug: "mediaFeature",
  labels: { singular: "Feature band (big media)", plural: "Feature bands" },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true, admin: { description: "Large background image. Used as the poster if a video is set." } },
    {
      name: "format",
      type: "select",
      defaultValue: "fullScreen",
      label: "Format",
      admin: {
        description:
          "Full screen fills the whole screen on desktop with the text over the photo. Portrait shows the photo upright and complete, with the text beside it. Both keep the current height on phones.",
      },
      options: [
        { label: "Full screen (text over the photo)", value: "fullScreen" },
        { label: "Portrait (photo upright, text beside)", value: "portrait" },
        { label: "Band (short, the old style)", value: "band" },
      ],
    },
    { name: "videoUrl", type: "text", label: "Video link", admin: { description: "Paste a Vimeo or YouTube address here and the video plays instead of the image above. Nothing to upload." } },
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    { name: "body", type: "textarea" },
    ctaArray("ctas"),
    tone,
  ],
};

export const allBlocks: Block[] = [
  HeroBlock,
  RichTextBlock,
  ThreePhasesBlock,
  SituationsBlock,
  PhotoBandBlock,
  MediaFeatureBlock,
  WaysGridBlock,
  GalleryBlock,
  DetailsGridBlock,
  ExpandableStoryBlock,
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

// Every block can be parked without deleting it. A section whose copy has not
// been written yet stays in the page, invisible to visitors, and comes back by
// unticking one box.
const hiddenField = {
  name: "hidden",
  type: "checkbox" as const,
  label: "Hide this section",
  defaultValue: false,
  admin: {
    position: "sidebar" as const,
    description: "Keeps the section saved but removes it from the live site.",
  },
};

for (const b of allBlocks) {
  if (!b.fields.some((f) => "name" in f && f.name === "anchor")) b.fields.push(anchorField);
  if (!b.fields.some((f) => "name" in f && f.name === "hidden")) b.fields.push(hiddenField);
}
