import { NextResponse } from "next/server";

// Contact form handler.
// MVP: validate and acknowledge. TODO (phase 2): forward to Sabine's inbox via
// Brevo/Resend + store lead in FluentCRM. Wire up with env vars when available.
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

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email." }, { status: 422 });
  }

  // TODO: send email / persist lead here.
  console.info("[contact] inquiry from", email, "subject:", body.subject);

  return NextResponse.json({ ok: true });
}
