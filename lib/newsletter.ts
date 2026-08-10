// Envío del suscriptor a la plataforma de email.
//
// El formulario es nuestro y la plataforma queda del otro lado de esta función.
// Ese es el punto: si mañana pasa de Flodesk a Brevo o a MailerLite, cambian dos
// variables de entorno y nada más. Con el formulario incrustado de la
// plataforma, en cambio, mudarse obliga a rehacerlo.
//
// Si no hay clave configurada, no es un error: el contacto ya quedó guardado en
// la base y esto simplemente no corre todavía.

export type SyncResult = { ok: true } | { ok: false; error: string };

const provider = (process.env.NEWSLETTER_PROVIDER || "").trim().toLowerCase();
const apiKey = (process.env.NEWSLETTER_API_KEY || "").trim();
const listId = (process.env.NEWSLETTER_LIST_ID || "").trim();

export const newsletterConfigured = Boolean(provider && apiKey);

async function flodesk(email: string, firstName?: string): Promise<SyncResult> {
  // Basic auth con la API key como usuario. Requiere plan pago: el gratuito de
  // Flodesk no expone la API.
  const auth = Buffer.from(`${apiKey}:`).toString("base64");
  const head = { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };

  const r = await fetch("https://api.flodesk.com/v1/subscribers", {
    method: "POST",
    headers: head,
    body: JSON.stringify({ email, first_name: firstName || undefined }),
  });
  if (!r.ok) return { ok: false, error: `flodesk ${r.status}: ${(await r.text()).slice(0, 180)}` };

  if (listId) {
    const s = await fetch(`https://api.flodesk.com/v1/subscribers/${encodeURIComponent(email)}/segments`, {
      method: "POST",
      headers: head,
      body: JSON.stringify({ segment_ids: [listId] }),
    });
    if (!s.ok) return { ok: false, error: `flodesk segment ${s.status}: ${(await s.text()).slice(0, 180)}` };
  }
  return { ok: true };
}

async function brevo(email: string, firstName?: string): Promise<SyncResult> {
  const r = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      attributes: firstName ? { FIRSTNAME: firstName } : undefined,
      listIds: listId ? [Number(listId)] : undefined,
      updateEnabled: true,
    }),
  });
  // 204 cuando actualiza un contacto que ya existía.
  if (!r.ok && r.status !== 204) return { ok: false, error: `brevo ${r.status}: ${(await r.text()).slice(0, 180)}` };
  return { ok: true };
}

async function mailerlite(email: string, firstName?: string): Promise<SyncResult> {
  const r = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      fields: firstName ? { name: firstName } : undefined,
      groups: listId ? [listId] : undefined,
    }),
  });
  if (!r.ok) return { ok: false, error: `mailerlite ${r.status}: ${(await r.text()).slice(0, 180)}` };
  return { ok: true };
}

export async function syncSubscriber(email: string, firstName?: string): Promise<SyncResult> {
  if (!newsletterConfigured) return { ok: false, error: "not configured" };
  try {
    if (provider === "flodesk") return await flodesk(email, firstName);
    if (provider === "brevo") return await brevo(email, firstName);
    if (provider === "mailerlite") return await mailerlite(email, firstName);
    return { ok: false, error: `unknown provider "${provider}"` };
  } catch (e) {
    return { ok: false, error: (e as Error).message.slice(0, 180) };
  }
}
