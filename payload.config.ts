import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor, FixedToolbarFeature } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { en } from "@payloadcms/translations/languages/en";
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

// Origins allowed to send cookie-authenticated mutations. Payload only honors
// the auth cookie on a POST/PATCH/DELETE when the request Origin is in `csrf`
// (it auto-adds serverURL). The admin currently runs on the provisional domain
// while NEXT_PUBLIC_SERVER_URL points at the final domain, so without listing
// both here every save fails with "You are not allowed to perform this action".
// Keep the final + provisional + local origins so it works before and after the
// domain cutover. Extra origins can be supplied via ADMIN_ORIGINS (comma-sep).
const trustedOrigins = [
  "https://breathworktulum.com",
  "https://www.breathworktulum.com",
  "https://breathworktulum.hearttalecreative.com",
  "http://localhost:3000",
  "http://localhost:4123",
  ...(process.env.ADMIN_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? []),
];

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
  cors: trustedOrigins,
  csrf: trustedOrigins,
  ...(email ? { email } : {}),
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: "· Breathwork Tulum",
      // Match the admin browser-tab favicon to the public site's brand mark.
      icons: [
        { rel: "icon", type: "image/x-icon", url: "/favicon.ico" },
        { rel: "icon", type: "image/png", sizes: "512x512", url: "/brand/icon-512.png" },
        { rel: "apple-touch-icon", url: "/brand/icon-512.png" },
      ],
    },
    components: {
      graphics: {
        Logo: "@/components/admin/BrandLogo",
        Icon: "@/components/admin/BrandIcon",
      },
      providers: ["@/components/admin/AdminCredit"],
      views: {
        dashboard: { Component: "@/components/admin/Dashboard" },
      },
    },
  },
  // Admin UI is English-only.
  i18n: {
    supportedLanguages: { en },
    fallbackLanguage: "en",
  },
  collections: [Pages, Posts, Testimonials, Media, Users],
  globals: [SiteSettings, Header, Footer, ChatSettings],
  // A persistent (fixed) formatting toolbar on every rich-text field, so the
  // blog body reads as an obvious, easy WYSIWYG editor instead of relying on the
  // hover/selection toolbar. Keeps all Payload defaults (headings, lists, links,
  // images, blockquote, etc.).
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
  }),
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
