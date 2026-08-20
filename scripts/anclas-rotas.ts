import { getPayload } from "payload";
import config from "../payload.config";

// Los CTA que apuntan a #algo sólo funcionan si alguna sección de la misma
// página lleva esa ancla. Este script busca los que apuntan a la nada.

const DRY = process.argv.includes("--dry");
// Ancla que corresponde a cada destino roto, por tipo de bloque.
// Ancla -> a qué sección corresponde. "about-retreat" apunta al primer bloque
// de texto después del hero, que es el que explica el retiro.
const ARREGLOS: Record<string, string> = { phases: "threePhases", "about-retreat": "richText" };

(async () => {
  const p = await getPayload({ config });
  const pgs = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  let rotos = 0, arreglados = 0;

  for (const pg of pgs) {
    const layout = [...(pg.layout || [])];
    const anclas = new Set(layout.map((b: any) => b.anchor).filter(Boolean));
    const destinos = new Set<string>();
    layout.forEach((b: any) => {
      [...(b.ctas || []), ...(b.cta ? [b.cta] : [])].forEach((c: any) => {
        const h = String(c?.href || "");
        if (h.startsWith("#")) destinos.add(h.slice(1));
      });
    });

    let cambio = false;
    for (const d of destinos) {
      if (anclas.has(d)) continue;
      rotos++;
      const tipo = ARREGLOS[d];
      const i = tipo ? layout.findIndex((b: any) => b.blockType === tipo && !b.anchor) : -1;
      if (i >= 0) {
        console.log(`  ${String(pg.slug).padEnd(34)} #${d}  ->  se lo pongo a la sección ${i + 1} (${tipo})`);
        layout[i] = { ...(layout[i] as any), anchor: d };
        cambio = true; arreglados++;
      } else {
        console.log(`  ${String(pg.slug).padEnd(34)} #${d}  ->  ROTO, no sé a qué sección corresponde`);
      }
    }
    if (cambio && !DRY) {
      await p.update({ collection: "pages", id: pg.id, data: { layout } as never, overrideAccess: true, draft: pg._status !== "published" });
    }
  }

  console.log(`\n${DRY ? "PRUEBA EN SECO — " : ""}enlaces rotos: ${rotos}, arreglados: ${arreglados}`);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
