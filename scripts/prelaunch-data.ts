import { getPayload } from "payload";
import config from "../payload.config";

// Three small data fixes from the pre-launch list (30 Sept). Touches one block
// on one page, one global and two images. Nothing sitewide.
//   node --env-file=.env.local --import tsx scripts/prelaunch-data.ts --dry
const DRY = process.argv.includes("--dry");

const STANDARD = ["Private session", "Couples / Shared session", "Private retreat", "Corporate or group breathwork", "General question"];

(async () => {
  const p = await getPayload({ config });

  // 1. NUMA pointed at a free model that no longer exists.
  const chat: any = await p.findGlobal({ slug: "chatSettings", overrideAccess: true });
  console.log(`NUMA model: ${chat.model} -> nvidia/nemotron-3-super-120b-a12b:free`);
  if (!DRY && chat.model !== "nvidia/nemotron-3-super-120b-a12b:free") {
    await p.updateGlobal({ slug: "chatSettings", data: { model: "nvidia/nemotron-3-super-120b-a12b:free" } as never, overrideAccess: true });
  }

  // 2. The waitlist form had no choice for the retreat it belongs to.
  const pg: any = (await p.find({ collection: "pages", where: { slug: { equals: "retreat-riviera-maya-2026" } }, depth: 0, overrideAccess: true })).docs[0];
  const layout = [...(pg.layout || [])];
  const idx = layout.findIndex((b: any) => b.blockType === "contactForm" && b.anchor === "waitlist");
  if (idx < 0) console.log("waitlist form: not found");
  else if ((layout[idx].subjects || []).length) console.log("waitlist form: already has its own choices, left alone");
  else {
    const subjects = ["Signature Retreat", ...STANDARD].map((label) => ({ label }));
    console.log("waitlist form choices ->", subjects.map((s) => s.label).join(" | "));
    layout[idx] = { ...layout[idx], subjects };
    if (!DRY) await p.update({ collection: "pages", id: pg.id, data: { layout } as never, overrideAccess: true, draft: pg._status !== "published" });
  }

  // 3. Two image descriptions carried escaped quotes from the blog import.
  for (const id of [63, 64]) {
    const m: any = await p.findByID({ collection: "media", id, overrideAccess: true }).catch(() => null);
    if (!m) continue;
    const clean = String(m.alt || "").replace(/\\+"/g, "").replace(/^"+|"+$/g, "").trim();
    console.log(`image ${id} alt: ${JSON.stringify(m.alt)} -> ${JSON.stringify(clean)}`);
    if (!DRY && clean && clean !== m.alt) await p.update({ collection: "media", id, data: { alt: clean } as never, overrideAccess: true });
  }

  console.log(DRY ? "\nDRY RUN" : "\nsaved");
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message.slice(0, 200)); process.exit(1); });
