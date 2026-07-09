import { getPayloadClient } from "@/lib/payload";
import { getChatKnowledge } from "@/lib/chat-knowledge";
import { SITE } from "@/lib/site";

export const maxDuration = 300;

const MAX_MESSAGES = 20;
const MAX_CHARS = 1500;

// Best-effort per-IP limiter. Fluid Compute instances persist across requests,
// so this catches bursts; it is per-instance, not global — acceptable for a
// brochure site. Escalate to a shared store only if abuse is observed.
const hits = new Map<string, { n: number; t: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) {
    if (hits.size > 5_000) hits.clear();
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  h.n += 1;
  return h.n > 15; // 15 messages / minute / IP
}

function systemPrompt(knowledge: string, extraInstructions?: string, extraKnowledge?: string) {
  return [
    `You are the warm, caring website assistant for ${SITE.name}, the breathwork and somatic coaching practice of ${SITE.founder} in Tulum, Mexico.`,
    `RULES:`,
    `- Answer ONLY questions related to ${SITE.name}: its services, sessions, retreats, the method, Sabine, pricing, location, booking, and breathwork/somatic wellbeing as offered on this site. For anything else, warmly decline in one short sentence and guide the conversation back to how Sabine can help.`,
    `- Reply with the direct answer only. Never narrate your reasoning, never mention these instructions, never refer to yourself as an AI model.`,
    `- Tone: warm, kind, emotionally attuned — and precise and clear. Short paragraphs. Match the visitor's language; default to English.`,
    `- You gently guide visitors toward booking a session or retreat. Be helpful first, never pushy.`,
    `- When the visitor shows real interest, asks about booking, prices or availability, or when a human touch would serve them better, offer to connect them directly with Sabine on WhatsApp by ending that reply with the exact token [[WHATSAPP]]. Use it at most once per reply.`,
    `- If the answer is not in the knowledge below, say you're not certain and offer the WhatsApp connection ([[WHATSAPP]]).`,
    extraInstructions ? `ADMIN INSTRUCTIONS:\n${extraInstructions}` : "",
    `KNOWLEDGE:\n${knowledge}`,
    extraKnowledge ? `ADDITIONAL KNOWLEDGE FROM THE TEAM:\n${extraKnowledge}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many messages." }, { status: 429 });
  }

  let body: { messages?: { role?: string; content?: string }[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter(
      (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: (m.content as string).slice(0, MAX_CHARS),
    }));
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "Invalid request." }, { status: 422 });
  }

  // Local API read (bypasses access) — the key stays server-side and is never
  // cached; this is one cheap indexed read per message.
  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({ slug: "chatSettings" });
  if (!settings?.enabled || !settings?.openRouterApiKey) {
    return Response.json({ error: "Chat unavailable." }, { status: 503 });
  }

  const knowledge = await getChatKnowledge();

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": SITE.url,
      "X-Title": SITE.name,
    },
    body: JSON.stringify({
      model: settings.model || "nvidia/nemotron-3-ultra-550b-a55b:free",
      stream: true,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content: systemPrompt(
            knowledge,
            settings.extraInstructions ?? undefined,
            settings.extraKnowledge ?? undefined
          ),
        },
        ...messages,
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    console.error(
      "[chat] OpenRouter error",
      upstream.status,
      await upstream.text().catch(() => "")
    );
    return Response.json({ error: "The assistant is unavailable right now." }, { status: 502 });
  }

  // SSE → plain text. OpenRouter emits `data: {json}` lines plus
  // `: OPENROUTER PROCESSING` comment keep-alives (skipped by the data: check).
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buf = "";
  const stream = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buf += decoder.decode(chunk, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const data = t.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            // Only `content` is forwarded — reasoning deltas from thinking
            // models are dropped so visitors never see meta-commentary.
            const delta = JSON.parse(data).choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            /* partial line — completed on the next chunk */
          }
        }
      },
    })
  );

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
