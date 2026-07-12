import React from "react";

// Friendly "start here" panel rendered above the admin dashboard
// (admin.components.beforeDashboard). Gives Sabine plain-language entry points
// instead of a bare list of collections. Styling lives in custom.scss (.btw-dash).
const siteURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

const cards: { href: string; title: string; body: string; external?: boolean }[] = [
  {
    href: "/admin/collections/pages",
    title: "Site pages",
    body: "Edit the text, photos, and sections of each page. Drag to reorder.",
  },
  {
    href: "/admin/collections/posts",
    title: "Blog",
    body: "Write a new article or edit the existing ones. It adds SEO to the site.",
  },
  {
    href: "/admin/collections/media",
    title: "Photos & files",
    body: "Upload and organize the images you use across the pages and the blog.",
  },
  {
    href: "/admin/globals/header",
    title: "Menus & footer",
    body: "Change the links in the top menu and in the site footer.",
  },
  {
    href: siteURL,
    title: "View the site",
    body: "Open the public site in a new tab to review your changes.",
    external: true,
  },
];

export default function DashboardWelcome() {
  return (
    <section className="btw-dash">
      <header className="btw-dash__intro">
        <h2 className="btw-dash__title">Hi, Sabine</h2>
        <p className="btw-dash__lede">
          This is where you manage the whole site. Pick where to start. Changes save on their own;
          use “Preview” inside each page to see them before publishing.
        </p>
      </header>
      <div className="btw-dash__grid">
        {cards.map((c) => (
          <a
            key={c.href}
            href={c.href}
            {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="btw-dash__card"
          >
            <span className="btw-dash__card-title">
              {c.title}
              <span aria-hidden className="btw-dash__arrow">→</span>
            </span>
            <span className="btw-dash__card-body">{c.body}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
