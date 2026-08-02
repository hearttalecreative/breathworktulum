import { getPayload } from "payload";
import config from "../payload.config";

// Brief batch C — Private Sessions offers: names, prices, currency note,
// corrected Foundation description, and removal of the editing placeholders
// ("TO BE REVISED", "CHANGE ITEMS > xxxx", "XXXX") that were live on the page.
// Idempotent.

const lex = (...paras: string[]) => ({
  root: {
    type: "root", format: "", indent: 0, version: 1, direction: "ltr" as const,
    children: paras.map((t) => ({
      type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr" as const,
      children: [{ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: t, version: 1 }],
    })),
  },
});
const incl = (...xs: string[]) => xs.map((text) => ({ text }));

// ⚠️ Half-Day is 7,000 in the client's table and 7,500 in her notes on the same
// sheet. Using 7,000 per the brief's fallback — FLAGGED for confirmation.
const HALF_DAY_MXN = "7,000";

const CURRENCY_NOTE =
  "USD prices are approximate and may change due to currency fluctuations. MXN is the official pricing currency. All prices include 16% IVA.";

type Patch = { match: RegExp; title: string; investment: string; body?: unknown; included?: { text: string }[] };

const PATCHES: Patch[] = [
  {
    match: /foundation/i,
    title: "Foundation Breathwork Session, 1:1",
    investment: "4,000 MXN (approx. 229 USD) · 2 to 2.5 hours",
    // C-3: no core wounds, no inner child work in the Foundation.
    body: lex(
      "The Foundation is the entry point, designed primarily for people coming to this work for the first time. Two to two and a half hours: an intake conversation to set your intention, nervous system regulation, a guided Clarity Breathwork™ session, and grounding before you leave.",
      "Softer. Slower. Trauma informed. By the end you'll have a clearer sense of what your body has been holding, and a simple practice to keep working with."
    ),
    included: incl(
      "Initial intake and intention setting.",
      "Nervous system regulation and grounding.",
      "Guided Clarity Breathwork™, around 60 to 75 minutes.",
      "A Life Alignment Circle, a simple intention process.",
      "Integration conversation at the end.",
      "A simple practice to take with you."
    ),
  },
  {
    match: /half-day private immersive|private immersive session, half-day/i,
    title: "Private Immersive Session, Half-Day, 1:1",
    investment: `${HALF_DAY_MXN} MXN (approx. 402 USD) · 3.5 to 4 hours`,
    included: incl(
      "Around 90 minutes of guided breathwork.",
      "Somatic and conversational integration.",
      "Core wound decoding, connecting what surfaces to the pattern underneath.",
      "Time for whatever is asking for time.",
      "Pre-session and post-session voice notes via WhatsApp."
    ),
  },
  {
    match: /full-day private immersive|private immersive session, full-day/i,
    title: "Private Immersive Session, Full-Day, 1:1",
    investment: "15,000 MXN (approx. 860 USD) · 7 hours, two sessions and a meal",
  },
  {
    match: /couples immersive/i,
    title: "Couples Immersive, Half-Day",
    investment: "9,800 MXN per couple (approx. 562 USD) · 4 to 4.5 hours",
  },
];

// Strip leftover editing markers from any string in the tree.
const JUNK = [/^TO BE REVISED:\s*/i, /^CHANGE ITEMS\s*>\s*x+\s*$/i, /^X{2,}\s*/i, /\s*X{2,}\s*$/i];
function clean(node: unknown): unknown {
  if (typeof node === "string") {
    let s = node;
    for (const rx of JUNK) s = s.replace(rx, "");
    return s.trim();
  }
  if (Array.isArray(node)) return node.map(clean).filter((x) => !(typeof x === "string" && x === ""));
  if (node && typeof node === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) o[k] = clean(v);
    return o;
  }
  return node;
}

(async () => {
  const p = await getPayload({ config });
  const d = (await p.find({ collection: "pages", where: { slug: { equals: "work-with-me/private-sessions" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;

  let touched = 0;
  let layout = (d.layout || []).map((b: any) => {
    if (b.blockType !== "formatDetail") return b;
    const patch = PATCHES.find((x) => x.match.test(b.title || ""));
    if (!patch) return b;
    touched++;
    return {
      ...b,
      title: patch.title,
      investment: patch.investment,
      ...(patch.body ? { body: patch.body } : {}),
      ...(patch.included ? { included: patch.included } : {}),
    };
  });

  // Remove placeholder junk everywhere on the page, then drop empty included rows.
  layout = (clean(layout) as any[]).map((b: any) =>
    b.included ? { ...b, included: b.included.filter((x: any) => (x?.text || "").trim().length > 2) } : b
  );

  // C-2: currency disclaimer right after the last offer block.
  const hasNote = layout.some((b: any) => JSON.stringify(b).includes("MXN is the official pricing currency"));
  if (!hasNote) {
    const lastOffer = layout.map((b: any) => b.blockType).lastIndexOf("formatDetail");
    const note = { blockType: "richText", tone: "cream", width: "narrow", body: lex(CURRENCY_NOTE) };
    layout.splice(lastOffer + 1, 0, note);
  }

  await p.update({ collection: "pages", id: d.id, data: { layout } as any, overrideAccess: true });
  console.log("C-1/C-3 offer blocks patched:", touched);
  console.log("C-2 currency note:", hasNote ? "already present" : "added");

  // verify no junk remains
  const after = (await p.find({ collection: "pages", where: { slug: { equals: "work-with-me/private-sessions" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  const s = JSON.stringify(after);
  console.log("junk left:", ["TO BE REVISED", "CHANGE ITEMS", "XXXX"].filter((j) => s.includes(j)).join(", ") || "none");
  console.log("titles:", (after.layout || []).filter((b: any) => b.blockType === "formatDetail").map((b: any) => `${b.title} → ${b.investment}`).join("\n         "));
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
