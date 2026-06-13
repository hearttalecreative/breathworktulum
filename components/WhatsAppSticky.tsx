import { whatsappLink } from "@/lib/whatsapp";

// Floating WhatsApp button, mobile only, always present (13_GLOBAL_ELEMENTS.md).
// Quiet, present, no attention-grabbing animation.
export default function WhatsAppSticky() {
  return (
    <a
      href={whatsappLink("general")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-sage text-cream shadow-lg shadow-ink/20 lg:hidden"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm4.52 11.99c-.25-.12-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.31-.02-.47-.02-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.74 2.65 4.2 3.72.59.25 1.04.4 1.4.52.59.18 1.12.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
      </svg>
    </a>
  );
}
