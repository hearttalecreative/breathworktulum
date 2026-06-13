import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/Section";
import CTAButton from "@/components/CTAButton";
import Accordion from "@/components/Accordion";
import JsonLd from "@/components/JsonLd";
import { pageMeta, serviceLd, faqLd } from "@/lib/seo";
import { whatsappLink, emailLink } from "@/lib/whatsapp";

export const metadata: Metadata = pageMeta({
  title: "Private Breathwork Sessions in Tulum. Foundation, Immersive, 1 Day",
  description:
    "One on one breathwork sessions in Tulum or online. Foundation, Immersive, and 1 Day Private Retreat formats. Couples and 2 person sessions available.",
  path: "/work-with-me/private-sessions/",
  ogImage: "/images/breathwork-tulum-deck-session.jpg",
});

const FORMATS = [
  {
    id: "foundation",
    name: "Foundation Session",
    duration: "Around 2 hours",
    ideal: "First time experiencing breathwork, or a first session with me",
  },
  {
    id: "immersive",
    name: "Immersive Session",
    tag: "Signature",
    duration: "Around 3 to 4 hours, body-led not clock-led",
    ideal: "Going deeper. The format the method was built for",
  },
  {
    id: "one-day",
    name: "1 Day Private Retreat",
    duration: "A full day",
    ideal: "Repeat clients, or someone arriving in transition wanting full focus",
  },
];

const FAQ = [
  { q: "Do I need breathwork experience?", a: "No. The Foundation Session exists specifically for first-timers. The technique is soft by design." },
  { q: "How is this different from Wim Hof, Holotropic, or Pranayama?", a: "Different lineage, different goal. Clarity Breathwork™ is built for emotional work, not performance or peak experience. The pace is slower and the focus is on what's stored in the body, not on catharsis." },
  { q: "Will I feel a release?", a: "Maybe, maybe not. I don't aim for catharsis. I aim for what's actually ready. Sometimes that's emotional, sometimes that's a quiet shift. Both count." },
  { q: "What if I cry, or shake, or feel overwhelmed?", a: "That's all part of the territory. My job is to stay with you, regulate the room, and make sure the experience completes safely." },
  { q: "How long until I see effects?", a: "Some shifts land within hours, others over weeks. Most people notice a difference in how they sleep and how they respond to stress within the first few days." },
  { q: "Is online really equivalent to in person?", a: "Functionally yes, with some honest differences. In person, I can read your body more directly. Online, you're in your own space which has its own value. Both work." },
  { q: "Can I do this if I'm in therapy?", a: "Yes, and it often pairs well. Bring it up so I know the context. If your therapist wants to coordinate, I'm open to it." },
  { q: "How do I book?", a: "WhatsApp is the fastest. Email also works. We'll exchange a few messages, decide on format and timing, and book it from there." },
];

