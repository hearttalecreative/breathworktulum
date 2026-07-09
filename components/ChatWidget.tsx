"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Floating AI chat for every visitor (replaces the WhatsApp-only sticky).
// Same quiet, refined language as the rest of the site: small night disc,
// soft halo, ivory panel. WhatsApp with Sabine stays one tap away — in the
// panel header, and inline whenever the assistant offers the handoff.

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "bwt-chat";
const MARKER = "[[WHATSAPP]]";

const ERROR_TEXT =
  "Something went wrong on my side. You can always reach Sabine directly on WhatsApp.";

function loadHistory(): Msg[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Msg[];
    return Array.isArray(parsed) ? parsed.slice(-20) : [];
  } catch {
    return [];
  }
}

function saveHistory(msgs: Msg[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-20)));
  } catch {
    /* storage unavailable — chat still works for the session */
  }
}

export default function ChatWidget({
  welcomeMessage,
  whatsappHref,
}: {
  welcomeMessage: string;
  whatsappHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Restore history after mount (avoids hydration mismatch).
  useEffect(() => {
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the newest message in view while streaming.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open]);

  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);

    const history: Msg[] = [...messages, { role: "user", content: text }];
    // Placeholder assistant bubble that streaming fills in.
    setMessages([...history, { role: "assistant", content: "" }]);

    const fail = () => {
      setMessages(() => {
        const next: Msg[] = [...history, { role: "assistant", content: `${ERROR_TEXT}${MARKER}` }];
        saveHistory(next);
        return next;
      });
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        fail();
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const current = acc;
        setMessages(() => [...history, { role: "assistant", content: current }]);
      }
      if (!acc.trim()) {
        fail();
        return;
      }
      saveHistory([...history, { role: "assistant", content: acc }]);
    } catch {
      fail();
    } finally {
      setBusy(false);
    }
  }, [input, busy, messages]);

  const shown: Msg[] = [
    { role: "assistant", content: welcomeMessage || "Hi, how can I help you today?" },
    ...messages,
  ];

  return (
    <>
      {/* Launcher */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Chat with us"}
        className="group fixed bottom-[max(1.1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-night text-pure shadow-[0_10px_30px_-8px_rgba(25,27,23,0.45)] ring-1 ring-inset ring-gold-soft/40 transition-transform duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
      >
        {/* Soft halo so it sits on the page, never harsh. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-gold-soft/30"
          style={{ transform: "scale(1.35)" }}
        />
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Breathwork Tulum"
          className="fixed inset-x-0 bottom-0 z-40 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl bg-ivory shadow-[0_24px_60px_-20px_rgba(25,27,23,0.35)] ring-1 ring-line sm:inset-x-auto sm:bottom-20 sm:right-4 sm:w-[380px] sm:max-h-[70vh] sm:rounded-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 bg-night px-5 py-4 text-pure">
            <div>
              <p className="font-serif text-lg leading-tight">Breathwork Tulum</p>
              <p className="text-xs text-pure/60">Ask me anything about the practice</p>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp with Sabine"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pure/10 text-whatsapp transition-colors hover:bg-pure/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
            >
              <WhatsAppIcon />
            </a>
          </div>

          {/* Messages */}
          <div ref={listRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {shown.map((m, i) => {
              const offersWhatsApp = m.role === "assistant" && m.content.includes(MARKER);
              const text = m.content.replaceAll(MARKER, "").trim();
              const streamingThis = busy && i === shown.length - 1 && m.role === "assistant";
              return (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className="max-w-[85%]">
                    <div
                      className={
                        m.role === "user"
                          ? "rounded-2xl rounded-br-md bg-forest px-3.5 py-2.5 text-sm leading-relaxed text-pure"
                          : "rounded-2xl rounded-bl-md bg-sand px-3.5 py-2.5 text-sm leading-relaxed text-ink"
                      }
                    >
                      {text || (streamingThis ? <TypingDots /> : null)}
                    </div>
                    {offersWhatsApp && !streamingThis && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-2 text-xs font-medium text-pure transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
                      >
                        <WhatsAppIcon size={14} />
                        Continue on WhatsApp with Sabine
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-end gap-2 border-t border-line bg-ivory px-3 py-3"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              disabled={busy}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Write your question…"
              aria-label="Your message"
              className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-xl bg-shell px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-night text-pure transition-transform active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Assistant is typing">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-soft/60" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-soft/60 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-soft/60 [animation-delay:300ms]" />
    </span>
  );
}

function WhatsAppIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm4.52 11.99c-.25-.12-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.31-.02-.47-.02-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.74 2.65 4.2 3.72.59.25 1.04.4 1.4.52.59.18 1.12.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}
