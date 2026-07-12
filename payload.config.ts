import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { en } from "@payloadcms/translations/languages/en";
import { es } from "@payloadcms/translations/languages/es";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Testimonials } from "./collections/Testimonials";
import { Pages } from "./collections/Pages";
import { Posts } from "./collections/Posts";
import { SiteSettings } from "./globals/SiteSettings";
import { Header } from "./globals/Header";
import { Footer } from "./globals/Footer";
import { ChatSettings } from "./globals/ChatSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

// Email is only wired when SMTP credentials exist (Vercel prod). Without them —
// e.g. local dev — Payload falls back to logging emails to the console, so the
// forgot-password flow still generates a reset link you can grab from the logs.
// defaultFromAddress must be an inbox Sabine controls, or spam filters bounce it.
const smtpHost = process.env.SMTP_HOST;
const email = smtpHost
  ? await nodemailerAdapter({
      defaultFromAddress: process.env.SMTP_FROM || "breathe@breathworktulum.com",
      defaultFromName: process.env.SMTP_FROM_NAME || "Breathwork Tulum",
      // Skip the connection check at boot: on serverless a failed verify would
      // block cold starts. Delivery errors still surface at send time.
      skipVerify: true,
      transportOptions: {
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  : undefined;

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  ...(email ? { email } : {}),
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: "· Breathwork Tulum" },
    components: {
      graphics: {
        Logo: "@/components/admin/BrandLogo",
        Icon: "@/components/admin/BrandIcon",
      },
      beforeDashboard: ["@/components/admin/DashboardWelcome"],
      providers: ["@/components/admin/AdminCredit"],
    },
  },
  // Panel en español por defecto (Sabine). Cada usuario puede cambiar el idioma
  // desde su perfil; el inglés queda disponible.
  i18n: {
    supportedLanguages: { es, en },
    fallbackLanguage: "es",
  },
  collections: [Pages, Posts, Testimonials, Media, Users],
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
