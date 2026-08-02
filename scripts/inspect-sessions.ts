import { getPayload } from "payload";
import config from "../payload.config";

function lexText(n: any): string {
  let out = "";
  const walk = (x: any) => {
    if (!x) return;
    if (typeof x.text === "string") out += x.text + " ";
    (x.children || []).forEach(walk);
  };
  walk(n?.root ?? n);
  return out.trim();
}

(async () => {
  const p = await getPayload({ config });
  const d = (await p.find({ collection: "pages", where: { slug: { equals: "work-with-me/private-sessions" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  (d.layout || []).forEach((b: any, i: number) => {
    console.log(`\n#${i} ${b.blockType}${b.anchor ? " #" + b.anchor : ""}`);
    if (b.title) console.log("   title:", b.title);
    if (b.tag) console.log("   tag:", b.tag);
    if (b.tagline) console.log("   tagline:", b.tagline);
    if (b.heading) console.log("   heading:", b.heading);
    if (b.body) console.log("   body:", (typeof b.body === "string" ? b.body : lexText(b.body)).slice(0, 320));
    if (b.included?.length) console.log("   included:", b.included.map((x: any) => x.text).join(" | "));
    if (b.items?.length) console.log("   items:", b.items.map((x: any) => x.text || x.question).join(" | ").slice(0, 300));
    if (b.note) console.log("   note:", b.note);
  });
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
