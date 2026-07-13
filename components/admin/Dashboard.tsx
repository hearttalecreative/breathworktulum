import React from "react";

// Custom admin homepage (admin.components.views.dashboard). Replaces Payload's
// flat default card grid with one cohesive, color-coded set — no duplication —
// so Sabine sees clear, grouped entry points. Styling in custom.scss (.dsh-*).

const siteURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

type Item = { title: string; href: string; desc: string; icon: React.ReactNode };
type Group = { key: string; label: string; blurb: string; items: Item[] };

// — inline line icons (currentColor, inherit the group accent) —
const I = {
  pages: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3h11l5 5v13H4z" /><path d="M14 3v6h6M8 13h8M8 17h8" /></svg>
  ),
  blog: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16M4 12h16M4 19h10" /></svg>
  ),
  quote: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3H4M20 7h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3h-3" /></svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 16-5-5L5 21" /></svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
  ),
  sliders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M18 18h2" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="16" cy="18" r="2" /></svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.5A8 8 0 1 1 21 12Z" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" /></svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
  ),
  footer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 15h18" /><path d="M7 18h4" /></svg>
  ),
};

const GROUPS: Group[] = [
  {
    key: "content",
    label: "Content",
    blurb: "The words, photos, and pages your visitors see.",
    items: [
      { title: "Pages", href: "/admin/collections/pages", desc: "Edit each page's text, photos & sections.", icon: I.pages },
      { title: "Blog", href: "/admin/collections/posts", desc: "Write a new article or edit existing ones.", icon: I.blog },
      { title: "Testimonials", href: "/admin/collections/testimonials", desc: "The client reviews shown on the site.", icon: I.quote },
      { title: "Images", href: "/admin/collections/media", desc: "Upload and organize your photos.", icon: I.image },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    blurb: "Brand details and who can manage the site.",
    items: [
      { title: "Site details", href: "/admin/globals/siteSettings", desc: "Brand, contact info, and social links.", icon: I.sliders },
      { title: "AI Chat", href: "/admin/globals/chatSettings", desc: "The assistant that answers visitors.", icon: I.chat },
      { title: "Users", href: "/admin/collections/users", desc: "Who can log in to manage the site.", icon: I.user },
    ],
  },
  {
    key: "navigation",
    label: "Navigation",
    blurb: "The links in your menu and footer.",
    items: [
      { title: "Top menu", href: "/admin/globals/header", desc: "The links across the top of the site.", icon: I.menu },
      { title: "Footer", href: "/admin/globals/footer", desc: "Footer links and text.", icon: I.footer },
    ],
  },
];

export default function Dashboard(props: unknown) {
  // Read the logged-in user's name defensively (prop shape varies by version).
  let name = "Sabine";
  try {
    const u = (props as { initPageResult?: { req?: { user?: { name?: string } } } })?.initPageResult?.req?.user;
    if (u?.name) name = u.name;
  } catch {
    /* keep fallback */
  }

  return (
    <div className="dsh">
      <header className="dsh__head">
        <div>
          <p className="dsh__eyebrow">Breathwork Tulum · Admin</p>
          <h1 className="dsh__title">Hi, {name}</h1>
          <p className="dsh__lede">
            This is where you manage the whole site. Pick where to start — changes save on their own,
            and you can hit “Preview” inside any page to see them before publishing.
          </p>
        </div>
        <a className="dsh__view" href={siteURL} target="_blank" rel="noopener noreferrer">
          <span>View the site</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
        </a>
      </header>

      {GROUPS.map((g) => (
        <section key={g.key} className={`dsh__group dsh__group--${g.key}`}>
          <div className="dsh__group-head">
            <span className="dsh__group-dot" aria-hidden />
            <h2 className="dsh__group-label">{g.label}</h2>
            <span className="dsh__group-blurb">{g.blurb}</span>
          </div>
          <div className="dsh__grid">
            {g.items.map((it) => (
              <a key={it.href} href={it.href} className="dsh__card">
                <span className="dsh__icon" aria-hidden>{it.icon}</span>
                <span className="dsh__card-body">
                  <span className="dsh__card-title">{it.title}</span>
                  <span className="dsh__card-desc">{it.desc}</span>
                </span>
                <span className="dsh__card-arrow" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
