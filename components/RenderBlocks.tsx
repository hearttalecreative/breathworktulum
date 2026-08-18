import { RichText } from "@payloadcms/richtext-lexical/react";
import Section from "./Section";
import CTAButton from "./CTAButton";
import Accordion from "./Accordion";
import ContactForm from "./ContactForm";
import NewsletterSignup from "./NewsletterSignup";
import PayloadImage from "./PayloadImage";
import HeroVideo from "./HeroVideo";
import ExpandableSection from "./ExpandableSection";
import WaveMark from "./WaveMark";
import Reveal from "./Reveal";
import { resolveCta, resolveCtas, type RawCta } from "@/lib/cta";
import { bodyConverters } from "@/lib/richtextConverters";

type Settings = Parameters<typeof resolveCtas>[1];
type AnyBlock = Record<string, unknown> & { blockType: string; id?: string };

const paras = (s?: string | null) =>
  (s || "").split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

// Énfasis dentro de un titular, escrito en el propio campo de texto:
//   *palabra*   cursiva Canela, la "palabra que respira"
//   **palabra** peso 500
// La negrita no va a 700 a propósito: el titular es Canela 300, y un 700 al
// lado rompe el trazo fino de la tipografía. 500 marca sin gritar.
// El orden importa: ** se prueba antes que *, si no el split parte de a uno.
function emph(s?: string | null) {
  if (!s) return null;
  return s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} className="font-medium">{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
    return <span key={i}>{part}</span>;
  });
}

function CtaRow({
  ctas,
  align = "left",
  onDark = false,
  stack = false,
}: {
  ctas: { label: string; href: string; variant: "primary" | "secondary" | "whatsapp"; external: boolean }[];
  align?: "left" | "center";
  onDark?: boolean;
  /** Uno debajo del otro y centrados, en teléfono y en escritorio. Lo usa el
   *  bloque de cierre de página: en fila, el botón principal quedaba descentrado
   *  y el enlace de correo competía a su lado en vez de seguirlo. */
  stack?: boolean;
}) {
  if (!ctas.length) return null;
  // El enlace de correo trae min-h de 52px para el dedo, y con el texto centrado
  // dentro deja 16px muertos arriba y abajo. A 44px sigue siendo tocable y el
  // grupo se junta. El botón principal baja un punto sólo en escritorio, que es
  // donde se veía grande.
  const apilado =
    "flex-col items-center gap-y-2 sm:gap-y-7 [&_.link-underline]:min-h-[2.75rem] sm:[&_.btn-sheen-gold]:min-h-[3rem] sm:[&_.btn-sheen-gold]:px-7";
  return (
    <div
      className={`mt-8 flex items-center gap-x-6 ${
        stack ? apilado : `flex-wrap gap-y-3 ${align === "center" ? "justify-center" : ""}`
      }`}
    >
      {ctas.map((c, i) => (
        <CTAButton key={i} href={c.href} variant={c.variant} external={c.external} onDark={onDark}>
          {c.label}
        </CTAButton>
      ))}
    </div>
  );
}

// Turn a Vimeo/YouTube link into a background-style embed URL (autoplay, muted,
// looped, no chrome). Returns "" for anything unrecognized so callers fall back
// to the poster image.
function toVideoEmbed(url: string): string {
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?background=1&autoplay=1&muted=1&loop=1&dnt=1`;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/i);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&controls=0&modestbranding=1&rel=0`;
  return "";
}

// Opciones que ella elige desde el panel.
const SHAPE: Record<string, string> = { arch: "arch", rounded: "shape-rounded", square: "shape-square" };
// El header es fixed y mide 89px en escritorio, así que el padding no es el
// hueco que se ve: hay que descontarlo. Con lg:pt-28 quedaban 23px entre el
// header y el titular, que es lo que se veía apretado. Normal deja ~63px, el
// mismo respiro que .section-first le da al blog.
const HERO_PAD: Record<string, string> = {
  compact: "pt-24 sm:pt-28 lg:pt-32",
  normal: "pt-28 sm:pt-32 lg:pt-[9.5rem]",
  generous: "pt-32 sm:pt-40 lg:pt-48",
};
// El velo sobre la foto de cada tarjeta. Light deja ver más foto; el texto
// blanco sigue leyéndose porque el degradado se mantiene fuerte abajo, que es
// donde está el texto.
const CARD_OVERLAY: Record<string, string> = {
  light: "bg-gradient-to-t from-night/72 via-night/20 to-transparent",
  medium: "bg-gradient-to-t from-night/90 via-night/40 to-transparent",
  strong: "bg-gradient-to-t from-night/95 via-night/65 to-night/20",
};

// URL de una foto de la biblioteca, normalizada igual que en PayloadImage: las
// que guarda Payload vienen absolutizadas con serverURL, que en dev es
// localhost. Se usa para el póster del video del hero.
function mediaUrl(m: unknown): string {
  const u = (m as { url?: string } | null)?.url;
  return typeof u === "string" ? u.replace(/^https?:\/\/[^/]+(\/api\/media\/)/, "$1") : "";
}

