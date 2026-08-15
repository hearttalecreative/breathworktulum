import { getPayload } from "payload";
import config from "../payload.config";

// La acción de WhatsApp pisaba la variante elegida, así que durante meses el
// campo no hizo nada y quedaron valores puestos al azar. Ahora que la elección
// manda, esos valores cambiarían el aspecto de nueve botones que nadie pidió
// tocar. Se normalizan al botón de WhatsApp de siempre.
//
// La excepción es el hero de Private Sessions, donde la clienta pidió
// expresamente que WhatsApp baje a enlace de texto.
const EXCEPCION = "work-with-me/private-sessions";
const RECIENTE_MS = 30 * 60 * 1000;

(async () => {
  const p = await getPayload({ config });
  const pages = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  let tocadas = 0, botones = 0;

  for (const d of pages) {
    if (Date.now() - new Date(d.updatedAt).getTime() < RECIENTE_MS) {
      console.log("  saltada (editada recién):", d.slug);
      continue;
    }
    let cambio = false;
    const fix = (c: any) => {
      if (c?.action === "whatsapp" && c.variant !== "whatsapp") {
        if (d.slug === EXCEPCION && c.variant === "secondary") return c; // lo pedido
        console.log(`  /${d.slug}  "${c.label}"  ${c.variant} -> whatsapp`);
        cambio = true; botones++;
        return { ...c, variant: "whatsapp" };
      }
      return c;
    };
    const layout = (d.layout || []).map((b: any) => ({
      ...b,
      ...(b.ctas ? { ctas: b.ctas.map(fix) } : {}),
      ...(b.cta ? { cta: fix(b.cta) } : {}),
    }));
    if (cambio) { await p.update({ collection: "pages", id: d.id, data: { layout } as never, overrideAccess: true }); tocadas++; }
  }
  console.log(`\n@@@\npáginas tocadas: ${tocadas} | botones normalizados: ${botones}`);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
