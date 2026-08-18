import { getPayload } from "payload";
import config from "../payload.config";

// Corta la lista de formación de About después del 4º punto y guarda el resto
// detrás de un enlace. Arrancar Payload ya empuja las columnas nuevas.
//
// Con --dry muestra el plan sin escribir.

const DRY = process.argv.includes("--dry");
const TOPE = 4;
const MAS = "View full training & background";
const MENOS = "Show less";

(async () => {
  const p = await getPayload({ config });

  const pages = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  const pg = pages.find((x) => String(x.slug) === "about");
  if (!pg) throw new Error("no encontré la página About");

  const layout = [...(pg.layout || [])];
  const i = layout.findIndex((b: any) => b.blockType === "list" && (b.items || []).length > TOPE);
  if (i < 0) throw new Error("no encontré la lista");

  const items = layout[i].items || [];
  console.log(`página: ${pg.title}  (estado: ${pg._status})`);
  console.log(`lista: "${layout[i].heading}"  ${items.length} ítems\n`);
  items.forEach((it: any, n: number) => {
    console.log(`  ${n + 1 <= TOPE ? "visible " : "guardado"}  ${String(it.text).slice(0, 62)}`);
    if (n + 1 === TOPE) console.log(`  ${"-".repeat(12)} corte aquí, con "${MAS}"`);
  });

  if (DRY) { console.log("\nPRUEBA EN SECO — no se escribió nada"); process.exit(0); }

  layout[i] = { ...layout[i], collapseAfter: TOPE, moreLabel: MAS, lessLabel: MENOS };
  await p.update({
    collection: "pages",
    id: pg.id,
    data: { layout } as never,
    overrideAccess: true,
    // Se mantiene el estado que ya tenía: si estaba publicada sigue publicada.
    draft: pg._status !== "published",
  });

  const check = (await p.findByID({ collection: "pages", id: pg.id, depth: 0, overrideAccess: true })) as any;
  const b = (check.layout || [])[i];
  console.log(`\nguardado -> corte: ${b.collapseAfter} | abre: "${b.moreLabel}" | cierra: "${b.lessLabel}"`);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
