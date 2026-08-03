import { getPayload } from "payload";
import config from "../payload.config";

// Read-only audit for brief L-2, L-3 and L-4. Reports; deletes nothing.

// ---------- L-2: editing notes accidentally published ----------
const NOTE_PATTERNS: [string, RegExp][] = [
  ["TO BE REVISED", /TO BE REVISED/i],
  ["NEEDS TO BE …", /NEEDS? TO BE (REVISED|REPLACED|CHANGED|ADDED|DONE|FIXED|MOVED)/i],
  // La versión imperativa se escapó del barrido anterior: "NEED SPACE | FOR THIS
  // NEXT SENTENCE", "NEED HERE: ...". Cubrir NEED en mayúsculas, sea cual sea
  // lo que siga.
  ["NEED … (imperativo)", /\bNEED\b[^a-z]{0,3}[A-Z]/],
  ["NOT CORRECT", /NOT CORRECT/i],
  ["TBC / TBD", /\bTB[CD]\b/],
  ["CHANGE …", /\bCHANGE (ITEMS|THIS|TEXT|COPY|FONT|COLOU?R)\b/i],
  ["REPLACE …", /\bREPLACE (THIS|IMAGE|BANNER|TEXT|WITH)\b/i],
  ["INSERT / ADD …", /\b(INSERT|ADD) (HERE|THIS|IMAGE|TEXT|A )\b/i],
  ["FIX …", /\bFIX (THIS|HERE|IT)\b/i],
  ["nota con pipe", /[A-Z]{3,}[^|]{0,40}\|\s*[A-Z]{3,}/],
  ["flecha >>> o >>", />{2,}/],
  ["placeholder XX+", /\bX{3,}\b/],
  ["MAYÚSCULAS sostenidas", /(?:^|[.!?]\s)[A-Z][A-Z ,'’-]{18,}[.:!?]/],
  ["nota entre paréntesis", /\((?:sabine|sergio|pending|tbd|note|nota)[^)]{0,60}\)/i],
  ["placeholder corchetes", /\[(?:price|precio|tbd|pending|link|url|texto|text)[^\]]{0,30}\]/i],
];

// ---------- L-3: leftovers from the July audit ----------
const OLD_AUDIT: [string, RegExp][] = [
  ["Booking link coming soon", /booking link coming soon/i],
  ["$[price on inquiry]", /price on (inquiry|request)/i],
  ["Q1 2026", /\bQ1\s*20(26|25)\b/i],
  ["2nd person FOR FREE", /2nd person|second person free|for free/i],
];

// ---------- L-4: how wide each block actually displays its image ----------
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
};

type Hit = { where: string; field: string; pattern: string; text: string };

function walk(node: unknown, path: string, out: (p: string, v: string) => void) {
  if (typeof node === "string") { out(path, node); return; }
  if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${path}[${i}]`, out)); return; }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === "id" || k === "createdAt" || k === "updatedAt") continue;
      walk(v, path ? `${path}.${k}` : k, out);
    }
  }
}

(async () => {
  const p = await getPayload({ config });
  const pages = (await p.find({ collection: "pages", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  const posts = (await p.find({ collection: "posts", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  const media = (await p.find({ collection: "media", limit: 1000, depth: 0, overrideAccess: true })).docs as any[];
  const globals = await Promise.all(
    ["header", "footer", "siteSettings", "chatSettings"].map(async (slug) => ({
      slug, doc: await p.findGlobal({ slug: slug as any, overrideAccess: true }),
    }))
  );

  const notes: Hit[] = [];
  const old: Hit[] = [];
  const scan = (label: string, doc: unknown) => {
    walk(doc, "", (field, text) => {
      const t = text.trim();
      if (!t || t.length > 600) return;
      for (const [name, rx] of NOTE_PATTERNS) if (rx.test(t)) notes.push({ where: label, field, pattern: name, text: t.slice(0, 160) });
      for (const [name, rx] of OLD_AUDIT) if (rx.test(t)) old.push({ where: label, field, pattern: name, text: t.slice(0, 160) });
    });
  };

  pages.forEach((d) => scan(`page /${d.slug}`, d));
  posts.forEach((d) => scan(`post /blog/${d.slug}`, d));
  media.forEach((m) => scan(`media #${m.id} ${m.filename}`, { alt: m.alt, filename: m.filename }));
  globals.forEach((g) => scan(`global ${g.slug}`, g.doc));

  console.log("\n########## L-2 — POSIBLES NOTAS DE EDICIÓN ##########");
  console.log(`total: ${notes.length}\n`);
  notes.forEach((h) => console.log(`[${h.pattern}]\n  dónde : ${h.where}\n  campo : ${h.field}\n  texto : ${h.text}\n`));

  console.log("\n########## L-3 — PENDIENTES DE LA AUDITORÍA DE JULIO ##########");
  console.log(`total: ${old.length}\n`);
  old.forEach((h) => console.log(`[${h.pattern}]\n  dónde : ${h.where}\n  campo : ${h.field}\n  texto : ${h.text}\n`));

  // ---------- L-4 ----------
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
      const maxW = Math.max(...ctxs.map((c) => DISPLAY_WIDTH[c] ?? 1280));
      const w = Number(m.width) || 0;
      const ratio = w ? maxW / w : 0;
      return { file: m.filename, w, h: Number(m.height) || 0, kb: Math.round((Number(m.filesize) || 0) / 1024), maxW, ratio, ctxs: ctxs.join(", ") };
    })
    .sort((a, b) => b.ratio - a.ratio);

  console.log("\n########## L-4 — IMÁGENES EN USO ##########");
  console.log("estirada = el ancho de uso supera el ancho real del archivo\n");
  console.log("ESTADO   ARCHIVO                                        REAL        USO      PESO     DONDE");
  for (const r of rows) {
    const state = r.ratio > 1.35 ? "ESTIRADA" : r.ratio > 1.0 ? "justa   " : "ok      ";
    console.log(
      `${state} ${r.file.slice(0, 44).padEnd(45)} ${String(r.w + "x" + r.h).padEnd(11)} ${String(r.maxW + "px").padEnd(8)} ${String(r.kb + "KB").padEnd(8)} ${r.ctxs}`
    );
  }
  const heavy = rows.filter((r) => r.kb > 800);
  console.log(`\npesadas (>800KB, se sirven enteras sin optimizador): ${heavy.length}`);
  heavy.forEach((r) => console.log(`   ${r.kb}KB  ${r.file}`));
  console.log(`\nmedia total en la biblioteca: ${media.length} | en uso: ${rows.length}`);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
