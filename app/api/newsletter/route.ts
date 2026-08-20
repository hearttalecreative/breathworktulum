import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { syncSubscriber, newsletterConfigured } from "@/lib/newsletter";

// Alta al newsletter.
//
// Orden deliberado: primero se guarda en la base, después se intenta la
// plataforma de email. Si la plataforma falla o todavía no está configurada, el
// contacto ya está a salvo y queda marcado como pendiente de sincronizar.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: los bots completan todo, incluido un campo que nadie ve.
  if (body.bwt_ref) return NextResponse.json({ ok: true });

  const email = String(body.email ?? "").trim().toLowerCase();
  const firstName = String(body.firstName ?? "").trim();
  const source = String(body.source ?? "").trim().slice(0, 120);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "That doesn't look like a valid email." }, { status: 422 });
  }

  const payload = await getPayload({ config });

  const existing = (
    await payload.find({
      collection: "subscribers",
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0] as { id: number | string } | undefined;

  let id = existing?.id;
  if (!id) {
    const created = await payload.create({
      collection: "subscribers",
      data: { email, firstName: firstName || undefined, source: source || undefined } as never,
      overrideAccess: true,
    });
    id = created.id;
  } else if (firstName) {
    await payload.update({ collection: "subscribers", id, data: { firstName } as never, overrideAccess: true });
  }

  if (newsletterConfigured) {
    const res = await syncSubscriber(email, firstName || undefined);
    await payload.update({
      collection: "subscribers",
      id,
      data: res.ok
        ? { syncedAt: new Date().toISOString(), syncError: null }
        : { syncError: res.error },
      overrideAccess: true,
    } as never);
  }

  return NextResponse.json({ ok: true });
}
