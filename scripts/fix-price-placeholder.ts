import { getPayload } from "payload";
import config from "../payload.config";

// La fila "Investment: [price]" estaba publicada con el placeholder a la vista.
// Su precio del 1-Day de grupo no está en ningún material suyo (los precios que
// mandó son de sesiones 1:1 y de couples), así que la fila sale hasta que lo
// confirme. Un placeholder visible es peor que una fila menos.

(async () => {
  const p = await getPayload({ config });
  const d = (await p.find({ collection: "pages", where: { slug: { equals: "work-with-me/group-practice" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;

  let removed = 0;
  const layout = (d.layout || []).map((b: any) => {
    if (!Array.isArray(b.rows)) return b;
    const rows = b.rows.filter((r: any) => !/\[price\]|\[precio\]/i.test(r?.value || ""));
    removed += b.rows.length - rows.length;
    return { ...b, rows };
  });

  await p.update({ collection: "pages", id: d.id, data: { layout } as any, overrideAccess: true });
  console.log("filas con placeholder eliminadas:", removed);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
