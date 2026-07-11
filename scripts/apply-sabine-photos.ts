// Upload the processed Sabine photos (public/images/sabine-*.jpg) to Media and
// assign them to the right blocks on the live pages. Idempotent: media is
// found-or-created by filename; block assignments are skipped when already set.
//
//   npx tsx scripts/apply-sabine-photos.ts --dry
//   npx tsx scripts/apply-sabine-photos.ts
import path from "path";
import { fileURLToPath } from "url";

process.loadEnvFile(".env.local");

const DRY = process.argv.includes("--dry");
const dirname = path.dirname(fileURLToPath(import.meta.url));
const img = (f: string) => path.resolve(dirname, "../public/images", f);
type Rec = Record<string, unknown>;

const PHOTOS: { file: string; alt: string }[] = [
  { file: "sabine-jungle-bench.jpg", alt: "Sabine Binns smiling, seated on a wooden bench in the Tulum jungle" },
  { file: "sabine-jungle-seated.jpg", alt: "Sabine Binns sitting cross-legged on a jungle branch in Tulum, smiling" },
  { file: "sabine-beach-open-arms.jpg", alt: "Sabine Binns on the beach under a palm tree, arms open wide, smiling" },
  { file: "sabine-beach-sky.jpg", alt: "Sabine Binns on the beach with open arms, face lifted to the sky" },
  { file: "sabine-beach-rock.jpg", alt: "Sabine Binns seated on beach rocks under a palm tree, calm and present" },
  { file: "sabine-beach-wide.jpg", alt: "Sabine Binns smiling on the beach in Tulum, palms behind her" },
  { file: "sabine-meditation.jpg", alt: "Sabine Binns meditating cross-legged with open palms" },
];

async function run() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  const log = (m: string) => payload.logger.info(m);
  let changed = 0;

  // 1. Find-or-create media by filename.
  const ids = new Map<string, number>();
  for (const p of PHOTOS) {
    // Media converts uploads to webp, so the stored filename may swap the
    // extension — match on the basename with either extension.
    const base = p.file.replace(/\.jpg$/, "");
    const existing = await payload.find({
      collection: "media",
      where: { or: [{ filename: { equals: p.file } }, { filename: { equals: `${base}.webp` } }] },
      limit: 1,
    });
    if (existing.docs[0]) {
      ids.set(p.file, existing.docs[0].id as number);
      log(`  = media ${p.file} exists (#${existing.docs[0].id})`);
      continue;
    }
    if (DRY) {
      log(`  ~ media ${p.file} would upload`);
      continue;
    }
    const created = await payload.create({ collection: "media", data: { alt: p.alt }, filePath: img(p.file) });
    ids.set(p.file, created.id as number);
    changed++;
    log(`  ✓ media ${p.file} uploaded (#${created.id})`);
  }
  const id = (f: string) => ids.get(f);

  // 2. Assign to page blocks.
  const getPage = async (slug: string) => {
    const r = await payload.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
    return r.docs[0];
  };
  const patch = async (slug: string, mutate: (layout: Rec[]) => number) => {
    const page = await getPage(slug);
    if (!page) return log(`  ! ${slug} not found`);
    const layout = (page.layout as Rec[]) || [];
    const before = JSON.stringify(layout);
    const n = mutate(layout);
    if (JSON.stringify(layout) === before) return log(`  = ${slug} no change`);
    changed++;
    if (DRY) return log(`  ~ ${slug} would change (${n})`);
    await payload.update({ collection: "pages", id: page.id as never, data: { layout } as never });
    log(`  ✓ ${slug} (${n})`);
  };
  // Set block.image to mediaId when not already that id.
  const setImage = (layout: Rec[], match: (b: Rec) => boolean, file: string): number => {
    const target = id(file);
    if (!target) return 0;
    const b = layout.find(match);
    if (!b) return 0;
    const cur = typeof b.image === "object" && b.image ? (b.image as Rec).id : b.image;
    if (cur === target) return 0;
    b.image = target;
    return 1;
  };

  // HOME: splitImageText → jungle bench; threePhases → meditation (small 3/4 card).
  await patch("home", (l) => {
    let n = 0;
    n += setImage(l, (b) => b.blockType === "splitImageText", "sabine-jungle-bench.jpg");
    n += setImage(l, (b) => b.blockType === "threePhases", "sabine-meditation.jpg");
    return n;
  });

  // ABOUT: hero → jungle seated; photoBand → beach wide (landscape full-bleed).
  await patch("about", (l) => {
    let n = 0;
    n += setImage(l, (b) => b.blockType === "hero", "sabine-jungle-seated.jpg");
    n += setImage(l, (b) => b.blockType === "photoBand", "sabine-beach-wide.jpg");
    return n;
  });

  // THE METHOD: hero → beach sky (release, face to the sky).
  await patch("the-method", (l) => setImage(l, (b) => b.blockType === "hero", "sabine-beach-sky.jpg"));

  // PRIVATE SESSIONS: hero → beach rock (calm 1:1 presence).
  await patch("work-with-me/private-sessions", (l) =>
    setImage(l, (b) => b.blockType === "hero", "sabine-beach-rock.jpg")
  );

  // PERSONALIZED RETREATS: hero → open arms on the beach.
  await patch("work-with-me/personalized-retreats", (l) =>
    setImage(l, (b) => b.blockType === "hero", "sabine-beach-open-arms.jpg")
  );

  log(DRY ? `\nDRY RUN. ${changed} change(s).` : `\n✅ Applied. ${changed} change(s).`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
