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

**Email / SMTP** — habilita el envío del correo de "olvidé contraseña" del admin. Sin `SMTP_HOST`, Payload escribe el correo (con el link de reset) en la consola en vez de enviarlo.
- `SMTP_HOST` — host SMTP (vacío en dev)
- `SMTP_PORT` — 587 (STARTTLS) o 465 (SSL); 465 activa `secure`
- `SMTP_USER` / `SMTP_PASS` — credenciales SMTP
- `SMTP_FROM` — remitente; debe ser un buzón del dominio SMTP (default `breathe@breathworktulum.com`)
- `SMTP_FROM_NAME` — nombre visible (default `Breathwork Tulum`)

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

## Lecciones aprendidas

### Orden al desplegar cambios que tocan el esquema

Payload empuja el esquema **cuando arranca**, no durante `npm run build`. Un campo
nuevo sin su columna hace que las páginas respondan 200 con el cuerpo vacío, y el
sitio entero queda caído (pasó en el PR #33).

Secuencia correcta:

1. `npm run build`
2. Correr un script que arranque Payload (`node --env-file=.env.local --import tsx scripts/<x>.ts`) para que cree las columnas
3. Mergear y esperar a que el deploy esté **Ready** en Vercel
4. **Recién ahí** invalidar el caché: `POST /api/revalidate/` con `x-revalidate-token: $PAYLOAD_SECRET`

El paso 4 va después del 3 a propósito. `getGlobals()` y las páginas usan
`unstable_cache`; si se invalida antes de que el build nuevo esté sirviendo, el
caché se vuelve a llenar leyendo con el build viejo, que no conoce el campo nuevo.
Pasó con `mobileOnly` en el menú: la base y la API de Payload devolvían el valor
correcto y el sitio seguía mostrando el dato viejo.

Verificar siempre contra el HTML servido, no contra la base, y contar
encabezados por página: un 200 con cuerpo vacío es el modo de falla que se
escapa.

### Quitar un campo del esquema

Borrar un campo dispara un DROP destructivo con confirmación interactiva, que
cuelga en modo headless. Si un campo se retira, dejarlo con `admin: { hidden: true }`
para que el push siga siendo aditivo.

### Subir archivos al almacenamiento de medios

Los blobs van a la **raíz**, sin prefijo: `put(filename, ...)`. Un `put("media/" + filename, ...)`
sube bien pero Payload no los encuentra y las imágenes quedan en 404. Pasó al
recomprimir las variantes a WebP: 190 imágenes rotas en vivo hasta reparar.
La referencia correcta es `scripts/regen-image-sizes.ts`.

Al verificar imágenes contra el HTML servido, extraer las URLs **solo de las
etiquetas `<img>`**. Buscar `/api/media/file/...` en todo el documento también
matchea el payload RSC, donde las comillas van escapadas, y aparecen URLs con una
barra invertida al final que dan falsos errores.

### Cacheado de páginas (pendiente, decidido para después del lanzamiento)

Hoy todas las páginas son `force-dynamic`: nada se cachea y cada visita espera un
render nuevo. Se nota en las páginas largas, donde la pantalla de carga queda a la
vista. La vía correcta en Next 16 es activar `cacheComponents` y marcar el render
con `use cache` + `cacheTag`; el modo borrador saltea el caché por sí solo, así
que no hace falta el `force-dynamic` que hoy lo protege. Cambia el comportamiento
de toda la aplicación y activa PPR, así que se hace con verificación página por
página y no durante la revisión diaria de la clienta.
