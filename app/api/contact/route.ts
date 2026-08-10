import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

// Consultas de los formularios.
//
// Antes esto validaba, escribía una línea en la consola y respondía que todo
// bien. Son cuatro formularios en vivo, incluida la lista de espera del
// Signature Retreat, así que cada consulta se perdía.
//
// Ahora la consulta se guarda primero y el aviso por correo va después. Si el
// correo no está configurado o falla, la consulta ya está en el panel.
const NOTIFY_TO = process.env.SMTP_FROM || "breathe@breathworktulum.com";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — silently accept to not tip off bots.
  if (body.company) return NextResponse.json({ ok: true });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const source = String(body.source ?? "").trim().slice(0, 120);

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email." }, { status: 422 });
  }

  try {
    const payload = await getPayload({ config });
    const doc = await payload.create({
      collection: "inquiries",
      data: { name, email, subject: subject || undefined, message, source: source || undefined } as never,
      overrideAccess: true,
    });

    // El aviso es lo secundario: si no hay SMTP, la consulta igual quedó guardada.
    if (process.env.SMTP_HOST) {
      try {
        await payload.sendEmail({
          to: NOTIFY_TO,
          replyTo: email,
          subject: `New inquiry — ${subject || "website form"}`,
          text: `From: ${name} <${email}>\nPage: ${source || "unknown"}\n\n${message}`,
        });
        await payload.update({
          collection: "inquiries",
          id: doc.id,
          data: { notifiedAt: new Date().toISOString() } as never,
          overrideAccess: true,
        });
      } catch (e) {
        console.error("[contact] no se pudo enviar el aviso:", (e as Error).message);
      }
    }
  } catch (e) {
    console.error("[contact] no se pudo guardar la consulta:", (e as Error).message);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
