import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/Section";
import CTAButton from "@/components/CTAButton";
import JsonLd from "@/components/JsonLd";
import { pageMeta, personLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "About Sabine Binns. Breathwork Tulum Founder",
  description:
    "Sabine Binns is a Clarity Breathwork™ Specialist with twenty years in wellness and an international corporate background spanning Orbitz and Booking. Based in Tulum, Mexico.",
  path: "/about/",
  ogImage: "/images/breathwork-tulum-sabine-portrait.jpg",
});

const HOW = [
  ["I don't heal anyone.", "I don't apply something to you. I hold the space and let your body do its work. The responsibility for your process stays with you, which is the only place it belongs."],
  ["I work slowly.", "The technique I use is soft on purpose. I'm not interested in catharsis. I'm interested in what's actually ready to move, and in the kind of integration that lasts beyond the session."],
  ["I read what's there.", "Sessions are flexible. The intake matters, but the actual work follows what shows up that day. Sometimes that's emotional, sometimes a deep stillness, sometimes a conversation that goes somewhere unexpected."],
  ["I stay with the body, not the story.", "People often arrive wanting to talk through their situation. I welcome that. But the work happens when we move from talking about it to feeling it."],
  ["I don't perform.", "I don't try to look spiritual, calm, wise. I'm a person sitting with another person. Sometimes the work asks for stillness. Sometimes it asks for me to lean in and gently push. Sometimes it asks for nothing."],
];

const CREDENTIALS = [
  "Certified Clarity Breathwork™ Specialist. Trained directly under the founders of the technique. To my knowledge, the only one with this formal certification in Riviera Maya.",
  "Over 10 years of dedicated breathwork practice.",
  "Over 20 years in the wellness and healing space.",
  "MA, Master of Arts.",
  "Background in international corporate leadership across multiple countries, including roles at Orbitz and Booking in travel and hospitality.",
  "Continued training in somatic experiencing, nervous system regulation, and trauma informed practice.",
  "Studies in mindfulness-based approaches, transformational coaching, and integration practices.",
];

const NOT_FIT = [
  "You're looking for a fast catharsis or peak experience. Look at Holotropic or shamanic breathwork practitioners for that.",
  "You want pure talk therapy. Find a good therapist; the work is different.",
  "You're in acute psychiatric crisis. You need parallel medical support; I work alongside that, not instead of it.",
  "You want to perform spirituality. This isn't that space.",
];

