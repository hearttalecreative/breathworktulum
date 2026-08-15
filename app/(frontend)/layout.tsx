import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import ChatWidget from "@/components/ChatWidget";
import CookieConsent from "@/components/CookieConsent";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";
import { organizationLd, websiteLd, localBusinessLd } from "@/lib/seo";
import { getGlobals, getChatPublicSettings } from "@/lib/payload";
import { whatsappHref } from "@/lib/cta";

// Playfair Display (titulares) + Hanken Grotesk (textos). Las dos con licencia
// SIL OFL, aptas para producción.
//
// Reemplazan a Canela y Söhne, que eran archivos de prueba: 74 y 68 glifos, sin
// "&", sin "®", sin acentos, y Söhne encima sin apóstrofo ni signo de pregunta.
// Todo eso caía a la fuente del sistema, que es lo que la clienta notó como un
// "&" más grueso y redondeado. Estas traen 659 y 550 glifos y cubren el juego
// completo que usa el sitio.
//
// Son variables, así que un archivo por estilo cubre todos los pesos.
const playfair = localFont({
  variable: "--font-playfair",
  display: "swap",
  src: [
    { path: "../../typefaces/PlayfairDisplay-Variable.woff2", weight: "400 900", style: "normal" },
    { path: "../../typefaces/PlayfairDisplay-Italic-Variable.woff2", weight: "400 900", style: "italic" },
  ],
});

const hanken = localFont({
  variable: "--font-hanken",
  display: "swap",
  src: [
    { path: "../../typefaces/HankenGrotesk-Variable.woff2", weight: "100 900", style: "normal" },
    { path: "../../typefaces/HankenGrotesk-Italic-Variable.woff2", weight: "100 900", style: "italic" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Breathwork Tulum. Somatic Coaching for Life Transitions",
    template: "%s · Breathwork Tulum",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.founder }],
  creator: SITE.founder,
  publisher: SITE.name,
  keywords: [
    "breathwork Tulum",
    "somatic coaching",
    "trauma informed breathwork",
    "breathwork retreat Tulum",
    "Riviera Maya retreat",
    "nervous system regulation",
    "Sabine Binns",
    "Breathe Heal Transform",
  ],
  category: "Health & Wellness",
  alternates: { canonical: "/" },
  // Sin index/follow explícitos a propósito. Una página sin etiqueta robots ya
  // es indexable, así que declararlo no agregaba nada, y en cambio la pantalla
  // de 404 terminaba con dos etiquetas contradictorias: el "index, follow" de
  // acá y el "noindex" que inyecta notFound(). Google toma la más restrictiva,
  // así que funcionaba, pero la señal quedaba sucia. Los directivos de preview
  // sí se conservan porque mejoran cómo se ve el resultado en el buscador.
  robots: {
    googleBot: { "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: "Breathwork Tulum. Somatic Coaching for Life Transitions",
    description: SITE.description,
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Breathwork Tulum. Somatic Coaching for Life Transitions",
    description: SITE.description,
    images: ["/images/og-default.jpg"],
  },
};

export const viewport = { themeColor: "#191b17" };

const HEADING_SCALE: Record<string, number> = { compact: 0.88, normal: 1, generous: 1.14 };

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [globals, chat] = await Promise.all([getGlobals(), getChatPublicSettings()]);
  const s = globals.siteSettings as unknown as Record<string, never>;
  const header = globals.header as unknown as Record<string, never[]>;
  const footer = globals.footer as unknown as Record<string, never>;
  const waHref = whatsappHref(globals.siteSettings as never, "general");

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${hanken.variable} h-full`}
      // Escala de titulares elegida desde el panel. Multiplica el clamp que ya
      // tienen, así que la proporción entre páginas y el comportamiento en
      // móvil no cambian: sube o baja toda la escala junta.
      style={{ "--heading-scale": HEADING_SCALE[s.headingScale as string] ?? 1 } as React.CSSProperties}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={[organizationLd(), websiteLd(), localBusinessLd()]} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <Header
          brandName={(s.brandName as string) || "Breathwork Tulum"}
          workWithMe={header.workWithMe || []}
          retreats={header.retreats || []}
          primary={header.primary || []}
          whatsappHref={waHref}
          email={(s.email as string) || ""}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer
          brandName={(s.brandName as string) || "Breathwork Tulum"}
          slogan={(s.slogan as string) || "Breathe. Heal. Transform.®"}
          brandBlurb={footer.brandBlurb || ""}
          locationBlurb={footer.locationBlurb || ""}
          subBrandTitle={footer.subBrandTitle || "Sister project"}
          subBrandName={footer.subBrandName || ""}
          subBrandBlurb={footer.subBrandBlurb || ""}
          workWithMe={footer.workWithMe || []}
          explore={footer.explore || []}
          newsletterBlurb={footer.newsletterBlurb || ""}
          newsletterSuccess={footer.newsletterSuccess || undefined}
          newsletterSignature={footer.newsletterSignature || undefined}
          legal={footer.legal || []}
          bottomNote={footer.bottomNote || ""}
          instagram={(s.instagram as string) || ""}
          googleReviews={(s.googleReviews as string) || ""}
        />
        {chat.enabled ? (
          <ChatWidget welcomeMessage={chat.welcomeMessage} whatsappHref={waHref} />
        ) : (
          <WhatsAppSticky />
        )}
        <CookieConsent />
      </body>
    </html>
  );
}
