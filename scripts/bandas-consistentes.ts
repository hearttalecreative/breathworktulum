import { getPayload } from "payload";
import config from "../payload.config";

// Unifica el tratamiento de las bandas de foto: mismo alto y mismo color en
// todo el sitio. Con el velo nuevo el dorado se lee sobre cualquier foto, así
// que el blanco deja de hacer falta.

const DRY = process.argv.includes("--dry");
const ALTO = "standard";
const COLOR = "gold";

(async () => {
  const p = await getPayload({ config });
  const pgs = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  let tocadas = 0;

  for (const pg of pgs) {
    const layout = [...(pg.layout || [])];
    let cambio = false;
    layout.forEach((b: any, i: number) => {
      if (b.blockType !== "photoBand") return;
      const alto = b.height || "tall";
      const color = b.eyebrowColor || "gold";
      if (alto === ALTO && color === COLOR) return;
      console.log(`  ${String(pg.slug).padEnd(36)} #${i + 1}  alto ${alto} -> ${ALTO} | color ${color} -> ${COLOR}`);
      layout[i] = { ...b, height: ALTO, eyebrowColor: COLOR };
      cambio = true;
      tocadas++;
    });
    if (cambio && !DRY) {
      await p.update({ collection: "pages", id: pg.id, data: { layout } as never, overrideAccess: true, draft: pg._status !== "published" });
    }
  }

  console.log(`\n${DRY ? "PRUEBA EN SECO — " : ""}bandas ajustadas: ${tocadas}`);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
