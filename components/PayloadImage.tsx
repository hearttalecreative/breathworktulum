type Size = { url?: string | null; width?: number | null; height?: number | null };

type Media =
  | string
  | number
  | {
      url?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
      focalX?: number | null;
      focalY?: number | null;
      sizes?: Record<string, Size | null | undefined> | null;
    }
  | null
  | undefined;

// Payload generates a set of widths at upload (see collections/Media). This is
// the single place that turns them into a srcset, so every block on the site
// gets responsive images from one implementation.
//
// A plain <img> rather than next/image on purpose: the Vercel optimizer is off,
// so next/image would emit a single un-resized source and none of these
// variants would ever be requested.
const VARIANT_ORDER = ["thumbnail", "card", "wide", "hero"];

// Same-origin media is absolutised with the runtime host; make it relative.
const rel = (u: string) => u.replace(/^https?:\/\/[^/]+(\/api\/media\/)/, "$1");

export default function PayloadImage({
  media,
  fill,
  sizes,
  className,
  priority,
}: {
  media: Media;
  fill?: boolean;
  /** Tells the browser how wide the image renders, so it can pick a variant.
   *  Without it the browser assumes 100vw and always takes the largest. */
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  if (!media || typeof media === "string" || typeof media === "number") return null;
  const { url: rawUrl, alt, width, height, focalX, focalY } = media;
  if (!rawUrl) return null;

  const src = rel(rawUrl);

  // Every generated width, plus the original, largest last. Duplicated widths
  // collapse so a variant that matches the original isn't listed twice.
  const byWidth = new Map<number, string>();
  for (const name of VARIANT_ORDER) {
    const v = media.sizes?.[name];
    if (v?.url && typeof v.width === "number") byWidth.set(v.width, rel(v.url));
  }
  if (typeof width === "number" && width > 0) byWidth.set(width, src);

  const srcSet =
    byWidth.size > 1
      ? [...byWidth.entries()].sort((a, b) => a[0] - b[0]).map(([w, u]) => `${u} ${w}w`).join(", ")
      : undefined;

  // Honour the focal point set per image in the admin, so object-cover crops
  // around the subject instead of the centre.
  const objectPosition =
    typeof focalX === "number" || typeof focalY === "number"
      ? `${focalX ?? 50}% ${focalY ?? 50}%`
      : undefined;

  const loading = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : undefined;

  if (fill) {
    return (
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt || ""}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={priority ? "sync" : "async"}
        className={`absolute inset-0 h-full w-full ${className || ""}`}
        style={objectPosition ? { objectPosition } : undefined}
      />
    );
  }

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt || ""}
      // Explicit dimensions reserve the space and stop the layout jumping.
      width={width || 1200}
      height={height || 1500}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={priority ? "sync" : "async"}
      className={className}
      style={objectPosition ? { objectPosition } : undefined}
    />
  );
}
