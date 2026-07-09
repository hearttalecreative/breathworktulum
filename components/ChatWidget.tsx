"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import WaveMark from "./WaveMark";

// Floating AI chat for every visitor (replaces the WhatsApp-only sticky).
// Warm, soft, healing language to match why people arrive here: a calm sage
// and gold palette, a gentle "breathing" launcher, a friendly host avatar, and
// quick ways to move toward a session with Sabine. WhatsApp with Sabine stays
// one tap away, in the header and inline whenever the assistant offers it.

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "bwt-chat";
const NUDGE_KEY = "bwt-chat-nudge";
const MARKER = "[[WHATSAPP]]";

const NUDGE_TEXT = "Hi, I'm right here if you have any questions about sessions, retreats, or getting started.";

const ERROR_TEXT =
  "I could not reach the assistant just now, but Sabine is right here for you on WhatsApp.";

// Warm starters shown before the first question, to make it easy to begin and
// to gently guide toward a session.
const QUICK_PROMPTS = [
  "Which session is right for me?",
  "What does a session feel like?",
  "I'd like to book with Sabine",
];

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
  const [opened, setOpened] = useState(false);
  const [nudge, setNudge] = useState(false);
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

  // A gentle proactive greeting so visitors notice they can chat live. Shows
  // once per session, a few seconds in, unless they've already opened or
  // dismissed it.
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(NUDGE_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (dismissed) return;
    const t = setTimeout(() => setNudge(true), 3500);
    return () => clearTimeout(t);
  }, []);

  const openChat = useCallback(() => {
    setOpen(true);
    setOpened(true);
    setNudge(false);
  }, []);

  const dismissNudge = useCallback(() => {
    setNudge(false);
    try {
      sessionStorage.setItem(NUDGE_KEY, "1");
    } catch {
      /* ignore */
    }
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

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
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
    },
    [busy, messages]
  );

  const shown: Msg[] = [
    {
      role: "assistant",
      content: welcomeMessage || "Hi, I'm so glad you're here. How can I support you today?",
    },
    ...messages,
  ];
  const showStarters = messages.length === 0 && !busy;

  return (
    <>
      <style>{BREATHE_CSS}</style>

      {/* Proactive greeting — draws the eye and says the chat is live. */}
      {nudge && !open && (
        <div
          className="fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] right-4 z-40 w-[15.5rem] max-w-[calc(100vw-2rem)]"
          style={{ animation: "bwtNudge 0.4s cubic-bezier(0.22,1,0.36,1)" }}
        >
          <button
            type="button"
            onClick={openChat}
            className="flex w-full items-start gap-2.5 rounded-2xl rounded-br-md bg-pure px-3.5 py-3 text-left shadow-[0_16px_40px_-16px_rgba(43,55,48,0.5)] ring-1 ring-line transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
          >
            <span aria-hidden className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-whatsapp to-gold-soft text-pure">
              <WaveMark className="w-4 text-pure" />
            </span>
            <span className="text-[0.82rem] leading-snug text-ink">{NUDGE_TEXT}</span>
          </button>
          <button
            type="button"
            onClick={dismissNudge}
            aria-label="Dismiss"
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-forest text-pure shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}

      {/* Launcher */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : openChat())}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Chat with us"}
        className="group fixed bottom-[max(1.1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-whatsapp to-gold-soft text-pure shadow-[0_14px_34px_-10px_rgba(43,55,48,0.5)] ring-1 ring-inset ring-pure/30 transition-transform duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
      >
        {/* Attention ring + gentle breathing halo, before the first open. */}
        {!open && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-whatsapp/50"
              style={{ animation: "bwtPing 2.6s cubic-bezier(0,0,0.2,1) infinite" }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full bg-whatsapp/25"
              style={{ animation: "bwtBreathe 4.5s ease-in-out infinite" }}
            />
          </>
        )}
        {/* Unread-style dot until the visitor opens the chat. */}
        {!open && !opened && (
          <span aria-hidden className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-shell bg-gold" />
        )}
        {open ? (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <WaveMark className="w-7 text-pure" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Breathwork Tulum"
          className="fixed inset-x-0 bottom-0 z-40 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-3xl bg-ivory shadow-[0_-18px_60px_-24px_rgba(43,55,48,0.45)] ring-1 ring-line sm:inset-x-auto sm:bottom-24 sm:right-5 sm:w-[390px] sm:max-h-[74vh] sm:rounded-3xl sm:shadow-[0_28px_70px_-24px_rgba(43,55,48,0.4)]"
          style={{ animation: "bwtIn 0.34s cubic-bezier(0.22,1,0.36,1)" }}
        >
          {/* Mobile grab handle */}
          <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-forest/15 sm:hidden" />

          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#eaf1ea] to-champagne px-4 py-3.5">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-whatsapp to-gold-soft text-pure shadow-[0_6px_16px_-6px_rgba(43,55,48,0.5)]"
            >
              <WaveMark className="w-5 text-pure" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[1.05rem] leading-tight text-forest">Breathwork Tulum</p>
              <p className="flex items-center gap-1.5 text-xs text-forest/60">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-whatsapp" />
                Here with you, whenever you need
              </p>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp with Sabine"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-whatsapp/15 text-[#4d7a62] transition-colors hover:bg-whatsapp/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
            >
              <WhatsAppIcon />
            </a>
            <button
              type="button"
              onClick={close}
              aria-label="Close chat"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-forest/50 transition-colors hover:bg-forest/5 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} aria-live="polite" className="flex-1 space-y-3.5 overflow-y-auto bg-ivory px-4 py-4">
            {shown.map((m, i) => {
              const offersWhatsApp = m.role === "assistant" && m.content.includes(MARKER);
              const text = m.content.replaceAll(MARKER, "").trim();
              const streamingThis = busy && i === shown.length - 1 && m.role === "assistant";
              return (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex items-end gap-2 justify-start"}>
                  {m.role === "assistant" && (
                    <span aria-hidden className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-whatsapp to-gold-soft text-pure">
                      <WaveMark className="w-4 text-pure" />
                    </span>
                  )}
                  <div className="max-w-[82%]">
                    <div
                      className={
                        m.role === "user"
                          ? "rounded-3xl rounded-br-md bg-[#e5efe6] px-4 py-2.5 text-[0.9rem] leading-relaxed text-forest"
                          : "rounded-3xl rounded-bl-md bg-pure px-4 py-2.5 text-[0.9rem] leading-relaxed text-ink shadow-[0_2px_10px_-6px_rgba(43,55,48,0.3)] ring-1 ring-line/70"
                      }
                    >
                      {text || (streamingThis ? <TypingDots /> : null)}
                    </div>
                    {offersWhatsApp && !streamingThis && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-2.5 text-xs font-medium text-pure shadow-[0_8px_20px_-8px_rgba(123,168,137,0.9)] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
                      >
                        <WhatsAppIcon size={15} />
                        Book with Sabine on WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Starter chips */}
            {showStarters && (
              <div className="flex flex-wrap gap-2 pl-9 pt-1">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => void send(p)}
                    className="rounded-full border border-gold-soft/40 bg-pure/70 px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:border-gold-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-end gap-2 border-t border-line bg-ivory px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
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
                  void send(input);
                }
              }}
              placeholder="Share what's on your mind…"
              aria-label="Your message"
              className="max-h-28 min-h-[2.75rem] flex-1 resize-none rounded-2xl bg-pure px-4 py-3 text-[0.9rem] text-ink shadow-[inset_0_1px_2px_rgba(43,55,48,0.04)] ring-1 ring-line placeholder:text-ink-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-whatsapp to-gold-soft text-pure shadow-[0_8px_20px_-8px_rgba(43,55,48,0.55)] transition-transform active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

const BREATHE_CSS = `
@keyframes bwtBreathe {
  0%, 100% { transform: scale(1); opacity: 0.55; }
  50% { transform: scale(1.5); opacity: 0; }
}
@keyframes bwtPing {
  0% { transform: scale(1); opacity: 0.7; }
  75%, 100% { transform: scale(1.8); opacity: 0; }
}
@keyframes bwtIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes bwtNudge {
  from { opacity: 0; transform: translateY(10px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  [style*="bwtBreathe"], [style*="bwtIn"], [style*="bwtPing"], [style*="bwtNudge"] { animation: none !important; }
}
`;

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Assistant is typing">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-whatsapp/70" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-whatsapp/70 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-whatsapp/70 [animation-delay:300ms]" />
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
