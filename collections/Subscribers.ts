import type { CollectionConfig } from "payload";

// Quien se anota al newsletter queda guardado acá antes de intentar nada más.
// El formulario decía "You're in" y descartaba la dirección, así que lo primero
// es no perder a nadie. El envío a la plataforma de email es un paso posterior
// que puede fallar sin que se pierda el contacto.
export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  labels: { singular: "Subscriber", plural: "Newsletter" },
  admin: {
    group: "Inbox",
    useAsTitle: "email",
    defaultColumns: ["email", "firstName", "syncedAt", "createdAt"],
    description: "Everyone who signed up through the site. Newest first.",
  },
  access: {
    // Cualquiera puede anotarse; solo el admin puede leer la lista.
    create: () => true,
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: "email", type: "email", required: true, unique: true, index: true },
    { name: "firstName", type: "text", label: "First name" },
    {
      name: "source",
      type: "text",
      admin: { readOnly: true, description: "Which page they signed up from." },
    },
    {
      name: "syncedAt",
      type: "date",
      label: "Sent to the email platform",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Empty means it is stored here but not yet in the email platform.",
      },
    },
    {
      name: "syncError",
      type: "text",
      admin: { readOnly: true, position: "sidebar", description: "Why the last sync failed, if it did." },
    },
  ],
  timestamps: true,
};

export default Subscribers;
