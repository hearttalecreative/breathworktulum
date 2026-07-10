import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { RichText } from "@payloadcms/richtext-lexical/react";
import Section from "@/components/Section";
import PayloadImage from "@/components/PayloadImage";
import JsonLd from "@/components/JsonLd";
import LivePreviewListener from "@/components/LivePreviewListener";
import { getPost, getAuthUser } from "@/lib/payload";
import { postConverters } from "@/lib/richtextConverters";
import { blogPostingLd, breadcrumbLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const OG_FALLBACK = "/images/og-default.jpg";
type Params = { slug: string };
type Media = { url?: string | null; alt?: string | null } | null | undefined;

type Post = {
  title: string;
  slug: string;
  excerpt?: string | null;
  heroImage?: Media;
  body?: unknown;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: Media;
  noindex?: boolean | null;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getPost(slug)) as unknown as Post | null;
  if (!post) return {};
  const url = `${SITE.url}/blog/${slug}/`;
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || undefined;
  const ogUrl = post.ogImage?.url || post.heroImage?.url || OG_FALLBACK;
  return {
    title,
    description,
    alternates: { canonical: url },
    ...(post.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogUrl] },
  };
}

function formatDate(d?: string | null): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const draft = isEnabled && !!(await getAuthUser());
  const post = (await getPost(slug, draft)) as unknown as Post | null;
  if (!post) notFound();

  const url = `${SITE.url}/blog/${slug}/`;
  const published = post.publishedAt || post.createdAt || undefined;
  const schemas = [
    blogPostingLd({
      title: post.title,
      description: post.metaDescription || post.excerpt || undefined,
      url,
      image: post.heroImage?.url || post.ogImage?.url || undefined,
      datePublished: published || undefined,
      dateModified: post.updatedAt || undefined,
    }),
    breadcrumbLd(`blog/${slug}`, post.title),
  ];

  return (
    <>
      {draft ? (
        <LivePreviewListener serverURL={process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"} />
      ) : null}
      <JsonLd data={schemas} />

      <article>
        <Section tone="cream" width="narrow">
          <Link href="/blog/" className="eyebrow inline-flex items-center gap-1.5 text-gold-ink/80 transition-colors hover:text-gold-ink">
            <span aria-hidden>&larr;</span> Blog
          </Link>
          {formatDate(published) ? (
            <p className="mt-6 text-sm text-ink-soft/70">{formatDate(published)}</p>
          ) : null}
          <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3.25rem)] leading-[1.08] text-ink">{post.title}</h1>
          {post.excerpt ? <p className="measure mt-5 text-[1.15rem] leading-relaxed text-ink-soft">{post.excerpt}</p> : null}
        </Section>

        {post.heroImage ? (
          <div className="mx-auto w-full max-w-5xl px-[clamp(20px,5vw,80px)]">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-sand ring-1 ring-line">
              <PayloadImage media={post.heroImage as never} fill priority sizes="(max-width: 1024px) 100vw, 960px" className="object-cover" />
            </div>
          </div>
        ) : null}

        <Section tone="cream" width="narrow">
          <div className="prose-body measure space-y-5 text-[1.05rem] leading-relaxed text-ink-soft [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-[1.6rem] [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-[1.3rem] [&_h3]:text-ink [&_h4]:mt-6 [&_h4]:font-semibold [&_h4]:text-ink [&_a]:text-gold-ink [&_a]:underline [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
            {post.body ? <RichText data={post.body as never} converters={postConverters} /> : null}
          </div>
        </Section>

        <Section tone="sand" width="narrow">
          <div className="text-center">
            <h2 className="font-serif text-[1.8rem] leading-tight text-ink">Ready to begin?</h2>
            <p className="measure mx-auto mt-3 text-muted">
              If any of this landed, the next step is a conversation. Message Sabine and we&apos;ll find the right starting point.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappLink("general")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[3rem] items-center bg-whatsapp px-7 text-sm font-medium text-pure transition-transform active:scale-95"
              >
                Message me on WhatsApp
              </a>
              <Link href="/work-with-me/private-sessions/" className="inline-flex min-h-[3rem] items-center border border-line px-7 text-sm font-medium text-ink transition-colors hover:bg-sand/60">
                Explore private sessions
              </Link>
            </div>
          </div>
        </Section>
      </article>
    </>
  );
}
