import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/Section";
import CTAButton from "@/components/CTAButton";
import ThreePhases from "@/components/method/ThreePhases";
import JsonLd from "@/components/JsonLd";
import { pageMeta, serviceLd, personLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "The Method. Breathe. Heal. Transform.®",
  description:
    "A three phase process built on Clarity Breathwork™ and somatic work. Trauma informed, structured, and designed to transform what the mind alone can't reach.",
  path: "/the-method/",
  ogImage: "/images/breathwork-tulum-somatic-session.jpg",
});

const PHASES = [
  {
    n: "Breathe",
    paras: [
      "The body enters the work. The technique opens what's been held. We slow down enough for sensation to come back online: the chest, the belly, the throat, places that have been quiet for a long time.",
      "What you might notice: tingling, warmth, vibration, your awareness moving from your head into the rest of you. This is your nervous system shifting state. It's not the work yet. It's the body becoming available for the work.",
    ],
  },
  {
    n: "Heal",
    paras: [
      "The emotional layer surfaces. What was sitting underneath the daily breath now has room to move. Core wounds, old patterns, the things the mind has named already but the body never finished.",
      "What you might notice: emotions you didn't know were there, tears that surprise you, sometimes laughter, sometimes a deep stillness. Sometimes a wave of clarity about something you've been turning over for months.",
      "This is the part most people are talking about when they talk about transformation. But the truth is, this phase alone isn't transformation. It's release of what's ready to move. Transformation is what comes next.",
    ],
  },
  {
    n: "Transform",
    paras: [
      "Integration. What surfaced gets language. Patterns that loosened in the breath get named, so they can be recognized when they come back. New choices, new boundaries, new responses become possible because the body knows what they feel like now.",
      "Without this phase, the work doesn't land. People go home from sessions feeling lighter and then watch the old patterns return within two weeks. The Transform phase is what makes the shift sustainable.",
    ],
  },
];

const DIFFERENCES = [
  {
    h: "We don't aim for release. We aim for transformation.",
    paras: [
      "“Release” gets used a lot in this work. I understand why. It points to something real. But we don't actually release our past life experiences. We can't undo what happened. What we can do is transform what happened, the meaning, the felt sense, the patterns that the experience installed.",
      "If a session ends with you feeling lighter but the same thing happens to you again next week, nothing transformed. That's not the goal here.",
    ],
  },
  {
    h: "We work with what's stored, not just what's understood.",
    paras: [
      "The mind already knows a lot. Therapy, books, journaling, conversations with friends. Most people I work with come having understood their patterns intellectually. What they haven't been able to do is move them. That's where the body comes in.",
    ],
  },
  {
    h: "There's structure. There's process. There's integration.",
    paras: [
      "A breathwork session without a method around it is an experience. Sometimes a powerful one. But experiences don't usually translate into sustained change unless they're held inside a process.",
      "BREATHE.HEAL.TRANSFORM.® gives the work a shape. Every session, every retreat, every program follows the three phases. That's what makes the work cumulative instead of just memorable.",
    ],
  },
];

const NOT = [
  "This is not a medical or psychological treatment. It complements but doesn't replace therapy or medical care.",
  "It doesn't promise healing, cure, or instant change. The body does what it's ready to do, when it's ready.",
  "It's not a spiritual ceremony or a religious practice. There's no belief system you need to adopt.",
  "It's not a one-session fix. The method is built to be cumulative.",
  "It's not for every body or every nervous system in every moment. There are contraindications and there are times when this isn't the right tool.",
];

