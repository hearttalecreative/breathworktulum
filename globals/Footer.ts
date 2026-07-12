import type { GlobalConfig } from "payload";
import { revalidateGlobalsTag } from "../lib/revalidate";

const linkFields = [
  { name: "label", type: "text" as const, required: true, label: "Link text" },
  { name: "href", type: "text" as const, required: true, label: "Destination (URL)" },
];

export const Footer: GlobalConfig = {
  slug: "footer",
  label: "Footer",
  access: { read: () => true },
  admin: {
    group: "Navigation",
    description: "Links and text for the site footer.",
  },
  hooks: { afterChange: [revalidateGlobalsTag] },
  fields: [
    {
      type: "collapsible",
      label: "Brand column",
      fields: [
        { name: "brandBlurb", type: "textarea", label: "Brand text" },
        { name: "locationBlurb", type: "textarea", label: "Location" },
        { name: "subBrandTitle", type: "text", label: "Sister project title", defaultValue: "Sister project" },
        { name: "subBrandName", type: "text", label: "Sister project name" },
        { name: "subBrandBlurb", type: "textarea", label: "Sister project description" },
      ],
    },
    { name: "workWithMe", type: "array", label: "\"Work With Me\" column", labels: { singular: "Link", plural: "Links" }, fields: linkFields },
    { name: "explore", type: "array", label: "\"Explore\" column", labels: { singular: "Link", plural: "Links" }, fields: linkFields },
    {
      type: "collapsible",
      label: "Newsletter + legal",
      fields: [
        { name: "newsletterBlurb", type: "textarea", label: "Newsletter text" },
        { name: "legal", type: "array", label: "Legal links", labels: { singular: "Link", plural: "Links" }, fields: linkFields },
        { name: "bottomNote", type: "text", label: "Bottom note" },
      ],
    },
  ],
};
