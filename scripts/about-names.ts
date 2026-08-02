import { getPayload } from "payload";
import config from "../payload.config";

// Her rewrite drops the employer names on purpose ("an international corporate
// career ... across seven countries"). Align the About training list with that.
// The Corporate page also names them — left alone, flagged for confirmation.
const FROM = /Twenty years of international corporate experience, including global management and leadership roles at Orbitz and Booking\.com\./i;
const TO = "Twenty years of international corporate experience, including global management and leadership roles across seven countries.";

(async () => {
  const p = await getPayload({ config });
  const d = (await p.find({ collection: "pages", where: { slug: { equals: "about" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  let n = 0;
  const layout = (d.layout || []).map((b: any) =>
    b.items
      ? { ...b, items: b.items.map((it: any) => (FROM.test(it.text || "") ? (n++, { ...it, text: TO }) : it)) }
      : b
  );
  if (n) await p.update({ collection: "pages", id: d.id, data: { layout } as any, overrideAccess: true });
  const after = JSON.stringify((await p.find({ collection: "pages", where: { slug: { equals: "about" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]);
  console.log("items rewritten:", n, "| Orbitz/Booking left on About:", /Orbitz|Booking/.test(after));
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
