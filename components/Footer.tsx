import Link from "next/link";
import NewsletterSignup from "./NewsletterSignup";
import SocialLinks from "./SocialLinks";
import WaveMark from "./WaveMark";

type NavLink = { label: string; href: string };

export default function Footer({
  brandName = "Breathwork Tulum",
  slogan = "Breathe. Heal. Transform.®",
  brandBlurb = "",
  locationBlurb = "",
  subBrandTitle = "Sister project",
  subBrandName = "",
  subBrandBlurb = "",
  workWithMe = [],
  explore = [],
  newsletterBlurb = "",
  legal = [],
  bottomNote = "",
  instagram = "",
  googleReviews = "",
}: {
  brandName?: string;
  slogan?: string;
  brandBlurb?: string;
  locationBlurb?: string;
  subBrandTitle?: string;
  subBrandName?: string;
  subBrandBlurb?: string;
  workWithMe?: NavLink[];
  explore?: NavLink[];
  newsletterBlurb?: string;
  legal?: NavLink[];
  bottomNote?: string;
  instagram?: string;
  googleReviews?: string;
}) {
  const year = new Date().getFullYear();
  return (
    <footer
      className="relative overflow-hidden text-cream-dim"
      style={{ background: "linear-gradient(170deg, #191b17 0%, #1a1b16 55%, #221d12 100%)" }}
    >
      {/* Faint gold wash pooling in the lower corner — barely there. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 80% at 90% 120%, rgba(194,168,120,0.12), transparent 60%)" }}
      />
      {/* Oversized brand wave, barely there, anchoring the footer. */}
      <WaveMark className="pointer-events-none absolute -bottom-6 left-1/2 w-[120%] max-w-none -translate-x-1/2 text-gold-soft/[0.05]" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-28 lg:pb-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" aria-label={`${brandName} home`} className="inline-block transition-opacity hover:opacity-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-allb.svg" alt={brandName} className="h-10 w-auto" />
            </Link>
            {brandBlurb ? <p className="mt-5 text-sm leading-relaxed text-cream-dim/80">{brandBlurb}</p> : null}
            {locationBlurb ? <p className="mt-3 text-sm leading-relaxed text-cream-dim/80">{locationBlurb}</p> : null}
            {subBrandName ? (
              <div className="mt-6 border-t border-cream-dim/15 pt-5">
                <p className="text-xs uppercase tracking-widest text-cream-dim/50">{subBrandTitle}</p>
                <p className="mt-1 text-sm text-cream-dim">{subBrandName}</p>
                {subBrandBlurb ? <p className="text-xs text-cream-dim/70">{subBrandBlurb}</p> : null}
              </div>
            ) : null}
          </div>

          <FooterCol title="Work With Me" links={workWithMe} />
          <FooterCol title="Explore" links={explore} />

          <div>
            <p className="text-xs uppercase tracking-widest text-cream-dim/50">Stay in touch</p>
            {newsletterBlurb ? <p className="mt-4 text-sm leading-relaxed text-cream-dim/80">{newsletterBlurb}</p> : null}
            <div className="mt-4"><NewsletterSignup tone="dark" /></div>
            <p className="mt-7 text-xs uppercase tracking-widest text-cream-dim/50">Follow along</p>
            <SocialLinks tone="dark" className="mt-3" />
            {googleReviews ? (
              <a href={googleReviews} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-cream-dim/80 transition-colors hover:text-cream">
                Google Reviews &rarr;
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream-dim/15 pt-6 text-xs text-cream-dim/55">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {bottomNote ? <p className="font-serif italic text-cream-dim/70">{bottomNote}</p> : <span />}
            {legal.length > 0 && (
              <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
                {legal.map((l) => (
                  <Link key={l.href} href={l.href} className="transition-colors hover:text-cream">{l.label}</Link>
                ))}
              </nav>
            )}
          </div>
          <p className="leading-relaxed">
            Copyright © {year} {brandName} – Breathe. Heal. Transform.® &nbsp;All rights reserved. Developed with{" "}
            <span className="text-[#e2554c]" aria-hidden>♥</span>
            <span className="sr-only">love</span> by{" "}
            <a
              href="https://www.hearttalecreative.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream-dim/85 underline-offset-2 transition-colors hover:text-cream hover:underline"
            >
              Hearttale Creative
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: NavLink[] }) {
  if (!links.length) return <div />;
  return (
    <nav aria-label={title}>
      <p className="text-xs uppercase tracking-widest text-cream-dim/50">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-cream">{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
