import type { Metadata } from "next";
import Section from "@/components/Section";
import CTAButton from "@/components/CTAButton";
import ContactForm from "@/components/ContactForm";
import JsonLd from "@/components/JsonLd";
import { pageMeta, localBusinessLd } from "@/lib/seo";
import { whatsappLink, emailLink } from "@/lib/whatsapp";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Contact Breathwork Tulum. WhatsApp, Email, Booking",
  description:
    "Reach out by WhatsApp, email, or contact form. Sessions in Tulum, in person retreats in Riviera Maya, and worldwide online programs.",
  path: "/contact/",
});

const EXPECT = [
  ["First message.", "Doesn't need to be long. “Hi, I'm thinking about a session” or “I have a question about retreats” is enough. The conversation builds from there."],
  ["My response.", "Usually a voice note on WhatsApp, around two minutes. I respond to what you actually asked, not with a template. This is how I work."],
  ["Timing.", "WhatsApp: usually within hours during business hours (Mexico Central Time). Email: within 24 to 48 hours. Discovery calls: within a week."],
  ["No automated chatbots.", "If you message me, you're getting me. Sometimes that means I take a few hours to respond properly instead of replying instantly with a script."],
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "ContactPage", name: "Contact Breathwork Tulum" },
          localBusinessLd(),
        ]}
      />

      {/* BLOCK-01 Hero */}
      <Section tone="cream" width="narrow" className="text-center">
        <h1 className="text-[2.4rem] leading-[1.1] sm:text-5xl">
          The easiest way to start is to write me.
        </h1>
        <p className="prose-lede mx-auto mt-6 max-w-xl">
          WhatsApp gets the fastest response. Email works too if you prefer to
          take more time. Forms are below for specific cases.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <CTAButton href={whatsappLink("contact")} variant="whatsapp">
            Message me on WhatsApp
          </CTAButton>
          <CTAButton href={emailLink()} variant="secondary">
            Send me an email
          </CTAButton>
        </div>
      </Section>

      {/* BLOCK-02 Direct contact */}
      <Section tone="sand" width="wide">
        <div className="grid gap-6 md:grid-cols-3">
          <Tile title="WhatsApp" line="Fastest response, usually same day." value={SITE.phoneDisplay} ctaLabel="Open WhatsApp" href={whatsappLink("contact")} />
          <Tile title="Email" line="For longer messages or when you want to take your time." value={SITE.email} ctaLabel="Send an email" href={emailLink()} />
          <Tile title="Discovery Call" line="30 minutes for retreats and corporate inquiries." value="Booking link coming soon" ctaLabel="Book a discovery call" href={emailLink("Discovery call request")} />
        </div>
      </Section>

      {/* BLOCK-03 What to expect */}
      <Section tone="cream" width="default">
        <h2 className="text-3xl sm:text-4xl">A few honest notes on what happens next.</h2>
        <div className="mt-10 space-y-6">
          {EXPECT.map(([h, b]) => (
            <div key={h}>
              <h3 className="font-serif text-xl text-ink">{h}</h3>
              <p className="mt-1.5 text-muted">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* BLOCK-04 Form */}
      <Section tone="sand" width="default">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-3xl sm:text-4xl">Or use a form, if that&apos;s easier.</h2>
            <p className="mt-5 text-muted">
              Tell me a little about what&apos;s bringing you here. For private
              sessions, a phone or WhatsApp number gets you a faster reply.
            </p>
            <div className="mt-8 rounded-2xl border border-sand-deep bg-cream/60 p-6 text-sm text-muted">
              <p className="font-medium text-ink">Where I&apos;m based</p>
              <p className="mt-1">Tulum, Quintana Roo, Mexico.</p>
              <p className="mt-3 font-medium text-ink">When I&apos;m reachable</p>
              <p className="mt-1">
                WhatsApp and email: Monday to Friday, 9 AM to 7 PM Mexico Central
                Time. Weekends I check sporadically.
              </p>
            </div>
          </div>
          <ContactForm />
        </div>
      </Section>

      {/* BLOCK-08 Final CTA */}
      <Section tone="cream" width="narrow" className="text-center">
        <h2 className="text-3xl sm:text-4xl">One message away.</h2>
        <div className="mt-8 flex justify-center">
          <CTAButton href={whatsappLink("contact")} variant="whatsapp">
            Message me on WhatsApp
          </CTAButton>
        </div>
      </Section>
    </>
  );
}

function Tile({
  title,
  line,
  value,
  ctaLabel,
  href,
}: {
  title: string;
  line: string;
  value: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-sand-deep bg-cream p-7">
      <h3 className="font-serif text-2xl text-ink">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted">{line}</p>
      <p className="mt-4 text-sm font-medium text-ink">{value}</p>
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold hover:text-ink"
      >
        {ctaLabel} <span aria-hidden>→</span>
      </a>
    </div>
  );
}
