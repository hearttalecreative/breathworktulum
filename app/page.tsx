import Image from "next/image";
import Link from "next/link";
import Section from "@/components/Section";
import CTAButton from "@/components/CTAButton";
import ThreePhases from "@/components/method/ThreePhases";
import JsonLd from "@/components/JsonLd";
import { whatsappLink, emailLink } from "@/lib/whatsapp";
import { serviceLd } from "@/lib/seo";

// Copy is textual from 02_HOME.md — do not rewrite. Voice rules in 02_VOZ_Y_TONO.md.

const SITUATIONS = [
  "You're going through a change that hasn't quite landed yet. A career shift, a relationship ending, a relocation, a new chapter that's asking something different from you.",
  "Your body is asking you to stop. Burnout, chronic stress, anxiety that lives in your chest or your jaw. You're functional on the outside and tired in a way sleep doesn't fix.",
  "You've done the work. Therapy, books, courses. You understand a lot. But understanding hasn't been enough. Something is still stuck somewhere your mind can't reach.",
  "You're moving through midlife, menopause, or a quiet identity shift. You're not in crisis. You just want to meet what's underneath, with someone who knows how to hold it.",
];

const WAYS = [
  {
    title: "Private Sessions",
    body: "Foundation, Immersive, or a full 1 Day Private Retreat. Online or in Tulum. For one person, or two.",
    cta: "Explore private sessions",
    href: "/work-with-me/private-sessions/",
  },
  {
    title: "Personalized Retreats",
    body: "Multi-day retreats designed around you. 3 Day, 5 Day, custom, or virtual. For individuals and couples ready for depth.",
    cta: "Explore retreats",
    href: "/work-with-me/personalized-retreats/",
  },
  {
    title: "Group Practice",
    body: "Weekly 1 Day Retreats in a national park and regular Group Sessions at Nomade. Open to drop ins.",
    cta: "Explore group practice",
    href: "/work-with-me/group-practice/",
  },
  {
    title: "Curated Group Experiences",
    body: "Private group breathwork for retreat leaders, families, wellness events, and luxury groups. Designed on request.",
    cta: "Inquire about group experiences",
    href: "/work-with-me/curated-group-experiences/",
  },
  {
    title: "Corporate Breathwork",
    body: "Workshops, talks, and team programs for organizations that take wellbeing seriously.",
    cta: "Corporate programs",
    href: "/work-with-me/corporate/",
  },
];

const TESTIMONIALS = [
  "I was dealing with some personal issues and almost didn't go. I'm so grateful I did. I struggle with ADHD and usually can't stay focused for more than fifteen minutes. With Sabine I didn't lose focus once. My session was scheduled for two hours and ended up lasting almost four. That alone says everything.",
  "I came in carrying decades of emotional weight, from trauma, burnout, and grief. What I found was a space of deep healing, connection, and clarity. Sabine held such a powerful safe space that I felt free to let go in ways I never had before.",
  "Endlessly grateful. The 1:1 private session was one of the most transformative moments I'll cherish forever. Her presence alone was a catalyst.",
];

