import Image from "next/image";

type Media =
  | string
  | number
  | { url?: string | null; alt?: string | null; width?: number | null; height?: number | null }
  | null
  | undefined;

export default function PayloadImage({
  media,
  fill,
  sizes,
  className,
  priority,
}: {
  media: Media;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  if (!media || typeof media === "string" || typeof media === "number") return null;
  const { url: rawUrl, alt, width, height } = media;
  if (!rawUrl) return null;
  // Payload serves local media from /api/media/file/... with an absolute URL.
  // Make same-origin URLs relative so next/image serves them without host config.
  // Remote (Vercel Blob) URLs are left absolute (allowed via remotePatterns).
  const url = rawUrl.replace(/^https?:\/\/[^/]+(\/api\/media\/)/, "$1");

  if (fill) {
    return (
      <Image src={url} alt={alt || ""} fill sizes={sizes} className={className} priority={priority} />
    );
  }
  return (
    <Image
      src={url}
      alt={alt || ""}
      width={width || 1200}
      height={height || 1500}
      className={className}
      priority={priority}
    />
  );
}
