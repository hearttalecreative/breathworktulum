import type { CollectionConfig } from "payload";
import { allBlocks } from "../blocks";
import { revalidatePagesTag } from "../lib/revalidate";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Página", plural: "Páginas" },
  hooks: {
    afterChange: [revalidatePagesTag],
    afterDelete: [revalidatePagesTag],
  },
  access: {
    // Public can read published; authenticated can read drafts.
    read: ({ req }) => {
      if (req.user) return true;
      return { _status: { equals: "published" } };
    },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    group: "Contenido",
    description: "Las páginas del sitio. Cada página se arma con secciones (bloques). Tocá «Vista previa» para ver los cambios en vivo antes de publicar.",
    livePreview: {
      url: ({ data }) => {
        const slug = (data?.slug as string) || "";
        const path = slug === "home" || slug === "" ? "/" : `/${slug}/`;
        return `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}${path}`;
      },
    },
  },
  versions: {
    drafts: { autosave: { interval: 375 }, schedulePublish: false },
    maxPerDoc: 25,
  },
  fields: [
    { name: "title", type: "text", required: true, label: "Título", admin: { description: "Nombre interno de la página (no siempre se muestra en el sitio)." } },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "Dirección (URL)",
      admin: {
        position: "sidebar",
        description: 'Parte final de la URL. Usá "home" para la portada; ej.: "about", "work-with-me/private-sessions". Cambiarlo cambia el enlace de la página.',
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Contenido",
          fields: [
            {
              name: "layout",
              type: "blocks",
              label: "Secciones",
              labels: { singular: "Sección", plural: "Secciones" },
              admin: { description: "Armá la página agregando secciones. Arrastralas para reordenar." },
              blocks: allBlocks,
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            { name: "metaTitle", type: "text", label: "Título SEO", admin: { description: "Lo que aparece en Google. Ideal ≤ 60 caracteres." } },
            { name: "metaDescription", type: "textarea", label: "Descripción SEO", admin: { description: "Resumen que aparece bajo el título en Google. Ideal ≤ 155 caracteres." } },
            { name: "ogImage", type: "upload", relationTo: "media", label: "Imagen para redes", admin: { description: "Imagen que se ve al compartir la página en redes (WhatsApp, Facebook…)." } },
            {
              name: "noindex",
              type: "checkbox",
              defaultValue: false,
              label: "Ocultar de los buscadores",
              admin: { description: "Si lo activás, la página no aparece en Google ni en el mapa del sitio." },
            },
          ],
        },
      ],
    },
  ],
};