export default function Home() {
  return (
    <>
      <JsonLd
        data={serviceLd(
          "Breathwork and somatic coaching",
          "Trauma informed breathwork and somatic coaching for people moving through life transitions. In Tulum, online, and personalized retreats."
        )}
      />

      {/* BLOCK-01 Hero */}
      <section className="bg-cream px-6 pt-16 pb-12 sm:pt-20 lg:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="text-[2.4rem] leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
              A grounded space to feel what you&apos;ve been avoiding, and to
              move forward with clarity.
            </h1>
            <p className="prose-lede mt-7">
              Trauma informed breathwork and somatic coaching for people moving
              through life transitions. In Tulum, online, or in a personalized
              retreat.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CTAButton href="/work-with-me/private-sessions/#immersive">
                Book an Immersive Session
              </CTAButton>
              <CTAButton href="/the-method/" variant="secondary">
                Explore the Method
              </CTAButton>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand lg:aspect-[5/6]">
            <Image
              src="/images/breathwork-tulum-palapa-space.jpg"
              alt="A breathwork session under an open A-frame palapa with natural light, surrounded by jungle in Tulum"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* BLOCK-02 Who this is for */}
      <Section tone="sand">
        <h2 className="text-3xl sm:text-4xl">If anything below sounds familiar.</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-sand-deep bg-sand-deep sm:grid-cols-2">
          {SITUATIONS.map((s, i) => (
            <p key={i} className="bg-cream p-7 text-[1.05rem] leading-relaxed text-muted">
              {s}
            </p>
          ))}
        </div>
        <p className="mt-10 font-serif text-2xl text-ink">This is the work.</p>
      </Section>

      {/* BLOCK-03 The method preview */}
      <Section tone="cream" width="wide">
        <span className="eyebrow">The Method</span>
        <h2 className="mt-3 max-w-2xl text-3xl sm:text-4xl">A method, not a moment.</h2>
        <div className="mt-12">
          <ThreePhases />
        </div>
        <div className="mt-10 max-w-3xl space-y-4 text-[1.05rem] leading-relaxed text-muted">
          <p>
            Every session and every retreat follows the same three phase
            process. Breathe to open the body. Heal to meet what&apos;s stored
            beneath the surface. Transform to integrate what shifted, in
            language and choices that hold beyond the session.
          </p>
          <p>
            The technical backbone is Clarity Breathwork™, a soft, trauma
            informed approach I&apos;ve practiced for over ten years and trained
            under its founders.
          </p>
        </div>
        <div className="mt-8">
          <CTAButton href="/the-method/" variant="secondary">
            See the full method
          </CTAButton>
        </div>
      </Section>

      {/* BLOCK-04 The five ways */}
      <Section tone="sand" width="wide">
        <h2 className="text-3xl sm:text-4xl">Ways to work together.</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WAYS.map((w) => (
            <div
              key={w.title}
              className="flex flex-col rounded-2xl border border-sand-deep bg-cream p-7"
            >
              <h3 className="font-serif text-2xl text-ink">{w.title}</h3>
              <p className="mt-3 flex-1 text-muted">{w.body}</p>
              <Link
                href={w.href}
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-gold transition-colors hover:text-ink"
              >
                {w.cta} <span aria-hidden>→</span>
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* BLOCK-05 Sabine preview */}
      <Section tone="cream" width="wide">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-last aspect-[4/5] overflow-hidden rounded-2xl bg-sand lg:order-first">
            <Image
              src="/images/breathwork-tulum-sabine-portrait.jpg"
              alt="Portrait of Sabine Binns in a garden in Tulum, eyes softly closed"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl">
              I lived the version of you that&apos;s reading this.
            </h2>
            <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-muted">
              <p>
                I&apos;m Sabine. I spent fifteen years moving through burnout,
                identity shifts, and the kind of slow undoing that doesn&apos;t
                make sense from the outside. Breathwork is what brought me back
                to my body, and to a way of working that doesn&apos;t require
                leaving any part of you behind.
              </p>
              <p>
                Over ten years later, I work in Tulum with people in transition.
                With a clinical structure, a soft technique, and the energy of
                someone who has been on both sides of this.
              </p>
            </div>
            <div className="mt-8">
              <CTAButton href="/about/" variant="secondary">
                Read more about Sabine
              </CTAButton>
            </div>
          </div>
        </div>
      </Section>

      {/* BLOCK-06 Testimonials */}
      <Section tone="sand" width="wide">
        <h2 className="text-3xl sm:text-4xl">What people say after.</h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-2xl border border-sand-deep bg-cream p-7"
            >
              <blockquote className="flex-1 font-serif text-lg leading-relaxed text-ink">
                &ldquo;{t}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-xs uppercase tracking-widest text-faint">
                Google Review
              </figcaption>
            </figure>
          ))}
        </div>
        <a
          href="https://g.page/r/CXT0CCkbKfFWEBM/review"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-gold hover:text-ink"
        >
          Read more reviews on Google <span aria-hidden>→</span>
        </a>
      </Section>

      {/* BLOCK-07 Signature Retreat band */}
      <section className="relative overflow-hidden bg-night px-6 py-24 text-cream-dim sm:py-32">
        <Image
          src="/images/breathwork-tulum-riviera-maya.jpg"
          alt="Riviera Maya landscape"
          fill
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-night/70" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="eyebrow text-gold-soft">Signature Event · 2026</span>
          <h2 className="mt-4 text-3xl text-cream sm:text-4xl lg:text-5xl">
            Five days. Twenty people. One process. Riviera Maya.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-cream-dim/85">
            A residential breathwork retreat in Xpu Ha, designed for people
            ready to step out of daily life for a week and walk through the full
            method in community. Limited to twenty places. First retreat Q1
            2026.
          </p>
          <div className="mt-9 flex justify-center">
            <CTAButton href="/retreat-riviera-maya-2026/">
              Join the waitlist
            </CTAButton>
          </div>
        </div>
      </section>

      {/* BLOCK-08 Final CTA */}
      <Section tone="cream" width="narrow" className="text-center">
        <h2 className="text-3xl sm:text-4xl">Not sure where to start?</h2>
        <p className="mx-auto mt-6 max-w-xl text-[1.05rem] leading-relaxed text-muted">
          The honest answer is most people just write me. We talk for a few
          minutes, I get a sense of what you&apos;re moving through, and we
          figure out the right starting point together. There&apos;s no script.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
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
