"use client";

import { useState } from "react";

// Formulario del newsletter. Es nuestro, con el diseño del sitio, y manda a
// /api/newsletter, que guarda el contacto y después lo pasa a la plataforma de
// email. Por eso cambiar de plataforma no obliga a rehacer nada acá.
export default function NewsletterSignup({
  tone = "light",
  buttonLabel = "Receive the Letters",
  finedPrint = "By signing up, you agree to receive occasional emails from Breathwork Tulum. Unsubscribe anytime.",
  source = "",
  stacked = false,
  successMessage = "You're in. Thank you for signing up.",
  successSignature = "With Love, Sabine.",
}: {
  tone?: "light" | "dark";
  buttonLabel?: string;
  finedPrint?: string;
  source?: string;
  /** Lo que se ve después de anotarse. No promete un correo de confirmación:
   *  la plataforma de email todavía no está conectada. */
  successMessage?: string;
  successSignature?: string;
  /** Para columnas angostas, como la del pie. Tres elementos en fila ahí dejaban
   *  los campos reducidos a dos cuadraditos. Apilado ocupan todo el ancho. */
  stacked?: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const dark = tone === "dark";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That doesn't look like a valid email. Want to check?");
      return;
    }
    setError("");
    setState("sending");
    try {
      const res = await fetch("/api/newsletter/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, email, bwt_ref: company, source }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
      setState("done");
    } catch (err) {
      setState("idle");
      setError((err as Error).message || "Something went wrong. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <p className={dark ? "text-cream-dim" : "text-muted"}>
        {successMessage}{" "}
        <span className="font-serif italic">{successSignature}</span>
      </p>
    );
  }

  const field = `min-h-[44px] w-full rounded-none border px-5 py-2.5 text-sm outline-none ${
    dark
      ? "border-cream-dim/30 bg-transparent text-cream placeholder:text-cream-dim/50"
      : "border-sand-deep bg-cream text-ink placeholder:text-faint"
  }`;

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <div className={stacked ? "flex flex-col gap-2" : "flex flex-col gap-2 sm:flex-row"}>
        <div className="flex-1">
          <label htmlFor={`nl-name-${tone}`} className="sr-only">
            First name
          </label>
          <input
            id={`nl-name-${tone}`}
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className={field}
          />
        </div>
        <div className="flex-1">
          <label htmlFor={`nl-email-${tone}`} className="sr-only">
            Email address
          </label>
          <input
            id={`nl-email-${tone}`}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={field}
          />
        </div>
        <button
          type="submit"
          disabled={state === "sending"}
          className={`min-h-[44px] rounded-none px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${
            stacked ? "w-full" : "shrink-0"
          } ${dark ? "bg-cream text-ink hover:bg-cream-dim" : "bg-ink text-cream hover:bg-night-soft"}`}
        >
          {state === "sending" ? "One moment…" : buttonLabel}
        </button>
      </div>

      {/* Trampa para bots: fuera de pantalla y nunca enfocable con el teclado. */}
      <input
        type="text"
        name="bwt_ref"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {error ? <p className="mt-2 text-sm text-clay">{error}</p> : null}
      {finedPrint ? (
        <p className={`mt-3 text-xs leading-relaxed ${dark ? "text-cream-dim/70" : "text-faint"}`}>
          {finedPrint}{" "}
          <a href="/legal/privacy/" className="underline underline-offset-2 hover:opacity-80">
            Privacy policy
          </a>
          .
        </p>
      ) : null}
    </form>
  );
}
