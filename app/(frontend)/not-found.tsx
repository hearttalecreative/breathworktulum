import Section from "@/components/Section";
import CTAButton from "@/components/CTAButton";

export default function NotFound() {
  return (
    <Section tone="cream" width="narrow" className="text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl sm:text-4xl">
        This page doesn&apos;t exist anymore.
      </h1>
      <p className="mt-5 text-muted">Let&apos;s get you somewhere useful.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <CTAButton href="/">Home</CTAButton>
        <CTAButton href="/work-with-me/private-sessions/" variant="secondary">
          Work With Me
        </CTAButton>
        <CTAButton href="/contact/" variant="secondary">
          Contact
        </CTAButton>
      </div>
    </Section>
  );
}
