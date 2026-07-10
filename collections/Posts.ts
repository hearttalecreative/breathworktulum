import type { CollectionConfig } from "payload";
import { revalidatePostsTag } from "../lib/revalidate";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Artículo", plural: "Blog (artículos)" },
  hooks: {
    afterChange: [revalidatePostsTag],
    afterDelete: [revalidatePostsTag],
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
    defaultColumns: ["title", "slug", "_status", "publishedAt", "updatedAt"],
    group: "Contenido",
    description:
      "Los artículos del blog. Escribí el contenido, subí una imagen de portada y publicá. Tocá «Vista previa» para verlo en vivo antes de publicar.",
    livePreview: {
      url: ({ data }) => {
        const slug = (data?.slug as string) || "";
        const base = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
        return `${base}/blog/${slug}/`;
      },
    },
  },
  versions: {
    drafts: { autosave: { interval: 375 }, schedulePublish: false },
    maxPerDoc: 25,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Título",
      admin: { description: "El título del artículo, tal como se muestra en el sitio." },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "Dirección (URL)",
      admin: {
        position: "sidebar",
        description: 'Parte final de la URL del artículo, ej.: "breathing-into-grief". El artículo vive en /blog/<dirección>/.',
      },
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Fecha de publicación",
      admin: {
        position: "sidebar",
        description: "Fecha que se muestra y que ordena el blog. Si la dejás vacía, se usa la fecha de creación.",
        date: { pickerAppearance: "dayOnly" },
      },
    },
    {
      name: "oldPath",
      type: "text",
      label: "URL anterior (referencia)",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Ruta del artículo en el sitio anterior, para los redirects. No editar.",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Contenido",
          fields: [
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              label: "Imagen de portada",
              admin: { description: "Imagen principal del artículo (arriba del texto y en las tarjetas del blog)." },
            },
            {
              name: "excerpt",
              type: "textarea",
              label: "Resumen",
              admin: { description: "Uno o dos renglones que resumen el artículo. Se muestra en la lista del blog." },
            },
            {
              name: "body",
              type: "richText",
              label: "Contenido",
              admin: { description: "El cuerpo del artículo. Podés agregar títulos, párrafos, listas e imágenes." },
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            { name: "metaTitle", type: "text", label: "Título SEO", admin: { description: "Lo que aparece en Google. Ideal ≤ 60 caracteres. Si lo dejás vacío se usa el título." } },
            { name: "metaDescription", type: "textarea", label: "Descripción SEO", admin: { description: "Resumen que aparece bajo el título en Google. Ideal ≤ 155 caracteres. Si lo dejás vacío se usa el resumen." } },
            { name: "ogImage", type: "upload", relationTo: "media", label: "Imagen para redes", admin: { description: "Imagen al compartir en redes. Si lo dejás vacío se usa la portada." } },
            {
              name: "noindex",
              type: "checkbox",
              defaultValue: false,
              label: "Ocultar de los buscadores",
              admin: { description: "Si lo activás, el artículo no aparece en Google ni en el mapa del sitio." },
            },
          ],
        },
      ],
    },
  ],
};