const FIT = [
  "You're moving through a transition that's bigger than you expected.",
  "You've done the cognitive work and now need something that goes deeper than thought.",
  "You want depth without theatre.",
  "You want a method, not just a session.",
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={personLd()} />

      {/* BLOCK-01 Hero */}
      <section className="bg-cream px-6 pt-16 pb-12 sm:pt-20 lg:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="prose-lede">Hi. I&apos;m Sabine Binns.</p>
            <h1 className="mt-4 text-[2.2rem] leading-[1.1] sm:text-[2.7rem] lg:text-[3rem]">
              I lived the burnout. I learned to breathe through it. Now I guide
              others through theirs.
            </h1>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
            <Image
              src="/images/breathwork-tulum-sabine-portrait.jpg"
              alt="Portrait of Sabine Binns, Clarity Breathwork Specialist, in a Tulum garden"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* BLOCK-02 + 03 Story */}
      <Section tone="sand" width="narrow">
        <h2 className="text-3xl sm:text-4xl">How I got here.</h2>
        <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-muted">
          <p>
            I spent twenty years in international corporate leadership, including
            roles at Orbitz and Booking, working across travel, hospitality, and
            global teams. Long enough to understand that environment from the
            inside, and long enough to start unraveling inside it. The kind of
            burnout that doesn&apos;t show on the calendar but shows in the body,
            the relationships, the small choices that stop making sense.
          </p>
          <p>Somewhere in there I found breathwork. Not as a wellness trend. As a way through.</p>
          <p>
            What started as my own work eventually became my practice. I trained
            in Clarity Breathwork™ directly with its founders. I added somatic
            coaching, nervous system literacy, and the structural thinking I&apos;d
            carried over from my corporate years. I moved to Mexico. I started
            working with people who reminded me of who I&apos;d been a decade
            earlier.
          </p>
          <p>That&apos;s been ten years and counting. The work is the same. The clients change.</p>
        </div>

        <blockquote className="mt-12 border-l-2 border-gold py-1 pl-5 font-serif text-xl leading-relaxed text-ink">
          I&apos;m not particularly interested in healing as a concept. I&apos;m
          interested in what actually shifts when someone comes back to their
          body and meets what was stored there.
        </blockquote>
        <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-muted">
          <p>
            I&apos;m interested in the specific moment when a client realizes
            they&apos;ve been carrying something that wasn&apos;t theirs to begin
            with. The first breath after that recognition. The conversation that
            comes the next week. The decision they make a month later that
            surprises everyone, including them.
          </p>
          <p>That&apos;s the work. The rest is structure that makes the work possible.</p>
        </div>
      </Section>

      {/* BLOCK-04 How I work */}
      <Section tone="cream" width="default">
        <h2 className="text-3xl sm:text-4xl">A few honest notes on how I show up.</h2>
        <div className="mt-10 space-y-7">
          {HOW.map(([h, b]) => (
            <div key={h}>
              <h3 className="font-serif text-xl text-ink">{h}</h3>
              <p className="mt-1.5 text-muted">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* BLOCK-05 Credentials */}
      <Section tone="sand" width="default">
        <h2 className="text-3xl sm:text-4xl">Training, certifications, and lineage.</h2>
        <ul className="mt-8 space-y-3">
          {CREDENTIALS.map((c, i) => (
            <li key={i} className="flex gap-3 text-muted">
              <span aria-hidden className="mt-1 text-gold">—</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm italic text-faint">
          A complete training timeline is available on request for corporate
          partners, retreat centers, or professionals considering a
          collaboration.
        </p>
      </Section>

      {/* BLOCK-06 Fit */}
      <Section tone="cream" width="default">
        <h2 className="text-3xl sm:text-4xl">Honest about fit.</h2>
        <p className="mt-5 text-muted">
          Not everyone needs me. Sometimes the work I do is exactly right.
          Sometimes another practitioner, another modality, or another moment
          makes more sense.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-sand-deep bg-sand p-6">
            <h3 className="font-serif text-xl text-ink">I&apos;m not the right person if</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {NOT_FIT.map((n, i) => (
                <li key={i} className="flex gap-2.5"><span aria-hidden className="mt-1 text-clay">—</span><span>{n}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-sand-deep bg-sand p-6">
            <h3 className="font-serif text-xl text-ink">I am the right person if</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {FIT.map((n, i) => (
                <li key={i} className="flex gap-2.5"><span aria-hidden className="mt-1 text-sage">—</span><span>{n}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* BLOCK-06b + 07 Reviews + where */}
      <Section tone="sand" width="default">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl sm:text-4xl">What people say after working with me.</h2>
            <p className="mt-5 text-muted">
              Reviews live on Google. Real names, real context, mixed length. If
              you want to read them before deciding whether to write me, this is
              the most direct way.
            </p>
            <a
              href={SITE.social.googleReviews}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-gold hover:text-ink"
            >
              Read reviews on Google <span aria-hidden>→</span>
            </a>
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl">Home base.</h2>
            <div className="mt-5 space-y-4 text-muted">
              <p>
                I live in Tulum, Mexico. Most of my in person work happens here
                and across Riviera Maya. I travel for specific corporate or
                retreat engagements within Mexico and internationally on request.
              </p>
              <p>
                The online work crosses borders. I currently have clients in
                Europe, the US, Latin America, and a few in Asia.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* BLOCK-09 Closing */}
      <Section tone="cream" width="narrow" className="text-center">
        <h2 className="text-3xl sm:text-4xl">If any of this lands.</h2>
        <div className="mx-auto mt-6 max-w-lg space-y-4 text-muted">
          <p>
            The easiest way to start working together is a private session. The
            Immersive is what I usually recommend if you have the time. The
            Foundation if you&apos;re new or short on time.
          </p>
          <p>
            If you&apos;re not sure what fits, write me on WhatsApp. The first
            message is always the hardest. After that, it&apos;s a conversation.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <CTAButton href="/work-with-me/private-sessions/">
            Explore private sessions
          </CTAButton>
          <CTAButton href={whatsappLink("general")} variant="whatsapp">
            Message me on WhatsApp
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
