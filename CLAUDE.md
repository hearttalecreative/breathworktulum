@AGENTS.md

## Credenciales

Valores reales en `.env.local` (gitignoreado — nunca se commitea). Plantilla con placeholders en `.env.example`. No mezclar credenciales de otros proyectos.

Variables en `.env.local`:

**Supabase — públicas (browser-safe)**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Supabase — solo servidor**
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_PASSWORD`
- `DATABASE_URL`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ANON_JWT`
- `SUPABASE_SERVICE_ROLE_JWT`

**Payload CMS**
- `DATABASE_URI` — conexión Postgres (dev: Supabase directo; Vercel: pooler de transacción, puerto 6543)
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL` — origen público (Live Preview, canonical/OG)

**Vercel (proyecto + deploy + Blob)**
- `BLOB_READ_WRITE_TOKEN` — almacenamiento de media (vacío = disco local en dev)
- `VERCEL_PROJECT_ID`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_NAME`
- `VERCEL_OIDC_TOKEN`
- `VERCEL_TOKEN`

**GitHub**
- `GITHUB_REPO`
- `GITHUB_USERNAME`
- `GITHUB_TOKEN`
