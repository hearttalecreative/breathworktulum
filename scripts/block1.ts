import { getPayload } from "payload";
import config from "../payload.config";

// Brief bloque 1 — E-5a y E-7b.
//
// E-5a: the order she asked for is already in place (her philosophy leads in the
// lede, the phase list follows, Clarity Breathwork closes the body). What was
// actually wrong is that her own editing notes were published live on the home
// page: "NEEDS TO BE REVISED - The Method" and "NOT CORRECT >>> NEEDS TO BE
// REVISED .". Those are notes, not copy, so they get stripped — no rewriting.
//
// E-7b: the Signature band becomes the reusable Feature band in Portrait, so
// the photograph shows whole instead of being cropped to a strip.

const MARKERS = [
  /^NEEDS TO BE REVISED\s*-\s*/i,
  /^NOT CORRECT\s*>+\s*NEEDS TO BE REVISED\s*\.?\s*/i,
  /^NEEDS TO BE REVISED\s*\.?\s*/i,
  /^TO BE REVISED:\s*/i,
];

function strip(node: unknown): unknown {
  if (typeof node === "string") {
    let s = node;
    for (const rx of MARKERS) s = s.replace(rx, "");
    return s;
  }
  if (Array.isArray(node)) return node.map(strip);
  if (node && typeof node === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) o[k] = strip(v);
    return o;
  }
  return node;
}

(async () => {
  const p = await getPayload({ config });
  const pages = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];

  let cleaned = 0;
  let converted = 0;

  for (const pg of pages) {
    const before = JSON.stringify(pg.layout);
    let layout = strip(pg.layout) as any[];
    if (JSON.stringify(layout) !== before) cleaned++;

    // E-7b — only the home Signature band.
    if (pg.slug === "home") {
      layout = layout.map((b: any) => {
        if (b.blockType !== "signatureBand") return b;
        converted++;
        return {
          blockType: "mediaFeature",
          format: "portrait",
          image: b.image?.id ?? b.image,
          videoUrl: "",
          eyebrow: b.eyebrow || "",
          heading: b.heading || "",
          body: b.body || "",
          ctas: b.cta?.label ? [b.cta] : [],
          tone: "cream",
          anchor: b.anchor,
        };
      });
    }

    if (JSON.stringify(layout) !== before) {
      await p.update({ collection: "pages", id: pg.id, data: { layout } as any, overrideAccess: true });
    }
  }

  console.log("E-5a pages with editing notes stripped:", cleaned);
  console.log("E-7b signature band -> portrait feature:", converted);

  const after = JSON.stringify(
    (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs
  );
  console.log(
    "markers left:",
    ["NEEDS TO BE REVISED", "NOT CORRECT", "TO BE REVISED"].filter((m) => after.includes(m)).join(", ") || "none"
  );
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
