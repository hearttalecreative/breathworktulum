import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getAllPageSlugs } from "@/lib/payload";

export const dynamic = "force-dynamic";

// Built dynamically from published CMS pages. Legal pages are excluded (noindex).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllPageSlugs();
  const now = new Date();
  return slugs
    .filter((s) => !s.startsWith("legal/"))
    .map((slug) => {
      const path = slug === "home" ? "/" : `/${slug}/`;
      return {
        url: `${SITE.url}${path}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: slug === "home" ? 1 : 0.8,
      };
    });
}
