import { getPayload } from "payload";
import config from "../payload.config";

// Brief F-1 + G-4 — the About banner was a short horizontal band, so a portrait
// photo of Sabine showed only a sliver and her head was cut. Convert it to the
// reusable feature band in full-screen format: the photo fills the viewport on
// desktop, keeps its current height on phones, and the copy sits over it.
(async () => {
  const p = await getPayload({ config });
  const d = (await p.find({ collection: "pages", where: { slug: { equals: "about" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;

  let converted = 0;
  const layout = (d.layout || []).map((b: any) => {
    if (b.blockType !== "photoBand") return b;
    converted++;
    return {
      blockType: "mediaFeature",
      format: "fullScreen",
      image: b.image?.id ?? b.image,
      videoUrl: "",
      eyebrow: b.eyebrow || "Sabine Binns · Tulum",
      heading: b.caption || "",
      body: "",
      ctas: [],
      tone: "night",
      anchor: b.anchor,
    };
  });

  if (converted) await p.update({ collection: "pages", id: d.id, data: { layout } as any, overrideAccess: true });
  console.log("About photoBand -> full-screen feature:", converted);

  const after = (await p.find({ collection: "pages", where: { slug: { equals: "about" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  console.log("blocks now:", (after.layout || []).map((b: any) => b.blockType + (b.format ? `(${b.format})` : "")).join(" | "));
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