// The media layer of a feature band: a self-hosted mp4, an embedded
// Vimeo/YouTube background, or the still image. Module scope so the portrait
// and full-screen formats share exactly one implementation.
function FeatureMedia({
  block: b,
  video,
  sizes,
  fill = false,
}: {
  block: AnyBlock;
  video: string;
  sizes: string;
  fill?: boolean;
}) {
  const cover = "absolute inset-0 h-full w-full object-cover";
  if (/\.mp4($|\?)/i.test(video)) {
    return <video className={cover} src={video} autoPlay muted loop playsInline />;
  }
  const embed = video ? toVideoEmbed(video) : "";
  if (embed) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full"
        src={embed}
        title={(b.heading as string) || "Video"}
        allow="autoplay; fullscreen; picture-in-picture"
        loading="lazy"
      />
    );
  }
  return <PayloadImage media={b.image as never} fill sizes={sizes} className={fill ? "kenburns object-cover" : "object-cover"} />;
}

// One chapter of an expandable story block (About). Module scope so it isn't
// redefined on every render.
function StoryChapter({ c, first }: { c: { title?: string; body?: unknown }; first: boolean }) {
  return (
    <div className={first ? "" : "mt-10"}>
      {c.title ? <h3 className="font-serif text-[1.35rem] leading-snug text-ink">{c.title}</h3> : null}
      <div className="prose-body measure mt-4 space-y-4 text-ink-soft">
        {c.body ? <RichText data={c.body as never} converters={bodyConverters} /> : null}
      </div>
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
  // Sections parked from the panel stay in the document but never render.
  const visible = blocks.filter((b) => !b.hidden);
  if (!visible.length) return null;
  return (
    <>
      {visible.map((b, i) =>
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
      //
      // El video venía fijo al de la home, así que cualquier otra página que
      // eligiera este formato mostraba la home. Ahora sale del bloque: si hay
      // Video URL se reproduce en silencio y en loop, y si no, se ve la foto.
      const heroVideo = ((b.videoUrl as string) || "").trim();
      const heroMedia = heroVideo ? (
        <HeroVideo
          url={heroVideo}
          poster={mediaUrl(b.image) || "/hero/hero-poster.jpg"}
          loopEnd={typeof b.videoTrim === "number" ? b.videoTrim : undefined}
        />
      ) : (
        <PayloadImage media={b.image as never} fill priority sizes="100vw" className="object-cover" />
      );

      if (b.variant === "fullBleed" && b.image) {
        // Variant she can pick from the panel: the headline sits under the
        // footage instead of over it, so the video stays completely clean.
        if (b.textPlacement === "below") {
          return (
            <>
              <section data-fullbleed-hero className="relative min-h-[72svh] overflow-clip bg-night lg:min-h-[86svh]">
                <div className="absolute inset-0">{heroMedia}</div>
              </section>
              <section className="bg-shell px-[clamp(20px,5vw,80px)] pt-14 pb-12 sm:pt-16">
                <div className="mx-auto max-w-6xl">
                  {b.eyebrow ? <span className="eyebrow eyebrow--filet">{b.eyebrow as string}</span> : null}
                  <h1 className="t-display mt-4 max-w-[20ch]">{emph(b.heading as string)}</h1>
                  {b.lede ? <p className="prose-lede measure mt-6 whitespace-pre-line">{b.lede as string}</p> : null}
                  <CtaRow ctas={ctas} />
                </div>
              </section>
            </>
          );
        }
        return (
          <section
            data-fullbleed-hero
            className="relative flex min-h-[100svh] items-end overflow-clip bg-night"
          >
            <div className="absolute inset-0">
              {heroMedia}
              <div className="hero-scrim absolute inset-0" aria-hidden />
              {/* El velo lateral está calibrado para el video de la home, que ya
                  viene oscuro. Una foto fija puede ser clara, y ahí el titular
                  blanco se pierde. El texto va a la izquierda, así que oscurece
                  ese lado y deja el otro limpio: se lee sin tapar la foto. */}
              {heroVideo ? null : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-night/92 via-night/55 to-night/10" aria-hidden />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-night/25" aria-hidden />
                </>
              )}
            </div>
            <div className="over-photo relative mx-auto w-full max-w-6xl px-[clamp(20px,5vw,80px)] pb-[clamp(3rem,9vh,7rem)] pt-[clamp(7rem,18vh,11rem)]">
              {b.eyebrow ? (
                <span className="eyebrow eyebrow--filet text-champagne">
                  {b.eyebrow as string}
                </span>
              ) : null}
              <h1 className="t-display mt-5 max-w-[16ch] text-pure">{emph(b.heading as string)}</h1>
              {b.lede ? (
                <p className="prose-lede mt-6 max-w-xl text-pure/90 whitespace-pre-line">{b.lede as string}</p>
              ) : null}
              {b.metaLine ? (
                <p className="mt-4 text-[0.9rem] tracking-wide text-champagne/90">{b.metaLine as string}</p>
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
      // Sin foto, el contenedor de la imagen se dibujaba igual: un arco vacío
      // ocupando media pantalla, y el texto centrado verticalmente contra él,
      // que es de dónde salía el hueco enorme bajo el menú. Sin foto no hay
      // columna: el texto va a todo el ancho.
      const heroImg = !!b.image;
      // El video del hero partido vive en el mismo campo que el de pantalla
      // completa; acá ocupa el lugar de la foto dentro de la forma.
      const heroSideVideo = ((b.videoUrl as string) || "").trim();
      const heroPad = HERO_PAD[(b.spacing as string) || "normal"] ?? HERO_PAD.normal;
      return (
        <section className={`bg-shell px-[clamp(20px,5vw,80px)] pb-12 ${heroPad}`}>
          {/* La foto es más alta que el texto, y con items-center el texto se
              centraba contra ella: quedaban unos 110px de aire muerto arriba a
              la izquierda, que es lo que la clienta marcó. Alineado arriba, el
              titular arranca a la altura de la foto.
              En teléfono no cambia nada: hay una sola columna, así que la
              alineación vertical nunca tuvo efecto ahí. */}
          <div className={`mx-auto grid max-w-6xl items-center gap-12 lg:items-start lg:gap-16 ${heroImg ? "lg:grid-cols-[1.05fr_0.95fr]" : ""}`}>
            <div className={left && heroImg ? "lg:order-last" : ""}>
              {b.eyebrow ? (
                <span className="eyebrow eyebrow--filet">{b.eyebrow as string}</span>
              ) : null}
              <h1 className="t-display mt-4">{emph(b.heading as string)}</h1>
              {b.lede ? <p className="prose-lede mt-7 measure whitespace-pre-line">{b.lede as string}</p> : null}
              {b.metaLine ? <p className="mt-4 text-[0.9rem] tracking-wide text-gold-ink">{b.metaLine as string}</p> : null}
              <CtaRow ctas={ctas} />
            </div>
            {heroImg || heroSideVideo ? (
              // Con video la forma pasa a 9:16, que es como se filma en el
              // teléfono, y se limita el ancho para que no domine la fila.
              <div className={`card relative float-slow bg-sand ${heroSideVideo ? "mx-auto aspect-[9/16] w-full max-w-[20rem]" : "aspect-[4/5] lg:aspect-[5/6]"} ${SHAPE[(b.imageShape as string) || "arch"] ?? "arch"}`}>
                <div className="card-media absolute inset-0">
                  {heroSideVideo ? (
                    <FeatureMedia block={b} video={heroSideVideo} sizes="(max-width: 1024px) 100vw, 40vw" />
                  ) : (
                    <PayloadImage
                      media={b.image as never}
                      fill
                      priority={first}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  )}
                </div>
              </div>
            ) : null}
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
                    <p className="measure whitespace-pre-line text-[1.0625rem] leading-relaxed text-ink-soft">{it.text}</p>
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

    case "mediaFeature": {
      const ctas = resolveCtas(b.ctas as RawCta[], settings);
      const video = ((b.videoUrl as string) || "").trim();
      const format = (b.format as string) || "fullScreen";

      // Portrait: the photo stays upright and uncropped, with the copy beside it
      // on desktop and stacked underneath on phones (brief F-1).
      if (format === "portrait") {
        return (
          <Section tone={(b.tone as never) || "cream"} width="wide" id={(b.anchor as string) || undefined}>
            <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-2xl bg-sand ring-1 ring-line lg:max-w-none">
                {/* Con foto, el marco vertical de siempre. Con video se abre a
                    9:16, que es como se filma en el teléfono: en 4:5 quedaba
                    con una banda oscura a cada lado. */}
                <div className={`relative ${video ? "aspect-[9/16]" : "aspect-[4/5]"}`}>
                  <FeatureMedia block={b} video={video} sizes="(max-width: 1024px) 100vw, 45vw" />
                </div>
              </div>
              <div>
                {b.eyebrow ? <span className="eyebrow eyebrow--filet">{b.eyebrow as string}</span> : null}
                {b.heading ? <h2 className="t-h2 mt-4 max-w-[20ch]">{emph(b.heading as string)}</h2> : null}
                {b.body ? <p className="measure mt-5 text-[1.05rem] leading-relaxed text-ink-soft whitespace-pre-line">{b.body as string}</p> : null}
                <CtaRow ctas={ctas} />
              </div>
            </div>
          </Section>
        );
      }

      // Full screen fills the viewport on desktop; phones keep the height she
      // already likes. "band" is the old short format, kept for existing pages.
      const height = format === "band" ? "min-h-[48svh] lg:min-h-[56svh]" : "min-h-[70svh] lg:min-h-[100svh]";
      return (
        <section className={`on-dark relative flex ${height} items-end overflow-clip bg-night`} id={(b.anchor as string) || undefined}>
          <FeatureMedia block={b} video={video} sizes="100vw" fill />
          <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/25 to-transparent" aria-hidden />
          <div className="over-photo relative mx-auto w-full max-w-6xl px-[clamp(20px,5vw,80px)] pb-[clamp(2.5rem,7vh,5rem)]">
            {b.eyebrow ? <span className="eyebrow eyebrow--filet text-champagne">{b.eyebrow as string}</span> : null}
            {b.heading ? <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.9rem,4vw,3rem)] leading-[1.1] text-pure">{b.heading as string}</h2> : null}
            {b.body ? <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-cream-dim/90 whitespace-pre-line">{b.body as string}</p> : null}
            <CtaRow ctas={ctas} onDark />
          </div>
        </section>
      );
    }

    case "expandableStory": {
      const chapters = (b.chapters as { title?: string; body?: unknown; collapsed?: boolean }[]) || [];
      const open = chapters.filter((c) => !c.collapsed);
      const folded = chapters.filter((c) => c.collapsed);
      return (
        <Section tone={(b.tone as never) || "cream"} width={(b.width as never) || "narrow"} id={(b.anchor as string) || undefined}>
          <Ornament start />
          <h2 className="t-h2 mt-7 max-w-[24ch]">{emph(b.heading as string)}</h2>
          <div className="mt-8">
            {open.map((c, i) => <StoryChapter key={`o${i}`} c={c} first={i === 0} />)}
          </div>
          {folded.length ? (
            <ExpandableSection label={(b.moreLabel as string) || "Read more"}>
              <div className="mt-10">
                {folded.map((c, i) => <StoryChapter key={`f${i}`} c={c} first={i === 0} />)}
              </div>
            </ExpandableSection>
          ) : null}
        </Section>
      );
    }

    case "detailsGrid": {
      const rows = (b.rows as { label: string; value: string }[]) || [];
      const cta = resolveCta(b.cta as RawCta, settings);
      return (
        <Section tone={(b.tone as never) || "sand"} width={(b.width as never) || "default"} id={(b.anchor as string) || undefined}>
          {b.heading ? <h2 className="t-h2 max-w-[24ch]">{emph(b.heading as string)}</h2> : null}
          <dl className="mt-8 grid gap-x-10 gap-y-0 sm:grid-cols-2">
            {rows.map((r, i) => (
              <div key={i} className="flex flex-wrap items-baseline gap-x-3 border-b border-line py-3.5">
                <dt className="eyebrow shrink-0 text-gold-ink/85">{r.label}</dt>
                <dd className="text-[0.98rem] text-ink-soft">{r.value}</dd>
              </div>
            ))}
          </dl>
          {b.note ? <p className="mt-6 whitespace-pre-line text-sm italic text-faint">{b.note as string}</p> : null}
          {cta ? <CtaRow ctas={[cta]} /> : null}
        </Section>
      );
    }

    case "gallery": {
      const imgs = (b.images as { image: unknown; caption?: string }[]) || [];
      return (
        <Section tone={(b.tone as never) || "cream"} width={(b.width as never) || "wide"} id={(b.anchor as string) || undefined}>
          {b.heading ? <h2 className="t-h2 max-w-[24ch]">{emph(b.heading as string)}</h2> : null}
          {b.intro ? <p className="mt-5 max-w-2xl text-muted whitespace-pre-line">{b.intro as string}</p> : null}
          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {imgs.map((it, i) => (
              <figure key={i} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-sand ring-1 ring-line">
                <PayloadImage media={it.image as never} fill sizes="(max-width:640px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                {it.caption ? (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/75 to-transparent p-3 text-xs text-pure opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {it.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </Section>
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
              <div className="over-photo relative mx-auto w-full max-w-6xl px-[clamp(20px,5vw,80px)] pb-[clamp(2rem,6vh,4rem)]">
                {b.eyebrow ? <span className="eyebrow eyebrow--filet text-champagne">{b.eyebrow as string}</span> : null}
                {b.caption ? <p className="mt-3 max-w-2xl font-serif text-2xl text-pure sm:text-3xl whitespace-pre-line">{b.caption as string}</p> : null}
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
      // The section now follows the block's own Background colour instead of
      // being hard-coded to forest green, and the photo sits in a plain rounded
      // frame — the arch and the framed card were the three things she named.
      // Extra top padding gives the transition from the photo band above room
      // to breathe.
      const dark = b.tone === "night" || b.tone === "forest";
      const surface = dark ? "on-dark bg-forest text-cream-dim" : b.tone === "sand" ? "bg-sand text-ink" : "bg-shell text-ink";
      return (
        // Arriba: el respiro extra sobre la banda de foto era más del necesario.
        // Abajo: esta sección y la que sigue son las dos del mismo color y cada
        // una ponía su padding entero, así que el corte entre ambas se leía como
        // un bloque vacío. El de abajo se reduce a un tercio y el hueco combinado
        // baja del orden de 122px a 81px en teléfono.
        <section
          className={`${surface} px-[clamp(20px,5vw,80px)] pt-[calc(var(--spacing-section)+clamp(0.5rem,2vh,2rem))] pb-[calc(var(--spacing-section)*0.33)]`}
          id={(b.anchor as string) || undefined}
        >
          {/* En escritorio la imagen quedaba centrada contra una columna de texto
              mucho más alta, y sobraba aire arriba y abajo. Estirada, su borde
              superior arranca a la altura del eyebrow y las dos columnas cierran
              parejas. En teléfono sigue con su proporción 4:5. */}
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-16">
            {b.image ? (
              <div className={`relative order-last aspect-[4/5] overflow-hidden rounded-2xl lg:aspect-auto lg:min-h-[32rem] ${dark ? "bg-night" : "bg-sand"} lg:order-first`}>
                <PayloadImage media={b.image as never} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              </div>
            ) : null}
            <div>
              {b.eyebrow ? (
                <span className="inline-flex items-center gap-3">
                  <span className="breath-dot" aria-hidden />
                  <span className={`eyebrow ${dark ? "text-champagne" : "text-gold-ink"}`}>{b.eyebrow as string}</span>
                </span>
              ) : null}
              {b.heading ? <h2 className={`t-h2 mt-4 ${dark ? "text-pure" : "text-ink"}`}>{emph(b.heading as string)}</h2> : null}
              {b.lede ? <p className={`prose-lede mt-5 ${dark ? "text-cream-dim" : "text-ink-soft"} whitespace-pre-line`}>{b.lede as string}</p> : null}
              <ol className="stagger mt-10 space-y-7">
                {phases.map((p, i) => (
                  <li key={p.n} className={`flex gap-5 border-t pt-7 first:border-0 first:pt-0 ${dark ? "border-cream-dim/15" : "border-line"}`}>
                    <span className="font-serif text-3xl text-gold-soft tabular-nums">0{i + 1}</span>
                    <div>
                      <h3 className={`text-2xl ${dark ? "text-pure" : "text-ink"}`}>{p.n}</h3>
                      <p className={`mt-1 whitespace-pre-line ${dark ? "text-cream-dim" : "text-ink-soft"}`}>{p.line}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {b.body ? (
                <div className={`prose-body mt-8 max-w-xl space-y-4 leading-relaxed ${dark ? "text-cream-dim [&_strong]:text-pure" : "text-ink-soft [&_strong]:text-ink"}`}>
                  <RichText data={b.body as never} converters={bodyConverters} />
                </div>
              ) : null}
              {cta ? <div className="mt-9"><CTAButton href={cta.href} variant={cta.variant} external={cta.external} onDark={dark}>{cta.label}</CTAButton></div> : null}
            </div>
          </div>
        </section>
      );
    }

    case "waysGrid": {
      const cards =
        (b.cards as { image?: unknown; title: string; body: string; ctaLabel?: string; href?: string; width?: string; overlay?: string }[]) || [];
      // Editorial, photo-forward, asymmetric: the first two span wide, the rest
      // narrow — no uniform box grid, no hairline borders.
      //
      // El reparto por defecto era fijo, así que con tres tarjetas la tercera
      // quedaba sola ocupando un tercio de la fila. Ahora sale de cuántas hay, y
      // cada tarjeta puede forzar su ancho desde el panel.
      const AUTO: Record<number, string[]> = {
        1: ["lg:col-span-6"],
        2: ["lg:col-span-3", "lg:col-span-3"],
        3: ["lg:col-span-2", "lg:col-span-2", "lg:col-span-2"],
        4: ["lg:col-span-3", "lg:col-span-3", "lg:col-span-3", "lg:col-span-3"],
      };
      const auto = AUTO[cards.length] ?? ["lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2"];
      const spanOf = (c: { width?: string }, i: number) =>
        c.width === "full" ? "sm:col-span-2 lg:col-span-6"
        : c.width === "half" ? "lg:col-span-3"
        : auto[i % auto.length];
      // La proporción sale del ancho de la tarjeta, no de su posición. Cuando el
      // reparto pasó a repartir en partes iguales, las dos primeras seguían
      // pidiendo una imagen apaisada y corta mientras la tercera pedía una
      // vertical. La fila iguala alturas, así que debajo de las cortas asomaba
      // el fondo oscuro de la tarjeta como una franja negra.
      const ratioOf = (c: { width?: string }, i: number) => {
        const span = c.width === "full" ? 6 : c.width === "half" ? 3 : Number((auto[i % auto.length].match(/\d+$/) || [3])[0]);
        if (span >= 6) return "aspect-[4/5] sm:aspect-[16/7]";
        if (span >= 3) return "aspect-[4/5] sm:aspect-[16/10]";
        return "aspect-[4/5]";
      };
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
                  // La proporción va en la tarjeta y la foto la llena entera. Si
                  // la fila estira una tarjeta para igualar alturas, la foto
                  // estira con ella y nunca queda fondo a la vista.
                  className={`card group relative block overflow-clip bg-night transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 focus-within:-translate-y-1.5 sm:[&:last-child:nth-child(odd)]:col-span-2 ${spanOf(c, i)} ${ratioOf(c, i)}`}
                >
                  <div className="card-media absolute inset-0">
                    {c.image ? (
                      <PayloadImage media={c.image as never} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                    ) : null}
                    <div className={`absolute inset-0 ${CARD_OVERLAY[c.overlay || "medium"] ?? CARD_OVERLAY.medium}`} aria-hidden />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-2xl text-pure">{c.title}</h3>
                    <p className="mt-2 max-w-sm whitespace-pre-line text-sm leading-relaxed text-cream-dim">{c.body}</p>
                    {c.ctaLabel ? (
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-cream-dim transition-colors group-hover:text-pure">
                        <span className="relative">
                          {c.ctaLabel}
                          <span aria-hidden className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gold-soft transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-within:scale-x-100" />
                        </span>
                        <span aria-hidden className="text-gold-soft transition-transform duration-300 group-hover:translate-x-1 group-focus-within:translate-x-1">→</span>
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
                <blockquote className="-mt-6 whitespace-pre-line font-serif text-2xl leading-snug text-ink sm:text-[1.75rem]">
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
                  <blockquote className="whitespace-pre-line font-serif text-lg leading-relaxed text-ink">{t.quote}</blockquote>
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
            {/* En teléfono la onda y el titular suben arriba del retrato y el
                texto queda debajo: se presenta y después se la ve, que es el
                orden en que se lee. El envoltorio usa `contents`, así que en
                teléfono sus dos partes son celdas sueltas de la grilla y se
                pueden ordenar; desde lg vuelve a ser un bloque y la columna
                queda igual que siempre. */}
            <div className="contents lg:block">
              <div className="order-1 lg:order-none">
                <Ornament start />
                <h2 className="t-h2 mt-7 max-w-[20ch] text-ink">{emph(b.heading as string)}</h2>
              </div>
              <div className="order-3 lg:order-none">
                {b.body ? (
                  <div className="prose-body measure space-y-4 text-ink-soft lg:mt-6">
                    <RichText data={b.body as never} converters={bodyConverters} />
                  </div>
                ) : null}
                {cta ? <CtaRow ctas={[cta]} /> : null}
              </div>
            </div>
            <div className={`card relative order-2 aspect-[4/5] arch bg-sand lg:order-none ${left ? "lg:order-first" : "lg:order-last"}`}>
              <div className="card-media absolute inset-0">
                <PayloadImage media={b.image as never} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
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
          {/* Directional scrim: only the lower-left, where the type sits, needs to
              stay dark for contrast. The previous values covered the whole frame,
              which is why the photograph read as murky. */}
          <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/35 to-transparent" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-night/70 via-night/10 to-transparent" aria-hidden />
          <div className="relative mx-auto w-full max-w-6xl">
            <div className="max-w-xl">
              {b.eyebrow ? <span className="eyebrow eyebrow--filet text-gold-soft">{b.eyebrow as string}</span> : null}
              <h2 className="t-h2 mt-4 text-cream">{emph(b.heading as string)}</h2>
              <div className="mt-6"><Ornament start tone="champagne" /></div>
              {b.body ? <p className="mt-6 max-w-lg text-cream-dim/90 whitespace-pre-line">{b.body as string}</p> : null}
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
        // Siete páginas abren con este bloque, entre ellas Contact y las legales.
        // Sin hero delante, el titular quedaba contra el header fijo, que mide
        // 89px y flota sobre el contenido. `first` le da el alto del header más
        // el respiro normal.
        <Section
          first={first}
          tone={(b.tone as never) || "cream"}
          width={(b.width as never) || "narrow"}
          id={(b.anchor as string) || undefined}
          // Cuando cierra la página, el aire de abajo se recorta: el pie ya
          // aporta su propio respiro y sobraba un hueco muerto antes de él.
          className={`${center ? "text-center" : ""} ${first ? "" : "pb-[calc(var(--spacing-section)*0.62)]"}`}
        >
          <div className={center ? "flex justify-center" : ""}><Ornament start={!center} tone={b.tone === "night" ? "champagne" : "gold"} /></div>
          <h2 className="t-h2 mt-7">{emph(b.heading as string)}</h2>
          {b.body ? <p className={`prose-body mt-6 text-muted ${center ? "mx-auto max-w-xl" : "max-w-2xl"} whitespace-pre-line`}>{b.body as string}</p> : null}
          <CtaRow ctas={ctas} align={center ? "center" : "left"} onDark={b.tone === "night"} stack={center} />
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
              // El botón vive en la columna de la tarjeta, debajo de ella: es la
              // oferta lo que se está aceptando, no el texto. La columna entera
              // queda pegajosa, así que precio y botón suben juntos mientras se
              // lee el texto largo de la izquierda.
              //
              // Va aquí y no después de la grilla porque suelto caía por debajo
              // de la columna más alta y dejaba un vacío enorme bajo el texto.
              //
              // En teléfono el orden que ella dio por bueno se conserva con
              // `contents`: texto, tarjeta, botón.
              <div className={`mt-6 grid gap-10 ${hasAside ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
                <div className="prose-body order-1 space-y-4 text-muted lg:order-none">
                  {b.body ? <RichText data={b.body as never} converters={bodyConverters} /> : null}
                </div>
                <div className="contents lg:sticky lg:top-28 lg:block lg:h-fit">
                  {hasAside ? (
                  <div className="relative order-2 h-fit overflow-hidden border border-line bg-ivory p-7 shadow-[0_1px_30px_-18px_rgba(34,36,32,0.5)] sm:p-8 lg:order-none">
                    <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold-soft/70 to-transparent" />
                    {included.length ? (
                      <>
                        <p className="eyebrow text-gold-ink/80">{(b.includedLabel as string) || "What's included"}</p>
                        <ul className="stagger mt-5 space-y-3 text-sm text-ink-soft">
                          {included.map((it, i) => (
                            <li key={i} className="whitespace-pre-line border-l border-gold-soft/55 pl-3.5">{it.text}</li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                    {b.includedNote ? <p className="mt-4 text-[0.82rem] leading-relaxed text-faint">{b.includedNote as string}</p> : null}
                    {b.investment ? <p className="mt-6 border-t border-line pt-5 text-sm text-ink-soft"><span className="font-medium text-ink">Investment</span> · {b.investment as string}</p> : null}
                  </div>
                  ) : null}
                  {cta ? (
                    // En teléfono el botón ya es una celda de la grilla, así que
                    // el gap de 40px lo separa de la tarjeta; su propio mt-8 se
                    // sumaba encima y lo alejaba 72px, el hueco que ella marcó.
                    // Centrado en teléfono, alineado con la tarjeta desde lg.
                    <div className="order-3 [&>div]:mt-0 [&>div]:justify-center lg:order-none lg:[&>div]:mt-8 lg:[&>div]:justify-start">
                      <CtaRow ctas={[cta]} />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })()}
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
      const items = (b.items as { title?: string; text: string }[]) || [];
      const cta = resolveCta(b.cta as RawCta, settings);
      const stages = b.layout === "stages";
      return (
        <Section tone={(b.tone as never) || "cream"} width={stages ? "wide" : ((b.width as never) || "default")} id={(b.anchor as string) || undefined}>
          <Ornament start />
          <h2 className="t-h2 mt-7 max-w-[24ch]">{emph(b.heading as string)}</h2>
          {b.intro ? <p className={`mt-5 text-muted whitespace-pre-line${stages ? " measure" : ""}`}>{b.intro as string}</p> : null}
          {stages ? (
            /* Recorrido en etapas: número grande en dorado y serif, titular
               separado del párrafo. Sin iconos, como pidió. */
            <ol className="stagger mt-12 grid gap-8 md:grid-cols-3 md:gap-7">
              {items.map((it, i) => (
                <li key={i} className="relative flex flex-col bg-ivory/70 p-8 sm:p-9">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold-soft/60 to-transparent" />
                  <span className="font-serif text-[2.6rem] font-light leading-none text-gold-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {it.title ? <h3 className="mt-6 text-[1.15rem] leading-snug text-ink">{it.title}</h3> : null}
                  <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft whitespace-pre-line">{it.text}</p>
                </li>
              ))}
            </ol>
          ) : (
            (() => {
              // Con un tope puesto desde el panel, y sólo si sobra algo que
              // esconder, la lista se corta ahí y el resto queda detrás del
              // enlace. Si no, va entera como siempre.
              const tope = Number(b.collapseAfter) || 0;
              const parte = tope > 0 && items.length > tope;
              const li = "whitespace-pre-line border-l border-gold-soft/55 pl-4 text-[1.0625rem] leading-relaxed text-ink-soft";
              const fila = (it: { text: string }, i: number) => <li key={i} className={li}>{it.text}</li>;
              return (
                <>
                  <ul className="stagger mt-8 space-y-4 measure">
                    {(parte ? items.slice(0, tope) : items).map(fila)}
                  </ul>
                  {parte ? (
                    <ExpandableSection
                      label={(b.moreLabel as string) || "Show more"}
                      lessLabel={(b.lessLabel as string) || "Show less"}
                    >
                      <ul className="measure space-y-4 pt-4">{items.slice(tope).map(fila)}</ul>
                    </ExpandableSection>
                  ) : null}
                </>
              );
            })()
          )}
          {b.note ? <p className="mt-6 whitespace-pre-line text-sm italic text-faint">{b.note as string}</p> : null}
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
          {b.intro ? <p className="mt-5 text-muted whitespace-pre-line">{b.intro as string}</p> : null}
          {/* Dos tarjetas idénticas lado a lado leen como formulario de admisión:
              la mitad de la sección es el panel de rechazo. La columna afirmativa
              lleva el peso y la otra queda como nota al margen. Se deemphasiza
              por estructura, no bajando el color: el gris más claro que hay
              (--color-faint) no llega a AA para texto de cuerpo. */}
          <div className="mt-10 grid items-start gap-8 md:grid-cols-5 md:gap-10">
            <div className="relative overflow-hidden bg-ivory/70 p-8 sm:p-9 md:col-span-3">
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold-soft/60 to-transparent" />
              {b.leftTitle ? <h3 className="text-xl text-ink">{b.leftTitle as string}</h3> : null}
              <ul className="stagger mt-6 space-y-3.5 text-sm leading-relaxed text-ink-soft">
                {left.map((it, i) => <li key={i} className="whitespace-pre-line border-l border-gold-soft/45 pl-3.5">{it.text}</li>)}
              </ul>
            </div>
            <div className="md:col-span-2 md:pt-3">
              {b.rightTitle ? <h3 className="text-xs uppercase tracking-[0.16em] text-ink-soft">{b.rightTitle as string}</h3> : null}
              <ul className="stagger mt-5 space-y-3 text-sm leading-relaxed text-ink-soft">
                {right.map((it, i) => <li key={i} className="whitespace-pre-line">{it.text}</li>)}
              </ul>
            </div>
          </div>
        </Section>
      );
    }

    case "contactTiles": {
      const tiles = (b.tiles as { title: string; line?: string; value?: string; ctaLabel?: string; action?: string; whatsappContext?: string; href?: string }[]) || [];
      // Vaciar las tarjetas desde el panel dejaba la sección igual, con todo su
      // espacio arriba y abajo, así que quedaba un hueco entre las dos secciones
      // vecinas sin nada que lo explicara.
      if (!tiles.length) return null;
      return (
        <Section tone={(b.tone as never) || "sand"} width="wide" id={(b.anchor as string) || undefined}>
          <div className="stagger grid gap-6 md:grid-cols-3">
            {tiles.map((t, i) => {
              const cta = resolveCta({ label: t.ctaLabel, action: t.action as never, whatsappContext: t.whatsappContext, href: t.href }, settings);
              return (
                <div key={i} className="group relative flex flex-col overflow-hidden border border-line bg-ivory/70 p-8 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold-soft/60 to-transparent" />
                  <h3 className="text-2xl text-ink">{t.title}</h3>
                  {t.line ? <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{t.line}</p> : <div className="flex-1" />}
                  {t.value ? <p className="mt-5 text-sm font-medium text-ink">{t.value}</p> : null}
                  {cta ? (
                    <a href={cta.href} target={cta.external ? "_blank" : undefined} rel={cta.external ? "noopener noreferrer" : undefined} className="link-underline mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gold-ink">
                      {cta.label} <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1 group-focus-within:translate-x-1">&rarr;</span>
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
        <Section first={first} tone={(b.tone as never) || "sand"} id={(b.anchor as string) || undefined}>
          <Ornament start />
          {/* El titular iba al mismo tamaño que los de las secciones que cuentan
              algo, y acá domina lo que es una sección de apoyo. Un escalón menos. */}
          {b.heading ? (
            <h2 className="mt-7 max-w-[24ch] font-serif text-[clamp(1.4rem,2.2vw+0.6rem,2.1rem)] font-light leading-tight text-ink">
              {emph(b.heading as string)}
            </h2>
          ) : null}
          {b.intro ? <p className="mt-5 text-muted whitespace-pre-line">{b.intro as string}</p> : null}
          <div className="mt-9">
            <ContactForm
              subjectLabel={(b.subjectLabel as string) || undefined}
              subjects={((b.subjects as { label: string }[]) || []).map((s) => s.label).filter(Boolean)}
              source={(b.anchor as string) || "contact form"}
            />
          </div>
        </Section>
      );

    case "newsletter": {
      const nlCentered = b.align === "center";
      return (
        <Section
          tone={(b.tone as never) || "cream"}
          width="narrow"
          id={(b.anchor as string) || undefined}
          className={nlCentered ? "text-center" : ""}
        >
          {/* Centrado también mueve el adorno, que era lo que quedaba a la
              izquierda mientras el texto iba al medio. */}
          <div className={nlCentered ? "flex justify-center" : ""}><Ornament start={!nlCentered} /></div>
          {b.heading ? (
            <h2 className={`t-h2 mt-7 max-w-[24ch] ${nlCentered ? "mx-auto" : ""}`}>{emph(b.heading as string)}</h2>
          ) : null}
          {b.intro ? (
            <p className={`mt-5 text-muted whitespace-pre-line ${nlCentered ? "mx-auto measure" : ""}`}>{b.intro as string}</p>
          ) : null}
          <div className={`mt-9 max-w-md ${nlCentered ? "mx-auto text-left" : ""}`}>
            <NewsletterSignup
              buttonLabel={(b.buttonLabel as string) || undefined}
              finedPrint={(b.finePrint as string) ?? undefined}
              successMessage={(b.successMessage as string) || undefined}
              successSignature={(b.successSignature as string) || undefined}
              source={(b.anchor as string) || "newsletter block"}
            />
          </div>
        </Section>
      );
    }

    case "richText": {
      const cta = resolveCta(b.cta as RawCta, settings);
      // "Centered" has to move the heading and the body together — centring only
      // the body (or only via the editor) was the mismatch reported from the panel.
      const centered = b.align === "center";
      return (
        <Section
          tone={(b.tone as never) || "cream"}
          width={(b.width as never) || "default"}
          id={(b.anchor as string) || undefined}
          className={centered ? "text-center" : ""}
        >
          {b.eyebrow ? (
            <span className="eyebrow eyebrow--filet">{b.eyebrow as string}</span>
          ) : (
            <div className={centered ? "flex justify-center" : ""}><Ornament start={!centered} /></div>
          )}
          {b.heading ? (
            <h2 className={`t-h2 max-w-[24ch] text-ink ${centered ? "mx-auto" : ""} ${b.eyebrow ? "mt-4" : "mt-7"}`}>
              {emph(b.heading as string)}
            </h2>
          ) : null}
          {/* Body kept to a comfortable reading measure even when the section runs
              wide — long-form internal copy never sprawls past ~66ch. */}
          <div className={`prose-body measure mt-6 space-y-4 text-muted [&>p:first-of-type]:text-[1.1875rem] [&>p:first-of-type]:text-ink-soft ${centered ? "mx-auto" : ""}`}>
            {b.body ? <RichText data={b.body as never} converters={bodyConverters} /> : null}
          </div>
          {cta ? <CtaRow ctas={[cta]} align={centered ? "center" : "left"} /> : null}
        </Section>
      );
    }

    default:
      return null;
  }
}
