import { getPayload } from "payload";
import config from "../payload.config";

// Brief bloque 2 — sección K, 1-Day Group Retreat (/work-with-me/group-practice/).
// Reordena la página, mueve botones, rellena los campos nuevos de K-4 y crea la
// sección compacta de K-5. No se escribe copy nuevo: los textos existentes se
// mueven tal cual, y lo que ella tiene que redactar queda como contenedor.

const SLUG = "work-with-me/group-practice";

const text = (t: string) => ({ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: t, version: 1 });
const link = (t: string, url: string) => ({
  type: "link", version: 3, format: "", indent: 0, direction: "ltr" as const,
  fields: { linkType: "custom" as const, newTab: false, url },
  children: [text(t)],
});
const para = (children: unknown[]) => ({ type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr" as const, children });
const doc = (...paras: unknown[]) => ({ root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr" as const, children: paras } });

// K-1b — one discreet line at the end, links inside the sentence, no buttons.
const PRIVATE_WORK_LINE = doc(
  para([
    text("Looking for a more personal or in-depth journey? Explore "),
    link("Private Sessions", "/work-with-me/private-sessions/"),
    text(" and "),
    link("Personalized Retreats", "/work-with-me/personalized-retreats/"),
    text("."),
  ])
);

// K-5 — compact, scannable facts. Price is a visible placeholder: it is not in
// any of the five batches. Group size follows her structured table (4 to 10);
// her analysis text says 10 to 12, flagged for confirmation.
const DETAILS = {
  blockType: "detailsGrid",
  heading: "Retreat details",
  tone: "sand",
  width: "default",
  rows: [
    { label: "Location", value: "DiamanteK, Tulum Jaguar National Park" },
    { label: "Season", value: "November to April, on selected dates" },
    { label: "Group size", value: "Minimum 4, maximum 10 participants" },
    { label: "Duration", value: "Full-day retreat, exact times shown for each date" },
    { label: "Investment", value: "[price]" },
    { label: "Lunch", value: "Included once the minimum group size of four is confirmed" },
    { label: "Included", value: "Access to the pool and showers" },
    { label: "Experience level", value: "No previous Breathwork experience is required" },
    { label: "Booking", value: "Advance booking is required" },
  ],
};

// Editing notes she left in the CMS and that were rendering live.
const NOTES = [/^BANNER NEEDS TO BE REPLACED[^]*$/i, /^NEEDS TO BE REVISED\s*-?\s*/i, /^NOT CORRECT[^]*?REVISED\s*\.?\s*/i];
function stripNotes(v: unknown): unknown {
  if (typeof v === "string") { let s = v; for (const rx of NOTES) s = s.replace(rx, ""); return s; }
  if (Array.isArray(v)) return v.map(stripNotes);
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) o[k] = stripNotes(x);
    return o;
  }
  return v;
}

(async () => {
  const p = await getPayload({ config });
  const d = (await p.find({ collection: "pages", where: { slug: { equals: SLUG } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  const src = stripNotes(d.layout || []) as any[];

  const find = (fn: (b: any) => boolean) => src.find(fn);
  const hero = find((b) => b.blockType === "hero");
  const stepAway = find((b) => /step away and reconnect/i.test(b.heading || ""));
  const shared = find((b) => /shared journey/i.test(b.heading || ""));
  const journey = find((b) => b.blockType === "formatDetail");
  const banner = find((b) => b.blockType === "photoBand" || b.blockType === "mediaFeature");
  const setting = find((b) => /oceanfront breathwork space/i.test(b.heading || ""));
  const faq = find((b) => b.blockType === "faq");
  const finalCta = find((b) => /find a date/i.test(b.heading || ""));

  // K-3 hero title + K-4a detail line. The slug stays put on purpose.
  hero.heading = "BREATHE. HEAL. TRANSFORM.® 1-Day Group Retreat";
  hero.eyebrow = "";
  hero.metaLine = "Small-group retreat · Tulum · November to April";

  // K-4b eyebrow she could not find — the field did not exist until now.
  if (stepAway) stepAway.eyebrow = "YOUR INVITATION";

  // K-4c / K-4d on the journey block. Its old title moved to the hero.
  if (journey) {
    journey.title = "Your journey through the day";
    journey.tag = "";
    journey.includedLabel = "YOUR RETREAT EXPERIENCE";
    journey.includedNote = "Lunch is included once the minimum group size of four participants has been confirmed.";
  }

  // The setting — full-screen media instead of the narrow band (K-2 §6, K-8).
  const settingMedia = banner
    ? {
        blockType: "mediaFeature",
        format: "fullScreen",
        image: banner.image?.id ?? banner.image,
        videoUrl: banner.videoUrl || "",
        eyebrow: "",
        heading: banner.caption || "",
        body: "",
        ctas: [],
        tone: "night",
        anchor: banner.anchor,
      }
    : null;

  // K-1a — the two mid-page buttons leave the setting block.
  if (setting) setting.ctas = [];

  // Container for the section she still has to write (K-2 §3).
  const offer = { blockType: "richText", eyebrow: "", heading: "What this day can offer you", tone: "cream", width: "narrow", align: "left", body: doc(para([text("")])) };

  const privateLine = { blockType: "richText", heading: "", tone: "cream", width: "narrow", align: "left", body: PRIVATE_WORK_LINE };

  const layout = [hero, stepAway, offer, journey, shared, settingMedia, setting, DETAILS, faq, finalCta, privateLine].filter(Boolean);

  await p.update({ collection: "pages", id: d.id, data: { layout } as any, overrideAccess: true });

  const after = (await p.find({ collection: "pages", where: { slug: { equals: SLUG } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  console.log("order:", (after.layout || []).map((b: any) => `${b.blockType}${b.format ? ":" + b.format : ""}`).join(" > "));
  const s = JSON.stringify(after);
  console.log("editing notes left:", /NEEDS TO BE REPLACED|NEEDS TO BE REVISED|NOT CORRECT/i.test(s));
  console.log("slug unchanged:", after.slug === SLUG);
  console.log("mid-page buttons removed:", !/work-with-me\/private-sessions\/"[^]{0,80}"variant":"primary"/.test(JSON.stringify(after.layout?.find((b: any) => /oceanfront/i.test(b.heading || "")) || {})));
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
