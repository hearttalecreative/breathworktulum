import { getPayload } from "payload";
import config from "../payload.config";

// Las fotos de pareja de su biblioteca son verticales, así que en las bandas
// horizontales el recorte centrado les corta la cara. El punto focal fija qué
// parte se conserva. Ella lo puede mover desde el panel, en cada imagen.
const FOCAL: [number, number, number, string][] = [
  [169, 50, 32, "hero: las caras están arriba"],
  [17, 50, 68, "banda: la pareja está en la mitad de abajo"],
  [159, 55, 60, "banda ancha: conserva horizonte y palmeras, saca cielo vacío"],
  [161, 50, 45, "cierre: casi no recorta"],
];

(async () => {
  const p = await getPayload({ config });
  for (const [id, x, y, why] of FOCAL) {
    await p.update({ collection: "media", id, data: { focalX: x, focalY: y } as never, overrideAccess: true });
    const m = (await p.findByID({ collection: "media", id, overrideAccess: true })) as any;
    console.log(`#${id} ${String(m.filename).slice(0, 40).padEnd(41)} focal ${m.focalX}/${m.focalY}  — ${why}`);
  }
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
