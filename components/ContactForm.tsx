"use client";

import { useState } from "react";

// General inquiry form. Submits to /api/contact (validates + responds for now;
// real email backend — Brevo/Resend — is a phase-2 wire-up).
export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    // Honeypot
    if (data.company) return;
    if (!data.name || !data.email || !data.message) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) {
      setError("That doesn't look like a valid email. Want to check?");
      return;
    }

    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      <div className="rounded-2xl border border-sand-deep bg-cream p-8">
        <p className="text-[1.05rem] text-ink">
          Got it. I&apos;ll get back to you within 48 hours.
        </p>
        <p className="mt-2 font-serif italic text-gold">With Love, Sabine.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <Field label="Your name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone or WhatsApp (optional)" name="phone" />

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-ink">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          className="min-h-[44px] w-full rounded-xl border border-sand-deep bg-cream px-4 py-2.5 text-ink"
        >
          <option>Question</option>
          <option>Private session booking</option>
          <option>Personalized retreat</option>
          <option>Group or corporate</option>
          <option>Collaboration</option>
          <option>Press</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full rounded-xl border border-sand-deep bg-cream px-4 py-3 text-ink"
        />
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}
      {status === "error" && (
        <p className="text-sm text-clay">
          Something didn&apos;t go through. Try again, or write me directly at
          breathe@breathworktulum.com.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="min-h-[44px] rounded-full bg-ink px-7 py-3 text-cream transition-colors hover:bg-night-soft disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-clay"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="min-h-[44px] w-full rounded-xl border border-sand-deep bg-cream px-4 py-2.5 text-ink"
      />
    </div>
  );
}
