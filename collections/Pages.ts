import type { CollectionConfig } from "payload";
import { allBlocks } from "../blocks";

export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    // Public can read published; authenticated can read drafts.
    read: ({ req }) => {
      if (req.user) return true;
      return { _status: { equals: "published" } };
    },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    group: "Content",
    livePreview: {
      url: ({ data }) => {
        const slug = (data?.slug as string) || "";
        const path = slug === "home" || slug === "" ? "/" : `/${slug}/`;
        return `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}${path}`;
      },
    },
  },
  versions: {
    drafts: { autosave: { interval: 375 }, schedulePublish: false },
    maxPerDoc: 25,
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: 'URL path. Use "home" for the homepage; e.g. "about", "work-with-me/private-sessions".',
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "layout",
              type: "blocks",
              labels: { singular: "Section", plural: "Sections" },
              blocks: allBlocks,
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            { name: "metaTitle", type: "text", admin: { description: "≤ 60 chars." } },
            { name: "metaDescription", type: "textarea", admin: { description: "≤ 155 chars." } },
            { name: "ogImage", type: "upload", relationTo: "media" },
          ],
        },
      ],
    },
  ],
};
