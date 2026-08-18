import { getPayload } from "payload";
import config from "../payload.config";

// About era la única página del sitio con dos secciones seguidas del mismo
// tono al cerrar. El resto alterna. La última pasa de sand a cream.
const DRY = process.argv.includes("--dry");

(async () => {
  const p = await getPayload({ config });
  const pgs = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  const pg = pgs.find((x) => String(x.slug) === "about");
  if (!pg) throw new Error("no encontré About");

  const layout = [...(pg.layout || [])];
  const i = layout.length - 1;
  const ult: any = layout[i];
  if (ult.blockType !== "ctaSection") throw new Error(`la última no es ctaSection, es ${ult.blockType}`);
  const pen: any = layout[i - 1];

  console.log(`  penúltima: ${pen.blockType.padEnd(16)} ${pen.tone}`);
  console.log(`  última:    ${ult.blockType.padEnd(16)} ${ult.tone} -> cream`);

  if (DRY) { console.log("\nPRUEBA EN SECO"); process.exit(0); }

  layout[i] = { ...ult, tone: "cream" };
  await p.update({ collection: "pages", id: pg.id, data: { layout } as never, overrideAccess: true, draft: pg._status !== "published" });

  const ck = (await p.findByID({ collection: "pages", id: pg.id, depth: 0, overrideAccess: true })) as any;
  const L = ck.layout || [];
  console.log(`\nguardado -> ${L[L.length-2].tone} luego ${L[L.length-1].tone}`);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
