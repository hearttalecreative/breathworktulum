import { getPayload } from "payload";
import config from "../payload.config";

// Fechas reales de publicación y limpieza de lo que arrastró el import.
//
// El scrape del sitio viejo se llevó, dentro del cuerpo, los muebles de la
// página: el enlace "All Posts", el título repetido y la línea de fecha, a veces
// con las categorías pegadas ("2 March 2025|Stress"). Eso es lo que ella veía
// como "formatos distintos": no eran formatos, era basura heredada, y por eso
// unos posts mostraban fecha y otros no.
//
// Las fechas verdaderas están en el RSS del sitio viejo, que sigue publicado.
//
// Guardas: no toca un post editado en la última media hora, ni pisa una fecha
// que ya exista.

const FEED = "https://breathworktulum.com/blog/f.rss";
const RECIENTE_MS = 30 * 60 * 1000;
const DATE_LINE = /^\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*(\|.*)?$/;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

(async () => {
  const rss = await (await fetch(FEED)).text();
  const byOld = new Map<string, string>();
  for (const m of rss.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const link = (m[1].match(/<link>([^<]*)<\/link>/) || [])[1] || "";
    const pub = (m[1].match(/<pubDate>([^<]*)<\/pubDate>/) || [])[1] || "";
    const slug = (link.match(/\/blog\/f\/([^/?#]+)/) || [])[1] || "";
    if (slug && pub) byOld.set(slug, new Date(pub).toISOString());
  }
  console.log("fechas en el RSS:", byOld.size);

  const p = await getPayload({ config });
  const posts = (await p.find({ collection: "posts", limit: 500, depth: 0, overrideAccess: true })).docs as any[];

  let fechas = 0, limpiados = 0, saltados = 0;
  for (const d of posts) {
    if (Date.now() - new Date(d.updatedAt).getTime() < RECIENTE_MS) {
      console.log("  saltado (editado recién):", d.slug);
      saltados++;
      continue;
    }

    const data: Record<string, unknown> = {};

    // Fecha, solo si no tiene.
    if (!d.publishedAt) {
      const old = String(d.oldPath || "").replace(/^\/blog\/f\//, "").replace(/\/$/, "");
      const date = byOld.get(old) || byOld.get(d.slug);
      if (date) { data.publishedAt = date; fechas++; }
    }

    // Las tres primeras líneas heredadas, y solo si están al principio.
    const root = d.body?.root;
    const kids: any[] = root?.children || [];
    const textOf = (n: any): string => {
      let t = "";
      const w = (x: any) => { if (typeof x?.text === "string") t += x.text; (x?.children || []).forEach(w); };
      w(n);
      return t.trim();
    };
    let cut = 0;
    for (const k of kids.slice(0, 4)) {
      const t = textOf(k);
      const esAllPosts = /^all posts$/i.test(t);
      const esTitulo = norm(t) === norm(String(d.title || ""));
      const esFecha = DATE_LINE.test(t);
      if (esAllPosts || esTitulo || esFecha) cut++;
      else break;
    }
    if (cut > 0) {
      data.body = { ...d.body, root: { ...root, children: kids.slice(cut) } };
      limpiados++;
    }

    if (Object.keys(data).length) {
      await p.update({ collection: "posts", id: d.id, data: data as never, overrideAccess: true });
    }
  }

  console.log(`\n@@@\nfechas puestas: ${fechas} | cuerpos limpiados: ${limpiados} | saltados: ${saltados}`);
  const after = (await p.find({ collection: "posts", limit: 500, depth: 0, overrideAccess: true })).docs as any[];
  console.log("posts con fecha:", after.filter((x: any) => x.publishedAt).length, "de", after.length);
  const ord = after.filter((x: any) => x.publishedAt).map((x: any) => String(x.publishedAt).slice(0, 10)).sort();
  console.log("rango:", ord[0], "..", ord[ord.length - 1]);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
