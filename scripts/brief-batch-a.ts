import { getPayload } from "payload";
import config from "../payload.config";

// Brief batch A — navigation, footer, Resources, Couples cross-link.
// Idempotent: safe to re-run.

const lex = (...paras: string[]) => ({
  root: {
    type: "root", format: "", indent: 0, version: 1, direction: "ltr" as const,
    children: paras.map((t) => ({
      type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr" as const,
      children: [{ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: t, version: 1 }],
    })),
  },
});

// PLACEHOLDER — Sabine must supply the two LinkedIn newsletter article URLs.
// Until then this points at her LinkedIn profile so the link is never broken.
const LINKEDIN_NEWSLETTER = "https://www.linkedin.com/in/sabine-binns-039787a/";

const RESOURCES_INTRO =
  "Whether you're just beginning your journey or looking to deepen your practice, you'll find reflections, guided practices and inspiration here.";

(async () => {
  const p = await getPayload({ config });

  // ---- A-1: drop "Blog" from the top nav (more breathing room for the logo).
  const header = (await p.findGlobal({ slug: "header", overrideAccess: true })) as any;
  const primary = (header.primary || [])
    .map((x: any) => ({ label: x.label, href: x.href, description: x.description }))
    .filter((x: any) => x.href !== "/blog/");
  await p.updateGlobal({ slug: "header", data: { ...header, primary } as any, overrideAccess: true });
  console.log("A-1 nav primary:", primary.map((x: any) => x.label).join(" | "));

  // ---- A-2: footer EXPLORE = The Method, About, Resources, Contact.
  const footer = (await p.findGlobal({ slug: "footer", overrideAccess: true })) as any;
  const explore = [
    { label: "The Method", href: "/the-method/" },
    { label: "About", href: "/about/" },
    { label: "Resources", href: "/resources/" },
    { label: "Contact", href: "/contact/" },
  ];
  await p.updateGlobal({ slug: "footer", data: { ...footer, explore } as any, overrideAccess: true });
  console.log("A-2 footer explore:", explore.map((x) => x.label).join(" | "));

  // ---- A-3: Resources section. Only the three live blocks are rendered; the
  // three future ones (Breathing Practices, Guides, Videos) are intentionally
  // not rendered so the page doesn't read as empty.
  const res = (await p.find({ collection: "pages", where: { slug: { equals: "resources" } }, limit: 1, overrideAccess: true })).docs[0] as any;
  const resourcesLayout = [
    {
      blockType: "hero",
      variant: "split",
      eyebrow: "Resources",
      heading: "Reflections, practices, and inspiration.",
      lede: RESOURCES_INTRO,
      image: res?.layout?.find?.((b: any) => b.image)?.image ?? undefined,
      ctas: [],
    },
    {
      blockType: "waysGrid",
      heading: "Where to start.",
      tone: "cream",
      cards: [
        {
          title: "Reflections",
          body: "The blog. Essays and reflections on breathwork, healing, and living through change.",
          ctaLabel: "Read the blog",
          href: "/blog/",
        },
        {
          title: "Beyond the Breath",
          body: "The LinkedIn newsletter. Longer-form thinking for people navigating pressure and transition.",
          ctaLabel: "Read on LinkedIn",
          href: LINKEDIN_NEWSLETTER,
        },
        {
          title: "Monthly Newsletter",
          body: "A quiet monthly email — practices, dates, and what I'm working with.",
          ctaLabel: "Subscribe",
          href: "/resources/newsletter/",
        },
      ],
    },
  ];
  if (res) {
    await p.update({ collection: "pages", id: res.id, data: { layout: resourcesLayout } as any, overrideAccess: true });
    console.log("A-3 resources page rebuilt (3 live blocks; 3 future ones not rendered)");
  } else {
    console.log("A-3 !! resources page not found");
  }

  // ---- A-4: Couples block on Private Sessions links to the Couples page.
  const ps = (await p.find({ collection: "pages", where: { slug: { equals: "work-with-me/private-sessions" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  let linked = 0;
  const psLayout = (ps.layout || []).map((b: any) => {
    if (b.blockType === "formatDetail" && /couples/i.test(b.title || "")) {
      linked++;
      return {
        ...b,
        cta: { label: "Explore Couples Sessions", variant: "primary", action: "internal", href: "/work-with-me/couples/" },
      };
    }
    return b;
  });
  if (linked) {
    await p.update({ collection: "pages", id: ps.id, data: { layout: psLayout } as any, overrideAccess: true });
  }
  console.log("A-4 couples CTA added to private-sessions blocks:", linked);

  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
