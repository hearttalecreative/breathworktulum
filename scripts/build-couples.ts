import { getPayload } from "payload";
import config from "../payload.config";

const lex = (...paras: string[]) => ({
  root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr" as const,
    children: paras.map((t) => ({ type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr" as const,
      children: [{ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: t, version: 1 }] })) },
});
const incl = (...xs: string[]) => xs.map((text) => ({ text }));
const wa = (label: string, context: string, variant = "whatsapp") => ({ label, variant, action: "whatsapp", whatsappContext: context });
const link = (label: string, href: string, variant = "primary") => ({ label, variant, action: "internal", href });

const IMG = 26; // bw-deck-sea.jpg
const SLUG = "work-with-me/couples";

const layout = [
  { blockType: "hero", eyebrow: "Couples Sessions",
    heading: "A shared space to work through what is present in your relationship",
    lede: "This is not traditional couples therapy. It is a guided somatic and breathwork-based process where both individuals remain responsible for their own experience, while becoming more aware of the dynamic between them.",
    image: IMG, ctas: [wa("Ask about couples sessions", "general"), link("See private sessions", "/work-with-me/private-sessions/", "secondary")] },
  { blockType: "list", heading: "What we work with", tone: "cream", width: "narrow",
    items: incl("Communication patterns", "Emotional triggers", "Attachment responses", "Unresolved relational tension") },
  { blockType: "list", heading: "What sessions include", tone: "sand", width: "narrow",
    items: incl("Guided breathwork, individual and shared", "Somatic awareness of relational patterns", "Structured communication tools", "Integration and reflection") },
  { blockType: "list", heading: "Who this is for", tone: "cream", width: "narrow",
    items: incl("Couples feeling stuck or disconnected", "Couples navigating change or decisions", "Couples who want to understand patterns rather than blame"),
    note: "Rates on request. Message me and we'll find the right container for where you are." },
  { blockType: "ctaSection", heading: "Start a conversation.", width: "narrow", align: "center", tone: "sand",
    body: "Message me about couples sessions and we'll find the right starting point.",
    ctas: [wa("Message me about couples", "general")] },
];

const data = {
  title: "Couples Sessions",
  slug: SLUG,
  metaTitle: "Couples Breathwork Sessions in Tulum",
  metaDescription: "A guided somatic and breathwork-based process for two — awareness of relationship patterns, communication, and connection. Not traditional couples therapy.",
  ogImage: IMG,
  layout,
  _status: "published" as const,
};

(async () => {
  const p = await getPayload({ config });
  const existing = (await p.find({ collection: "pages", where: { slug: { equals: SLUG } }, limit: 1, overrideAccess: true })).docs[0] as any;
  if (existing) { await p.update({ collection: "pages", id: existing.id, data: data as any, overrideAccess: true }); console.log("couples page UPDATED", existing.id); }
  else { const d = await p.create({ collection: "pages", data: data as any, overrideAccess: true }); console.log("couples page CREATED", (d as any).id); }

  // Add "Couples Sessions" INSIDE the Work With Me dropdown (idempotent), and
  // clear the standalone couples dropdown that a prior version set.
  const header = (await p.findGlobal({ slug: "header", overrideAccess: true })) as any;
  const wwm = (header.workWithMe || []).map((x: any) => ({ label: x.label, href: x.href, description: x.description }));
  if (!wwm.some((x: any) => x.href === "/work-with-me/couples/")) {
    const item = { label: "Couples Sessions", href: "/work-with-me/couples/", description: "A shared space for two." };
    const idx = wwm.findIndex((x: any) => /corporate/i.test(x.href || ""));
    if (idx >= 0) wwm.splice(idx, 0, item); else wwm.push(item);
  }
  await p.updateGlobal({ slug: "header", data: { ...header, workWithMe: wwm, couples: [] } as any, overrideAccess: true });
  console.log("header.workWithMe updated with Couples; standalone dropdown cleared");
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
