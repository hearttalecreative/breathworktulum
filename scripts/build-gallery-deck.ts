import { getPayload } from "payload";
import config from "../payload.config";

const DECK = 26; // bw-deck-sea
const GALLERY = [11, 13, 18, 19, 22, 24, 26, 139];

const galleryPage = {
  title: "Gallery",
  slug: "gallery",
  metaTitle: "Gallery. Breathwork in Tulum and the Riviera Maya",
  metaDescription: "Photos from sessions, retreats, and the settings where this work happens — in Tulum and across the Riviera Maya.",
  ogImage: DECK,
  layout: [
    { blockType: "hero", eyebrow: "Gallery", heading: "Moments from the work.",
      lede: "Sessions, retreats, and the spaces where this work happens — in Tulum and across the Riviera Maya.",
      image: DECK, ctas: [] },
    { blockType: "gallery", tone: "cream", width: "wide",
      images: GALLERY.map((id) => ({ image: id })) },
  ],
  _status: "published" as const,
};

(async () => {
  const p = await getPayload({ config });

  // 1) Gallery page (idempotent by slug).
  const g = (await p.find({ collection: "pages", where: { slug: { equals: "gallery" } }, limit: 1, overrideAccess: true })).docs[0] as any;
  if (g) { await p.update({ collection: "pages", id: g.id, data: galleryPage as any, overrideAccess: true }); console.log("GALLERY page UPDATED", g.id); }
  else { const d = await p.create({ collection: "pages", data: galleryPage as any, overrideAccess: true }); console.log("GALLERY page CREATED", (d as any).id); }

  // 2) Convert the home beach-deck photoBand -> mediaFeature.
  const home = (await p.find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  let converted = 0;
  const layout = (home.layout || []).map((blk: any) => {
    if (blk.blockType === "photoBand" && (blk.image === DECK || blk.image?.id === DECK)) {
      converted++;
      return {
        blockType: "mediaFeature",
        image: DECK,
        videoUrl: "",
        eyebrow: "The Breathwork Deck",
        heading: "Breathe by the sea, in Tulum National Park.",
        body: "An open-air deck framed by jungle and water — one of the settings for private sessions, group experiences, and retreats.",
        ctas: [],
        tone: blk.tone || "night",
        anchor: blk.anchor,
      };
    }
    return blk;
  });
  if (converted) { await p.update({ collection: "pages", id: home.id, data: { layout } as any, overrideAccess: true }); }
  console.log("home photoBand->mediaFeature converted:", converted);

  // 3) Add "Gallery" to the top-nav primary links (after The Method), idempotent.
  const header = (await p.findGlobal({ slug: "header", overrideAccess: true })) as any;
  const primary = (header.primary || []).map((x: any) => ({ label: x.label, href: x.href, description: x.description }));
  if (!primary.some((x: any) => x.href === "/gallery/")) {
    const idx = primary.findIndex((x: any) => /the-method/i.test(x.href || ""));
    const item = { label: "Gallery", href: "/gallery/" };
    if (idx >= 0) primary.splice(idx + 1, 0, item); else primary.push(item);
  }
  await p.updateGlobal({ slug: "header", data: { ...header, primary } as any, overrideAccess: true });
  console.log("header.primary:", primary.map((x: any) => x.label).join(" | "));
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
