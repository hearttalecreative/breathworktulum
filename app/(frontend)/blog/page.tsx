import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import PayloadImage from "@/components/PayloadImage";
import { getPublishedPosts } from "@/lib/payload";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const TITLE = "Blog. Breathwork, healing, and living through change";
const DESCRIPTION =
  "Writing on breathwork, Clarity Breathwork™, the nervous system, and moving through burnout, grief, and life transitions. From Sabine at Breathwork Tulum.";

export async function generateMetadata(): Promise<Metadata> {
  const url = `${SITE.url}/blog/`;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url,
      images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  };
}

type PostCard = {
  slug: string;
  title: string;
  excerpt?: string | null;
  heroImage?: unknown;
  publishedAt?: string | null;
  createdAt?: string | null;
};

function postDate(p: PostCard): string {
  const d = p.publishedAt || p.createdAt;
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

export default async function BlogIndex() {
  const posts = (await getPublishedPosts()) as unknown as PostCard[];

  return (
    <Section tone="cream" width="wide">
      <span className="eyebrow eyebrow--filet">Journal</span>
      <h1 className="mt-4 max-w-[20ch] font-serif text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] text-ink">
        Breathwork, healing, and living through change.
      </h1>
      <p className="measure mt-5 text-muted">
        Notes on the breath, the nervous system, and the emotional work underneath the surface.
      </p>

      {posts.length === 0 ? (
        <p className="mt-12 text-muted">New writing is on its way.</p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Reveal key={p.slug}>
              <Link href={`/blog/${p.slug}/`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand ring-1 ring-line">
                  {p.heroImage ? (
                    <PayloadImage
                      media={p.heroImage as never}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : null}
                </div>
                <div className="mt-4">
                  {postDate(p) ? <p className="eyebrow text-gold-ink/70">{postDate(p)}</p> : null}
                  <h2 className="mt-2 font-serif text-[1.35rem] leading-snug text-ink transition-colors group-hover:text-gold-ink">
                    {p.title}
                  </h2>
                  {p.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed text-ink-soft">
                      {p.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-gold-soft transition-transform duration-300 group-hover:translate-x-0.5">
                    Read <span aria-hidden>&rarr;</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
