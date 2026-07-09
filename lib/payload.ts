import "server-only";
import { getPayload } from "payload";
import { headers as nextHeaders } from "next/headers";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import config from "@payload-config";

export const getPayloadClient = cache(async () => getPayload({ config }));

// Cross-request data cache TTL. Published content changes rarely; an editor
// save can be pushed live instantly with revalidateTag("pages") from a hook.
const TTL = 3600;

/** The currently authenticated Payload user, if any (admins viewing the site). */
export const getAuthUser = cache(async () => {
  const payload = await getPayloadClient();
  try {
    const { user } = await payload.auth({ headers: await nextHeaders() });
    return user;
  } catch {
    return null;
  }
});

// Published page fetch, cached across requests (data cache, not per-request).
// depth:1 populates the media + testimonial relations the blocks render —
// nothing deeper exists, so depth:2 only added a wasted population pass.
const getPagePublished = (slug: string) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient();
      const res = await payload.find({
        collection: "pages",
        where: { slug: { equals: slug } },
        depth: 1,
        limit: 1,
      });
      return res.docs[0] ?? null;
    },
    ["page", slug],
    { revalidate: TTL, tags: ["pages", `page:${slug}`] }
  )();

/** Fetch a single page by slug. Published reads come from the cross-request
 *  cache; the draft path (admin Live Preview) is always live + uncached. */
export const getPage = cache(async (slug: string, draft = false) => {
  if (!draft) return getPagePublished(slug);
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    draft: true,
    depth: 1,
    limit: 1,
    overrideAccess: true,
  });
  return res.docs[0] ?? null;
});

/** Published pages (slug + updatedAt + noindex) for the sitemap. Cached. */
export const getPublishedPages = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "pages",
      where: { _status: { equals: "published" } },
      limit: 200,
      pagination: false,
      depth: 0,
      select: { slug: true, updatedAt: true, noindex: true },
    });
    return res.docs as { slug: string; updatedAt?: string; noindex?: boolean }[];
  },
  ["published-pages"],
  { revalidate: TTL, tags: ["pages"] }
);

/** Safe-for-client chat settings. The API key is deliberately NOT returned so
 *  it never enters this cache entry nor any RSC prop. */
export const getChatPublicSettings = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    // Local API read — bypasses the authenticated-only access on the global.
    const chat = await payload.findGlobal({ slug: "chatSettings" });
    return {
      enabled: chat?.enabled !== false,
      welcomeMessage: chat?.welcomeMessage || "",
    };
  },
  ["chat-public"],
  { revalidate: TTL, tags: ["chat-settings"] }
);

// Header/footer/settings change ~never — cache across requests so the layout
// stops issuing 3 findGlobal round-trips on every pageview.
export const getGlobals = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const [siteSettings, header, footer] = await Promise.all([
      payload.findGlobal({ slug: "siteSettings" }),
      payload.findGlobal({ slug: "header" }),
      payload.findGlobal({ slug: "footer" }),
    ]);
    return { siteSettings, header, footer };
  },
  ["globals"],
  { revalidate: TTL, tags: ["globals"] }
);
