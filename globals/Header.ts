import type { GlobalConfig } from "payload";

const linkFields = [
  { name: "label", type: "text" as const, required: true },
  { name: "href", type: "text" as const, required: true },
];

export const Header: GlobalConfig = {
  slug: "header",
  access: { read: () => true },
  admin: { group: "Navigation" },
  fields: [
    {
      name: "workWithMe",
      type: "array",
      label: "Work With Me submenu",
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
