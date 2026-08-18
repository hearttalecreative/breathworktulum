import { getPayload } from "payload";
import config from "../payload.config";

// El CTA de cierre de Home, About, Gallery y Private Sessions usa el contexto
// "general", que traía el mensaje genérico de reserva. Ella escribió el texto
// que quiere que se abra en WhatsApp.

const DRY = process.argv.includes("--dry");
const CTX = "general";
const MSG =
  "Hi Sabine, I'm thinking about a private session, but I'm not yet sure which format would be right for me. Could you please guide me?";

(async () => {
  const p = await getPayload({ config });
  const st = (await p.findGlobal({ slug: "siteSettings", overrideAccess: true })) as any;
  const msgs = [...(st.whatsappMessages || [])];
  const i = msgs.findIndex((m: any) => m.context === CTX);
  if (i < 0) throw new Error(`no existe el contexto ${CTX}`);

  console.log(`contexto: ${CTX}`);
  console.log(`  antes:  ${msgs[i].message}`);
  console.log(`  ahora:  ${MSG}`);

  if (DRY) { console.log("\nPRUEBA EN SECO — no se escribió nada"); process.exit(0); }

  msgs[i] = { ...msgs[i], message: MSG };
  await p.updateGlobal({ slug: "siteSettings", data: { whatsappMessages: msgs } as never, overrideAccess: true });

  const check = (await p.findGlobal({ slug: "siteSettings", overrideAccess: true })) as any;
  const g = (check.whatsappMessages || []).find((m: any) => m.context === CTX);
  console.log(`\nguardado: ${g.message === MSG ? "ok" : "NO COINCIDE"}`);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
