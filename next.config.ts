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
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2_592_000, // 30d — CMS media is effectively immutable per URL
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
