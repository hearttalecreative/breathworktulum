import type { CollectionConfig } from "payload";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  labels: { singular: "Testimonial", plural: "Testimonials" },
  access: { read: () => true },
  admin: {
    useAsTitle: "quote",
    defaultColumns: ["quote", "source"],
    group: "Content",
    description: "Reviews and testimonials shown across the pages.",
  },
  fields: [
    { name: "quote", type: "textarea", required: true, label: "Testimonial", admin: { description: "The text of the review." } },
    {
      name: "source",
      type: "text",
      label: "Source",
      defaultValue: "Google Review",
      admin: { description: 'Where it comes from, e.g. "Google Review".' },
    },
    { name: "name", type: "text", label: "Name (optional)", admin: { description: "The client's name or initials." } },
  ],
};
