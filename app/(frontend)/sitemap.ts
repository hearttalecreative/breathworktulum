import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Public URLs live in this MVP. Phase-2 routes are added as they ship.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    "/the-method/",
    "/work-with-me/private-sessions/",
    "/about/",
    "/contact/",
  ];
  const now = new Date();
  return routes.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
