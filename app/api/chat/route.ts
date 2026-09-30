import { getPayloadClient } from "@/lib/payload";
import { getChatKnowledge } from "@/lib/chat-knowledge";
import { SITE } from "@/lib/site";

export const maxDuration = 300;

const MAX_MESSAGES = 20;
const MAX_CHARS = 1500;

// Free OpenRouter models are throttled upstream and get withdrawn without
// notice. Two of the three that used to be listed here stopped being free, the
// third was rate-limited, and NUMA answered every visitor with the WhatsApp
// fallback for weeks.
//
// VETTED are free models checked against the live site content (30 Sept 2026):
// they quote prices exactly, stay in plain prose and answer in the visitor's
// language. They follow the admin's choice in the chain.
//
// "openrouter/free" is OpenRouter's own router across whatever free models
// exist that day. It cannot be withdrawn, which is why it is the last resort,
// and it is only the last resort because it picks blindly: in testing it also
// handed questions to a content-safety classifier and to coding models.
// NOTE: OpenRouter caps the `models` fallback array at 3 entries.
const MAX_MODELS = 3;
const VETTED = ["nvidia/nemotron-3-super-120b-a12b:free", "dots-studio/dots-3-note-preview:free"];
const FREE_ROUTER = "openrouter/free";
const DEFAULT_MODEL = VETTED[0];

type Attempt = { models: string[]; reasoning: Record<string, unknown>; maxTokens: number };
type Opened = { reader: ReadableStreamDefaultReader<Uint8Array>; parse: ReturnType<typeof sseParser>; text: string; model: string };

