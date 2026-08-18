import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import PayloadImage from "@/components/PayloadImage";
import { toArticleEmbed } from "@/lib/videoEmbed";

// Lexical stores the alignment chosen in the editor toolbar on each node's
// `format`, but the library's default paragraph/heading converters drop it — so
// centring text in the panel had no effect on the site. Re-apply it.
type Align = "center" | "right" | "justify";
type VideoFields = { url?: string; aspect?: string; caption?: string };
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
  blocks: {
    // El marco toma la forma en que se filmó el video. Un vertical dentro de
    // un marco apaisado quedaría en el medio con bandas negras, así que además
    // se le limita el ancho para que no se coma la columna de lectura.
    videoEmbed: ({ node }: { node: { fields?: VideoFields } }) => {
      const f = node?.fields || {};
      const src = toArticleEmbed(f.url || "");
      if (!src) return null;
      const shape =
        f.aspect === "vertical"
          ? "aspect-[9/16] mx-auto max-w-[22rem]"
          : f.aspect === "square"
            ? "aspect-square mx-auto max-w-[30rem]"
            : "aspect-video";
      return (
        <figure className="my-9">
          <div className={`relative w-full overflow-hidden rounded-xl bg-sand ${shape}`}>
            <iframe
              src={src}
              title={f.caption || "Video"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          {f.caption ? (
            <figcaption className="mt-2 text-center text-sm text-ink-soft/70">{f.caption}</figcaption>
          ) : null}
        </figure>
      );
    },
  },
});
