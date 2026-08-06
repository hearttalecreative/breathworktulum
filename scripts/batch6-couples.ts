import { getPayload } from "payload";
import config from "../payload.config";

// BATCH #6 — Couples & Shared Immersive.
//
// Su copy no se toca ni se inventa: lo que cambia es el nombre del menú que
// ella pidió, el link roto del CTA, y la presentación visual. Las fotos salen
// de su propia biblioteca y las puede cambiar desde el panel.

const IMG = {
  hero: 169,      // pareja en eye-gazing, su foto actual del hero
  working: 17,    // pareja descansando en el deck sobre el Caribe
  breath: 159,    // cala privada de DiamanteK, respiro sin texto
  closing: 161,   // pareja abrazada después de una sesión
};

// Sección 4 — su texto, partido en titular y párrafo. El número lo pone el
// diseño, así que sale del texto para no duplicarlo.
const splitStage = (raw: string): { title: string; text: string } => {
  const clean = raw.replace(/^\s*\d+\.\s*/, "");
  const [first, ...rest] = clean.split(/\n\s*\n/);
  return { title: (first || "").trim(), text: rest.join("\n\n").trim() || (first || "").trim() };
};

(async () => {
  const p = await getPayload({ config });

  // ---------- El menú ----------
  const header = (await p.findGlobal({ slug: "header" as never, overrideAccess: true })) as any;
  const renameCouples = (arr: any[]) =>
    (arr || []).map((it) =>
      /\/work-with-me\/couples\/?$/.test(it.href || "")
        ? { ...it, label: "Couples & Shared Immersive", description: "A shared space for two." }
        : it
    );
  await p.updateGlobal({
    slug: "header" as never,
    overrideAccess: true,
    data: {
      workWithMe: renameCouples(header.workWithMe),
      retreats: header.retreats,
      // El dropdown propio de Couples se descartó en su momento; el array quedó
      // huérfano y no lo lee nadie.
      couples: [],
      primary: header.primary,
    } as never,
  });

  // ---------- La página ----------
  const d = (
    await p.find({
      collection: "pages",
      where: { slug: { equals: "work-with-me/couples" } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
  ).docs[0] as any;

  const src: any[] = d.layout || [];
  const hero = src.find((b) => b.blockType === "hero");
  const attention = src.find((b) => /wants attention/i.test(b.heading || ""));
  const different = src.find((b) => /different way of working/i.test(b.heading || ""));
  const unfolds = src.find((b) => /immersive experience unfolds/i.test(b.heading || ""));
  const closing = src.find((b) => b.blockType === "ctaSection");

  // S1 — apertura a pantalla completa. El campo Video URL queda listo para
  // cuando tenga el clip; mientras tanto se ve la foto.
  hero.variant = "fullBleed";
  hero.image = IMG.hero;
  hero.textPlacement = "over";
  hero.videoUrl = hero.videoUrl || "";
  // G-2 — el CTA apuntaba a Private Sessions desde la propia página de Couples.
  hero.ctas = (hero.ctas || []).map((c: any) =>
    /private-sessions/.test(c.href || "") ? { ...c, href: "#how-it-unfolds" } : c
  );

  // S3 — el titular y la entrada pasan sobre la foto; los tres párrafos que
  // explican el trabajo se quedan sobre fondo limpio, que es donde se leen.
  const differentBand = {
    blockType: "mediaFeature",
    format: "fullScreen",
    image: IMG.working,
    videoUrl: "",
    eyebrow: "The work",
    heading: different?.heading || "",
    body: different?.intro || "",
    ctas: [],
    tone: "night",
  };
  const differentBody = {
    blockType: "list",
    layout: "list",
    heading: "What that looks like in practice.",
    intro: "",
    items: different?.items || [],
    tone: "cream",
    width: "narrow",
  };

  // S4 — etapas numeradas, con titular y párrafo en campos separados.
  unfolds.layout = "stages";
  unfolds.anchor = "how-it-unfolds";
  unfolds.items = (unfolds.items || []).map((it: any) => ({ ...it, ...splitStage(it.text || "") }));

  // OTHER-1 — un respiro visual sin texto antes del cierre.
  const breather = {
    blockType: "mediaFeature",
    format: "band",
    image: IMG.breath,
    videoUrl: "",
    eyebrow: "",
    heading: "",
    body: "",
    ctas: [],
    tone: "night",
  };

  // S5 — el cierre deja de ser texto y botón sueltos: foto de un lado, la
  // invitación del otro. Su copy se conserva.
  const closingSplit = {
    blockType: "mediaFeature",
    format: "portrait",
    image: IMG.closing,
    videoUrl: "",
    eyebrow: "",
    heading: closing?.heading || "Start a conversation.",
    body: closing?.body || "",
    ctas: closing?.ctas || [],
    tone: "sand",
  };

  const layout = [hero, attention, differentBand, differentBody, unfolds, breather, closingSplit].filter(Boolean);
  await p.update({ collection: "pages", id: d.id, data: { layout } as never, overrideAccess: true });

  // ---------- Home ----------
  // El hero full-bleed dejó de tener el video fijo en el código, así que el de
  // la home pasa a vivir en el bloque. Mismo video, mismo corte de loop.
  const home = (
    await p.find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1, depth: 0, overrideAccess: true })
  ).docs[0] as any;
  const homeLayout = (home.layout || []).map((b: any) =>
    b.blockType === "hero" && b.variant === "fullBleed"
      ? { ...b, videoUrl: "https://vimeo.com/773408641/7c81c6bfcc", videoTrim: 25.8 }
      : b
  );
  await p.update({ collection: "pages", id: home.id, data: { layout: homeLayout } as never, overrideAccess: true });

  // ---------- Verificación ----------
  const after = (
    await p.find({ collection: "pages", where: { slug: { equals: "work-with-me/couples" } }, limit: 1, depth: 0, overrideAccess: true })
  ).docs[0] as any;
  console.log("\n@@@");
  console.log("bloques:", (after.layout || []).map((b: any) => `${b.blockType}${b.format ? ":" + b.format : ""}${b.layout ? ":" + b.layout : ""}`).join(" > "));
  const st = (after.layout || []).find((b: any) => b.layout === "stages");
  console.log("etapas:", (st?.items || []).map((i: any) => `[${i.title}]`).join(" "));
  console.log("hero:", after.layout?.[0]?.variant, "| CTAs:", JSON.stringify((after.layout?.[0]?.ctas || []).map((c: any) => c.href || c.action)));
  const h2 = (await p.findGlobal({ slug: "header" as never, overrideAccess: true })) as any;
  console.log("menu:", h2.workWithMe.map((i: any) => i.label).join(" | "));
  const hm = (await p.find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  const hh = (hm.layout || []).find((b: any) => b.blockType === "hero");
  console.log("home hero video:", hh?.videoUrl, "| trim:", hh?.videoTrim, "| image:", hh?.image);
  process.exit(0);
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
