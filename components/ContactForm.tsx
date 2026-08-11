"use client";

import { useState } from "react";

// Formulario de consulta. Manda a /api/contact, que guarda la consulta en el
// panel y después avisa por correo.
//
// Las opciones del desplegable salen del bloque, así que ella las edita desde el
// panel. Esta lista es el respaldo si el bloque no trae ninguna.
const SUBJECTS_FALLBACK = [
  "Private session",
  "Couples / Shared session",
  "Private retreat",
  "Corporate or group breathwork",
  "General question",
];

export default function ContactForm({
  subjectLabel = "I'm interested in",
  subjects,
  source = "",
}: {
  subjectLabel?: string;
  subjects?: string[];
  source?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const options = subjects?.length ? subjects : SUBJECTS_FALLBACK;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    // Honeypot
    if (data.company) return;
    if (!data.name || !data.email || !data.phone || !data.message) {
      setError("Please fill in your name, email, phone, and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) {
      setError("That doesn't look like a valid email. Want to check?");
      return;
    }

    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="relative overflow-hidden bg-ivory/70 p-8">
        <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold-soft/60 to-transparent" />
        <p className="text-[1.05rem] text-ink">Your message has been received.</p>
        <p className="mt-2 text-ink-soft">I normally reply within 24 to 48 hours.</p>
        <p className="mt-4 font-serif italic text-gold-ink">With Love, Sabine.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7">
      {/* Honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {/* Al sacar los asteriscos rojos no quedó forma de saber qué era
          obligatorio, y ella dio por hecho que nada lo era. Vuelve la marca,
          en dorado en vez de rojo, con la aclaración arriba. */}
      <p className="text-xs text-faint">
        Fields marked with <span className="text-gold-ink">*</span> are required.
      </p>

      {/* Nombre y teléfono comparten fila: acorta el formulario sin apretar nada. */}
      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Your name" name="name" autoComplete="name" required />
        <Field label="Phone or WhatsApp, including country code" name="phone" type="tel" autoComplete="tel" required />
      </div>
      <Field label="Email" name="email" type="email" autoComplete="email" required />

      <div>
        <label htmlFor="subject" className={LABEL}>
          {subjectLabel}
        </label>
        <div className="relative">
          <select id="subject" name="subject" className={`${FIELD} appearance-none pr-8`}>
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <span aria-hidden className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gold-ink">
            ⌄
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="message" className={LABEL}>
          Message <span className="text-gold-ink">*</span>
        </label>
        <textarea id="message" name="message" rows={5} required className={`${FIELD} resize-y leading-relaxed`} />
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}
      {status === "error" ? (
        <p className="text-sm text-error">
          Something didn&apos;t go through. Try again, or write me directly at
          breathe@breathworktulum.com.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-[3rem] items-center bg-ink px-8 text-sm font-medium text-cream transition-transform hover:bg-night-soft active:scale-95 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        <p className="text-xs text-faint">
          Your details stay between us.{" "}
          <a href="/privacy/" className="underline underline-offset-2 hover:text-ink-soft">
            Privacy policy
          </a>
        </p>
      </div>
    </form>
  );
}

// Campos con una sola línea abajo en vez de cajas blancas. Las cajas metían un
// bloque de blanco puro sobre el fondo de la sección y el formulario terminaba
// pareciendo un trámite dentro de una página que no lo es. El filete es el mismo
// recurso que usa el resto del sitio, y al enfocar se vuelve dorado.
const FIELD =
  "min-h-[44px] w-full rounded-none border-0 border-b border-ink/20 bg-transparent px-1 py-2.5 text-[1.05rem] text-ink outline-none transition-colors placeholder:text-faint focus:border-gold-soft";

// La etiqueta deja de ser negrita negra: va como los eyebrows del sitio.
const LABEL = "mb-1 block text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft";

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={LABEL}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className={FIELD}
      />
    </div>
  );
}
