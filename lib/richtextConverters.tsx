import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import PayloadImage from "@/components/PayloadImage";

// Lexical stores the alignment chosen in the editor toolbar on each node's
// `format`, but the library's default paragraph/heading converters drop it — so
// centring text in the panel had no effect on the site. Re-apply it.
type Align = "center" | "right" | "justify";
const alignStyle = (format: unknown) =>
  typeof format === "string" && (["center", "right", "justify"] as string[]).includes(format)
    ? { textAlign: format as Align }
    : undefined;

export const bodyConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  paragraph: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    if (!children?.length) {
      return (
        <p>
          <br />
        </p>
      );
    }
    return <p style={alignStyle(node.format)}>{children}</p>;
  },
  heading: ({ node, nodesToJSX }) => {
    const Tag = ((node as { tag?: string }).tag || "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    return <Tag style={alignStyle(node.format)}>{nodesToJSX({ nodes: node.children })}</Tag>;
  },
});

// Render lexical `upload` nodes (images placed in a post body) through
// next/image + Vercel Blob instead of the default bare <img>, so post images
// are optimized and responsive. Everything else uses the library defaults.
export const postConverters: JSXConvertersFunction = (args) => ({
  ...bodyConverters(args),
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
