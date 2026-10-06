import { getPayloadClient } from "@/lib/payload";
import { getChatKnowledge } from "@/lib/chat-knowledge";
import { SITE } from "@/lib/site";
import { FACT_CHECK, systemPrompt, unknownNumbers } from "@/lib/numa-prompt";

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

  const extraInstructions = settings.extraInstructions ?? undefined;
  const extraKnowledge = settings.extraKnowledge ?? undefined;

  // One upstream request, read to the end. A provider can accept the request
  // and then fail inside the stream, or a model can return nothing at all;
  // both used to reach the visitor as an empty reply. And the finished text
  // has to be checked before anyone sees it (prices, below), so the reply is
  // not streamed: it is sent whole once it has passed.
  const ask = async (
    a: Attempt,
    system: string,
    turns: { role: string; content: string }[] = messages
  ): Promise<{ text: string; model: string } | { status: number; detail: string }> => {
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
        messages: [{ role: "system", content: system }, ...turns],
      }),
    });
    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      // A daily quota is not a throttle: it will still be spent in ten
      // seconds' time. Retrying it twelve times only makes the visitor wait
      // before the WhatsApp fallback they were always going to get.
      const spent = res.status === 429 && /per-day|daily|free-models-per-day/i.test(detail);
      return { status: spent ? 402 : res.status, detail };
    }
    const reader = res.body.getReader();
    const parse = sseParser();
    let text = "";
    let model = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const r = parse(value);
      if (r.model) model = r.model;
      text += r.text;
      if (r.error && !text.trim()) {
        reader.cancel().catch(() => {});
        return { status: 502, detail: r.error };
      }
      if (r.done) {
        reader.cancel().catch(() => {});
        break;
      }
    }
    if (!text.trim()) return { status: 502, detail: `empty reply from ${model || a.models[0]}` };
    // The blind router sometimes lands on a classifier, which answers a
    // question about sessions with "User Safety: safe".
    if (/safety|guard|moderation/i.test(model)) return { status: 502, detail: `not a chat model: ${model}` };
    return { text, model };
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
  const answer = async (system: string, turns?: { role: string; content: string }[]) => {
    for (const attempt of attempts) {
      for (let retry = 0; retry < 3; retry++) {
        const r = await ask(attempt, system, turns);
        if ("text" in r) return r;
        console.error("[chat] OpenRouter", r.status, attempt.models[0], r.detail.slice(0, 300));
        // 402 here means the account's daily free-model allowance is gone.
        // No model and no retry can change that, so stop immediately.
        if (r.status === 402) return null;
        if (r.status !== 429) break;
        await new Promise((res) => setTimeout(res, 1200));
      }
    }
    return null;
  };

  // The prompt asks for plain spoken prose, and the free models honour that
  // unevenly: some still send **bold**, # headings and long dashes, which the
  // chat window would print as literal symbols.
  const tidy = (text: string) =>
    text
      .replace(/\*+/g, "")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\s*[—–]\s*/g, ", ")
      .replace(/\u2011/g, "-")
      .trim();

  const base = systemPrompt(knowledge, extraInstructions, extraKnowledge);
  let reply = await answer(base);
  if (!reply) {
    return Response.json({ error: "The assistant is unavailable right now." }, { status: 502 });
  }

  // Said once, in the words the visitor should hear when a question cannot be
  // answered from the site.
  const HANDOFF =
    "That's not something I can confirm from what's here, and I'd rather not guess. Sabine answers this kind of question directly, and I'm happy to connect you. [[WHATSAPP]]";

  // Everything the reply is allowed to draw numbers from: the site, the team's
  // notes, and whatever the visitor typed themselves. Repeating the visitor's
  // own "2 people" back to them is not an invention.
  const sources = [knowledge, extraKnowledge ?? "", messages.map((m) => m.content).join("\n")];

  // Two checks, in order of cost. A number that is nowhere in the sources is
  // caught instantly and for certain. Anything else (a session described as
  // shareable when nothing says so) needs a reader, so a second model reads
  // the draft back against the site. It only overrules a reply when it answers
  // clearly; if the check itself fails, the reply stands rather than leaving
  // the visitor with nothing.
  const inspect = async (text: string): Promise<string | null> => {
    const invented = unknownNumbers(text, ...sources);
    if (invented.length) return `invented numbers: ${invented.join(", ")}`;
    const judge = await answer(FACT_CHECK, [
      { role: "user", content: `SOURCE:\n${knowledge}\n\n${extraKnowledge ? `MORE SOURCE:\n${extraKnowledge}\n\n` : ""}DRAFT:\n${text}` },
    ]);
    if (!judge) return null;
    const m = judge.text.trim().match(/^FAIL\s*:?\s*(.*)/i);
    return m ? `unsupported claim: ${m[1].slice(0, 160) || "(unstated)"}` : null;
  };

  let problem = await inspect(reply.text);
  if (problem) {
    console.warn("[chat] rejected:", problem, "| from", reply.model);
    const stricter = `${base}\n\nCORRECTION: a draft reply you just wrote was rejected because of ${problem}. Write the reply again using only what the KNOWLEDGE actually says. Do not state any number or any detail about the offering that is not written there. If the visitor is asking for something the KNOWLEDGE does not cover, tell them plainly that you cannot confirm it, and end with [[WHATSAPP]].`;
    const second = await answer(stricter);
    const stillWrong = second ? await inspect(second.text) : "no reply";
    if (second && !stillWrong) {
      reply = second;
    } else {
      console.warn("[chat] rejected again:", stillWrong);
      reply = { text: HANDOFF, model: "handoff" };
    }
  }

  // Which model answered. With free models this changes from message to
  // message, and it is the first thing to look at when a reply reads wrong.
  console.log("[chat] answered by", reply.model);

  return new Response(tidy(reply.text), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
