import type { GlobalConfig } from "payload";
import { revalidateChatSettingsTag } from "../lib/revalidate";

// Both Payload's global Access and FieldAccess receive { req } and accept a
// boolean return, so one guard serves both levels.
const authenticatedOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

export const ChatSettings: GlobalConfig = {
  slug: "chatSettings",
  label: "Chat IA",
  // Never exposed through public REST/GraphQL — the frontend reads it only via
  // the server-side Local API (see lib/payload + app/api/chat).
  access: { read: authenticatedOnly },
  admin: {
    group: "Ajustes",
    description:
      "Asistente de chat con IA para visitantes. Responde solo sobre el contenido del sitio y ofrece contacto directo por WhatsApp con Sabine.",
  },
  hooks: { afterChange: [revalidateChatSettingsTag] },
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      label: "Activado",
      defaultValue: true,
      admin: {
        description: "Si lo apagas, vuelve el botón flotante de WhatsApp.",
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
          "Clave de https://openrouter.ai/settings/keys. Nunca se muestra en el sitio público.",
      },
    },
    {
      name: "model",
      type: "text",
      label: "Modelo de IA",
      // A non-reasoning instruct model that streams a clean answer. Reasoning
      // models (hy3, nemotron-ultra) either leak their thinking or return an
      // empty answer, so they are avoided as the default.
      defaultValue: "meta-llama/llama-3.3-70b-instruct:free",
      admin: {
        components: { Field: "@/components/admin/ModelSelect" },
        description:
          "Los modelos marcados GRATIS no consumen crédito de OpenRouter.",
      },
    },
    {
      name: "welcomeMessage",
      type: "textarea",
      label: "Mensaje de bienvenida",
      defaultValue:
        "Hi, I'm NUMA, Sabine's assistant. I can tell you about her sessions and retreats, share how breathwork feels, and help you find what's right for you. What brings you here today?",
      admin: {
        description: "Primer mensaje que ve el visitante al abrir el chat.",
      },
    },
    {
      name: "extraInstructions",
      type: "textarea",
      label: "Instrucciones adicionales (opcional)",
      admin: {
        description: "Ajustes de tono o reglas extra para el asistente.",
      },
    },
    {
      name: "extraKnowledge",
      type: "textarea",
      label: "Información adicional (opcional)",
      admin: {
        description:
          "Datos que no están en el sitio (precios, horarios, políticas…). El asistente los usará al responder.",
      },
    },
  ],
};
