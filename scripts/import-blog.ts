// Import the scraped blog (blog-export/*.md) into the Posts collection.
// Downloads each image to Media (Sharp + Blob), rewrites markdown images to the
// UploadFeature placeholder syntax so they become lexical upload nodes, converts
// the body to Lexical, and creates published Posts. Idempotent by slug.
//
//   node --env-file=.env.local --import tsx scripts/import-blog.ts            (all)
//   node --env-file=.env.local --import tsx scripts/import-blog.ts --limit 3  (first N)
//   ... --force   (delete existing posts with the same slug first)
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.resolve(dirname, "../blog-export");
const FORCE = process.argv.includes("--force");
const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg >= 0 ? Number(process.argv[limitArg + 1]) : Infinity;

type Frontmatter = { title: string; description: string; old_path: string };

// Parse a standalone markdown image line. wsimg filenames can contain "(" and
// ")" (e.g. "Portada (8).png"), so a regex on the parens is unsafe — split on
// the first "](" and the LAST ")" instead, then strip an optional ' "title"'.
function parseImageLine(line: string): { alt: string; url: string } | null {
  const t = line.trim();
  if (!t.startsWith("![") || !t.endsWith(")")) return null;
  const sep = t.indexOf("](");
  if (sep < 0) return null;
  const alt = t.slice(2, sep);
  let inner = t.slice(sep + 2, t.length - 1);
  inner = inner.replace(/\s+"[^"]*"$/, "").trim();
  if (!inner.startsWith("http")) return null;
  return { alt, url: inner };
}

function parse(md: string): { fm: Frontmatter; body: string } {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: { title: "", description: "", old_path: "" }, body: md };
  const fm: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  let body = m[2].trim();
  // Drop the leading "# Title" (duplicates the frontmatter title).
  body = body.replace(/^#\s+.*\n+/, "");
  return { fm: fm as unknown as Frontmatter, body };
}

function extFromWsimgUrl(url: string): string {
  const base = url.split("/:/")[0]; // strip the iSteam transform suffix
  const ext = path.extname(base).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
}

async function run() {
  process.loadEnvFile?.(".env.local");
  const { getPayload } = await import("payload");
  const { convertMarkdownToLexical, editorConfigFactory } = await import("@payloadcms/richtext-lexical");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  const editorConfig = await editorConfigFactory.default({ config: payload.config });

  const files = fs
    .readdirSync(EXPORT_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
    .slice(0, LIMIT);

  const urlToMediaId = new Map<string, number>();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bwt-blog-"));

  const uploadImage = async (url: string, alt: string): Promise<number | null> => {
    if (urlToMediaId.has(url)) return urlToMediaId.get(url)!;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const file = path.join(tmpDir, `${urlToMediaId.size}_${Date.now()}${extFromWsimgUrl(url)}`);
      fs.writeFileSync(file, buf);
      const media = await payload.create({
        collection: "media",
        data: { alt: alt.slice(0, 240) || "Breathwork Tulum blog image" },
        filePath: file,
      });
      const id = media.id as number;
      urlToMediaId.set(url, id);
      return id;
    } catch (e) {
      payload.logger.warn(`  ! image failed ${url}: ${(e as Error).message}`);
      return null;
    }
  };

  let created = 0,
    skipped = 0;

  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    const { fm, body: rawBody } = parse(fs.readFileSync(path.join(EXPORT_DIR, f), "utf8"));
    const title = fm.title || slug;

    const existing = await payload.find({ collection: "posts", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
    if (existing.docs.length) {
      if (!FORCE) {
        skipped++;
        payload.logger.info(`  = ${slug} exists, skipping`);
        continue;
      }
      await payload.delete({ collection: "posts", where: { slug: { equals: slug } } });
    }

    // Walk lines; images are on their own lines. First image → hero (dropped
    // from the body), the rest → upload-node placeholders.
    const lines = rawBody.split("\n");
    let heroId: number | null = null;
    let imgCount = 0;
    const outLines: string[] = [];
    for (const line of lines) {
      const img = parseImageLine(line);
      if (!img) {
        outLines.push(line);
        continue;
      }
      imgCount++;
      const id = await uploadImage(img.url, img.alt || title);
      if (heroId === null && id !== null && imgCount === 1) {
        heroId = id;
        // omit the hero from the body (rendered as heroImage above the article)
        continue;
      }
      outLines.push(id ? `![media:${id}]()` : "");
    }
    const body = outLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

    const lexicalBody = convertMarkdownToLexical({ editorConfig, markdown: body });

    await payload.create({
      collection: "posts",
      data: {
        title,
        slug,
        excerpt: fm.description || "",
        heroImage: heroId ?? undefined,
        body: lexicalBody,
        metaTitle: title,
        metaDescription: fm.description || "",
        oldPath: fm.old_path || "",
        _status: "published",
      } as never,
    });
    created++;
    payload.logger.info(`  ✓ ${slug} (${imgCount} imgs)`);
  }

  payload.logger.info(`\n✅ Blog import done. Created ${created}, skipped ${skipped}. Media uploaded: ${urlToMediaId.size}.`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
