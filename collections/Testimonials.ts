import type { CollectionConfig } from "payload";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  labels: { singular: "Testimonio", plural: "Testimonios" },
  access: { read: () => true },
  admin: {
    useAsTitle: "quote",
    defaultColumns: ["quote", "source"],
    group: "Contenido",
    description: "Reseñas y testimonios que aparecen en las páginas.",
  },
  fields: [
    { name: "quote", type: "textarea", required: true, label: "Testimonio", admin: { description: "El texto de la reseña." } },
    {
      name: "source",
      type: "text",
      label: "Fuente",
      defaultValue: "Google Review",
      admin: { description: 'De dónde viene, ej. "Google Review".' },
    },
    { name: "name", type: "text", label: "Nombre (opcional)", admin: { description: "Nombre o iniciales del cliente." } },
  ],
};
