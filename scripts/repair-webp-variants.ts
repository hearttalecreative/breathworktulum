import { getPayload } from "payload";
import config from "../payload.config";
import { put, head } from "@vercel/blob";
import sharp from "sharp";

// Reparación: las variantes WebP se subieron con el prefijo "media/", donde
// Payload no las busca, así que quedaron en 404. Los JPEG originales siguen en
// el almacenamiento, así que se reconvierten y se suben a la raíz.
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const SITE = "https://breathworktulum.hearttalecreative.com";

(async () => {
  if (!TOKEN) throw new Error("falta BLOB_READ_WRITE_TOKEN");
  const p = await getPayload({ config });
  const docs = (await p.find({ collection: "media", limit: 1000, depth: 0, overrideAccess: true })).docs as any[];
  let ok = 0, yaEstaba = 0, fallo = 0;

  for (const d of docs) {
    for (const v of Object.values(d.sizes || {}) as any[]) {
      if (!v?.filename || !/\.webp$/i.test(v.filename)) continue;
      const existe = await head(v.filename, { token: TOKEN }).then(() => true).catch(() => false);
      if (existe) { yaEstaba++; continue; }

      const jpg = v.filename.replace(/\.webp$/i, ".jpg");
      try {
        const res = await fetch(`${SITE}/api/media/file/${encodeURIComponent(jpg)}`);
        if (!res.ok) { console.log(`  ✗ no está el jpeg de ${v.filename}`); fallo++; continue; }
        const out = await sharp(Buffer.from(await res.arrayBuffer())).webp({ quality: 80 }).toBuffer();
        await put(v.filename, out, { access: "public", addRandomSuffix: false, token: TOKEN, contentType: "image/webp" });
        ok++;
        if (ok % 25 === 0) console.log(`  ...${ok} reparadas`);
      } catch (e) { console.log(`  ✗ ${v.filename}: ${(e as Error).message.slice(0, 50)}`); fallo++; }
    }
  }
  console.log(`\n@@@\nreparadas: ${ok} | ya estaban: ${yaEstaba} | fallidas: ${fallo}`);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
