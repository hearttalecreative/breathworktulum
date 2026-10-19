import { getPayload } from "payload";
import config from "../payload.config";

// Fills the new "The three phases" field on the two Three-phases blocks with
// the wording that was hard-coded until now, so it shows up in the panel and
// can be edited. Only touches a block whose field is still empty.
const STANDARD = [
  { title: "Breathe", line: "The body enters the work. The technique opens what's been held." },
  { title: "Heal", line: "The emotional layer surfaces. What was stored has room to move." },
  { title: "Transform", line: "Integration. What shifted gets language, so the change holds." },
];
const DRY = process.argv.includes("--dry");

(async () => {
  const p = await getPayload({ config });
  for (const slug of ["home", "the-method"]) {
    const pg: any = (await p.find({ collection: "pages", where: { slug: { equals: slug } }, depth: 0, overrideAccess: true })).docs[0];
    if (!pg) { console.log(slug, "not found"); continue; }
    let touched = 0;
    const layout = (pg.layout || []).map((b: any) => {
      if (b.blockType !== "threePhases" || (b.phases || []).length) return b;
      touched++;
      return { ...b, phases: STANDARD };
    });
    console.log(`${slug}: ${touched} block(s) to fill`);
    if (touched && !DRY) await p.update({ collection: "pages", id: pg.id, data: { layout } as never, overrideAccess: true, draft: pg._status !== "published" });
  }
  console.log(DRY ? "DRY RUN" : "saved");
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
