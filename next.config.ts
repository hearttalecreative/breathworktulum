import type { NextConfig } from "next";
import fs from "fs";
import path from "path";
import { withPayload } from "@payloadcms/next/withPayload";

// 301s from the old GoDaddy blog URLs (/blog/f/<slug>) to the new /blog/<slug>/.
// Generated from blog-export/_redirects.csv (see scripts/import-blog).
const blogRedirects = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "lib/blogRedirects.json"), "utf8")
) as { source: string; destination: string; permanent: boolean }[];

const nextConfig: NextConfig = {
  // Canonical URLs, internal links, and the sitemap all use trailing slashes;
  // without this Next 308-redirects every /slug/ to /slug, so each internal
  // click and every crawler hit paid a redirect. Align the server with them.
  trailingSlash: true,
  // sharp ships native binaries — keep it external so it's required from
  // node_modules at runtime instead of bundled (fixes Vercel runtime load error).
  serverExternalPackages: ["sharp"],
  // Force the Linux sharp + libvips native binaries into the serverless function
  // bundle (Turbopack tracing misses the .so otherwise → ERR_DLOPEN_FAILED).
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/@img/sharp-libvips-linux-x64/**/*",
    ],
  },
  async redirects() {
    return [
      // Old blog index → new blog.
      { source: "/blog/f", destination: "/blog/", permanent: true },
      ...blogRedirects,
    ];
  },
  async headers() {
    return [
      // The provisional domain must never be indexed: canonical/OG/sitemap all
      // point at the final breathworktulum.com, and letting Google index the
      // temp host would split signals. Scoped by Host so the final domain and
      // previews are unaffected.
      {
        source: "/:path*",
        has: [{ type: "host", value: "breathworktulum.hearttalecreative.com" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  images: {
    // Vercel's image optimizer hit the plan's quota and started returning 402
    // (Payment Required) for every /_next/image request, so NO image rendered.
    // CMS media is already WebP (Payload/Sharp generates it at upload) and the
    // static assets are pre-sized, so bypass the optimizer entirely and serve
    // originals. Re-enable optimization (drop `unoptimized`) after upgrading the
    // Vercel plan if responsive resizing is wanted back.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2_592_000, // 30d — CMS media is effectively immutable per URL
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
