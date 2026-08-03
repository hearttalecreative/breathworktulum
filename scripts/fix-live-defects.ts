import { getPayload } from "payload";
import config from "../payload.config";

// Correcciones verificadas contra el HTML publicado, no contra la base.
// 1.1 tamaño de grupo del Signature, 1.2 notas de edición, 1.3 línea duplicada,
// 1.4 encabezado vacío duplicado, 1.5 typo, 2.1 "The first edition", 2.2 FAQ.

const text = (t: string) => ({ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: t, version: 1 });
const para = (t: string) => ({ type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr" as const, children: [text(t)] });
const doc = (...ts: string[]) => ({ root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr" as const, children: ts.map(para) } });

// 1.1 — la cifra exacta vive solo en los detalles prácticos y en la respuesta
// del FAQ que pregunta justamente por eso. El copy emocional no lleva número.
const SIGNATURE_FIX: [RegExp, string][] = [
  [/Sixteen places, no more\./gi, "A small group, no more."],
  [/Limited to twenty places\.?/gi, "Limited to a small group."],
  [/hold a group of twenty without losing intimacy/gi, "hold the group without losing intimacy"],
  [/one of the twenty seats/gi, "one of the seats"],
  [/\bTwenty is the maximum size\b/gi, "Sixteen is the maximum size"],
  [/\b11 to 20 participants\b/gi, "12 to 16 participants"],
  [/\bTwenty people\b/gi, "A small group"],
  [/\bTwenty places\b/gi, "A small group"],
];

// 1.2 / 1.3 / 1.5 — 1-Day
const GP_FIX: [RegExp, string][] = [
  // nota de edición + la línea que ya vive en su propio campo Detail line
  [/\n*\s*NEED SPACE \| FOR THIS NEXT SENTENCE:\s*\n*\s*Small-group retreat · Tulum · November to April\s*/gi, ""],
  [/\n*\s*NEED HERE:[^\n]*\n?/gi, ""],
  [/plastic bottles are not allowed into the parK0/gi, "plastic bottles are not allowed into the park)"],
];

// 2.1 — su línea, absorbida en "Meet your guide"
const GUIDE_LINE =
  "This is the residential retreat I have been preparing to offer through years of guiding breathwork, somatic work and personal transformation.";

// 2.2 — las cinco preguntas que faltaban. Las respuestas salen de los datos que
// ella misma dio en la sección Retreat details, no son redacción nueva.
const NEW_FAQ = [
  { question: "How many people attend?", answer: "A minimum of 4 and a maximum of 10 participants." },
  { question: "What is included in the investment?", answer: "Two guided Clarity Breathwork™ sessions, somatic practices and nervous-system support, integration, and access to the pool and showers. Lunch is included once the minimum group size of four participants has been confirmed." },
  { question: "Is lunch included?", answer: "Yes, once the minimum group size of four participants has been confirmed." },
  { question: "Where exactly does the retreat take place?", answer: "At DiamanteK, inside Tulum Jaguar National Park." },
  { question: "What time does the day begin and end?", answer: "It is a full-day retreat. The exact times are shown for each date." },
];

function apply(node: unknown, rules: [RegExp, string][]): unknown {
  if (typeof node === "string") {
    let s = node;
    for (const [rx, to] of rules) s = s.replace(rx, to);
    return s;
  }
  if (Array.isArray(node)) return node.map((v) => apply(v, rules));
  if (node && typeof node === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) o[k] = apply(v, rules);
    return o;
  }
  return node;
}

(async () => {
  const p = await getPayload({ config });

  // ---------- Signature Retreat ----------
  const sr = (await p.find({ collection: "pages", where: { slug: { equals: "retreat-riviera-maya-2026" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  let srLayout = apply(sr.layout, SIGNATURE_FIX) as any[];

  // 2.1 — la sección propia desaparece; su línea pasa a "Meet Sabine".
  const guide = srLayout.find((b: any) => /meet sabine/i.test(b.heading || ""));
  if (guide) { guide.body = GUIDE_LINE; guide.hidden = false; }
  srLayout = srLayout.filter((b: any) => !/^the first edition\.?$/i.test((b.heading || "").trim()));
  const practical = srLayout.find((b: any) => /^first edition:/i.test((b.heading || "").trim()));
  if (practical) practical.heading = "Practical details.";

  await p.update({
    collection: "pages", id: sr.id, overrideAccess: true,
    data: {
      layout: srLayout,
      metaDescription: apply(sr.metaDescription, SIGNATURE_FIX),
      metaTitle: apply(sr.metaTitle, SIGNATURE_FIX),
    } as any,
  });

  // ---------- 1-Day Group Retreat ----------
  const gp = (await p.find({ collection: "pages", where: { slug: { equals: "work-with-me/group-practice" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  let gpLayout = apply(gp.layout, GP_FIX) as any[];

  // 1.4 — el encabezado repetido sin nada debajo
  const seen = new Set<string>();
  gpLayout = gpLayout.filter((b: any) => {
    const h = (b.heading || "").trim().toLowerCase();
    if (!h) return true;
    const empty = !b.body || (typeof b.body === "object" && JSON.stringify(b.body).replace(/[^a-z]/gi, "").length < 40);
    if (seen.has(h) && empty) return false;
    seen.add(h);
    return true;
  });

  // 2.2 — completar el FAQ
  const faq = gpLayout.find((b: any) => b.blockType === "faq");
  if (faq) {
    const have = new Set((faq.items || []).map((i: any) => (i.question || "").trim().toLowerCase()));
    faq.items = [...(faq.items || []), ...NEW_FAQ.filter((q) => !have.has(q.question.toLowerCase()))];
  }

  await p.update({
    collection: "pages", id: gp.id, overrideAccess: true,
    data: { layout: gpLayout, metaDescription: apply(gp.metaDescription, GP_FIX), metaTitle: apply(gp.metaTitle, GP_FIX) } as any,
  });

  console.log("signature bloques:", srLayout.length, "| 1-day bloques:", gpLayout.length, "| faq preguntas:", faq?.items?.length);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