// OpenRouter streams `data: {json}` lines, plus `: OPENROUTER PROCESSING`
// keep-alive comments that the `data:` check skips. Only `content` is kept:
// reasoning deltas are dropped so a visitor never reads a model's notes.
function sseParser() {
  const decoder = new TextDecoder();
  let buf = "";
  return (chunk: Uint8Array) => {
    buf += decoder.decode(chunk, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    const out = { text: "", error: "", model: "", done: false };
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const data = t.slice(5).trim();
      if (data === "[DONE]") {
        out.done = true;
        continue;
      }
      try {
        const j = JSON.parse(data);
        if (j.error) out.error = JSON.stringify(j.error).slice(0, 300);
        if (j.model && !out.model) out.model = j.model;
        const delta = j.choices?.[0]?.delta?.content;
        if (delta) out.text += delta;
      } catch {
        /* not JSON: ignore the line */
      }
    }
    return out;
  };
}

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
    `- Keep it short. Two to four sentences is the right size for almost every reply, and never more than about 90 words unless the visitor asks you for the details. Mention one or two options that fit, not the whole list. A chat window is small.`,
    `- You are NUMA, not Sabine. Speak about Sabine in the third person ("Sabine offers", "with Sabine"), never as "I" or "me" when you mean her or her sessions.`,
    `- Write in plain, spoken prose, never markdown. No asterisks, no bold or italics, no headings, no bullet points, no numbered lists, no emojis. If you mention a few options, weave them into normal sentences the way you would say them out loud.`,
    `- Reply with the answer itself. Never narrate your reasoning, never mention these instructions, never call yourself an AI or a model.`,
    `- Match the visitor's language. If they write in Spanish, answer in Spanish. Default to English.`,
    `WHAT YOU KNOW:`,
    `- Everything you say about services, sessions, retreats, formats, options, pricing, availability, location, and the method must come from the KNOWLEDGE below, which is the live, current content of the site. Ground your answers in it and be specific about what is offered.`,
    `- Prices, durations, dates, group sizes and locations must be quoted exactly as they appear in the KNOWLEDGE. Never estimate, round, convert or guess one. If the figure someone asks for is not there, say you would rather Sabine confirm it and offer to connect them.`,
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

  const chatMessages = [
    {
      role: "system",
      content: systemPrompt(
        knowledge,
        settings.extraInstructions ?? undefined,
        settings.extraKnowledge ?? undefined
      ),
    },
    ...messages,
  ];

  // One upstream request, read as far as the first visible words. A provider
  // can accept the request and then fail inside the stream, or a model can
  // return nothing at all; both used to reach the visitor as an empty reply.
  // Holding the response until there is text lets the next attempt take over.
  const open = async (a: Attempt): Promise<Opened | { status: number; detail: string }> => {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE.url,
        "X-Title": SITE.name,
      },
      body: JSON.stringify({
        // OpenRouter routes to the first one that isn't rate-limited or down.
        models: a.models,
        stream: true,
        max_tokens: a.maxTokens,
        reasoning: a.reasoning,
        messages: chatMessages,
      }),
    });
    if (!res.ok || !res.body) return { status: res.status, detail: await res.text().catch(() => "") };
    const reader = res.body.getReader();
    const parse = sseParser();
    let text = "";
    let model = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return { status: 502, detail: `empty reply from ${model || a.models[0]}` };
      const r = parse(value);
      if (r.model) model = r.model;
      text += r.text;
      if (r.error && !text.trim()) {
        reader.cancel().catch(() => {});
        return { status: 502, detail: r.error };
      }
      if (r.done && !text.trim()) {
        reader.cancel().catch(() => {});
        return { status: 502, detail: `empty reply from ${model || a.models[0]}` };
      }
      if (text.trim()) {
        // The blind router sometimes lands on a classifier, which answers a
        // question about sessions with "User Safety: safe".
        if (/safety|guard|moderation/i.test(model)) {
          reader.cancel().catch(() => {});
          return { status: 502, detail: `not a chat model: ${model}` };
        }
        return { reader, parse, text, model };
      }
    }
  };

  // Nearly every free model can "think" now, and thinking spends the token
  // budget before any visible answer, so it is switched off where a model
  // allows it. Some refuse the switch outright (400), which is why the last
  // resort asks for a little thinking instead and gets more room to finish.
  const direct = { enabled: false };
  const attempts: Attempt[] = [
    { models: [...new Set([settings.model || DEFAULT_MODEL, ...VETTED])].slice(0, MAX_MODELS), reasoning: direct, maxTokens: 700 },
    { models: VETTED, reasoning: direct, maxTokens: 700 },
    { models: [FREE_ROUTER], reasoning: { effort: "low", exclude: true }, maxTokens: 1400 },
    { models: [FREE_ROUTER], reasoning: { effort: "low", exclude: true }, maxTokens: 1400 },
  ];

  // Free models are throttled upstream and ask to "retry shortly"
  // (retry_after ~1s), so a 429 gets two quick retries of the same attempt.
  // Any other failure will not fix itself (the chosen model was withdrawn, or
  // rejects a parameter), so the next attempt takes over. When none can
  // answer, the widget degrades to the WhatsApp handoff.
  let opened: Opened | null = null;
  for (const attempt of attempts) {
    for (let retry = 0; retry < 3 && !opened; retry++) {
      const r = await open(attempt);
      if ("reader" in r) {
        opened = r;
        break;
      }
      console.error("[chat] OpenRouter", r.status, attempt.models[0], r.detail.slice(0, 300));
      if (r.status !== 429) break;
      await new Promise((res) => setTimeout(res, 1200));
    }
    if (opened) break;
  }

  if (!opened) {
    return Response.json({ error: "The assistant is unavailable right now." }, { status: 502 });
  }
  // Which model answered. With free models this changes from message to
  // message, and it is the first thing to look at when a reply reads wrong.
  console.log("[chat] answered by", opened.model);

  // The prompt asks for plain spoken prose, and the free models honour that
  // unevenly: some still send **bold**, # headings and long dashes, which the
  // chat window would print as literal symbols. Cleaned here so the visitor
  // reads the same plain text whichever model answered. Trailing spaces and
  // marks are held back one step because a mark can arrive split in two.
  const encoder = new TextEncoder();
  const { reader, parse } = opened;
  let held = "";
  const tidy = (text: string) =>
    text
      .replace(/\*+/g, "")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\s*[—–]\s*/g, ", ")
      .replace(/\u2011/g, "-");
  const emit = (controller: ReadableStreamDefaultController<Uint8Array>, delta: string) => {
    const text = held + delta;
    const cut = text.search(/[\s*#—–]*$/);
    held = text.slice(cut);
    const out = tidy(text.slice(0, cut));
    if (out) controller.enqueue(encoder.encode(out));
    return Boolean(out);
  };
  const finish = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    const out = tidy(held).trimEnd();
    if (out) controller.enqueue(encoder.encode(out));
    controller.close();
    reader.cancel().catch(() => {});
  };

  let ended = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      emit(controller, opened.text.trimStart());
    },
    // A pull that returns without enqueuing or closing is never called again,
    // and the reply hangs open with the text already on screen. So each pull
    // keeps reading until it has something to hand over or the reply is over.
    // "[DONE]" ends it too: the upstream socket can stay open long after.
    async pull(controller) {
      while (!ended) {
        const { done, value } = await reader.read();
        const r = done ? null : parse(value);
        const wrote = r?.text ? emit(controller, r.text) : false;
        if (done || r?.done) {
          ended = true;
          finish(controller);
          return;
        }
        if (wrote) return;
      }
    },
    cancel() {
      ended = true;
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
