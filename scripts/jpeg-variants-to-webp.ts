import { getPayload } from "payload";
import config from "../payload.config";
import { put } from "@vercel/blob";
import sharp from "sharp";

// Recomprime a WebP las variantes que quedaron en JPEG.
//
// La colección Media pide WebP, pero 190 variantes se generaron antes con un
// script que guardaba JPEG. Pesan un 37% más de lo necesario, y eso se nota
// justo donde la clienta reportó lentitud: en el teléfono.
//
// El original no se toca: solo las variantes que sirve el srcset. Si algo falla
// en una imagen, esa se salta y las demás siguen.
//
// Correr con --dry para ver el plan sin escribir nada.

const DRY = process.argv.includes("--dry");
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const SITE = "https://breathworktulum.hearttalecreative.com";

const publicUrl = (u: string) => String(u || "").replace(/^https?:\/\/[^/]+/, SITE);

(async () => {
  if (!TOKEN && !DRY) throw new Error("falta BLOB_READ_WRITE_TOKEN");
  const p = await getPayload({ config });
  const docs = (await p.find({ collection: "media", limit: 1000, depth: 0, overrideAccess: true })).docs as any[];

  let convertidas = 0, saltadas = 0, fallidas = 0, antes = 0, despues = 0;

  for (const d of docs) {
    const sizes = { ...(d.sizes || {}) };
    let cambio = false;

    for (const [key, v] of Object.entries(sizes) as [string, any][]) {
      if (!v?.filename || !/\.jpe?g$/i.test(v.filename)) { continue; }

      try {
        const res = await fetch(publicUrl(v.url));
        if (!res.ok) { console.log(`  ✗ ${v.filename}: no se pudo descargar (${res.status})`); fallidas++; continue; }
        const src = Buffer.from(await res.arrayBuffer());
        const out = await sharp(src).webp({ quality: 80 }).toBuffer();

        // Si WebP no mejora, se deja el JPEG: no tiene sentido reescribir por peor.
        if (out.length >= src.length) { saltadas++; continue; }

        const filename = v.filename.replace(/\.jpe?g$/i, ".webp");
        // Sin prefijo: el almacenamiento guarda los archivos en la raíz, que es
        // donde Payload los busca. Con "media/" delante quedaban inalcanzables.
        const pathname = filename;
        if (!DRY) {
          await put(pathname, out, { access: "public", addRandomSuffix: false, token: TOKEN, contentType: "image/webp" });
        }

        antes += src.length; despues += out.length; convertidas++;
        sizes[key] = { ...v, filename, mimeType: "image/webp", filesize: out.length, url: `/api/media/file/${encodeURIComponent(filename)}` };
        cambio = true;
        console.log(`  ${Math.round(src.length / 1024)}KB -> ${Math.round(out.length / 1024)}KB  ${filename.slice(0, 46)}`);
      } catch (e) {
        console.log(`  ✗ ${v.filename}: ${(e as Error).message.slice(0, 60)}`);
        fallidas++;
      }
    }

    if (cambio && !DRY) {
      await p.update({ collection: "media", id: d.id, data: { sizes } as never, overrideAccess: true });
    }
  }

  console.log(`\n@@@
${DRY ? "PRUEBA EN SECO — no se escribió nada\n" : ""}convertidas: ${convertidas}
saltadas (WebP no mejoraba): ${saltadas}
fallidas: ${fallidas}
peso: ${(antes / 1024 / 1024).toFixed(1)} MB -> ${(despues / 1024 / 1024).toFixed(1)} MB  (-${antes ? Math.round(100 - (100 * despues) / antes) : 0}%)`);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
