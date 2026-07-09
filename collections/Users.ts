import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Usuario", plural: "Usuarios" },
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Ajustes",
    description: "Quién puede entrar a administrar el sitio.",
  },
  fields: [
    { name: "name", type: "text", label: "Nombre" },
  ],
};
