import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getPublishedPages, getPublishedPosts } from "@/lib/payload";

// Dynamic so the build never prerenders it against the connection-limited DB
// pooler; the underlying query is data-cached (getPublishedPages), so serving
// it does not hit Postgres per request.
export const dynamic = "force-dynamic";

// Built from published CMS pages. Legal / thanks / per-page noindex are excluded
// so the sitemap never advertises a URL that robots or meta tells crawlers to skip.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts] = await Promise.all([getPublishedPages(), getPublishedPosts()]);

  const pageEntries = pages
    .filter((p) => !p.noindex && !p.slug.startsWith("legal/") && !p.slug.startsWith("thanks"))
    .map(({ slug, updatedAt }) => {
      const path = slug === "home" ? "/" : `/${slug}/`;
      return {
        url: `${SITE.url}${path}`,
        lastModified: updatedAt ? new Date(updatedAt) : new Date(),
        changeFrequency: "monthly" as const,
        priority: slug === "home" ? 1 : 0.8,
      };
    });

  const postEntries = (posts as unknown as { slug: string; updatedAt?: string; noindex?: boolean }[])
    .filter((p) => !p.noindex)
    .map((p) => ({
      url: `${SITE.url}/blog/${p.slug}/`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // Blog index + all posts.
  return [
    ...pageEntries,
    { url: `${SITE.url}/blog/`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    ...postEntries,
  ];
}
