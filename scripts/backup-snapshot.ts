import { getPayload } from "payload";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import config from "../payload.config";

// Full content snapshot to backups/<timestamp>/ as JSON, one file per
// collection and global. Run before a schema change or a launch step:
//   node --env-file=.env.local --import tsx scripts/backup-snapshot.ts
// Media files themselves live in Vercel Blob and are not copied here.
(async () => {
  const payload = await getPayload({ config });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = path.join(process.cwd(), "backups", stamp);
  mkdirSync(dir, { recursive: true });

  for (const slug of Object.keys(payload.collections)) {
    const docs: unknown[] = [];
    let page = 1;
    for (;;) {
      const res = await payload.find({
        collection: slug as never,
        limit: 200,
        page,
        depth: 0,
        overrideAccess: true,
        draft: true,
        showHiddenFields: true,
      });
      docs.push(...res.docs);
      if (!res.hasNextPage) break;
      page += 1;
    }
    writeFileSync(path.join(dir, `collection-${slug}.json`), JSON.stringify(docs, null, 1));
    console.log(`${slug}: ${docs.length}`);
  }
  for (const g of payload.config.globals) {
    const doc = await payload.findGlobal({ slug: g.slug as never, depth: 0, overrideAccess: true, showHiddenFields: true });
    writeFileSync(path.join(dir, `global-${g.slug}.json`), JSON.stringify(doc, null, 1));
    console.log(`global ${g.slug}: ok`);
  }
  console.log(`snapshot -> ${dir}`);
  process.exit(0);
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
