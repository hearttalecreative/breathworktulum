import { getPayload } from "payload";
import config from "../payload.config";

// Fase 0, punto 4 — inventario de imágenes en uso: resolución real, ancho al que
// se muestran, peso, y qué variantes existen ya. Read-only.

const DISPLAY_WIDTH: Record<string, number> = {
  "hero:fullBleed": 2560,
  "hero:split": 1280,
  mediaFeature_fullScreen: 2560,
  mediaFeature_portrait: 1150,
  mediaFeature_band: 2560,
  photoBand: 2560,
  signatureBand: 2560,
  splitImageText: 1280,
  threePhases: 1280,
  situations: 900,
  waysGrid: 620,
  gallery: 640,
  formatDetail: 1280,
  post_hero: 960,
  og: 1200,
};

const VARIANTS = ["thumbnail", "card", "wide", "hero"] as const;

(async () => {
  const p = await getPayload({ config });
  const pages = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  const posts = (await p.find({ collection: "posts", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  const media = (await p.find({ collection: "media", limit: 1000, depth: 0, overrideAccess: true })).docs as any[];

  const usage = new Map<number, Set<string>>();
  const note = (id: unknown, ctx: string) => {
    const n = typeof id === "number" ? id : (id as any)?.id;
    if (typeof n !== "number") return;
    if (!usage.has(n)) usage.set(n, new Set());
    usage.get(n)!.add(ctx);
  };
  for (const d of pages) {
    for (const b of d.layout || []) {
      const kind =
        b.blockType === "hero" ? `hero:${b.variant || "split"}`
        : b.blockType === "mediaFeature" ? `mediaFeature_${b.format || "fullScreen"}`
        : b.blockType;
      note(b.image, kind);
      (b.cards || []).forEach((c: any) => note(c.image, "waysGrid"));
      (b.images || []).forEach((c: any) => note(c.image, "gallery"));
    }
    note(d.ogImage, "og");
  }
  for (const d of posts) { note(d.heroImage, "post_hero"); note(d.ogImage, "og"); }

  const rows = media
    .filter((m) => usage.has(m.id))
    .map((m) => {
      const ctxs = [...usage.get(m.id)!];
      const need = Math.max(...ctxs.map((c) => DISPLAY_WIDTH[c] ?? 1280));
      const w = Number(m.width) || 0;
      const have = VARIANTS.filter((v) => m.sizes?.[v]?.url);
      const missing = VARIANTS.filter((v) => {
        const target = { thumbnail: 480, card: 960, wide: 1600, hero: 2400 }[v];
        return !m.sizes?.[v]?.url && w > target; // sólo faltan las que el original permite
      });
      return {
        file: m.filename as string,
        w, h: Number(m.height) || 0,
        kb: Math.round((Number(m.filesize) || 0) / 1024),
        need, ratio: w ? need / w : 0,
        have: have.join(","), missing: missing.join(","),
        ctxs: ctxs.join(", "),
      };
    })
    .sort((a, b) => b.ratio - a.ratio);

  console.log("ESTADO    ARCHIVO                                    REAL        USO     PESO    VARIANTES        FALTAN");
  for (const r of rows) {
    const state = r.ratio > 1.35 ? "ESTIRADA" : r.ratio > 1.0 ? "justa   " : "ok      ";
    console.log(
      `${state}  ${r.file.slice(0, 40).padEnd(41)} ${(r.w + "x" + r.h).padEnd(11)} ${(r.need + "px").padEnd(7)} ${(r.kb + "KB").padEnd(7)} ${(r.have || "-").padEnd(16)} ${r.missing || "-"}`
    );
  }

  const insufficient = rows.filter((r) => r.need >= 1920 && r.w < 2000);
  console.log(`\n### ORIGINALES INSUFICIENTES (<2000px de ancho usados a >=1920px): ${insufficient.length}`);
  insufficient.forEach((r) => console.log(`   ${r.file}  ${r.w}x${r.h}  se usa a ${r.need}px  (${r.ctxs})`));

  const regen = rows.filter((r) => r.missing);
  console.log(`\n### CON VARIANTES FALTANTES QUE EL ORIGINAL SÍ PERMITE: ${regen.length}`);
  regen.forEach((r) => console.log(`   ${r.file}  (${r.w}px)  faltan: ${r.missing}`));

  const totalMissing = media.filter((m) => {
    const w = Number(m.width) || 0;
    return VARIANTS.some((v) => !m.sizes?.[v]?.url && w > { thumbnail: 480, card: 960, wide: 1600, hero: 2400 }[v]);
  }).length;
  console.log(`\nen uso: ${rows.length} | biblioteca: ${media.length} | con variantes faltantes en toda la biblioteca: ${totalMissing}`);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
