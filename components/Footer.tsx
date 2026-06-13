import Link from "next/link";
import NewsletterSignup from "./NewsletterSignup";

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
  return (
    <footer className="bg-night text-cream-dim">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-lg text-cream">{brandName}</p>
            <p className="mt-2 font-serif italic text-gold-soft">{slogan}</p>
            {brandBlurb ? <p className="mt-4 text-sm leading-relaxed text-cream-dim/80">{brandBlurb}</p> : null}
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
            <div className="mt-6 flex gap-4 text-sm">
              {instagram ? <a href={instagram} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-cream">Instagram</a> : null}
              {googleReviews ? <a href={googleReviews} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-cream">Google Reviews</a> : null}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-cream-dim/15 pt-6 text-xs text-cream-dim/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {brandName}. All rights reserved.</p>
          {bottomNote ? <p className="font-serif italic">{bottomNote}</p> : null}
          {legal.length > 0 && (
            <nav aria-label="Legal" className="flex gap-3">
              {legal.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-cream">{l.label}</Link>
              ))}
            </nav>
          )}
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
