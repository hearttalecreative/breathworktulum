import type { CollectionConfig } from "payload";
import { revalidatePostsTag } from "../lib/revalidate";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Article", plural: "Blog (articles)" },
  hooks: {
    afterChange: [revalidatePostsTag],
    afterDelete: [revalidatePostsTag],
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
    defaultColumns: ["title", "slug", "_status", "publishedAt", "updatedAt"],
    group: "Content",
    description:
      "The blog articles. Write the content, upload a cover image, and publish. Tap 'Preview' to see it live before publishing.",
    livePreview: {
      url: ({ data }) => {
        const slug = (data?.slug as string) || "";
        const base = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
        return `${base}/blog/${slug}/`;
      },
    },
  },
  versions: {
    drafts: { autosave: { interval: 375 }, schedulePublish: false },
    maxPerDoc: 25,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Title",
      admin: { description: "The article title, exactly as it shows on the site." },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "URL (address)",
      admin: {
        position: "sidebar",
        description: 'The last part of the article URL, e.g. "breathing-into-grief". The article lives at /blog/<address>/.',
      },
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Publish date",
      admin: {
        position: "sidebar",
        description: "The date shown and used to order the blog. If you leave it empty, the creation date is used.",
        date: { pickerAppearance: "dayOnly" },
      },
    },
    {
      name: "oldPath",
      type: "text",
      label: "Previous URL (reference)",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "The article's path on the old site, used for redirects. Don't edit.",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              label: "Cover image",
              admin: { description: "The article's main image (above the text and on the blog cards)." },
            },
            {
              name: "excerpt",
              type: "textarea",
              label: "Summary",
              admin: { description: "One or two lines that summarize the article. Shown in the blog list." },
            },
            {
              name: "body",
              type: "richText",
              label: "Content",
              admin: { description: "The body of the article. You can add headings, paragraphs, lists, and images." },
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            { name: "metaTitle", type: "text", label: "SEO title", admin: { description: "What shows up in Google. Ideally 60 characters or fewer. If left empty, the title is used." } },
            { name: "metaDescription", type: "textarea", label: "SEO description", admin: { description: "The summary that shows under the title in Google. Ideally 155 characters or fewer. If left empty, the summary is used." } },
            { name: "ogImage", type: "upload", relationTo: "media", label: "Social share image", admin: { description: "The image shown when shared on social media. If left empty, the cover image is used." } },
            {
              name: "noindex",
              type: "checkbox",
              defaultValue: false,
              label: "Hide from search engines",
              admin: { description: "If you turn this on, the article won't appear in Google or the sitemap." },
            },
          ],
        },
      ],
    },
  ],
};
