# Deploy — Breathwork Tulum (Next.js + Payload CMS → Vercel)

The site and the Payload admin run from the **same** Next.js app (`site/`).
Frontend lives in `app/(frontend)/`, admin + API in `app/(payload)/`. Database is
Supabase Postgres; uploaded media goes to Vercel Blob in production.

## First-time admin login

After deploy (or locally), open `/admin/create-first-user` and create Sabine's
account. We don't seed credentials. The site content is already seeded (5 pages,
globals, testimonials, media).

## Local development

```bash
cd site
cp .env.example .env.local   # fill values (already done on Sergio's machine)
npm install
npm run dev                  # http://localhost:3000  (admin at /admin)
```

Useful scripts: `npm run generate:types`, `npm run generate:importmap`,
`npx tsx scripts/seed.ts` (re-seeds content — destructive: clears pages/testimonials/media).

## Environment variables

| Var | Dev | Vercel (production) |
|---|---|---|
| `DATABASE_URI` | Supabase direct/session connection | **Supabase Transaction pooler** (host `...pooler.supabase.com:6543`) — required for serverless |
| `PAYLOAD_SECRET` | any 32-byte hex | same, set in Vercel |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3000` | `https://breathworktulum.com` |
| `BLOB_READ_WRITE_TOKEN` | empty (local disk) | token from the Vercel Blob store |
| `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_*` | from Supabase | same |

Secrets live in `.env.local` (gitignored). On Vercel set them via `vercel env` or the dashboard.

## Vercel setup steps

1. Import the GitHub repo into Vercel; set the project **root directory** to `site/`.
2. **Create a Vercel Blob store** (Storage tab) → it injects `BLOB_READ_WRITE_TOKEN`.
   The Payload config auto-enables the Blob adapter when the token is present.
3. Add env vars above. For `DATABASE_URI` use the Supabase **Transaction pooler**
   string (Supabase dashboard → Connect → Transaction pooler). The direct
   `db.<ref>.supabase.co:5432` connection will exhaust connections on serverless.
4. **Migrations (production).** Dev uses Drizzle `push` (auto schema sync). Production
   should use migrations, not push:
   - Generate once: `npx payload migrate:create` (commit the `migrations/` folder).
   - Set `push:false` semantics for prod, and run `npx payload migrate` on deploy
     (e.g. as a Vercel build step or one-off) against the Supabase DB.
   - The current schema was created via dev `push`; before the first prod deploy,
     either run an initial `migrate:create` against the existing DB or keep `push`
     for the first deploy and switch to migrations after.
5. Deploy. Admin is served at `https://breathworktulum.com/admin`.
6. Re-upload / re-point media if needed: media seeded locally lives on local disk;
   on Vercel, upload images through the admin (they land in Blob) or re-run a
   Blob-aware seed. Existing `pages` reference media docs by ID, so swapping the
   stored file keeps the references intact.

## Notes / follow-ups

- Pages render dynamically (each request checks Payload auth so logged-in admins see
  drafts). For best performance later, switch to ISR + on-publish revalidation and
  gate draft rendering behind Next `draftMode()` only.
- Email: Payload logs emails to console (no adapter). Add an email adapter
  (`@payloadcms/email-nodemailer` or Resend) for password resets and, if wanted,
  contact-form delivery.
- The contact form (`/api/contact`) currently validates only — wire it to Supabase
  or email when ready.
