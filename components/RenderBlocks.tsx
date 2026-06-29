import { RichText } from "@payloadcms/richtext-lexical/react";
import Section from "./Section";
import CTAButton from "./CTAButton";
import ThreePhases from "./method/ThreePhases";
import Accordion from "./Accordion";
import ContactForm from "./ContactForm";
import PayloadImage from "./PayloadImage";
import HeroVideo from "./HeroVideo";
import WaveMark from "./WaveMark";
import Reveal from "./Reveal";
import { resolveCta, resolveCtas, type RawCta } from "@/lib/cta";

type Settings = Parameters<typeof resolveCtas>[1];
type AnyBlock = Record<string, unknown> & { blockType: string; id?: string };

const paras = (s?: string | null) =>
  (s || "").split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

// Emphasis: *word* renders as a Canela italic "breath word" inside a headline.
function emph(s?: string | null) {
  if (!s) return null;
  return s.split(/(\*[^*]+\*)/g).map((part, i) =>
    /^\*[^*]+\*$/.test(part) ? <em key={i}>{part.slice(1, -1)}</em> : <span key={i}>{part}</span>
  );
}

function CtaRow({
  ctas,
  align = "left",
  onDark = false,
}: {
  ctas: { label: string; href: string; variant: "primary" | "secondary" | "whatsapp"; external: boolean }[];
  align?: "left" | "center";
  onDark?: boolean;
}) {
  if (!ctas.length) return null;
  return (
    <div className={`mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 ${align === "center" ? "justify-center" : ""}`}>
      {ctas.map((c, i) => (
        <CTAButton key={i} href={c.href} variant={c.variant} external={c.external} onDark={onDark}>
          {c.label}
        </CTAButton>
      ))}
    </div>
  );
}

// Delicate divider: a gold filet flanking the brand wave mark.
function Ornament({ start = false, tone = "gold" }: { start?: boolean; tone?: "gold" | "champagne" }) {
  return (
    <div
      className={`ornament ${start ? "ornament--start" : ""} ${tone === "champagne" ? "text-champagne/70" : ""}`}
      aria-hidden
    >
      <WaveMark className="w-9 opacity-90" />
    </div>
  );
}

export default function RenderBlocks({
  blocks,
  settings,
}: {
  blocks: AnyBlock[] | null | undefined;
  settings: Settings;
}) {
  if (!blocks?.length) return null;
  return (
    <>
      {blocks.map((b, i) =>
        i === 0 ? (
          // Hero / first block renders immediately (LCP — no reveal delay).
          <BlockSwitch key={b.id || i} block={b} settings={settings} first />
        ) : (
          <Reveal key={b.id || i}>
            <BlockSwitch block={b} settings={settings} first={false} />
          </Reveal>
        )
      )}
    </>
  );
}

