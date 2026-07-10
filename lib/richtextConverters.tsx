import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import PayloadImage from "@/components/PayloadImage";

// Render lexical `upload` nodes (images placed in a post body) through
// next/image + Vercel Blob instead of the default bare <img>, so post images
// are optimized and responsive. Everything else uses the library defaults.
export const postConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const value = node?.value as
      | { url?: string | null; alt?: string | null; width?: number | null; height?: number | null }
      | undefined;
    if (!value || typeof value !== "object") return null;
    return (
      <figure className="my-9">
        <PayloadImage
          media={value}
          sizes="(max-width: 768px) 100vw, 720px"
          className="h-auto w-full rounded-xl"
        />
        {value.alt ? (
          <figcaption className="mt-2 text-center text-sm text-ink-soft/70">{value.alt}</figcaption>
        ) : null}
      </figure>
    );
  },
});
