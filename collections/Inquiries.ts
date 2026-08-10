import type { CollectionConfig } from "payload";

// Consultas de los formularios de contacto y de las listas de espera.
//
// Hasta ahora /api/contact validaba, escribía una línea en la consola del
// servidor y respondía que todo bien. Son cuatro formularios en vivo, incluida
// la lista de espera del Signature Retreat, así que cada consulta se perdía.
// Acá quedan guardadas pase lo que pase con el correo de aviso.
export const Inquiries: CollectionConfig = {
  slug: "inquiries",
  labels: { singular: "Inquiry", plural: "Inquiries" },
  admin: {
    group: "Inbox",
    useAsTitle: "email",
    defaultColumns: ["email", "name", "subject", "handled", "createdAt"],
    description: "Everything sent through a form on the site. Newest first.",
  },
  access: {
    create: () => true,
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true, index: true },
    { name: "subject", type: "text" },
    { name: "message", type: "textarea" },
    {
      name: "handled",
      type: "checkbox",
      label: "Replied",
      defaultValue: false,
      admin: { position: "sidebar", description: "Tick it once you have answered." },
    },
    {
      name: "source",
      type: "text",
      admin: { readOnly: true, position: "sidebar", description: "Which page the form was on." },
    },
    {
      name: "notifiedAt",
      type: "date",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "When the alert email went out. Empty means email is not configured yet.",
      },
    },
  ],
  timestamps: true,
};

export default Inquiries;
