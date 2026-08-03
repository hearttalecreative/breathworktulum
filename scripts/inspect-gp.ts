import { getPayload } from "payload";
import config from "../payload.config";
function lexText(n: any): string {
  let o = ""; const w = (x: any) => { if (!x) return; if (typeof x.text === "string") o += x.text + " "; (x.children || []).forEach(w); };
  w(n?.root ?? n); return o.trim();
}
(async () => {
  const p = await getPayload({ config });
  const d = (await p.find({ collection: "pages", where: { slug: { equals: "work-with-me/group-practice" } }, limit: 1, depth: 1, overrideAccess: true })).docs[0] as any;
  (d.layout || []).forEach((b: any, i: number) => {
    console.log(`\n#${i} ${b.blockType}${b.anchor ? " #" + b.anchor : ""}  [tone=${b.tone || "-"} height=${b.height || "-"}]`);
    for (const k of ["eyebrow", "title", "heading", "tag", "tagline", "caption", "lede", "note", "investment"]) if (b[k]) console.log(`   ${k}: ${String(b[k]).slice(0, 130)}`);
    if (b.body) console.log("   body:", (typeof b.body === "string" ? b.body : lexText(b.body)).slice(0, 180));
    if (b.included?.length) console.log("   included:", b.included.map((x: any) => x.text).join(" | ").slice(0, 200));
    if (b.items?.length) console.log("   items:", b.items.map((x: any) => x.text || x.question).join(" | ").slice(0, 200));
    if (b.ctas?.length) console.log("   ctas:", b.ctas.map((c: any) => c.label).join(" | "));
    if (b.cta?.label) console.log("   cta:", b.cta.label);
    if (b.image) console.log("   image:", b.image?.filename || b.image, "| w/h:", b.image?.width, b.image?.height);
  });
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
