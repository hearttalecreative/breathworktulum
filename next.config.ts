import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // sharp ships native binaries — keep it external so it's required from
  // node_modules at runtime instead of bundled (fixes Vercel runtime load error).
  serverExternalPackages: ["sharp"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
