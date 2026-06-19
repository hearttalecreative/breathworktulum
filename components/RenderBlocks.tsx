import { RichText } from "@payloadcms/richtext-lexical/react";
import Section from "./Section";
import CTAButton from "./CTAButton";
import ThreePhases from "./method/ThreePhases";
import Accordion from "./Accordion";
import ContactForm from "./ContactForm";
import PayloadImage from "./PayloadImage";
import Reveal from "./Reveal";
import { resolveCta, resolveCtas, type RawCta } from "@/lib/cta";

type Settings = Parameters<typeof resolveCtas>[1];
type AnyBlock = Record<string, unknown> & { blockType: string; id?: string };

const paras = (s?: string | null) =>
  (s || "").split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

function CtaRow({
  ctas,
  align = "left",
}: {
  ctas: { label: string; href: string; variant: "primary" | "secondary" | "whatsapp"; external: boolean }[];
  align?: "left" | "center";
}) {
  if (!ctas.length) return null;
  return (
    <div className={`mt-8 flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}>
      {ctas.map((c, i) => (
        <CTAButton key={i} href={c.href} variant={c.variant} external={c.external}>
          {c.label}
        </CTAButton>
      ))}
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
              <PayloadImage
                media={b.image as never}
                fill
                priority={first}
                sizes="100vw"
                className="kenburns object-cover"
              />
              <div className="hero-scrim absolute inset-0" aria-hidden />
            </div>
            <div className="relative mx-auto w-full max-w-6xl px-[clamp(20px,5vw,80px)] pb-[clamp(3rem,9vh,7rem)] pt-40">
              {b.eyebrow ? (
                <span className="eyebrow eyebrow--filet text-champagne">
                  {b.eyebrow as string}
                </span>
              ) : null}
              <h1 className="t-display mt-5 max-w-[16ch] text-pure">{b.heading as string}</h1>
              {b.lede ? (
                <p className="prose-lede mt-6 max-w-xl text-cream-dim">{b.lede as string}</p>
              ) : null}
              <CtaRow ctas={ctas} />
            </div>
            <span
              aria-hidden
              className="scrollcue absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-cream-dim/80 sm:block"
            >
              Scroll
            </span>
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
              <h1 className="t-display mt-4">{b.heading as string}</h1>
              {b.lede ? <p className="prose-lede mt-7 measure">{b.lede as string}</p> : null}
              <CtaRow ctas={ctas} />
            </div>
            <div className="card relative aspect-[4/5] arch bg-sand lg:aspect-[5/6]">
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
      return (
        <Section tone={(b.tone as never) || "sand"} id={(b.anchor as string) || undefined}>
          <h2 className="text-3xl sm:text-4xl">{b.heading as string}</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-sand-deep bg-sand-deep sm:grid-cols-2">
            {items.map((it, i) => (
              <p key={i} className="bg-cream p-7 text-[1.05rem] leading-relaxed text-muted">
                {it.text}
              </p>
            ))}
          </div>
          {b.closing ? <p className="mt-10 font-serif text-2xl text-ink">{b.closing as string}</p> : null}
        </Section>
      );
    }

    case "threePhases": {
      const cta = resolveCta(b.cta as RawCta, settings);
      return (
        <Section tone={(b.tone as never) || "cream"} width="wide" id={(b.anchor as string) || undefined}>
          {b.eyebrow ? <span className="eyebrow">{b.eyebrow as string}</span> : null}
          {b.heading ? (
            <h2 className="mt-3 max-w-2xl text-3xl sm:text-4xl">{b.heading as string}</h2>
          ) : null}
          {b.lede ? <p className="prose-lede mt-4 max-w-2xl">{b.lede as string}</p> : null}
          <div className="mt-12">
            <ThreePhases />
          </div>
          {b.body ? (
            <div className="prose-body mt-10 max-w-3xl space-y-4 text-[1.05rem] leading-relaxed text-muted">
              <RichText data={b.body as never} />
            </div>
          ) : null}
          {cta ? <CtaRow ctas={[cta]} /> : null}
        </Section>
      );
    }

    case "waysGrid": {
      const cards =
        (b.cards as { image?: unknown; title: string; body: string; ctaLabel?: string; href?: string }[]) || [];
      // Editorial, photo-forward, asymmetric: the first two span wide, the rest
      // narrow — no uniform box grid, no hairline borders.
      const spans = ["lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2"];
      const ratios = ["aspect-[16/10]", "aspect-[16/10]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[4/5]"];
      return (
        <Section tone={(b.tone as never) || "sand"} width="wide" id={(b.anchor as string) || undefined}>
          <span className="eyebrow eyebrow--filet">Ways to work together</span>
          <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl lg:text-5xl">{b.heading as string}</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {cards.map((c, i) => {
              const Wrapper = c.href ? "a" : "div";
              return (
                <Wrapper
                  key={i}
                  {...(c.href ? { href: c.href } : {})}
                  className={`card group relative block overflow-clip rounded-2xl bg-night ${spans[i % spans.length]}`}
                >
                  <div className={`card-media relative ${ratios[i % ratios.length]} w-full`}>
                    {c.image ? (
                      <PayloadImage media={c.image as never} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/15 to-transparent" aria-hidden />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-serif text-2xl text-pure">{c.title}</h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-cream-dim">{c.body}</p>
                    {c.ctaLabel ? (
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-champagne">
                        {c.ctaLabel}
                        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
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
      return (
        <Section tone={(b.tone as never) || "sand"} width="wide" id={(b.anchor as string) || undefined}>
          {b.heading ? <h2 className="text-3xl sm:text-4xl">{b.heading as string}</h2> : null}
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {items.map((t, i) => (
              <figure key={i} className="flex flex-col rounded-2xl border border-sand-deep bg-cream p-7">
                <blockquote className="flex-1 font-serif text-lg leading-relaxed text-ink">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-xs uppercase tracking-widest text-faint">
                  {t.source || "Google Review"}
                </figcaption>
              </figure>
            ))}
          </div>
          {b.reviewsUrl ? (
            <a href={b.reviewsUrl as string} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-gold hover:text-ink">
              {(b.reviewsLabel as string) || "Read more reviews"} <span aria-hidden>→</span>
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
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand ${left ? "lg:order-first" : "lg:order-last"}`}>
              <PayloadImage media={b.image as never} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl">{b.heading as string}</h2>
              {b.body ? (
                <div className="prose-body mt-6 space-y-4 text-[1.05rem] leading-relaxed text-muted">
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
        <section className="relative overflow-hidden bg-night px-6 py-24 text-cream-dim sm:py-32" id={(b.anchor as string) || undefined}>
          <PayloadImage media={b.image as never} fill sizes="100vw" className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-night/70" aria-hidden />
          <div className="relative mx-auto max-w-3xl text-center">
            {b.eyebrow ? <span className="eyebrow text-gold-soft">{b.eyebrow as string}</span> : null}
            <h2 className="mt-4 text-3xl text-cream sm:text-4xl lg:text-5xl">{b.heading as string}</h2>
            {b.body ? <p className="mx-auto mt-6 max-w-xl text-cream-dim/85">{b.body as string}</p> : null}
            {cta ? <div className="mt-9 flex justify-center"><CTAButton href={cta.href} variant={cta.variant} external={cta.external}>{cta.label}</CTAButton></div> : null}
          </div>
        </section>
      );
    }

    case "ctaSection": {
      const ctas = resolveCtas(b.ctas as RawCta[], settings);
      const center = b.align !== "left";
      return (
        <Section tone={(b.tone as never) || "cream"} width={(b.width as never) || "narrow"} id={(b.anchor as string) || undefined} className={center ? "text-center" : ""}>
          <h2 className="text-3xl sm:text-4xl">{b.heading as string}</h2>
          {b.body ? <p className={`mt-6 text-[1.05rem] leading-relaxed text-muted ${center ? "mx-auto max-w-xl" : "max-w-2xl"}`}>{b.body as string}</p> : null}
          <CtaRow ctas={ctas} align={center ? "center" : "left"} />
        </Section>
      );
    }

    case "formatDetail": {
      const cta = resolveCta(b.cta as RawCta, settings);
      const included = (b.included as { text: string }[]) || [];
      return (
        <Section tone={(b.tone as never) || "cream"} id={(b.anchor as string) || undefined}>
          {b.tag ? (
            <span className="mb-3 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-medium uppercase tracking-widest text-gold">
              {b.tag as string}
            </span>
          ) : null}
          <h2 className="text-3xl sm:text-4xl">{b.title as string}</h2>
          {b.tagline ? <p className="prose-lede mt-3">{b.tagline as string}</p> : null}
          {(() => {
            const hasAside = included.length > 0 || !!b.investment;
            return (
              <div className={`mt-6 grid gap-10 ${hasAside ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
                <div className="prose-body space-y-4 text-[1.05rem] leading-relaxed text-muted">
                  {b.body ? <RichText data={b.body as never} /> : null}
                </div>
                {hasAside ? (
                  <div className="rounded-2xl border border-sand-deep bg-cream/60 p-6">
                    {included.length ? (
                      <>
                        <p className="text-xs uppercase tracking-widest text-faint">What&apos;s included</p>
                        <ul className="mt-4 space-y-2.5 text-sm text-muted">
                          {included.map((it, i) => (
                            <li key={i} className="flex gap-2.5"><span aria-hidden className="mt-1 text-gold">—</span><span>{it.text}</span></li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                    {b.investment ? <p className="mt-5 text-sm text-muted"><span className="font-medium text-ink">Investment:</span> {b.investment as string}</p> : null}
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
          {b.heading ? <h2 className="text-3xl sm:text-4xl">{b.heading as string}</h2> : null}
          <div className="mt-8"><Accordion items={items} /></div>
        </Section>
      );
    }

    case "list": {
      const items = (b.items as { text: string }[]) || [];
      const cta = resolveCta(b.cta as RawCta, settings);
      return (
        <Section tone={(b.tone as never) || "cream"} width={(b.width as never) || "default"} id={(b.anchor as string) || undefined}>
          <h2 className="text-3xl sm:text-4xl">{b.heading as string}</h2>
          {b.intro ? <p className="mt-5 text-muted">{b.intro as string}</p> : null}
          <ul className="mt-6 space-y-3">
            {items.map((it, i) => (
              <li key={i} className="flex gap-3 text-muted"><span aria-hidden className="mt-1 text-gold">—</span><span>{it.text}</span></li>
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
          <h2 className="text-3xl sm:text-4xl">{b.heading as string}</h2>
          {b.intro ? <p className="mt-5 text-muted">{b.intro as string}</p> : null}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-sand-deep bg-sand p-6">
              {b.leftTitle ? <h3 className="font-serif text-xl text-ink">{b.leftTitle as string}</h3> : null}
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                {left.map((it, i) => <li key={i} className="flex gap-2.5"><span aria-hidden className="mt-1 text-clay">—</span><span>{it.text}</span></li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-sand-deep bg-sand p-6">
              {b.rightTitle ? <h3 className="font-serif text-xl text-ink">{b.rightTitle as string}</h3> : null}
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                {right.map((it, i) => <li key={i} className="flex gap-2.5"><span aria-hidden className="mt-1 text-sage">—</span><span>{it.text}</span></li>)}
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
          <div className="grid gap-6 md:grid-cols-3">
            {tiles.map((t, i) => {
              const cta = resolveCta({ label: t.ctaLabel, action: t.action as never, whatsappContext: t.whatsappContext, href: t.href }, settings);
              return (
                <div key={i} className="flex flex-col rounded-2xl border border-sand-deep bg-cream p-7">
                  <h3 className="font-serif text-2xl text-ink">{t.title}</h3>
                  {t.line ? <p className="mt-2 flex-1 text-sm text-muted">{t.line}</p> : <div className="flex-1" />}
                  {t.value ? <p className="mt-4 text-sm font-medium text-ink">{t.value}</p> : null}
                  {cta ? (
                    <a href={cta.href} target={cta.external ? "_blank" : undefined} rel={cta.external ? "noopener noreferrer" : undefined} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold hover:text-ink">
                      {cta.label} <span aria-hidden>→</span>
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
          {b.heading ? <h2 className="text-3xl sm:text-4xl">{b.heading as string}</h2> : null}
          {b.intro ? <p className="mt-5 text-muted">{b.intro as string}</p> : null}
          <div className="mt-8"><ContactForm /></div>
        </Section>
      );

    case "richText": {
      const cta = resolveCta(b.cta as RawCta, settings);
      return (
        <Section tone={(b.tone as never) || "cream"} width={(b.width as never) || "default"} id={(b.anchor as string) || undefined}>
          {b.heading ? <h2 className="text-3xl sm:text-4xl">{b.heading as string}</h2> : null}
          <div className="prose-body mt-6 space-y-4 text-[1.05rem] leading-relaxed text-muted">
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
