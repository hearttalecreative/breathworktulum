import { getPayload } from "payload";
import sharp from "sharp";
import { put, head } from "@vercel/blob";
import config from "../payload.config";

// Fase 3 — build the variants missing from images uploaded before the sizes
// were configured.
//
// Payload only runs its image pipeline when it receives a file, and re-uploading
// would rewrite the stored original. So the derivatives are produced here with
// Sharp and written to Blob alongside the original, which is never touched.
//
// Idempotent: a variant already present in Blob or in the document is skipped.
//
//   --dry            report only
//   --limit=3        process at most N images
//   --batch=4        images per batch (default 4)
//   --pause=1200     ms between batches

const TARGETS: Record<string, number> = { thumbnail: 480, card: 960, wide: 1600, hero: 2400 };
const QUALITY = 80;
const MIN_FOR_FULLSCREEN = 2000;
// Originals are stored as relative paths, so they need an origin to fetch from.
// NEXT_PUBLIC_SERVER_URL points at localhost in dev, hence the --site override.
const strArg = (n: string, d: string) => {
  const hit = process.argv.find((a) => a.startsWith(`--${n}=`));
  return hit ? hit.split("=").slice(1).join("=") : d;
};
const SITE = strArg("site", process.env.NEXT_PUBLIC_SERVER_URL || "https://breathworktulum.hearttalecreative.com");

const numArg = (n: string, d: number) => {
  const hit = process.argv.find((a) => a.startsWith(`--${n}=`));
  return hit ? Number(hit.split("=")[1]) : d;
};
const DRY = process.argv.includes("--dry");
const LIMIT = numArg("limit", Number.POSITIVE_INFINITY);
const BATCH = numArg("batch", 4);
const PAUSE = numArg("pause", 1200);
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const stem = (f: string) => f.replace(/\.[^.]+$/, "");

async function fetchOriginal(url: string): Promise<Buffer> {
  // Payload absolutises stored URLs with serverURL, which is localhost in dev.
  // Keep only the path and re-anchor it on the site we were pointed at.
  const path = url.replace(/^https?:\/\/[^/]+/, "");
  const abs = `${SITE}${path}`;
  const res = await fetch(abs);
  if (!res.ok) throw new Error(`descarga falló: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

(async () => {
  if (!TOKEN && !DRY) throw new Error("falta BLOB_READ_WRITE_TOKEN");
  const p = await getPayload({ config });
  const all = (await p.find({ collection: "media", limit: 1000, depth: 0, overrideAccess: true })).docs as any[];

  const missingFor = (m: any) =>
    Object.entries(TARGETS).filter(([name, t]) => !m.sizes?.[name]?.url && (Number(m.width) || 0) > t);

  const todo = all.filter((m) => missingFor(m).length > 0);
  const slice = Number.isFinite(LIMIT) ? todo.slice(0, LIMIT) : todo;

  console.log(`biblioteca: ${all.length} | con variantes faltantes: ${todo.length} | a procesar ahora: ${slice.length}${DRY ? "  (DRY RUN)" : ""}`);
  slice.forEach((m) => console.log(`   ${m.filename} (${m.width}px) → ${missingFor(m).map(([n]) => n).join(", ")}`));
  if (DRY) { console.log("\ndry run: no se modificó nada"); process.exit(0); }

  const t0 = Date.now();
  let generated = 0, skipped = 0, failed = 0, touched = 0;

  for (let i = 0; i < slice.length; i += BATCH) {
    for (const m of slice.slice(i, i + BATCH)) {
      const want = missingFor(m);
      try {
        const original = await fetchOriginal(m.url as string);
        const patch: Record<string, unknown> = {};

        for (const [name, target] of want) {
          const img = sharp(original).rotate();
          const meta = await img.metadata();
          if ((meta.width || 0) <= target) { skipped++; continue; }

          const out = await img.resize({ width: target, withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer();
          const outMeta = await sharp(out).metadata();
          const pathname = `${stem(m.filename as string)}-${outMeta.width}x${outMeta.height}.webp`;

          // Never overwrite something already in the store.
          const exists = await head(pathname, { token: TOKEN }).then(() => true).catch(() => false);
          if (!exists) await put(pathname, out, { access: "public", addRandomSuffix: false, token: TOKEN, contentType: "image/webp" });

          patch[name] = {
            url: `/api/media/file/${pathname}`,
            width: outMeta.width,
            height: outMeta.height,
            mimeType: "image/webp",
            filesize: out.length,
            filename: pathname,
          };
          generated++;
        }

        if (Object.keys(patch).length) {
          await p.update({
            collection: "media",
            id: m.id,
            data: { sizes: { ...(m.sizes || {}), ...patch } } as any,
            overrideAccess: true,
          });
          touched++;
        }
        console.log(`  ok  ${m.filename}: +${Object.keys(patch).length} (${Object.keys(patch).join(", ") || "ninguna"})`);
      } catch (e) {
        failed++;
        console.log(`  ERR ${m.filename}: ${(e as Error).message}`);
      }
    }
    if (i + BATCH < slice.length) await sleep(PAUSE);
  }

  console.log(`\nvariantes nuevas: ${generated} | documentos actualizados: ${touched} | salteadas: ${skipped} | fallidas: ${failed} | ${Math.round((Date.now() - t0) / 1000)}s`);

  const tooSmall = all.filter((m) => (Number(m.width) || 0) < MIN_FOR_FULLSCREEN);
  console.log(`\n### ORIGINALES INSUFICIENTES (<${MIN_FOR_FULLSCREEN}px de ancho): ${tooSmall.length}`);
  console.log("necesitan archivo nuevo, el procesamiento no los arregla\n");
  tooSmall.sort((a, b) => (Number(a.width) || 0) - (Number(b.width) || 0))
    .forEach((m) => console.log(`   ${String(m.width).padStart(5)}px  ${m.filename}`));
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