function BlockSwitch({
  block: b,
  settings,
  first,
}: {
  block: AnyBlock;
  settings: Settings;
  first: boolean;
}) {
  switch (b.blockType) {
    case "hero": {
      const ctas = resolveCtas(b.ctas as RawCta[], settings);

      // Full-bleed immersive hero (Habitas-style): photo fills the viewport,
      // scrim keeps the display type legible, content sits low-left.
      if (b.variant === "fullBleed" && b.image) {
        return (
          <section
            data-fullbleed-hero
            className="relative flex min-h-[92svh] items-end overflow-clip bg-night"
          >
            <div className="absolute inset-0">
              <HeroVideo url="https://vimeo.com/773408641/7c81c6bfcc" poster="/hero/hero-poster.jpg" loopEnd={25.8} />
              <div className="hero-scrim absolute inset-0" aria-hidden />
            </div>
            <div className="over-photo relative mx-auto w-full max-w-6xl px-[clamp(20px,5vw,80px)] pb-[clamp(3rem,9vh,7rem)] pt-[clamp(7rem,18vh,11rem)]">
              {b.eyebrow ? (
                <span className="eyebrow eyebrow--filet text-champagne">
                  {b.eyebrow as string}
                </span>
              ) : null}
              <h1 className="t-display mt-5 max-w-[16ch] text-pure">{emph(b.heading as string)}</h1>
              {b.lede ? (
                <p className="prose-lede mt-6 max-w-xl text-pure/90">{b.lede as string}</p>
              ) : null}
              <CtaRow ctas={ctas} onDark />
            </div>
            {/* Breathing scroll cue — a thin line that exhales downward. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center sm:flex">
              <span className="scrollcue-line" aria-hidden />
            </div>
          </section>
        );
      }

      // Split editorial hero — image arched beside large display type.
      const left = b.imageSide === "left";
      return (
        <section className="bg-shell px-[clamp(20px,5vw,80px)] pt-20 pb-12 sm:pt-24 lg:pt-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className={left ? "lg:order-last" : ""}>
              {b.eyebrow ? (
                <span className="eyebrow eyebrow--filet">{b.eyebrow as string}</span>
              ) : null}
              <h1 className="t-display mt-4">{emph(b.heading as string)}</h1>
              {b.lede ? <p className="prose-lede mt-7 measure">{b.lede as string}</p> : null}
              <CtaRow ctas={ctas} />
            </div>
            <div className="card relative aspect-[4/5] arch float-slow bg-sand lg:aspect-[5/6]">
              <div className="card-media absolute inset-0">
                <PayloadImage
                  media={b.image as never}
                  fill
                  priority={first}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "situations": {
      const items = (b.items as { text: string }[]) || [];
      const hasImg = !!b.image;
      return (
        <section className="bg-shell px-[clamp(20px,5vw,80px)] py-section" id={(b.anchor as string) || undefined}>
          <div className={`mx-auto grid max-w-6xl gap-12 ${hasImg ? "lg:grid-cols-[0.85fr_1.15fr]" : ""}`}>
            {hasImg ? (
              <div className="card relative hidden lg:block">
                {/* Atmospheric image bleeding tall beside the text. */}
                <div className="sticky top-28">
                  <div className="card-media arch aspect-[3/4]">
                    <PayloadImage media={b.image as never} fill sizes="40vw" className="object-cover" />
                  </div>
                </div>
              </div>
            ) : null}
            <div>
              <Ornament start />
              <h2 className="t-h2 mt-7 max-w-xl text-ink">{emph(b.heading as string)}</h2>
              <ol className="stagger mt-10 space-y-9">
                {items.map((it, i) => (
                  <li key={i} className="timeline-item flex gap-6">
                    <span className="timeline-num font-serif text-2xl leading-none text-gold-soft tabular-nums">0{i + 1}</span>
                    <p className="measure text-[1.0625rem] leading-relaxed text-ink-soft">{it.text}</p>
                  </li>
                ))}
              </ol>
              {b.closing ? (
                <p className="mt-14 font-serif italic text-3xl text-ink sm:text-4xl">{emph(b.closing as string)}</p>
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    case "photoBand": {
      const tall = b.height !== "standard";
      return (
        <section
          className={`on-dark relative flex items-end overflow-clip bg-night ${tall ? "min-h-[70svh]" : "min-h-[48svh]"}`}
          id={(b.anchor as string) || undefined}
        >
          <PayloadImage media={b.image as never} fill sizes="100vw" className="kenburns object-cover" />
          {b.caption || b.eyebrow ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" aria-hidden />
              <div className="relative mx-auto w-full max-w-6xl px-[clamp(20px,5vw,80px)] pb-[clamp(2rem,6vh,4rem)]">
                {b.eyebrow ? <span className="eyebrow eyebrow--filet text-champagne">{b.eyebrow as string}</span> : null}
                {b.caption ? <p className="mt-3 max-w-2xl font-serif text-2xl text-pure sm:text-3xl">{b.caption as string}</p> : null}
              </div>
            </>
          ) : null}
        </section>
      );
    }

    case "threePhases": {
      const cta = resolveCta(b.cta as RawCta, settings);
      const phases = [
        { n: "Breathe", line: "The body enters the work. The technique opens what's been held." },
        { n: "Heal", line: "The emotional layer surfaces. What was stored has room to move." },
        { n: "Transform", line: "Integration. What shifted gets language, so the change holds." },
      ];
      // Dark "breath" anchor: forest bg, photo, big editorial phases (no icon).
      return (
        <section
          className="on-dark bg-forest px-[clamp(20px,5vw,80px)] py-section text-cream-dim"
          id={(b.anchor as string) || undefined}
        >
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {b.image ? (
              <div className="card relative order-last aspect-[4/5] arch bg-night lg:order-first">
                <div className="card-media absolute inset-0">
                  <PayloadImage media={b.image as never} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                </div>
              </div>
            ) : null}
            <div>
              {b.eyebrow ? (
                <span className="inline-flex items-center gap-3">
                  <span className="breath-dot" aria-hidden />
                  <span className="eyebrow text-champagne">{b.eyebrow as string}</span>
                </span>
              ) : null}
              {b.heading ? <h2 className="t-h2 mt-4 text-pure">{emph(b.heading as string)}</h2> : null}
              {b.lede ? <p className="prose-lede mt-5 text-cream-dim">{b.lede as string}</p> : null}
              <ol className="stagger mt-10 space-y-7">
                {phases.map((p, i) => (
                  <li key={p.n} className="flex gap-5 border-t border-cream-dim/15 pt-7 first:border-0 first:pt-0">
                    <span className="font-serif text-3xl text-gold-soft tabular-nums">0{i + 1}</span>
                    <div>
                      <h3 className="text-2xl text-pure">{p.n}</h3>
                      <p className="mt-1 text-cream-dim">{p.line}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {b.body ? (
                <div className="prose-body mt-8 max-w-xl space-y-4 leading-relaxed text-cream-dim [&_strong]:text-pure">
                  <RichText data={b.body as never} />
                </div>
              ) : null}
              {cta ? <div className="mt-9"><CTAButton href={cta.href} variant={cta.variant} external={cta.external} onDark>{cta.label}</CTAButton></div> : null}
            </div>
          </div>
        </section>
      );
    }

    case "waysGrid": {
      const cards =
        (b.cards as { image?: unknown; title: string; body: string; ctaLabel?: string; href?: string }[]) || [];
      // Editorial, photo-forward, asymmetric: the first two span wide, the rest
      // narrow — no uniform box grid, no hairline borders.
      const spans = ["lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2"];
      // Tall 4/5 on phones (room for title + body + CTA); wide 16/10 only from sm+.
      const ratios = [
        "aspect-[4/5] sm:aspect-[16/10]",
        "aspect-[4/5] sm:aspect-[16/10]",
        "aspect-[4/5]",
        "aspect-[4/5]",
        "aspect-[4/5]",
      ];
      return (
        <Section tone={(b.tone as never) || "sand"} width="wide" id={(b.anchor as string) || undefined}>
          <Ornament start />
          <h2 className="t-h2 mt-7 max-w-2xl">{emph(b.heading as string)}</h2>
          <div className="stagger mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {cards.map((c, i) => {
              const Wrapper = c.href ? "a" : "div";
              return (
                <Wrapper
                  key={i}
                  {...(c.href ? { href: c.href } : {})}
                  className={`card group relative block overflow-clip bg-night transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 sm:[&:last-child:nth-child(odd)]:col-span-2 ${spans[i % spans.length]}`}
                >
                  <div className={`card-media relative ${ratios[i % ratios.length]} w-full`}>
                    {c.image ? (
                      <PayloadImage media={c.image as never} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/40 to-transparent" aria-hidden />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-2xl text-pure">{c.title}</h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-cream-dim">{c.body}</p>
                    {c.ctaLabel ? (
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-cream-dim transition-colors group-hover:text-pure">
                        <span className="relative">
                          {c.ctaLabel}
                          <span aria-hidden className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gold-soft transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
                        </span>
                        <span aria-hidden className="text-gold-soft transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </span>
                    ) : null}
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </Section>
      );
    }

    case "testimonialsBlock": {
      const items = (b.items as { quote: string; source?: string }[]) || [];
      const [lead, ...rest] = items;
      return (
        <Section tone={(b.tone as never) || "sand"} width="wide" id={(b.anchor as string) || undefined}>
          <Ornament start />
          {b.heading ? <h2 className="t-h2 mt-7 max-w-2xl text-ink">{emph(b.heading as string)}</h2> : null}
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            {lead ? (
              <figure className="relative">
                <span aria-hidden className="font-serif text-7xl leading-none text-gold-soft">&ldquo;</span>
                <blockquote className="-mt-6 font-serif text-2xl leading-snug text-ink sm:text-[1.75rem]">
                  {lead.quote}
                </blockquote>
                <figcaption className="mt-5 text-xs uppercase tracking-[0.16em] text-gold-ink">
                  {lead.source || "Google Review"}
                </figcaption>
              </figure>
            ) : null}
            <div className="stagger flex flex-col justify-center gap-10 border-t border-line pt-10 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
              {rest.map((t, i) => (
                <figure key={i}>
                  <blockquote className="font-serif text-lg leading-relaxed text-ink">{t.quote}</blockquote>
                  <figcaption className="mt-3 text-xs uppercase tracking-[0.16em] text-gold-ink">
                    {t.source || "Google Review"}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          {b.reviewsUrl ? (
            <a href={b.reviewsUrl as string} target="_blank" rel="noopener noreferrer" className="group link-underline mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-gold-ink">
              {(b.reviewsLabel as string) || "Read more reviews"} <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </a>
          ) : null}
        </Section>
      );
    }

    case "splitImageText": {
      const cta = resolveCta(b.cta as RawCta, settings);
      const left = b.imageSide !== "right";
      return (
        <Section tone={(b.tone as never) || "cream"} width="wide" id={(b.anchor as string) || undefined}>
          <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div className={`card relative aspect-[4/5] arch bg-sand ${left ? "lg:order-first" : "lg:order-last"}`}>
              <div className="card-media absolute inset-0">
                <PayloadImage media={b.image as never} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>
            <div>
              <Ornament start />
              <h2 className="t-h2 mt-7 max-w-[20ch] text-ink">{emph(b.heading as string)}</h2>
              {b.body ? (
                <div className="prose-body measure mt-6 space-y-4 text-ink-soft">
                  <RichText data={b.body as never} />
                </div>
              ) : null}
              {cta ? <CtaRow ctas={[cta]} /> : null}
            </div>
          </div>
        </Section>
      );
    }

    case "signatureBand": {
      const cta = resolveCta(b.cta as RawCta, settings);
      return (
        <section className="on-dark relative flex min-h-[66svh] items-end overflow-hidden bg-night px-[clamp(20px,5vw,80px)] py-section text-cream-dim" id={(b.anchor as string) || undefined}>
          <PayloadImage media={b.image as never} fill sizes="100vw" className="object-cover" />
          {/* Directional scrim: the lower-left, where the type sits, stays dark for AA. */}
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/25" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/35 to-transparent" aria-hidden />
          <div className="relative mx-auto w-full max-w-6xl">
            <div className="max-w-xl">
              {b.eyebrow ? <span className="eyebrow eyebrow--filet text-gold-soft">{b.eyebrow as string}</span> : null}
              <h2 className="t-h2 mt-4 text-cream">{emph(b.heading as string)}</h2>
              <div className="mt-6"><Ornament start tone="champagne" /></div>
              {b.body ? <p className="mt-6 max-w-lg text-cream-dim/90">{b.body as string}</p> : null}
              {cta ? <div className="mt-9"><CTAButton href={cta.href} variant={cta.variant} external={cta.external} onDark>{cta.label}</CTAButton></div> : null}
            </div>
          </div>
        </section>
      );
    }

    case "ctaSection": {
      const ctas = resolveCtas(b.ctas as RawCta[], settings);
      const center = b.align !== "left";
      return (
        <Section tone={(b.tone as never) || "cream"} width={(b.width as never) || "narrow"} id={(b.anchor as string) || undefined} className={center ? "text-center" : ""}>
          <div className={center ? "flex justify-center" : ""}><Ornament start={!center} tone={b.tone === "night" ? "champagne" : "gold"} /></div>
          <h2 className="t-h2 mt-7">{emph(b.heading as string)}</h2>
          {b.body ? <p className={`prose-body mt-6 text-muted ${center ? "mx-auto max-w-xl" : "max-w-2xl"}`}>{b.body as string}</p> : null}
          <CtaRow ctas={ctas} align={center ? "center" : "left"} onDark={b.tone === "night"} />
        </Section>
      );
    }

    case "formatDetail": {
      const cta = resolveCta(b.cta as RawCta, settings);
      const included = (b.included as { text: string }[]) || [];
      return (
        <Section tone={(b.tone as never) || "cream"} id={(b.anchor as string) || undefined}>
          {b.tag ? <span className="eyebrow eyebrow--filet">{b.tag as string}</span> : null}
          <h2 className={`t-h2 ${b.tag ? "mt-4" : ""}`}>{b.title as string}</h2>
          {b.tagline ? <p className="prose-lede mt-3">{b.tagline as string}</p> : null}
          {(() => {
            const hasAside = included.length > 0 || !!b.investment;
            return (
              <div className={`mt-6 grid gap-10 ${hasAside ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
                <div className="prose-body space-y-4 text-muted">
                  {b.body ? <RichText data={b.body as never} /> : null}
                </div>
                {hasAside ? (
                  <div className="relative h-fit overflow-hidden border border-line bg-ivory p-7 shadow-[0_1px_30px_-18px_rgba(34,36,32,0.5)] sm:p-8 lg:sticky lg:top-28">
                    <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold-soft/70 to-transparent" />
                    {included.length ? (
                      <>
                        <p className="eyebrow text-gold-ink/80">What&apos;s included</p>
                        <ul className="stagger mt-5 space-y-3 text-sm text-ink-soft">
                          {included.map((it, i) => (
                            <li key={i} className="border-l border-gold-soft/55 pl-3.5">{it.text}</li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                    {b.investment ? <p className="mt-6 border-t border-line pt-5 text-sm text-ink-soft"><span className="font-medium text-ink">Investment</span> · {b.investment as string}</p> : null}
                  </div>
                ) : null}
              </div>
            );
          })()}
          {cta ? <CtaRow ctas={[cta]} /> : null}
        </Section>
      );
    }

    case "faq": {
      const items = ((b.items as { question: string; answer: string }[]) || []).map((q) => ({ q: q.question, a: q.answer }));
      return (
        <Section tone={(b.tone as never) || "sand"} id={(b.anchor as string) || undefined}>
          <Ornament start />
          {b.heading ? <h2 className="t-h2 mt-7 max-w-[24ch]">{emph(b.heading as string)}</h2> : null}
          <div className="mt-9"><Accordion items={items} /></div>
        </Section>
      );
    }

    case "list": {
      const items = (b.items as { text: string }[]) || [];
      const cta = resolveCta(b.cta as RawCta, settings);
      return (
        <Section tone={(b.tone as never) || "cream"} width={(b.width as never) || "default"} id={(b.anchor as string) || undefined}>
          <Ornament start />
          <h2 className="t-h2 mt-7 max-w-[24ch]">{emph(b.heading as string)}</h2>
          {b.intro ? <p className="mt-5 text-muted">{b.intro as string}</p> : null}
          <ul className="stagger mt-8 space-y-4 measure">
            {items.map((it, i) => (
              <li key={i} className="border-l border-gold-soft/55 pl-4 text-[1.0625rem] leading-relaxed text-ink-soft">{it.text}</li>
            ))}
          </ul>
          {b.note ? <p className="mt-6 text-sm italic text-faint">{b.note as string}</p> : null}
          {cta ? <CtaRow ctas={[cta]} /> : null}
        </Section>
      );
    }

    case "twoColumnLists": {
      const left = (b.left as { text: string }[]) || [];
      const right = (b.right as { text: string }[]) || [];
      return (
        <Section tone={(b.tone as never) || "cream"} id={(b.anchor as string) || undefined}>
          <Ornament start />
          <h2 className="t-h2 mt-7 max-w-[24ch]">{emph(b.heading as string)}</h2>
          {b.intro ? <p className="mt-5 text-muted">{b.intro as string}</p> : null}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden bg-ivory/70 p-8 sm:p-9">
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold-soft/60 to-transparent" />
              {b.leftTitle ? <h3 className="text-xl text-ink">{b.leftTitle as string}</h3> : null}
              <ul className="stagger mt-6 space-y-3.5 text-sm leading-relaxed text-ink-soft">
                {left.map((it, i) => <li key={i} className="border-l border-gold-soft/45 pl-3.5">{it.text}</li>)}
              </ul>
            </div>
            <div className="relative overflow-hidden bg-ivory/70 p-8 sm:p-9">
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold-soft/60 to-transparent" />
              {b.rightTitle ? <h3 className="text-xl text-ink">{b.rightTitle as string}</h3> : null}
              <ul className="stagger mt-6 space-y-3.5 text-sm leading-relaxed text-ink-soft">
                {right.map((it, i) => <li key={i} className="border-l border-gold-soft/45 pl-3.5">{it.text}</li>)}
              </ul>
            </div>
          </div>
        </Section>
      );
    }

    case "contactTiles": {
      const tiles = (b.tiles as { title: string; line?: string; value?: string; ctaLabel?: string; action?: string; whatsappContext?: string; href?: string }[]) || [];
      return (
        <Section tone={(b.tone as never) || "sand"} width="wide" id={(b.anchor as string) || undefined}>
          <div className="stagger grid gap-6 md:grid-cols-3">
            {tiles.map((t, i) => {
              const cta = resolveCta({ label: t.ctaLabel, action: t.action as never, whatsappContext: t.whatsappContext, href: t.href }, settings);
              return (
                <div key={i} className="group relative flex flex-col overflow-hidden border border-line bg-ivory/70 p-8 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold-soft/60 to-transparent" />
                  <h3 className="text-2xl text-ink">{t.title}</h3>
                  {t.line ? <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{t.line}</p> : <div className="flex-1" />}
                  {t.value ? <p className="mt-5 text-sm font-medium text-ink">{t.value}</p> : null}
                  {cta ? (
                    <a href={cta.href} target={cta.external ? "_blank" : undefined} rel={cta.external ? "noopener noreferrer" : undefined} className="link-underline mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gold-ink">
                      {cta.label} <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Section>
      );
    }

    case "contactForm":
      return (
        <Section tone={(b.tone as never) || "sand"} id={(b.anchor as string) || undefined}>
          <Ornament start />
          {b.heading ? <h2 className="t-h2 mt-7 max-w-[24ch]">{emph(b.heading as string)}</h2> : null}
          {b.intro ? <p className="mt-5 text-muted">{b.intro as string}</p> : null}
          <div className="mt-9"><ContactForm /></div>
        </Section>
      );

    case "richText": {
      const cta = resolveCta(b.cta as RawCta, settings);
      return (
        <Section tone={(b.tone as never) || "cream"} width={(b.width as never) || "default"} id={(b.anchor as string) || undefined}>
          {b.eyebrow ? <span className="eyebrow eyebrow--filet">{b.eyebrow as string}</span> : <Ornament start />}
          {b.heading ? <h2 className={`t-h2 max-w-[24ch] text-ink ${b.eyebrow ? "mt-4" : "mt-7"}`}>{emph(b.heading as string)}</h2> : null}
          {/* Body kept to a comfortable reading measure even when the section runs
              wide — long-form internal copy never sprawls past ~66ch. */}
          <div className="prose-body measure mt-6 space-y-4 text-muted [&>p:first-of-type]:text-[1.1875rem] [&>p:first-of-type]:text-ink-soft">
            {b.body ? <RichText data={b.body as never} /> : null}
          </div>
          {cta ? <CtaRow ctas={[cta]} /> : null}
        </Section>
      );
    }

    default:
      return null;
  }
}
