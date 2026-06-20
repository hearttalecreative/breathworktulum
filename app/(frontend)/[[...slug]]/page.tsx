import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import RenderBlocks from "@/components/RenderBlocks";
import LivePreviewListener from "@/components/LivePreviewListener";
import JsonLd from "@/components/JsonLd";
import { getPage, getGlobals, getAuthUser } from "@/lib/payload";
import { SITE } from "@/lib/site";
import { faqLd, serviceLd, personLd } from "@/lib/seo";

const OG_FALLBACK = "/images/og-default.jpg";

// Per-page structured data derived from slug + blocks.
function pageSchemas(slug: string, title: string, description: string, layout: { blockType: string; items?: { question: string; answer: string }[] }[]) {
  const schemas: object[] = [];
  // FAQ schema from any faq block.
  const faqBlock = layout.find((b) => b.blockType === "faq" && b.items?.length);
  if (faqBlock?.items) schemas.push(faqLd(faqBlock.items.map((i) => ({ q: i.question, a: i.answer }))));
  // Service schema for offer pages.
  if (slug.startsWith("work-with-me")) schemas.push(serviceLd(title, description));
  if (slug === "about") schemas.push(personLd());
  if (slug === "retreat-riviera-maya-2026") {
    schemas.push({
      "@context": "https://schema.org", "@type": "Event", name: title, description,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", name: "ONZE Xpu Ha", address: "Xpu Ha, Riviera Maya, Mexico" },
      organizer: { "@type": "Person", name: SITE.founder },
    });
  }
  return schemas;
}

// Pages are rendered per-request (auth check shows drafts to logged-in admins),
// so there is no build-time DB access. Keeps the build green without env/DB.
export const dynamic = "force-dynamic";

type Params = { slug?: string[] };

function toSlug(segments?: string[]) {
  if (!segments || segments.length === 0) return "home";
  return segments.join("/");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(toSlug(slug));
  if (!page) return {};
  const p = page as unknown as Record<string, unknown>;
  const path = toSlug(slug) === "home" ? "/" : `/${toSlug(slug)}/`;
  const og = p.ogImage as { url?: string } | undefined;
  // Home shares the branded hero portrait (IMG_5306); other pages use their
  // own CMS image, falling back to the same branded card.
  const ogUrl = toSlug(slug) === "home" ? OG_FALLBACK : og?.url || OG_FALLBACK;
  return {
    title: (p.metaTitle as string) || (p.title as string),
    description: (p.metaDescription as string) || undefined,
    alternates: { canonical: `${SITE.url}${path}` },
    openGraph: {
      title: (p.metaTitle as string) || (p.title as string),
      description: (p.metaDescription as string) || undefined,
      url: `${SITE.url}${path}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  // Authenticated admins (incl. the Live Preview iframe) see drafts.
  const draft = isEnabled || !!(await getAuthUser());
  const page = await getPage(toSlug(slug), draft);
  if (!page) notFound();

  const { siteSettings } = await getGlobals();
  const pd = page as unknown as { layout?: unknown[]; title?: string; metaDescription?: string };
  const layout = (pd.layout || []) as never;
  const schemas = pageSchemas(
    toSlug(slug),
    (pd.title as string) || "",
    (pd.metaDescription as string) || "",
    (pd.layout as { blockType: string; items?: { question: string; answer: string }[] }[]) || []
  );

  return (
    <>
      {draft ? (
        <LivePreviewListener
          serverURL={process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}
        />
      ) : null}
      {schemas.length > 0 ? <JsonLd data={schemas} /> : null}
      <RenderBlocks blocks={layout} settings={siteSettings as never} />
    </>
  );
}
