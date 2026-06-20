"use client";

import { useState } from "react";

// Reusable newsletter form. Backend (Brevo/FluentCRM) is a phase-2 wire-up;
// for now this validates and shows the confirmation copy from 13_GLOBAL_ELEMENTS.md.
export default function NewsletterSignup({
  tone = "light",
}: {
  tone?: "light" | "dark";
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const dark = tone === "dark";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That doesn't look like a valid email. Want to check?");
      return;
    }
    setError("");
    // TODO: POST to /api/newsletter once Brevo is connected.
    setDone(true);
  }

  if (done) {
    return (
      <p className={dark ? "text-cream-dim" : "text-muted"}>
        You&apos;re in. Check your inbox for a quick confirmation.{" "}
        <span className="font-serif italic">With Love, Sabine.</span>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <label htmlFor="nl-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="nl-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className={`min-h-[44px] flex-1 rounded-none border px-5 py-2.5 text-sm outline-none ${
            dark
              ? "border-cream-dim/30 bg-transparent text-cream placeholder:text-cream-dim/50"
              : "border-sand-deep bg-cream text-ink placeholder:text-faint"
          }`}
        />
        <button
          type="submit"
          className={`min-h-[44px] rounded-none px-6 py-2.5 text-sm font-medium transition-colors ${
            dark
              ? "bg-cream text-ink hover:bg-cream-dim"
              : "bg-ink text-cream hover:bg-night-soft"
          }`}
        >
          Sign up
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-clay">{error}</p>
      )}
      <p className={`mt-2 text-xs ${dark ? "text-cream-dim/70" : "text-faint"}`}>
        Unsubscribe in one click.
      </p>
    </form>
  );
}
