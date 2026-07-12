import type { GlobalConfig } from "payload";
import { revalidateGlobalsTag } from "../lib/revalidate";

const linkFields = [
  { name: "label", type: "text" as const, required: true, label: "Texto del enlace" },
  { name: "href", type: "text" as const, required: true, label: "Destino (URL)" },
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
      label: "Columna de marca",
      fields: [
        { name: "brandBlurb", type: "textarea", label: "Texto de marca" },
        { name: "locationBlurb", type: "textarea", label: "Ubicación" },
        { name: "subBrandTitle", type: "text", label: "Título del proyecto hermano", defaultValue: "Sister project" },
        { name: "subBrandName", type: "text", label: "Nombre del proyecto hermano" },
        { name: "subBrandBlurb", type: "textarea", label: "Descripción del proyecto hermano" },
      ],
    },
    { name: "workWithMe", type: "array", label: "Columna «Work With Me»", labels: { singular: "Enlace", plural: "Enlaces" }, fields: linkFields },
    { name: "explore", type: "array", label: "Columna «Explore»", labels: { singular: "Enlace", plural: "Enlaces" }, fields: linkFields },
    {
      type: "collapsible",
      label: "Newsletter + legal",
      fields: [
        { name: "newsletterBlurb", type: "textarea", label: "Texto del newsletter" },
        { name: "legal", type: "array", label: "Enlaces legales", labels: { singular: "Enlace", plural: "Enlaces" }, fields: linkFields },
        { name: "bottomNote", type: "text", label: "Nota al pie" },
      ],
    },
  ],
};
