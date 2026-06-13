import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
