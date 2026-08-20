import { getPayload } from "payload";
import config from "../payload.config";

// Las secciones de lugar de la Gallery van alternando el lado de la foto, para
// que dos seguidas no se lean como la misma. Arrancar Payload empuja la columna.

const DRY = process.argv.includes("--dry");

(async () => {
  const p = await getPayload({ config });
  const pgs = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  const g = pgs.find((x) => String(x.slug) === "gallery");
  const layout = [...(g.layout || [])];

  let n = 0;
  layout.forEach((b: any, i) => {
    if (b.blockType !== "mediaFeature" || b.format !== "portrait") return;
    const lado = n % 2 === 0 ? "left" : "right";
    console.log(`  #${i + 1}  ${String(b.heading || "").slice(0, 34).padEnd(36)} ${b.imageSide || "left"} -> ${lado}`);
    layout[i] = { ...b, imageSide: lado };
    n++;
  });

  if (DRY) { console.log("\nPRUEBA EN SECO"); process.exit(0); }
  await p.update({ collection: "pages", id: g.id, data: { layout } as never, overrideAccess: true, draft: g._status !== "published" });

  const ck = (await p.findByID({ collection: "pages", id: g.id, depth: 0, overrideAccess: true })) as any;
  console.log("\nguardado:");
  (ck.layout || []).forEach((b: any, i: number) => {
    if (b.blockType === "mediaFeature" && b.format === "portrait") console.log(`  #${i + 1}  ${b.imageSide}`);
  });
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
