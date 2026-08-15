import { getPayload } from "payload";
import config from "../payload.config";

// Blog como enlace directo en el menú del teléfono, entre About y Contact.
// Solo ahí: en la barra de escritorio se sacó a propósito para dar aire al logo,
// y ella pidió el menú hamburguesa.
(async () => {
  const p = await getPayload({ config });
  const h = (await p.findGlobal({ slug: "header" as never, overrideAccess: true })) as any;
  const primary = [...(h.primary || [])];

  if (primary.some((i: any) => /\/blog\/?$/.test(i.href || ""))) {
    console.log("Blog ya estaba en el menú");
  } else {
    const i = primary.findIndex((x: any) => /\/contact\/?$/.test(x.href || ""));
    const item = { label: "Blog", href: "/blog/", description: null, mobileOnly: true };
    primary.splice(i >= 0 ? i : primary.length, 0, item);
    await p.updateGlobal({
      slug: "header" as never,
      overrideAccess: true,
      data: { ...h, primary } as never,
    });
  }

  const after = (await p.findGlobal({ slug: "header" as never, overrideAccess: true })) as any;
  console.log("\n@@@");
  console.log("teléfono:   ", after.primary.map((i: any) => i.label).join(" > "));
  console.log("escritorio: ", after.primary.filter((i: any) => !i.mobileOnly).map((i: any) => i.label).join(" > "));
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
