import React from "react";

// Friendly Spanish "start here" panel rendered above the admin dashboard
// (admin.components.beforeDashboard). Gives Sabine plain-language entry points
// instead of a bare list of collections. Styling lives in custom.scss (.btw-dash).
const siteURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

const cards: { href: string; title: string; body: string; external?: boolean }[] = [
  {
    href: "/admin/collections/pages",
    title: "Páginas del sitio",
    body: "Editá el texto, las fotos y las secciones de cada página. Arrastrá para reordenar.",
  },
  {
    href: "/admin/collections/posts",
    title: "Blog",
    body: "Escribí un artículo nuevo o editá los existentes. Suma SEO al sitio.",
  },
  {
    href: "/admin/collections/media",
    title: "Fotos y archivos",
    body: "Subí y organizá las imágenes que usás en las páginas y el blog.",
  },
  {
    href: "/admin/globals/header",
    title: "Menús y pie",
    body: "Cambiá los enlaces del menú de arriba y del pie del sitio.",
  },
  {
    href: siteURL,
    title: "Ver el sitio",
    body: "Abrí el sitio público en una pestaña nueva para revisar los cambios.",
    external: true,
  },
];

export default function DashboardWelcome() {
  return (
    <section className="btw-dash">
      <header className="btw-dash__intro">
        <h2 className="btw-dash__title">Hola, Sabine</h2>
        <p className="btw-dash__lede">
          Desde acá controlás todo el sitio. Elegí por dónde empezar. Los cambios se guardan solos;
          usá «Vista previa» dentro de cada página para verlos antes de publicar.
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
