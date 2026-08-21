import { getPayload } from "payload";
import config from "../payload.config";

// Los cuatro mensajes que escribió ella, cada uno en el botón de WhatsApp de la
// sección de cierre de su página. Antes compartían un solo texto.

const DRY = process.argv.includes("--dry");

const TEXTOS: Record<string, string> = {
  home: "Hi Sabine, I've been exploring your website and would like some guidance on which session or retreat might be right for me.",
  about: "Hi Sabine, after reading more about you and your approach, I would like to explore working with you. Could you please guide me towards the most suitable next step?",
  gallery: "Hi Sabine, after looking through the Gallery, I would like to ask about a private session or retreat. Could you please guide me?",
  "work-with-me/private-sessions": "Hi Sabine, I'm thinking about a private session, but I'm not yet sure which format would be right for me. Could you please guide me?",
};

(async () => {
  const p = await getPayload({ config });
  const pgs = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];

  for (const [slug, texto] of Object.entries(TEXTOS)) {
    const pg = pgs.find((x) => String(x.slug) === slug);
    if (!pg) { console.log(`  ${slug}: no encontrada`); continue; }
    const layout = [...(pg.layout || [])];

    // el último bloque con un CTA de WhatsApp: la sección de cierre
    let idx = -1;
    layout.forEach((b: any, i) => {
      if ((b.ctas || []).some((c: any) => c?.action === "whatsapp")) idx = i;
    });
    if (idx < 0) { console.log(`  ${slug}: sin botón de WhatsApp`); continue; }

    const b: any = layout[idx];
    const ctas = (b.ctas || []).map((c: any) =>
      c?.action === "whatsapp" ? { ...c, whatsappMessage: texto } : c
    );
    const et = (b.ctas || []).find((c: any) => c?.action === "whatsapp");
    console.log(`  ${slug.padEnd(32)} sección ${idx + 1}  botón "${et?.label}"`);
    console.log(`      ${texto.slice(0, 74)}…`);
    layout[idx] = { ...b, ctas };
    if (!DRY) await p.update({ collection: "pages", id: pg.id, data: { layout } as never, overrideAccess: true, draft: pg._status !== "published" });
  }
  console.log(DRY ? "\nPRUEBA EN SECO" : "\nguardado");
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message.slice(0,90)); process.exit(1); });
