import { getPayload } from "payload";
import config from "../payload.config";
function lex(n: any): string { let o=""; const w=(x:any)=>{if(!x)return;if(typeof x.text==="string")o+=x.text+" ";(x.children||[]).forEach(w);}; w(n?.root??n); return o.trim(); }
(async () => {
  const p = await getPayload({ config });
  for (const slug of process.argv.slice(2).filter((a) => !a.startsWith("--"))) {
    const d = (await p.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1, depth: 1, overrideAccess: true })).docs[0] as any;
    if (!d) { console.log(`\n###### /${slug}: NO EXISTE`); continue; }
    console.log(`\n###### /${slug}  (${(d.layout||[]).length} bloques)`);
    (d.layout || []).forEach((b: any, i: number) => {
      console.log(`#${i} ${b.blockType}${b.format?":"+b.format:""}${b.hidden?" [OCULTO]":""}${b.anchor?" #"+b.anchor:""}`);
      for (const k of ["eyebrow","title","heading","tag","tagline","caption","lede","metaLine","note","investment","leftTitle","rightTitle"]) if (b[k]) console.log(`     ${k}: ${String(b[k]).slice(0,110)}`);
      if (b.body) console.log(`     body: ${(typeof b.body==="string"?b.body:lex(b.body)).slice(0,150)}`);
      for (const k of ["items","included","left","right","rows","cards","images","chapters"]) if (b[k]?.length) console.log(`     ${k}(${b[k].length}): ${b[k].map((x:any)=>x.text||x.question||x.title||x.label||"").join(" | ").slice(0,170)}`);
      if (b.image) console.log(`     image: ${b.image?.filename||b.image}`);
      if (b.ctas?.length) console.log(`     ctas: ${b.ctas.map((c:any)=>c.label).join(" | ")}`);
      if (b.cta?.label) console.log(`     cta: ${b.cta.label}`);
    });
  }
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
