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
      label: "Headings",
      fields: [
        {
          name: "headingScale",
          type: "select",
          defaultValue: "normal",
          label: "Heading size",
          admin: {
            description:
              "Changes every headline on the site at once, keeping the proportion between pages. Headlines already shrink on their own on phones; this shifts the whole scale up or down.",
          },
          options: [
            { label: "Compact", value: "compact" },
            { label: "Normal", value: "normal" },
            { label: "Generous", value: "generous" },
          ],
        },
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
