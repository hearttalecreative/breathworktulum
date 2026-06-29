import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: { read: () => true },
  admin: { group: "Content" },
  upload: {
    // Pre-generate WebP derivatives at upload so pages never pull the full-res
    // original. Spans thumbnail → full-bleed hero; next/image picks the fit.
    formatOptions: { format: "webp", options: { quality: 78 } },
    imageSizes: [
      { name: "thumbnail", width: 480, height: undefined },
      { name: "card", width: 960, height: undefined },
      { name: "wide", width: 1600, height: undefined },
      { name: "hero", width: 2400, height: undefined },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt text",
      admin: { description: "Describe the image for accessibility and SEO." },
    },
  ],
};
