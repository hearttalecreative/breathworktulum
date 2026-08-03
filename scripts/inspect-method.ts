import { getPayload } from "payload";
import config from "../payload.config";
(async () => {
  const p = await getPayload({ config });
  const d = (await p.find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  const b = (d.layout || []).find((x: any) => x.blockType === "threePhases");
  console.log("eyebrow:", JSON.stringify(b?.eyebrow));
  console.log("heading:", JSON.stringify(b?.heading));
  console.log("lede:", JSON.stringify(b?.lede));
  const paras = (b?.body?.root?.children || []).map((c: any) =>
    (c.children || []).map((t: any) => t.text || "").join("")
  );
  paras.forEach((t: string, i: number) => console.log(`body[${i}]:`, JSON.stringify(t)));
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
