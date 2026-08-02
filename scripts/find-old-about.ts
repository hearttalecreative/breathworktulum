import { getPayload } from "payload";
import config from "../payload.config";

function lexText(n: any): string {
  let out = "";
  const walk = (x: any) => { if (!x) return; if (typeof x.text === "string") out += x.text + " "; (x.children || []).forEach(walk); };
  walk(n?.root ?? n);
  return out.trim();
}

(async () => {
  const p = await getPayload({ config });
  // Which pages still name the old employers?
  const pages = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  for (const d of pages) {
    if (!/Orbitz|Booking/.test(JSON.stringify(d))) continue;
    console.log("\n### page:", d.slug);
    (d.layout || []).forEach((b: any, i: number) => {
      const s = JSON.stringify(b);
      if (!/Orbitz|Booking/.test(s)) return;
      console.log(`  block #${i} ${b.blockType} heading="${b.heading || b.title || ""}"`);
      for (const k of ["lede", "body", "intro", "note", "caption"]) {
        if (!b[k]) continue;
        const t = typeof b[k] === "string" ? b[k] : lexText(b[k]);
        if (/Orbitz|Booking/.test(t)) console.log(`     ${k}: ${t.slice(0, 400)}`);
      }
      (b.items || b.included || []).forEach((it: any) => {
        const t = it.text || it.answer || "";
        if (/Orbitz|Booking/.test(t)) console.log(`     item: ${t.slice(0, 300)}`);
      });
    });
  }
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
