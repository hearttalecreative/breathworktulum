import type { GlobalConfig } from "payload";
import { revalidateGlobalsTag } from "../lib/revalidate";

const linkFields = [
  { name: "label", type: "text" as const, required: true, label: "Texto del enlace" },
  { name: "href", type: "text" as const, required: true, label: "Destino (URL)" },
  {
    name: "description",
    type: "text" as const,
    label: "Descripción",
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
      label: "Submenú «Work With Me»",
      labels: { singular: "Enlace", plural: "Enlaces" },
      admin: { description: "Enlaces dentro del desplegable «Work With Me»." },
      fields: linkFields,
    },
    {
      name: "retreats",
      type: "array",
      label: "Submenú «Retreats»",
      labels: { singular: "Enlace", plural: "Enlaces" },
      admin: { description: "Enlaces dentro del desplegable «Retreats»." },
      fields: linkFields,
    },
    {
      name: "primary",
      type: "array",
      label: "Enlaces principales",
      labels: { singular: "Enlace", plural: "Enlaces" },
      admin: { description: "Enlaces sueltos de la barra superior (ej.: The Method, Blog, About, Contact)." },
      fields: linkFields,
    },
  ],
};
