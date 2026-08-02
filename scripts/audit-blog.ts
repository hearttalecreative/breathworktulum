import { getPayload } from "payload";
import config from "../payload.config";

// Read-only audit of the migrated posts (brief B-4 / B-6 / B-8).
const MOJIBAKE = [
  "â", // â€™  curly apostrophe
  "â", // â€œ  open quote
  "â", // â€  close quote
  "â", // â€"  em dash
  "â¢", // â„¢  trademark
  "â¦", // â€¦  ellipsis
  "ï»¿", // BOM
  "Â",             // stray Â
  "&nbsp;",
  "&amp;",
  "&#39;",
  "&quot;",
];

(async () => {
  const p = await getPayload({ config });
  const posts = (await p.find({ collection: "posts", limit: 500, depth: 0, overrideAccess: true })).docs as any[];

  const moji: Record<string, string[]> = {};
  for (const d of posts) {
    const s = JSON.stringify({ body: d.body, excerpt: d.excerpt, title: d.title });
    const found = MOJIBAKE.filter((m) => s.includes(m));
    if (found.length) moji[d.slug] = found;
  }
  console.log("MOJIBAKE posts:", Object.keys(moji).length);
  Object.entries(moji).slice(0, 10).forEach(([slug, f]) => console.log("   ", slug, "->", JSON.stringify(f)));

  const byExcerpt: Record<string, string[]> = {};
  for (const d of posts) {
    const k = (d.excerpt || "").trim();
    if (k) (byExcerpt[k] = byExcerpt[k] || []).push(d.slug);
  }
  const shared = Object.entries(byExcerpt).filter(([, v]) => v.length > 1);
  console.log("SHARED excerpts groups:", shared.length);
  shared.slice(0, 3).forEach(([k, v]) => console.log("   ", v.length + " posts share:", JSON.stringify(k.slice(0, 70))));
  console.log("posts with NO excerpt:", posts.filter((d) => !(d.excerpt || "").trim()).length);

  console.log("ODD titles:", posts.filter((d) => /[:\-–—]\s*$|\.\.\.$|…$/.test(d.title || "")).map((d) => d.title));
  console.log("dated posts:", posts.filter((d) => d.publishedAt).length, "/", posts.length);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
