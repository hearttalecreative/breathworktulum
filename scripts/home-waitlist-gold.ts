import { getPayload } from "payload";
import config from "../payload.config";

// "Join the waitlist" en Home pasa de botón oscuro a dorado.
const DRY = process.argv.includes("--dry");

(async () => {
  const p = await getPayload({ config });
  const pgs = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  const pg = pgs.find((x) => String(x.slug) === "home");
  if (!pg) throw new Error("no encontré Home");

  const layout = [...(pg.layout || [])];
  let tocados = 0;
  for (let i = 0; i < layout.length; i++) {
    const b: any = layout[i];
    const ctas = b.ctas;
    if (!Array.isArray(ctas)) continue;
    const nuevos = ctas.map((c: any) => {
      if (!/join the waitlist/i.test(String(c?.label || ""))) return c;
      console.log(`  bloque ${i + 1} (${b.blockType}): "${c.label}"  ${c.variant || "primary"} -> gold`);
      tocados++;
      return { ...c, variant: "gold" };
    });
    if (tocados) layout[i] = { ...b, ctas: nuevos };
  }
  if (!tocados) throw new Error('no encontré ningún CTA "Join the waitlist"');

  if (DRY) { console.log("\nPRUEBA EN SECO — no se escribió nada"); process.exit(0); }

  await p.update({ collection: "pages", id: pg.id, data: { layout } as never, overrideAccess: true, draft: pg._status !== "published" });
  const ck = (await p.findByID({ collection: "pages", id: pg.id, depth: 0, overrideAccess: true })) as any;
  const v = (ck.layout || []).flatMap((b: any) => b.ctas || []).find((c: any) => /join the waitlist/i.test(String(c?.label || "")));
  console.log(`\nguardado -> variante: ${v?.variant}`);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
