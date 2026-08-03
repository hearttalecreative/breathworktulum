import { getPayload } from "payload";
import config from "../payload.config";

// L-1 — park sections that are published with a heading and no content.
// They stay in the document and come back by unticking "Hide this section".
function lexText(n: any): string {
  let o = ""; const w = (x: any) => { if (!x) return; if (typeof x.text === "string") o += x.text; (x.children || []).forEach(w); };
  w(n?.root ?? n); return o.trim();
}
function isEmpty(b: any): boolean {
  if (b.hidden) return false;
  const hasText = [b.body, b.lede, b.intro, b.caption, b.tagline].some((v) =>
    typeof v === "string" ? v.trim().length > 0 : v ? lexText(v).length > 0 : false
  );
  // Every array a block can carry. Missing `left`/`right` here once hid two
  // two-column sections that were perfectly full — count them all.
  const ARRAYS = ["items", "cards", "rows", "images", "included", "chapters", "left", "right", "tiles", "phases"];
  const hasStuff = ARRAYS.some((k) => Array.isArray(b[k]) && b[k].length > 0);
  const hasMedia = !!b.image || !!b.videoUrl;
  const hasCta = (b.ctas?.length || 0) > 0 || !!b.cta?.label;
  const hasHeading = !!(b.heading || b.title);
  return hasHeading && !hasText && !hasStuff && !hasMedia && !hasCta;
}

(async () => {
  const p = await getPayload({ config });
  const pages = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  const found: string[] = [];
  for (const d of pages) {
    let changed = false;
    const layout = (d.layout || []).map((b: any) => {
      if (!isEmpty(b)) return b;
      found.push(`/${d.slug} → ${b.blockType} "${b.heading || b.title}"`);
      changed = true;
      return { ...b, hidden: true };
    });
    if (changed) await p.update({ collection: "pages", id: d.id, data: { layout } as any, overrideAccess: true });
  }
  console.log("secciones vacías ocultadas:", found.length);
  found.forEach((f) => console.log("   ", f));
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
