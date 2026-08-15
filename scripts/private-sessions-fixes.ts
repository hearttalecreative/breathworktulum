import { getPayload } from "payload";
import config from "../payload.config";

// Ajustes de la página de Private Sessions pedidos por la clienta.
// Guarda: no toca la página si la editó en la última media hora.
const RECIENTE_MS = 30 * 60 * 1000;

(async () => {
  const p = await getPayload({ config });
  const d = (await p.find({ collection: "pages", where: { slug: { equals: "work-with-me/private-sessions" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;

  if (Date.now() - new Date(d.updatedAt).getTime() < RECIENTE_MS) {
    console.log("SALTADO: la página se editó hace menos de 30 minutos");
    process.exit(0);
  }

  const layout = [...(d.layout || [])];
  const cambios: string[] = [];

  // Hero: el botón de formatos pasa a dorado y apunta a un ancla que existe.
  // "#compare" no correspondía a ninguna sección, así que no hacía nada.
  const hero = layout.find((b: any) => b.blockType === "hero");
  hero.ctas = (hero.ctas || []).map((c: any) => {
    if (/explore session formats/i.test(c.label || "")) {
      cambios.push(`hero: "${c.label}" ${c.variant} -> gold, ${c.href} -> #foundation`);
      return { ...c, variant: "gold", href: "#foundation" };
    }
    if (c.action === "whatsapp") {
      cambios.push(`hero: "${c.label}" ${c.variant} -> secondary`);
      return { ...c, variant: "secondary" };
    }
    return c;
  });

  // Couples: botón dorado con flecha, sin ícono de WhatsApp.
  const couples = layout.find((b: any) => b.anchor === "couples");
  if (couples?.cta) {
    cambios.push(`couples: "${couples.cta.label}" ${couples.cta.variant} -> gold`);
    couples.cta = { ...couples.cta, variant: "gold" };
    // Y fondo distinto: venía en el mismo tono que la sección de arriba, así que
    // las dos se leían como una sola.
    cambios.push(`couples: fondo ${couples.tone} -> cream`);
    couples.tone = "cream";
  }

  await p.update({ collection: "pages", id: d.id, data: { layout } as never, overrideAccess: true });
  console.log("\n@@@");
  cambios.forEach((c) => console.log("  " + c));

  const after = (await p.find({ collection: "pages", where: { slug: { equals: "work-with-me/private-sessions" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  console.log("\ncomprobación:");
  (after.layout || []).forEach((b: any, i: number) => {
    const cs = b.ctas || (b.cta ? [b.cta] : []);
    cs.forEach((c: any) => console.log(`  [${i}] ${b.blockType} tone=${b.tone ?? "-"}  "${c.label}" variant=${c.variant} href=${c.href ?? "-"}`));
  });
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
