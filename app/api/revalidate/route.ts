import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// On-demand cache busting for content changed OUTSIDE the admin (seed/patch
// scripts that write straight to the shared DB). Those run in a CLI process, so
// their revalidateTag never reaches the deployed runtime and the Data Cache
// (unstable_cache tags in lib/payload) keeps serving stale content until the
// hourly TTL. POST here from the runtime to drop the tags immediately.
//
// Guarded by PAYLOAD_SECRET, sent as a header (never in the URL/query). Only
// busts cache — it never reads or writes data.
export const dynamic = "force-dynamic";

const DEFAULT_TAGS = ["pages", "posts", "globals", "chat-settings"];

export async function POST(request: Request) {
  const token = request.headers.get("x-revalidate-token");
  if (!process.env.PAYLOAD_SECRET || token !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const tags: string[] = Array.isArray(body?.tags) && body.tags.length ? body.tags : DEFAULT_TAGS;
  // Single-arg form is correct for this project's caching mode (see lib/revalidate);
  // the bundled 2-arg type targets Cache Components mode, so narrow it here.
  const bust = revalidateTag as (tag: string) => void;
  for (const t of tags) bust(t);
  return NextResponse.json({ ok: true, revalidated: tags });
}
