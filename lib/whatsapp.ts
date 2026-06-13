import { SITE } from "./site";

// Pre-populated WhatsApp messages per context (table in 13_GLOBAL_ELEMENTS.md).
// Helps Sabine see where each lead came from.
export const WA_MESSAGES = {
  general: "Hi Sabine, I saw your website. I'd like to learn more.",
  foundation: "Hi Sabine, I'm interested in a Foundation Session.",
  immersive: "Hi Sabine, I'm interested in an Immersive Session.",
  oneDayPrivate: "Hi Sabine, I'm interested in a 1 Day Private Retreat.",
  couples: "Hi Sabine, I'm interested in a couples breathwork session.",
  personalizedRetreat: "Hi Sabine, I'm interested in a Personalized Retreat.",
  curated: "Hi Sabine, I'm inquiring about a curated group experience.",
  corporate: "Hi Sabine, I'm reaching out about a corporate program.",
  signature: "Hi Sabine, I'm interested in the Riviera Maya 2026 retreat.",
  contact: "Hi Sabine, I saw your website.",
} as const;

export type WaContext = keyof typeof WA_MESSAGES;

/** Build a wa.me link with a context-specific pre-filled message. */
export function whatsappLink(context: WaContext = "general"): string {
  const text = encodeURIComponent(WA_MESSAGES[context]);
  return `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
}

/** mailto link with optional pre-filled subject. */
export function emailLink(subject?: string): string {
  if (!subject) return `mailto:${SITE.email}`;
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;
}
