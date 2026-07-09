import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Testimonials } from "./collections/Testimonials";
import { Pages } from "./collections/Pages";
import { SiteSettings } from "./globals/SiteSettings";
import { Header } from "./globals/Header";
import { Footer } from "./globals/Footer";
import { ChatSettings } from "./globals/ChatSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: "· Breathwork Tulum" },
  },
  collections: [Pages, Testimonials, Media, Users],
  globals: [SiteSettings, Header, Footer, ChatSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
      // Supabase pooler presents a self-signed cert in the chain; accept it.
      ssl: { rejectUnauthorized: false },
    },
  }),
  sharp,
  // Media → Vercel Blob in production. Falls back to local disk storage in dev
  // when no token is set, so uploads still work before the Blob store exists.
  plugins: blobToken
    ? [
        vercelBlobStorage({
          collections: { media: true },
          token: blobToken,
        }),
      ]
    : [],
});
