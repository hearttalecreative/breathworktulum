// Cache-busting helpers for Payload collection/global hooks. They drop the
// matching unstable_cache tag (see lib/payload) so a CMS save goes live
// immediately instead of waiting for the hourly revalidate. Guarded so seed /
// CLI runs (no Next request scope) don't throw.
async function bust(tag: string) {
  try {
    const { revalidateTag } = await import("next/cache");
    // Single-arg form is the documented API in caching-without-cache-components
    // mode (this project). The bundled 2-arg type targets Cache Components mode,
    // so narrow it here.
    (revalidateTag as (tag: string) => void)(tag);
  } catch {
    /* outside a Next request scope (CLI/seed) — nothing to revalidate */
  }
}

export const revalidatePagesTag = () => bust("pages");
export const revalidateGlobalsTag = () => bust("globals");
export const revalidateChatSettingsTag = () => bust("chat-settings");
export const revalidatePostsTag = () => bust("posts");
