import type { GlobalConfig } from "payload";
import { revalidateGlobalsTag } from "../lib/revalidate";

const linkFields = [
  { name: "label", type: "text" as const, required: true, label: "Link text" },
  { name: "href", type: "text" as const, required: true, label: "Destination (URL)" },
  {
    name: "description",
    type: "text" as const,
    label: "Description",
    admin: { description: "Optional micro-copy shown under the link in the submenu." },
  },
];

export const Header: GlobalConfig = {
  slug: "header",
  label: "Top menu",
  access: { read: () => true },
  admin: {
    group: "Navigation",
    description: "Links for the site's top menu.",
  },
  hooks: { afterChange: [revalidateGlobalsTag] },
  fields: [
    {
      name: "workWithMe",
      type: "array",
      label: "\"Work With Me\" submenu",
      labels: { singular: "Link", plural: "Links" },
      admin: { description: "Links inside the \"Work With Me\" dropdown." },
      fields: linkFields,
    },
    {
      name: "retreats",
      type: "array",
      label: "\"Retreats\" submenu",
      labels: { singular: "Link", plural: "Links" },
      admin: { description: "Links inside the \"Retreats\" dropdown." },
      fields: linkFields,
    },
    {
      name: "couples",
      type: "array",
      label: "\"Couples\" submenu",
      labels: { singular: "Link", plural: "Links" },
      admin: { description: "Links inside the \"Couples\" dropdown. Leave empty to hide it." },
      fields: linkFields,
    },
    {
      name: "primary",
      type: "array",
      label: "Primary links",
      labels: { singular: "Link", plural: "Links" },
      admin: { description: "Standalone top-bar links (e.g. The Method, Blog, About, Contact)." },
      fields: linkFields,
    },
  ],
};
