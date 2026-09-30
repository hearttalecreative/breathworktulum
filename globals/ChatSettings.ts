import type { GlobalConfig } from "payload";
import { revalidateChatSettingsTag } from "../lib/revalidate";

// Both Payload's global Access and FieldAccess receive { req } and accept a
// boolean return, so one guard serves both levels.
const authenticatedOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

export const ChatSettings: GlobalConfig = {
  slug: "chatSettings",
  label: "AI Chat",
  // Never exposed through public REST/GraphQL — the frontend reads it only via
  // the server-side Local API (see lib/payload + app/api/chat).
  access: { read: authenticatedOnly },
  admin: {
    group: "Settings",
    description:
      "AI chat assistant for visitors. It answers only about the site's content and offers direct WhatsApp contact with Sabine.",
  },
  hooks: { afterChange: [revalidateChatSettingsTag] },
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      label: "Enabled",
      defaultValue: true,
      admin: {
        description: "Turn it off to bring back the floating WhatsApp button.",
      },
    },
    {
      name: "openRouterApiKey",
      type: "text",
      label: "OpenRouter API Key",
      // Defense in depth: even if the global were ever made public, the key
      // stays stripped for unauthenticated reads.
      access: { read: authenticatedOnly },
      admin: {
        description:
          "Key from https://openrouter.ai/settings/keys. Never shown on the public site.",
      },
    },
    {
      name: "model",
      type: "text",
      label: "AI model",
      // A free model checked against the live site content: it quotes prices
      // exactly and stays in plain prose. If it is ever withdrawn, the chat
      // route falls through to its own backups (see app/api/chat/route.ts).
      defaultValue: "nvidia/nemotron-3-super-120b-a12b:free",
      admin: {
        components: { Field: "@/components/admin/ModelSelect" },
        description:
          "Models marked FREE don't use up your OpenRouter credit. Free models vary a lot in quality and can be withdrawn; if the one chosen here stops working, NUMA switches to a backup on its own.",
      },
    },
    {
      name: "nudgeText",
      type: "text",
      label: "The little bubble that appears first",
      admin: {
        description:
          "The short line that pops up beside NUMA a few seconds after someone arrives. Default: Hi, I'm NUMA, Sabine's assistant. How can I help?",
      },
    },
    {
      name: "welcomeMessage",
      type: "textarea",
      label: "Welcome message",
      defaultValue:
        "Hi, I'm NUMA, Sabine's assistant. I can tell you about her sessions and retreats, share how breathwork feels, and help you find what's right for you. What brings you here today?",
      admin: {
        description: "The first message a visitor sees when they open the chat.",
      },
    },
    {
      name: "extraInstructions",
      type: "textarea",
      label: "Additional instructions (optional)",
      admin: {
        description: "Tone tweaks or extra rules for the assistant.",
      },
    },
    {
      name: "extraKnowledge",
      type: "textarea",
      label: "Additional information (optional)",
      admin: {
        description:
          "Details that aren't on the site (prices, schedules, policies…). The assistant will use them when answering.",
      },
    },
  ],
};
