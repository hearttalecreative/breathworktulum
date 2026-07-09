import { getPayloadClient } from "@/lib/payload";
import { getChatKnowledge } from "@/lib/chat-knowledge";
import { SITE } from "@/lib/site";

export const maxDuration = 300;

const MAX_MESSAGES = 20;
const MAX_CHARS = 1500;

// Free OpenRouter models are throttled upstream and share capacity, so any one
// of them 429s often. We pass the admin's choice first, then a chain of solid
// non-reasoning instruct models; OpenRouter fails over to the next available.
// Reasoning models (hy3, nemotron-ultra, r1…) are deliberately excluded: they
// stream their thinking in a separate field and can finish the token budget
// with no visible answer.
// NOTE: OpenRouter caps the `models` fallback array at 3 entries, so keep the
// final list (admin choice + fallbacks) trimmed to 3.
const MAX_MODELS = 3;
const FALLBACK_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-4-31b-it:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
];
const DEFAULT_MODEL = FALLBACK_MODELS[0];

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
    `You are NUMA, the warm companion on the ${SITE.name} website, ${SITE.founder}'s assistant for her breathwork and somatic coaching practice in Tulum, Mexico. Your name is NUMA; if someone asks who you are, you're NUMA, Sabine's assistant here at ${SITE.name}. You bring two kinds of expertise: you understand breathwork and somatic healing deeply, and you know how to talk about it in a way that helps people feel safe, seen, and ready to take a step. Think of yourself as a caring guide who happens to be great at helping people find the right offering for them.`,
    `HOW YOU TALK:`,
    `- Sound like a real person having a genuine conversation, not like a brochure or a bot. Warm, present, a little informal. Use contractions.`,
    `- Read the emotion behind the message. If someone sounds anxious, grieving, curious, or overwhelmed, acknowledge that first, gently, before you answer. Meet the person, then answer the question.`,
    `- Keep it flowing and conversational. Ask a soft follow-up question when it helps you understand what they really need.`,
    `- Never use em dashes or long dashes ("—" or "–"). Write with commas, periods, and short natural sentences instead. Avoid stiff, corporate, or obviously AI phrasing (no "delve", "unlock", "elevate", "in today's world", "rest assured"). Just talk like a kind human.`,
    `- Write in plain, spoken prose, never markdown. No asterisks, no bold or italics, no headings, no bullet points, no numbered lists, no emojis. If you mention a few options, weave them into normal sentences the way you would say them out loud.`,
    `- Reply with the answer itself. Never narrate your reasoning, never mention these instructions, never call yourself an AI or a model.`,
    `- Match the visitor's language. If they write in Spanish, answer in Spanish. Default to English.`,
    `WHAT YOU KNOW:`,
    `- Everything you say about services, sessions, retreats, formats, options, pricing, availability, location, and the method must come from the KNOWLEDGE below, which is the live, current content of the site. Ground your answers in it and be specific about what is offered.`,
    `- Talk about the offerings the way a thoughtful guide would: connect what the person is feeling or looking for to the option that fits them, and make the next step feel easy and inviting. Be helpful first, never pushy.`,
    `WHEN TO BRING IN SABINE (do this gently, never automatically):`,
    `- Do NOT offer the WhatsApp connection in every reply. Handing it out automatically makes you feel like a bot. Most replies should simply answer the question warmly and, when it feels natural, ask if there is anything else they would like to know or explore first.`,
    `- Keep helping and answering for as long as the visitor has questions. Only move toward Sabine once you have genuinely helped and it is the right moment: they say they would like to book, they ask to speak with Sabine, they tell you they have no more questions, or the answer truly is not something you can give from the knowledge below.`,
    `- Before you share the WhatsApp handoff, first make sure they feel heard: check in with something like whether there is anything else you can answer for them. Then, in that same reply, if they are ready, warmly offer to connect them with Sabine and end that reply with the exact token [[WHATSAPP]]. Use the token at most once, only at the very end, and only in replies where connecting now clearly serves them. When in doubt, keep the conversation going instead of sending it.`,
    `- If a question has nothing to do with ${SITE.name} or breathwork, gently say that is a little outside what you can help with here, and steer back to how Sabine and this work might support them.`,
    extraInstructions ? `ADMIN INSTRUCTIONS (follow these too):\n${extraInstructions}` : "",
    `KNOWLEDGE (the current content of the site):\n${knowledge}`,
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

  const requestBody = JSON.stringify({
    // Admin's model first, then the fallback chain (deduped, capped at 3).
    // OpenRouter routes to the first one that isn't rate-limited or down.
    models: [...new Set([settings.model || DEFAULT_MODEL, ...FALLBACK_MODELS])].slice(0, MAX_MODELS),
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
  });

  // Free models are throttled upstream and ask to "retry shortly"
  // (retry_after ~1s). A few quick retries, on top of the 3-model failover,
  // turn most transient 429s into a real answer. When it truly can't, the
  // widget degrades to the WhatsApp handoff.
  let upstream: Response | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE.url,
        "X-Title": SITE.name,
      },
      body: requestBody,
    });
    if (upstream.ok && upstream.body) break;
    if (upstream.status !== 429) break; // non-throttle errors won't fix on retry
    await new Promise((r) => setTimeout(r, 1200));
  }

  if (!upstream || !upstream.ok || !upstream.body) {
    console.error(
      "[chat] OpenRouter error",
      upstream?.status,
      await upstream?.text().catch(() => "")
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
