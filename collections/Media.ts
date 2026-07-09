import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Imagen", plural: "Imágenes" },
  access: { read: () => true },
  admin: {
    group: "Contenido",
    description: "Todas las fotos del sitio. Subí una imagen y usala en cualquier página.",
  },
  upload: {
    // Pre-generate WebP derivatives at upload so pages never pull the full-res
    // original. Spans thumbnail → full-bleed hero; next/image picks the fit.
    formatOptions: { format: "webp", options: { quality: 78 } },
    imageSizes: [
      { name: "thumbnail", width: 480, height: undefined },
      { name: "card", width: 960, height: undefined },
      { name: "wide", width: 1600, height: undefined },
      { name: "hero", width: 2400, height: undefined },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Texto alternativo",
      admin: { description: "Describí la imagen en pocas palabras (accesibilidad y SEO). Ej: «Sabine guiando una sesión de respiración»." },
    },
  ],
};
