import Link from "next/link";
import { SITE } from "@/lib/site";
import NewsletterSignup from "./NewsletterSignup";

export default function Footer() {
  return (
    <footer className="bg-night text-cream-dim">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="font-serif text-lg text-cream">Breathwork Tulum</p>
            <p className="mt-2 font-serif italic text-gold-soft">
              {SITE.slogan}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-cream-dim/80">
              Trauma informed breathwork and somatic coaching for people moving
              through life transitions.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-cream-dim/80">
              Based in Tulum, Mexico. Working in person across Riviera Maya and
              online worldwide.
            </p>
            <div className="mt-6 border-t border-cream-dim/15 pt-5">
              <p className="text-xs uppercase tracking-widest text-cream-dim/50">
                Sister project
              </p>
              <p className="mt-1 text-sm text-cream-dim">
                My Retreat Events · Riviera Maya
              </p>
              <p className="text-xs text-cream-dim/70">
                Retreat service provider and planner for private and corporate
                retreats.
              </p>
            </div>
          </div>

          {/* Work With Me */}
          <nav aria-label="Work With Me">
            <p className="text-xs uppercase tracking-widest text-cream-dim/50">
              Work With Me
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["Private Sessions", "/work-with-me/private-sessions/"],
                ["Personalized Retreats", "/work-with-me/personalized-retreats/"],
                ["Curated Group Experiences", "/work-with-me/curated-group-experiences/"],
                ["Corporate", "/work-with-me/corporate/"],
                ["Signature Retreat 2026", "/retreat-riviera-maya-2026/"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-cream">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Explore */}
          <nav aria-label="Explore">
            <p className="text-xs uppercase tracking-widest text-cream-dim/50">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["The Method", "/the-method/"],
                ["About", "/about/"],
                ["Resources", "/resources/"],
                ["Newsletter", "/resources/newsletter/"],
                ["Contact", "/contact/"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-cream">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Stay in touch */}
          <div>
            <p className="text-xs uppercase tracking-widest text-cream-dim/50">
              Stay in touch
            </p>
            <p className="mt-4 text-sm leading-relaxed text-cream-dim/80">
              A short letter once a month. New writing, occasional audio
              practices, early access to retreat dates.
            </p>
            <div className="mt-4">
              <NewsletterSignup tone="dark" />
            </div>
            <div className="mt-6 flex gap-4 text-sm">
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-cream"
              >
                Instagram
              </a>
              <a
                href={SITE.social.googleReviews}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-cream"
              >
                Google Reviews
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-cream-dim/15 pt-6 text-xs text-cream-dim/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Breathwork Tulum. All rights reserved.</p>
          <p className="font-serif italic">
            Clarity Breathwork™ Specialist · Breathe. Heal. Transform.®
          </p>
          <nav aria-label="Legal" className="flex gap-3">
            <Link href="/legal/privacy/" className="hover:text-cream">Privacy</Link>
            <Link href="/legal/terms/" className="hover:text-cream">Terms</Link>
            <Link href="/legal/contraindications/" className="hover:text-cream">Contraindications</Link>
            <Link href="/legal/retreat-policies/" className="hover:text-cream">Retreat Policies</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
