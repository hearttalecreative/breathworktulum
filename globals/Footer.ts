import type { GlobalConfig } from "payload";
import { revalidateGlobalsTag } from "../lib/revalidate";

const linkFields = [
  { name: "label", type: "text" as const, required: true },
  { name: "href", type: "text" as const, required: true },
];

export const Footer: GlobalConfig = {
  slug: "footer",
  label: "Pie de página",
  access: { read: () => true },
  admin: {
    group: "Navegación",
    description: "Enlaces y textos del pie del sitio.",
  },
  hooks: { afterChange: [revalidateGlobalsTag] },
  fields: [
    {
      type: "collapsible",
      label: "Brand column",
      fields: [
        { name: "brandBlurb", type: "textarea" },
        { name: "locationBlurb", type: "textarea" },
        { name: "subBrandTitle", type: "text", defaultValue: "Sister project" },
        { name: "subBrandName", type: "text" },
        { name: "subBrandBlurb", type: "textarea" },
      ],
    },
    { name: "workWithMe", type: "array", label: "Work With Me column", fields: linkFields },
    { name: "explore", type: "array", label: "Explore column", fields: linkFields },
    {
      type: "collapsible",
      label: "Newsletter + legal",
      fields: [
        { name: "newsletterBlurb", type: "textarea" },
        { name: "legal", type: "array", label: "Legal links", fields: linkFields },
        { name: "bottomNote", type: "text" },
      ],
    },
  ],
};
