import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import RenderBlocks from "@/components/RenderBlocks";
import LivePreviewListener from "@/components/LivePreviewListener";
import { getPage, getAllPageSlugs, getGlobals, getAuthUser } from "@/lib/payload";
import { SITE } from "@/lib/site";

type Params = { slug?: string[] };

function toSlug(segments?: string[]) {
  if (!segments || segments.length === 0) return "home";
  return segments.join("/");
}

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return slugs.map((slug) => ({
    slug: slug === "home" ? [] : slug.split("/"),
  }));
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
  return {
    title: (p.metaTitle as string) || (p.title as string),
    description: (p.metaDescription as string) || undefined,
    alternates: { canonical: `${SITE.url}${path}` },
    openGraph: {
      title: (p.metaTitle as string) || (p.title as string),
      description: (p.metaDescription as string) || undefined,
      url: `${SITE.url}${path}`,
      images: og?.url ? [{ url: og.url, width: 1200, height: 630 }] : undefined,
    },
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
  const layout = ((page as unknown as { layout?: unknown[] }).layout || []) as never;

  return (
    <>
      {draft ? (
        <LivePreviewListener
          serverURL={process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}
        />
      ) : null}
      <RenderBlocks blocks={layout} settings={siteSettings as never} />
    </>
  );
}
