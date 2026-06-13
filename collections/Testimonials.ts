import type { CollectionConfig } from "payload";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  access: { read: () => true },
  admin: {
    useAsTitle: "quote",
    defaultColumns: ["quote", "source"],
    group: "Content",
  },
  fields: [
    { name: "quote", type: "textarea", required: true },
    {
      name: "source",
      type: "text",
      defaultValue: "Google Review",
      admin: { description: 'e.g. "Google Review".' },
    },
    { name: "name", type: "text", admin: { description: "Optional client name or initials." } },
  ],
};
