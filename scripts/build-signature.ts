import { getPayload } from "payload";
import config from "../payload.config";

// Sección I — Signature Retreat.
//
// Su copy no se inventa. Lo que se hace acá es: corregir un dato incorrecto que
// está publicado, aplicar los títulos de día que ella misma definió, sacar las
// líneas que pidió sacar, reordenar, y dejar creados (ocultos) los contenedores
// de las secciones que todavía tiene que escribir.

const HER_PORTRAIT = 158;  // Larissa crossing arms, 3024x4032
const SENSORY = 20;        // se resuelve abajo si no existe

const text = (t: string) => ({ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: t, version: 1 });
const para = (t: string) => ({ type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr" as const, children: [text(t)] });
const doc = (...ts: string[]) => ({ root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr" as const, children: ts.map(para) } });

// I-3 — títulos que ella definió, conservando su descripción y quitando las
// frases que marcó como severas.
const DAY_TITLES: [RegExp, string][] = [
  [/^Day 1\.\s*Arrival\./i, "Day One: Arrive and Connect."],
  [/^Day 2\.\s*Breathe\./i, "Day Two: Breathe and Reconnect."],
  [/^Day 3\.\s*Heal \(the longer day\)\./i, "Day Three: Explore and Release."],
  [/^Day 4\.\s*Transform\./i, "Day Four: Integrate and Reorient."],
  [/^Day 5\.\s*Coming back\./i, "Day Five: Carry It Forward."],
];
const SEVERE = [
  /\s*The body comes online\.\s*/i,
  /\s*Most people don't know what they're really here for until this happens\.\s*/i,
  /\s*The day the retreat was built around\.\s*/i,
];

// I-4 — fuera del sitio público; pueden servir en el proceso de aplicación.
const DROP_FIT = [
  /You can give the work five days without checking your phone/i,
  /You're financially in a place where this is an investment/i,
  /You have no prior experience with inner work/i,
];

// I-1 — el dato es incorrecto: trabaja con 12 a 16 personas, no 20.
const FACTS: [RegExp, string][] = [
  [/Five days\. Twenty people\. One process\./i, "Five days. One process."],
  [/\b11 to 20 participants\b/gi, "12 to 16 participants"],
  [/\bTwenty places\b/gi, "Sixteen places"],
  [/\bTwenty people\b/gi, "A small group"],
];

function fix(node: unknown): unknown {
  if (typeof node === "string") {
    let s = node;
    for (const [rx, to] of FACTS) s = s.replace(rx, to);
    return s;
  }
  if (Array.isArray(node)) return node.map(fix);
  if (node && typeof node === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) o[k] = fix(v);
    return o;
  }
  return node;
}

const hidden = (b: Record<string, unknown>) => ({ ...b, hidden: true });

(async () => {
  const p = await getPayload({ config });
  const d = (await p.find({ collection: "pages", where: { slug: { equals: "retreat-riviera-maya-2026" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  const src = fix(d.layout || []) as any[];

  const by = (fn: (b: any) => boolean) => src.find(fn);
  const hero = by((b) => b.blockType === "hero");
  const firstEdition = by((b) => /first edition\./i.test(b.heading || ""));
  const arc = by((b) => /the arc/i.test(b.heading || ""));
  const venue = by((b) => /onze xpu ha\./i.test(b.heading || ""));
  const band = by((b) => b.blockType === "photoBand" || b.blockType === "mediaFeature");
  const fit = by((b) => b.blockType === "twoColumnLists");
  const details = by((b) => /first edition:/i.test(b.heading || ""));
  const steps = by((b) => /waitlist to confirmed seat/i.test(b.heading || ""));
  const investment = by((b) => /^investment\.?$/i.test(b.heading || ""));
  const form = by((b) => b.blockType === "contactForm");
  const faq = by((b) => b.blockType === "faq");
  const closing = by((b) => /two minutes on the form/i.test(b.heading || ""));
  const alt = by((b) => /can't wait for the group retreat/i.test(b.heading || ""));

  // I-3
  if (arc?.items) {
    arc.items = arc.items.map((it: any) => {
      let t: string = it.text || "";
      for (const rx of SEVERE) t = t.replace(rx, " ");
      for (const [rx, to] of DAY_TITLES) t = t.replace(rx, to);
      return { ...it, text: t.replace(/\s{2,}/g, " ").trim() };
    });
    arc.heading = "The rhythm of the five days.";
  }

  // I-4
  if (fit) {
    fit.left = (fit.left || []).filter((x: any) => !DROP_FIT.some((rx) => rx.test(x.text || "")));
    fit.right = (fit.right || []).filter((x: any) => !DROP_FIT.some((rx) => rx.test(x.text || "")));
  }

  // I-2 §15 — un nombre más cálido
  if (steps) steps.heading = "Your next steps.";

  // §3 — imagen sensorial grande
  const sensory = band
    ? { blockType: "mediaFeature", format: "fullScreen", image: band.image?.id ?? band.image ?? SENSORY, videoUrl: band.videoUrl || "", eyebrow: band.eyebrow || "", heading: band.caption || "", body: "", ctas: [], tone: "night", anchor: band.anchor }
    : null;

  const layout = [
    hero,                                                                        // 1
    hidden({ blockType: "richText", tone: "cream", width: "narrow", align: "left", eyebrow: "The invitation", heading: "Why step away for five days.", body: doc("") }), // 2
    sensory,                                                                     // 3
    firstEdition,                                                                // 4
    hidden({ blockType: "richText", tone: "sand", width: "narrow", align: "left", eyebrow: "The journey", heading: "Breathe. Heal. Transform.", body: doc("") }),        // 5
    hidden({ blockType: "richText", tone: "cream", width: "narrow", align: "left", eyebrow: "What you may experience", heading: "What you may take home.", body: doc("") }), // 7
    arc,                                                                         // 8
    venue,                                                                       // 9 — venue sin confirmar, se deja intacto
    hidden({ blockType: "richText", tone: "sand", width: "narrow", align: "left", eyebrow: "Staying there", heading: "Accommodation, food and space.", body: doc("") }),  // 10
    hidden({ blockType: "mediaFeature", format: "portrait", image: HER_PORTRAIT, videoUrl: "", eyebrow: "Your guide", heading: "Meet Sabine.", body: "", ctas: [], tone: "cream" }), // 11
    fit,                                                                         // 12
    details,                                                                     // 13
    investment,                                                                  // 14
    steps,                                                                       // 15
    faq,
    form,                                                                        // 16
    alt,
    closing,
  ].filter(Boolean);

  await p.update({ collection: "pages", id: d.id, data: { layout } as any, overrideAccess: true });

  const after = (await p.find({ collection: "pages", where: { slug: { equals: "retreat-riviera-maya-2026" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  const s = JSON.stringify(after);
  console.log("bloques:", (after.layout || []).length, "| visibles:", (after.layout || []).filter((b: any) => !b.hidden).length, "| ocultos:", (after.layout || []).filter((b: any) => b.hidden).length);
  console.log("headline:", (after.layout || [])[0]?.heading);
  console.log("dato 'Twenty people' presente:", /Twenty people/i.test(s), "| '11 to 20' presente:", /11 to 20/i.test(s));
  console.log("frases severas presentes:", SEVERE.some((rx) => rx.test(s)));
  console.log("líneas de idoneidad quitadas:", !DROP_FIT.some((rx) => rx.test(s)));
  console.log("días:", ((after.layout || []).find((b: any) => /rhythm of the five/i.test(b.heading || ""))?.items || []).map((x: any) => x.text.split(".")[0]).join(" | "));
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
