import { getPayload } from "payload";
import config from "../payload.config";

// Non-destructive: inserts one themed photo band into the text-heavy MVP pages
// (the-method, about) without touching media/testimonials or other blocks.
async function run() {
  const payload = await getPayload({ config });

  const mediaId = async (filename: string) => {
    const r = await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1 });
    return r.docs[0]?.id;
  };
  const methodRelease = await mediaId("bw-method-release.jpg");
  const sabineLaughing = await mediaId("bw-sabine-laughing.jpg");

  const getPage = async (slug: string) => {
    const r = await payload.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
    return r.docs[0];
  };

  // Strip ids so Payload re-creates array rows cleanly on update.
  const clean = (blocks: unknown[]) =>
    (blocks as Record<string, unknown>[]).map(({ id: _id, ...rest }) => rest);

  const insertBand = async (
    slug: string,
    afterBlockType: string,
    band: Record<string, unknown>
  ) => {
    const page = await getPage(slug);
    if (!page) return payload.logger.warn(`  ! ${slug} not found`);
    const layout = clean((page.layout as unknown[]) || []);
    if (layout.some((b) => (b as Record<string, unknown>).blockType === "photoBand")) {
      return payload.logger.info(`  = ${slug} already has a photoBand, skipping`);
    }
    const idx = layout.findIndex((b) => (b as Record<string, unknown>).blockType === afterBlockType);
    const at = idx >= 0 ? idx + 1 : 1;
    layout.splice(at, 0, band);
    await payload.update({ collection: "pages", id: page.id as never, data: { layout } as never });
    payload.logger.info(`  ✓ ${slug} (band after ${afterBlockType} @ ${at})`);
  };

  await insertBand("the-method", "threePhases", {
    blockType: "photoBand", image: methodRelease, height: "standard",
    eyebrow: "Breathe. Heal. Transform.®",
    caption: "Work with the body, and what it has been holding.",
  });

  await insertBand("about", "richText", {
    blockType: "photoBand", image: sabineLaughing, height: "standard",
    eyebrow: "Sabine Binns · Tulum",
    caption: "Twenty years in the work, and still learning from every room.",
  });

  payload.logger.info("✅ MVP pages enriched.");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
