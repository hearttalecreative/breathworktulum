import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppSticky from "@/components/WhatsAppSticky";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";
import { organizationLd, websiteLd, localBusinessLd } from "@/lib/seo";
import { getGlobals } from "@/lib/payload";
import { whatsappHref } from "@/lib/cta";

// Premium licensed faces (trial files in /fonts). Canela = display serif,
// Söhne = humanist sans. Swap point from the Fraunces + Hanken stand-ins.
const canela = localFont({
  variable: "--font-canela",
  display: "swap",
  src: [
    { path: "../../typefaces/Canela-Light.otf", weight: "300", style: "normal" },
    { path: "../../typefaces/Canela-Regular.otf", weight: "400", style: "normal" },
    { path: "../../typefaces/Canela-Italic.otf", weight: "400", style: "italic" },
    { path: "../../typefaces/Canela-Medium.otf", weight: "500", style: "normal" },
    { path: "../../typefaces/Canela-MediumItalic.otf", weight: "500", style: "italic" },
  ],
});

const sohne = localFont({
  variable: "--font-sohne",
  display: "swap",
  src: [
    { path: "../../typefaces/Sohne-Light.otf", weight: "300", style: "normal" },
    { path: "../../typefaces/Sohne-Book.otf", weight: "400", style: "normal" },
    { path: "../../typefaces/Sohne-Medium.otf", weight: "500", style: "normal" },
    { path: "../../typefaces/Sohne-Semibold.otf", weight: "600", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Breathwork Tulum. Somatic Coaching for Life Transitions",
    template: "%s · Breathwork Tulum",
  },
  description: SITE.description,
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const globals = await getGlobals();
  const s = globals.siteSettings as unknown as Record<string, never>;
  const header = globals.header as unknown as Record<string, never[]>;
  const footer = globals.footer as unknown as Record<string, never>;
  const waHref = whatsappHref(globals.siteSettings as never, "general");

  return (
    <html
      lang="en"
      className={`${canela.variable} ${sohne.variable} h-full`}
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
          legal={footer.legal || []}
          bottomNote={footer.bottomNote || ""}
          instagram={(s.instagram as string) || ""}
          googleReviews={(s.googleReviews as string) || ""}
        />
        <WhatsAppSticky />
      </body>
    </html>
  );
}
