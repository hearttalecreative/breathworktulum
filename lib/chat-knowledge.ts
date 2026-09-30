import "server-only";
import { unstable_cache } from "next/cache";
import { getPayloadClient } from "./payload";
import { SITE } from "./site";

// Plain-text knowledge base for the AI chat assistant, assembled from the
// published Payload pages. Tagged "pages" so a publish busts it instantly.

type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] };

/** Serialize a Lexical richtext value to plain text (text nodes + newlines). */
export function lexicalToText(value: unknown): string {
  const root = (value as { root?: LexicalNode } | null)?.root;
  if (!root) return "";
  const walk = (n: LexicalNode): string => {
    if (typeof n.text === "string") return n.text;
    const inner = (n.children ?? []).map(walk).join("");
    const blockTypes = ["paragraph", "heading", "listitem", "quote"];
    return blockTypes.includes(n.type ?? "") ? `${inner}\n` : inner;
  };
  return walk(root).replace(/\n{3,}/g, "\n\n").trim();
}

// String fields across the block types that carry human-readable content.
// Anything else (slugs, tones, anchors, ids, urls) stays out of the prompt.
const TEXT_KEYS = new Set([
  "eyebrow",
  "heading",
  "lede",
  "intro",
  "closing",
  "caption",
  "title",
  "tag",
  "tagline",
  "investment",
  "note",
  "question",
  "answer",
  "text",
  "line",
  "value",
  "leftTitle",
  "rightTitle",
  "quote",
  "name",
  "role",
  "label",
  // Plain-text bodies. Fifty sections keep their main paragraph here, and none
  // of it reached the assistant while only rich-text bodies were read.
  "body",
  "metaLine",
  "includedNote",
]);

// Pages the assistant is asked about most go first, so that if the text ever
// outgrows the budget it is the legal small print that falls off the end, not
// the prices. The old order was the database's, with a 60,000-character cut:
// About, Private Sessions, The Method and Home came last and were dropped
// whole, so NUMA had no private-session prices and made them up.
const PRIORITY = [
  "home",
  "work-with-me",
  "work-with-me/private-sessions",
  "work-with-me/couples",
  "work-with-me/personalized-retreats",
  "work-with-me/group-practice",
  "work-with-me/curated-group-experiences",
  "work-with-me/corporate",
  "retreat-riviera-maya-2026",
  "the-method",
  "about",
  "contact",
  "gallery",
  "resources",
  "resources/newsletter",
  "legal/contraindications",
  "legal/retreat-policies",
];
const rank = (slug: string) => {
  const i = PRIORITY.indexOf(slug);
  return i === -1 ? PRIORITY.length : i;
};

// ~140k chars ≈ 35k tokens. The whole site is about 100k today.
const MAX_CHARS = 140_000;

function blockToText(block: unknown): string {
  const parts: string[] = [];
  const visit = (obj: unknown): void => {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach(visit);
      return;
    }
    const rec = obj as Record<string, unknown>;
    if (rec.root) {
      // Lexical richtext value.
      const t = lexicalToText(rec);
      if (t) parts.push(t);
      return;
    }
    for (const [k, v] of Object.entries(rec)) {
      if (typeof v === "string") {
        if (TEXT_KEYS.has(k) && v.trim()) parts.push(v.trim());
      } else {
        visit(v);
      }
    }
  };
  visit(block);
  return parts.join("\n");
}

export const getChatKnowledge = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "pages",
      where: { _status: { equals: "published" } },
      depth: 1,
      limit: 100,
      pagination: false,
    });
    const head = [
      `# ${SITE.name} — site knowledge`,
      `Founder & facilitator: ${SITE.founder}. Slogan: ${SITE.slogan}`,
      SITE.description,
      `Location: ${SITE.location.city}, ${SITE.location.region}, ${SITE.location.country}. Sessions in Tulum, online, or in a personalized retreat.`,
      `Contact: ${SITE.email} · WhatsApp ${SITE.phoneDisplay}`,
    ].join("\n");
    const docs = [...res.docs].sort((a, b) => rank(String(a.slug)) - rank(String(b.slug)));
    const pages = docs.map((p) => {
      const path = p.slug === "home" ? "/" : `/${p.slug}/`;
      const body = ((p as { layout?: { hidden?: boolean }[] }).layout ?? [])
        // A section she has hidden from the page is hidden from NUMA too.
        .filter((b) => !b?.hidden)
        .map(blockToText)
        .filter(Boolean)
        .join("\n\n");
      return `## ${p.title} (${path})\n${body}`;
    });
    return [head, ...pages].join("\n\n").slice(0, MAX_CHARS);
  },
  ["chat-knowledge-v2"],
  { revalidate: 3600, tags: ["pages", "chat-settings"] }
);
