import type { GlobalConfig } from "payload";
import { revalidateGlobalsTag } from "../lib/revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "siteSettings",
  label: "Site details",
  access: { read: () => true },
  admin: {
    group: "Settings",
    description: "Brand, contact, social links, and WhatsApp messages used across the whole site.",
  },
  hooks: { afterChange: [revalidateGlobalsTag] },
  fields: [
    {
      type: "collapsible",
      label: "Brand",
      fields: [
        { name: "brandName", type: "text", defaultValue: "Breathwork Tulum" },
        { name: "slogan", type: "text", defaultValue: "Breathe. Heal. Transform.®" },
        { name: "description", type: "textarea" },
      ],
    },
    {
      type: "collapsible",
      label: "Contact",
      fields: [
        { name: "email", type: "text", defaultValue: "breathe@breathworktulum.com" },
        { name: "phoneDisplay", type: "text", defaultValue: "+52 55 4109 8336" },
        {
          name: "whatsappNumber",
          type: "text",
          defaultValue: "525541098336",
          admin: { description: "Digits only, for wa.me links." },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Social",
      fields: [
        { name: "instagram", type: "text" },
        { name: "googleReviews", type: "text" },
        { name: "linkedin", type: "text" },
        { name: "facebook", type: "text" },
      ],
    },
    {
      name: "whatsappMessages",
      type: "array",
      label: "WhatsApp message templates",
      admin: { description: "Pre-filled message per CTA context." },
      fields: [
        { name: "context", type: "text", required: true },
        { name: "message", type: "text", required: true },
      ],
    },
  ],
};
