import type { GlobalConfig } from "payload";
import { revalidateGlobalsTag } from "../lib/revalidate";

const linkFields = [
  { name: "label", type: "text" as const, required: true },
  { name: "href", type: "text" as const, required: true },
  {
    name: "description",
    type: "text" as const,
    admin: { description: "Micro-copy opcional bajo el enlace en el submenú." },
  },
];

export const Header: GlobalConfig = {
  slug: "header",
  label: "Menú superior",
  access: { read: () => true },
  admin: {
    group: "Navegación",
    description: "Enlaces del menú de arriba del sitio.",
  },
  hooks: { afterChange: [revalidateGlobalsTag] },
  fields: [
    {
      name: "workWithMe",
      type: "array",
      label: "Work With Me submenu",
      fields: linkFields,
    },
    {
      name: "retreats",
      type: "array",
      label: "Retreats submenu",
      fields: linkFields,
    },
    {
      name: "primary",
      type: "array",
      label: "Primary links",
      fields: linkFields,
    },
  ],
};
