import type { CollectionConfig } from "payload";
import { allBlocks } from "../blocks";
import { revalidatePagesTag } from "../lib/revalidate";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Page", plural: "Pages" },
  hooks: {
    afterChange: [revalidatePagesTag],
    afterDelete: [revalidatePagesTag],
  },
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
    description: "Your website pages. Each page is built from sections (blocks). Tap 'Preview' to see your changes live before publishing.",
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
    { name: "title", type: "text", required: true, label: "Title", admin: { description: "Internal name for the page (it isn't always shown on the site)." } },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "URL (address)",
      admin: {
        position: "sidebar",
        description: 'The last part of the URL. Use "home" for the front page; e.g. "about", "work-with-me/private-sessions". Changing it changes the page link.',
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
              label: "Sections",
              labels: { singular: "Section", plural: "Sections" },
              admin: { description: "Build the page by adding sections. Drag them to reorder." },
              blocks: allBlocks,
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            { name: "metaTitle", type: "text", label: "SEO title", admin: { description: "What shows up in Google. Ideally 60 characters or fewer." } },
            { name: "metaDescription", type: "textarea", label: "SEO description", admin: { description: "The summary that shows under the title in Google. Ideally 155 characters or fewer." } },
            { name: "ogImage", type: "upload", relationTo: "media", label: "Social share image", admin: { description: "The image shown when the page is shared on social media (WhatsApp, Facebook…)." } },
            {
              name: "noindex",
              type: "checkbox",
              defaultValue: false,
              label: "Hide from search engines",
              admin: { description: "If you turn this on, the page won't appear in Google or the sitemap." },
            },
          ],
        },
      ],
    },
  ],
};