export default function PrivateSessionsPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceLd("Private breathwork sessions", "One on one breathwork sessions in Tulum or online. Foundation, Immersive, and 1 Day Private Retreat formats."),
          faqLd(FAQ),
        ]}
      />

      {/* BLOCK-01 Hero */}
      <section className="bg-cream px-6 pt-16 pb-12 sm:pt-20 lg:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Private Sessions</span>
            <h1 className="mt-3 text-[2.4rem] leading-[1.08] sm:text-5xl">
              Private breathwork sessions, in Tulum or online.
            </h1>
            <p className="prose-lede mt-7">
              One on one, or two on the mat together. Three formats, one process.
              Choose the one that fits where you are.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CTAButton href={whatsappLink("general")} variant="whatsapp">
                Message me on WhatsApp
              </CTAButton>
              <CTAButton href="#compare" variant="secondary">
                Compare formats
              </CTAButton>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
            <Image
              src="/images/breathwork-tulum-private-session.jpg"
              alt="Sabine outdoors in Tulum, relaxed and present"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* BLOCK-02 Comparison */}
      <Section id="compare" tone="sand" width="wide">
        <h2 className="text-3xl sm:text-4xl">The three formats, side by side.</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {FORMATS.map((f) => (
            <div key={f.id} className="flex flex-col rounded-2xl border border-sand-deep bg-cream p-7">
              {f.tag && (
                <span className="mb-3 inline-block w-fit rounded-full bg-gold/15 px-3 py-1 text-xs font-medium uppercase tracking-widest text-gold">
                  {f.tag}
                </span>
              )}
              <h3 className="font-serif text-2xl text-ink">{f.name}</h3>
              <dl className="mt-4 space-y-2 text-sm text-muted">
                <div>
                  <dt className="inline font-medium text-ink">Duration: </dt>
                  <dd className="inline">{f.duration}.</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-ink">Ideal for: </dt>
                  <dd className="inline">{f.ideal}.</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-ink">From: </dt>
                  <dd className="inline">$[price on inquiry].</dd>
                </div>
              </dl>
              <a href={`#${f.id}`} className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-gold hover:text-ink">
                Read more <span aria-hidden>→</span>
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* BLOCK-03 Foundation */}
      <FormatDetail
        id="foundation"
        title="Foundation Session"
        tagline="Where most people start."
        paras={[
          "The Foundation is the entry point. Two hours, an intake conversation, a Clarity Breathwork™ session, and time to come back to the room together at the end.",
          "If you've never done breathwork before, this is the right format. If you've done other techniques (Wim Hof, Holotropic, Pranayama), this is a different terrain. Softer. Slower. Trauma informed.",
          "By the end you'll have a clearer sense of what's stored where in your body, the language to name it, and a first felt experience of working with it instead of around it.",
        ]}
        included={[
          "Pre-session intake conversation (around 30 minutes).",
          "Around 60 to 75 minutes of guided breathwork.",
          "Integration conversation at the end.",
          "A simple practice to take with you.",
        ]}
        ctaText="Book a Foundation"
        waHref={whatsappLink("foundation")}
        tone="cream"
      />

      {/* BLOCK-04 Immersive */}
      <FormatDetail
        id="immersive"
        title="Immersive Session"
        tag="Signature"
        tagline="The format the method was built for."
        paras={[
          "The Immersive is what I do when I have enough time to actually work. Half a day, body-led, with room to read what's coming up and respond instead of rush.",
          "The intake goes deeper. We map the core wounds and patterns that are loud right now. The breathwork goes longer. The integration isn't squeezed into the last ten minutes. There's space for somatic exploration, conversation, silence, sometimes a second pass of breath.",
          "Some people do it once. Others extend it into multiple Immersive sessions across a few weeks. The format is the same. The depth grows with repetition.",
          "This is what I recommend to most people who can give it the time. It's also the format most repeat clients land on.",
        ]}
        included={[
          "Deeper intake (around 45 minutes).",
          "Around 90 minutes of guided breathwork.",
          "Somatic and conversational integration.",
          "Time for whatever is asking for time.",
          "Pre-session and post-session voice notes via WhatsApp.",
        ]}
        ctaText="Book an Immersive"
        waHref={whatsappLink("immersive")}
        tone="sand"
      />

      {/* BLOCK-05 1 Day Private */}
      <FormatDetail
        id="one-day"
        title="1 Day Private Retreat"
        tagline="A full day with no other agenda."
        paras={[
          "If the Immersive is a deep session, this is a deep day. You arrive in the morning, you leave at sunset. In between we move through more than one breathwork session, somatic and conversational work, time alone with the process, a quiet meal, and proper integration.",
          "Designed for repeat clients ready to go further, or for someone arriving at a clear transition who needs to land the work in one focused container before going back to their life.",
        ]}
        included={[
          "A full day, sunrise to sunset roughly.",
          "Two breathwork sessions with integration between them.",
          "Somatic coaching and conversation.",
          "Quiet meal or nourishment break.",
          "Time in nature, alone or with me as feels right.",
          "Follow-up WhatsApp check-in within 72 hours.",
        ]}
        ctaText="Inquire about a 1 Day Private Retreat"
        waHref={whatsappLink("oneDayPrivate")}
        tone="cream"
      />

      {/* BLOCK-06 Couples */}
      <Section id="couples" tone="sand" width="default">
        <h2 className="text-3xl sm:text-4xl">Couples and 2-person sessions.</h2>
        <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-muted">
          <p>
            Any of the three formats is available for two people. The most common
            combinations are couples, but the second person can also be a friend,
            a sibling, a parent and adult child, anyone you share a process with.
          </p>
          <p>
            When two people breathe in the same room, the work expands. Patterns
            that were invisible on your own become legible together. The container
            changes, but the method doesn&apos;t soften, it deepens.
          </p>
          <p>
            What this is not: couples therapy with breath. We&apos;re not here to
            negotiate your relationship. We&apos;re here to give both of you
            access to what&apos;s underneath the talking, at the same time.
          </p>
        </div>
        <div className="mt-8">
          <CTAButton href={whatsappLink("couples")} variant="whatsapp">
            Inquire about a 2-person session
          </CTAButton>
        </div>
      </Section>

      {/* BLOCK-08 Safety */}
      <Section tone="cream" width="default">
        <h2 className="text-3xl sm:text-4xl">A few honest notes on safety.</h2>
        <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-muted">
          <p>
            Breathwork is not a medical or psychological treatment. It
            complements but does not replace therapy or medical care.
          </p>
          <p>
            Clarity Breathwork™ is a trauma informed technique, which means the
            approach is built to avoid retraumatization. That said, there are
            conditions where breathwork is not advised or where we&apos;d modify
            the approach significantly.
          </p>
          <p>
            Please don&apos;t book a session without sharing relevant health
            context. Conditions that need a conversation before we work include:
            pregnancy, recent cardiovascular events, epilepsy, glaucoma, severe
            asthma, recent surgery, untreated psychosis, severe PTSD without
            parallel therapeutic support.
          </p>
          <p>
            If any of the above applies, we talk first. Many of these are
            workable with adjustments. Some aren&apos;t, and I&apos;ll tell you.
          </p>
        </div>
        <div className="mt-8">
          <CTAButton href="/legal/contraindications/" variant="secondary">
            Read full health contraindications
          </CTAButton>
        </div>
      </Section>

      {/* BLOCK-10 FAQ */}
      <Section tone="sand" width="default">
        <h2 className="text-3xl sm:text-4xl">Questions, answered.</h2>
        <div className="mt-8">
          <Accordion items={FAQ} />
        </div>
      </Section>

      {/* BLOCK-11 Final CTA */}
      <Section tone="cream" width="narrow" className="text-center">
        <h2 className="text-3xl sm:text-4xl">Ready, or close to ready?</h2>
        <p className="mx-auto mt-5 max-w-lg text-muted">
          The first message doesn&apos;t need to be long. &ldquo;Hi, I&apos;m
          thinking about a session&rdquo; is enough. We&apos;ll take it from
          there.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <CTAButton href={whatsappLink("general")} variant="whatsapp">
            Message me on WhatsApp
          </CTAButton>
          <CTAButton href={emailLink()} variant="secondary">
            Send me an email
          </CTAButton>
        </div>
      </Section>
    </>
  );
}

function FormatDetail({
  id,
  title,
  tag,
  tagline,
  paras,
  included,
  ctaText,
  waHref,
  tone,
}: {
  id: string;
  title: string;
  tag?: string;
  tagline: string;
  paras: string[];
  included: string[];
  ctaText: string;
  waHref: string;
  tone: "cream" | "sand";
}) {
  return (
    <Section id={id} tone={tone} width="default">
      {tag && (
        <span className="mb-3 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-medium uppercase tracking-widest text-gold">
          {tag}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      <p className="prose-lede mt-3">{tagline}</p>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 text-[1.05rem] leading-relaxed text-muted">
          {paras.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="rounded-2xl border border-sand-deep bg-cream/60 p-6">
          <p className="text-xs uppercase tracking-widest text-faint">What&apos;s included</p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            {included.map((it, i) => (
              <li key={i} className="flex gap-2.5">
                <span aria-hidden className="mt-1 text-gold">—</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted">
            <span className="font-medium text-ink">Investment:</span> from
            $[price on inquiry]. Couples from $[price on inquiry].
          </p>
        </div>
      </div>
      <div className="mt-8">
        <CTAButton href={waHref} variant="whatsapp">
          {ctaText}
        </CTAButton>
      </div>
    </Section>
  );
}