export default function MethodPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceLd(
            "BREATHE.HEAL.TRANSFORM.® method",
            "A three phase process built on Clarity Breathwork™ and somatic work. Trauma informed and structured."
          ),
          personLd(),
        ]}
      />

      {/* BLOCK-01 Hero */}
      <section className="bg-cream px-6 pt-16 pb-12 sm:pt-20 lg:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">The Method</span>
            <h1 className="mt-3 text-[2.4rem] leading-[1.08] sm:text-5xl lg:text-[3.2rem]">
              The method behind the work.
            </h1>
            <p className="prose-lede mt-7">
              Every person arrives with their own story. But the process of
              coming back to the body, meeting what&apos;s stored there, and
              choosing from a different place, has a shape. This is mine.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CTAButton href="#phases">See the three phases</CTAButton>
              <CTAButton href="/work-with-me/private-sessions/" variant="secondary">
                Experience the method
              </CTAButton>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
            <Image
              src="/images/breathwork-tulum-somatic-session.jpg"
              alt="Sabine doing hands-on somatic work with a client during a breathwork session"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* BLOCK-02 Three phases */}
      <Section id="phases" tone="sand" width="wide">
        <h2 className="text-3xl sm:text-4xl">Breathe. Heal. Transform.®</h2>
        <p className="prose-lede mt-4 max-w-2xl">
          A three phase process. Not a metaphor. The actual arc of every session
          and every retreat.
        </p>
        <div className="mt-12">
          <ThreePhases />
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-3">
          {PHASES.map((p) => (
            <div key={p.n}>
              <h3 className="font-serif text-2xl text-ink">{p.n}</h3>
              <div className="mt-3 space-y-3 text-muted">
                {p.paras.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* BLOCK-03 Clarity Breathwork */}
      <Section tone="cream" width="default">
        <h2 className="text-3xl sm:text-4xl">
          Clarity Breathwork™. The technique that makes this possible.
        </h2>
        <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-muted">
          <p>
            The breathwork I practice is Clarity Breathwork™, a soft, trauma
            informed technique developed over forty years and designed to access
            what&apos;s stored in the body without forcing the nervous system
            into a stress response.
          </p>
          <p>
            I&apos;m certified as a Clarity Breathwork™ Specialist directly with
            the founders of the technique. To my knowledge, I&apos;m the only one
            with this formal certification in Riviera Maya.
          </p>
          <p>
            The reason I work with this technique and not others: it&apos;s been
            built for emotional and somatic depth. It&apos;s not designed for
            catharsis, peak experiences, or activation. It&apos;s designed for
            actual processing.
          </p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-sand-deep bg-sand p-6">
            <h3 className="font-serif text-xl text-ink">Soft, not strong</h3>
            <p className="mt-2 text-muted">
              Most popular breathwork techniques (Wim Hof, Holotropic, certain
              Pranayama traditions) use intensity. Clarity Breathwork uses
              softness. The result is different. Less spectacle, more landing.
            </p>
          </div>
          <div className="rounded-2xl border border-sand-deep bg-sand p-6">
            <h3 className="font-serif text-xl text-ink">Trauma informed by design</h3>
            <p className="mt-2 text-muted">
              The pacing, the cueing, the way the breath is held are all designed
              to avoid retraumatizing the system. People with trauma history can
              do this work safely with the right facilitator.
            </p>
          </div>
        </div>
      </Section>

      {/* BLOCK-04 Three honest differences */}
      <Section tone="sand" width="default">
        <h2 className="text-3xl sm:text-4xl">Three honest differences.</h2>
        <div className="mt-10 space-y-10">
          {DIFFERENCES.map((d, i) => (
            <div key={i} className="flex gap-5">
              <span className="font-serif text-2xl text-gold/60 tabular-nums">
                0{i + 1}
              </span>
              <div>
                <h3 className="font-serif text-2xl text-ink">{d.h}</h3>
                <div className="mt-3 space-y-3 text-muted">
                  {d.paras.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* BLOCK-05 What it feels like */}
      <Section tone="cream" width="narrow">
        <h2 className="text-3xl sm:text-4xl">What it actually feels like.</h2>
        <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-muted">
          <p>
            The first thing that usually happens once you start the active
            breathing is a physiological shift. The body&apos;s CO2 levels drop.
            Blood cells constrict. You might feel tingling in your hands, a
            lightness in your head, sometimes a kind of cramping in the hands or
            face. The technical name is tetany. It&apos;s normal. It&apos;s part
            of the process. It passes.
          </p>
          <p>
            Then the body wakes up in a way that&apos;s different from daily
            awareness. There&apos;s an internal light, like a compass, that you
            start breathing with. The outer air meets your inner energy and
            something turns on. People describe it differently, but everyone
            notices it.
          </p>
          <blockquote className="border-l-2 border-gold py-1 pl-5 font-serif text-xl leading-relaxed text-ink">
            Emotions tend to come from the center of the body, not the head. The
            chest carries grief. The stomach is the center of personal power. The
            lower belly carries womb history, digestion, generational pain.
          </blockquote>
          <p>
            Sometimes a release shows up as tears. Sometimes as shaking.
            Sometimes as laughter. Sometimes as deep stillness with no narrative
            attached.
          </p>
          <p>
            My job during all of this is to read what&apos;s there, hold the
            space, and respond. I don&apos;t push. I don&apos;t try to make
            anything happen. I trust the body&apos;s intelligence and stay with
            you while it does its thing.
          </p>
        </div>
      </Section>

      {/* BLOCK-06 What this is not */}
      <Section tone="sand" width="narrow">
        <h2 className="text-3xl sm:text-4xl">A few honest disclaimers.</h2>
        <p className="mt-5 text-muted">The work is real. But there are claims I won&apos;t make.</p>
        <ul className="mt-6 space-y-3">
          {NOT.map((n, i) => (
            <li key={i} className="flex gap-3 text-muted">
              <span aria-hidden className="mt-1 text-gold">—</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <CTAButton href="/legal/contraindications/" variant="secondary">
            Read full health contraindications
          </CTAButton>
        </div>
      </Section>

      {/* BLOCK-07 Facilitation */}
      <Section tone="cream" width="narrow">
        <h2 className="text-3xl sm:text-4xl">One last thing about how I work.</h2>
        <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-muted">
          <p>
            I&apos;m not the one doing the work. You are. The method gives the
            structure. The technique gives the access. Your body does the actual
            transformation.
          </p>
          <p>
            What I do is hold the space, read the room, pace the work, and stay
            present. I don&apos;t heal anyone. I don&apos;t fix anyone. I
            don&apos;t apply something to you. The responsibility for your
            process stays with you, which is exactly where it should be.
          </p>
          <p>
            I&apos;m a guide and a witness. Sometimes a translator. Sometimes a
            quiet presence in the corner. The work is yours.
          </p>
        </div>
      </Section>

      {/* BLOCK-08 Final CTA */}
      <Section tone="sand" width="narrow" className="text-center">
        <h2 className="text-3xl sm:text-4xl">Ready to experience it?</h2>
        <p className="mx-auto mt-5 max-w-lg text-muted">
          Reading about a method has its limits. The work shows up when
          you&apos;re in the room.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <CTAButton href="/work-with-me/private-sessions/">
            Explore private sessions
          </CTAButton>
          <CTAButton href="/about/" variant="secondary">
            Meet Sabine
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
