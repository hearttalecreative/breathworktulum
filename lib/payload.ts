import "server-only";
import { getPayload } from "payload";
import { headers as nextHeaders } from "next/headers";
import { cache } from "react";
import config from "@payload-config";

export const getPayloadClient = cache(async () => getPayload({ config }));

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

/** Fetch a single page by slug (draft-aware). Returns null if not found. */
export const getPage = cache(async (slug: string, draft = false) => {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: draft,
  });
  return res.docs[0] ?? null;
});

export const getAllPageSlugs = cache(async () => {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "pages",
    where: { _status: { equals: "published" } },
    limit: 100,
    pagination: false,
    select: { slug: true },
  });
  return res.docs.map((d) => d.slug as string);
});

export const getGlobals = cache(async () => {
  const payload = await getPayloadClient();
  const [siteSettings, header, footer] = await Promise.all([
    payload.findGlobal({ slug: "siteSettings" }),
    payload.findGlobal({ slug: "header" }),
    payload.findGlobal({ slug: "footer" }),
  ]);
  return { siteSettings, header, footer };
});
