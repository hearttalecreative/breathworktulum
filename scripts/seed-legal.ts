import { getPayload } from "payload";
import config from "../payload.config";

// Overwrites the four legal pages with full content. Non-destructive to the
// rest of the site. Plain, calm voice; no em-dashes. NOT legal advice — have a
// lawyer review before launch (Mexican LFPDPPP + international clients).
const UPDATED = "Last updated: June 2026.";
const EMAIL = "breathe@breathworktulum.com";

const lex = (...paras: string[]) => ({
  root: {
    type: "root", format: "", indent: 0, version: 1, direction: "ltr" as const,
    children: paras.map((t) => ({
      type: "paragraph", version: 1, format: "", indent: 0, direction: "ltr" as const, textFormat: 0,
      children: [{ type: "text", version: 1, text: t, format: 0, detail: 0, mode: "normal", style: "" }],
    })),
  },
});
const items = (...xs: string[]) => xs.map((text) => ({ text }));

async function run() {
  const payload = await getPayload({ config });

  const page = async (slug: string, data: Record<string, unknown>) => {
    await payload.delete({ collection: "pages", where: { slug: { equals: slug } } as never });
    await payload.create({ collection: "pages", data: { slug, _status: "published", ...data } as never });
    payload.logger.info(`  ✓ ${slug}`);
  };

  const rt = (heading: string, tone: "cream" | "sand", ...paras: string[]) => ({
    blockType: "richText", heading, tone, width: "default", body: lex(...paras),
  });
  const list = (heading: string, tone: "cream" | "sand", intro: string, xs: string[], note?: string) => ({
    blockType: "list", heading, tone, width: "default", intro, items: items(...xs), ...(note ? { note } : {}),
  });

  // ===================== PRIVACY POLICY =====================
  await page("legal/privacy", {
    title: "Privacy Policy",
    metaTitle: "Privacy Policy · Breathwork Tulum",
    metaDescription: "How Breathwork Tulum collects, uses, and protects your personal data. We collect only what you share, use it to respond and deliver services, and never sell it.",
    layout: [
      { blockType: "ctaSection", heading: "Privacy Policy", width: "narrow", align: "left", tone: "cream",
        body: `${UPDATED} This policy explains what personal data Breathwork Tulum collects, why, how it is handled, and the rights you have over it. Breathwork Tulum is operated by Sabine Binns, based in Tulum, Quintana Roo, Mexico. For any privacy question, write ${EMAIL}.` },
      rt("Who is responsible for your data.", "sand",
        "Breathwork Tulum (Sabine Binns) is the data controller for the information collected through this website and our communication channels. We are based in Mexico and serve clients in person in the Riviera Maya and online worldwide.",
        "We handle personal data in line with Mexico's Federal Law on the Protection of Personal Data Held by Private Parties (LFPDPPP). If you contact us from the European Union or United Kingdom, we also honor the access, correction, deletion, and objection rights described below."),
      list("What we collect.", "cream",
        "We only collect what you choose to share or what is strictly needed to run the site:",
        [
          "Contact details you submit. Your name, email address, and the content of any message you send through the contact form, by email, or over WhatsApp.",
          "Newsletter email. The email address you give when subscribing to our monthly letter.",
          "Booking and session context. Information you share so we can prepare for a session or retreat, which may include health context you choose to disclose (see our Contraindications page).",
          "Payment information. When you pay for a service, payment is handled by a third-party processor. We receive confirmation of payment, not your full card details.",
          "Technical and usage data. Basic, mostly anonymous information your browser sends automatically, such as device type, approximate region, and pages visited, used to keep the site secure and understand what is helpful.",
        ]),
      list("How we use your data.", "sand",
        "We use the information above only to:",
        [
          "Reply to your enquiries and stay in touch about the service you asked about.",
          "Prepare for and deliver sessions, retreats, and programs you book.",
          "Send the monthly newsletter, when you have asked for it.",
          "Process payments and keep records required for accounting and tax.",
          "Keep the website working, secure, and improving.",
        ]),
      rt("The legal basis for using it.", "cream",
        "We rely on your consent when you contact us, subscribe, or share health context. We rely on the performance of our agreement when you book and pay for a service. We rely on legitimate interest to keep the site secure and to understand, in aggregate, how it is used. You can withdraw consent at any time."),
      list("Who we share it with.", "sand",
        "We do not sell your personal data and we do not share it for advertising. We use a small number of trusted service providers who process data on our behalf, only as needed to run the business:",
        [
          "Website hosting and media storage, to serve and store the site.",
          "Email and newsletter delivery, to send and manage our correspondence.",
          "Messaging, when you choose to contact us over WhatsApp, which is operated by Meta under its own privacy terms.",
          "Payment processing, to take payment securely.",
          "Privacy-respecting analytics, to understand site usage in aggregate.",
        ],
        "We may also disclose information if required by law, or to protect the safety and rights of our clients and our business."),
      rt("Cookies and analytics.", "cream",
        "We use a small number of cookies. Essential cookies keep the site functioning. Optional analytics cookies help us understand, in aggregate, how the site is used. When you first visit, a notice lets you accept or decline the optional ones. You can change your mind any time by clearing the choice in your browser.",
        "We never place personal data in links or share it with parties you have not asked us to contact."),
      rt("How long we keep it.", "sand",
        "We keep enquiry and client correspondence for as long as needed to serve you and to meet legal and accounting obligations, then delete or anonymize it. Newsletter data is kept until you unsubscribe. You can ask us to delete your data sooner at any time."),
      rt("International transfers.", "cream",
        "Because we work with clients worldwide and use international service providers, your data may be processed outside your country, including in Mexico, the United States, and the European Union. We only work with providers that offer appropriate safeguards for the data they handle."),
      list("Your rights.", "sand",
        "You have the right, at any time, to:",
        [
          "Access the personal data we hold about you.",
          "Correct anything that is inaccurate or out of date.",
          "Delete your data, where there is no overriding legal reason to keep it.",
          "Object to or limit how we use it, and withdraw consent.",
          "Unsubscribe from the newsletter, using the link in any issue.",
        ],
        `To exercise any of these, or to make an ARCO request under Mexican law, write ${EMAIL} and we will respond promptly.`),
      rt("Security and children.", "cream",
        "We take reasonable technical and organizational measures to protect your data, though no method of transmission over the internet is perfectly secure. This site and our services are intended for adults. We do not knowingly collect data from anyone under eighteen."),
      { blockType: "ctaSection", heading: "Questions about your privacy?", width: "narrow", align: "left", tone: "sand",
        body: `Write ${EMAIL} and we will get back to you. We may update this policy from time to time; the date at the top reflects the latest version.` },
    ],
  });

  // ===================== TERMS OF SERVICE =====================
  await page("legal/terms", {
    title: "Terms of Service",
    metaTitle: "Terms of Service · Breathwork Tulum",
    metaDescription: "The terms for booking and attending Breathwork Tulum sessions, retreats, and programs. Bookings, payments, cancellations, health disclosure, and liability.",
    layout: [
      { blockType: "ctaSection", heading: "Terms of Service", width: "narrow", align: "left", tone: "cream",
        body: `${UPDATED} These terms apply when you book or attend any Breathwork Tulum service. By booking a session, retreat, or program, you agree to them. Please read them alongside our Privacy Policy, Contraindications, and Retreat Policies.` },
      rt("Who we are and what we offer.", "sand",
        "Breathwork Tulum is operated by Sabine Binns, a Clarity Breathwork specialist based in Tulum, Mexico. We offer trauma informed breathwork and somatic coaching as private sessions, personalized and group retreats, online sessions, and corporate programs.",
        "Breathe. Heal. Transform. is our method and a registered mark. Booking a service does not transfer any rights in our name, content, or method to you."),
      rt("Breathwork is not medical or psychological treatment.", "cream",
        "Our work supports wellbeing and nervous system regulation. It is not medical care, psychotherapy, or a diagnosis or treatment for any condition, and it does not replace the advice of a doctor or licensed mental health professional. If you are under medical or psychological care, continue it and consult your provider before taking part.",
        "You take part voluntarily and remain responsible for your own health decisions."),
      rt("Bookings and payment.", "sand",
        "A booking is confirmed once the agreed deposit or payment is received. Prices are communicated at the time of booking and may be quoted in US dollars or Mexican pesos. Payment is taken through secure third-party processors.",
        "For retreats and multi-day programs, a deposit secures your place and the balance follows the schedule sent at confirmation. Specific retreat terms are set out on our Retreat Policies page."),
      rt("Cancellations and rescheduling.", "cream",
        "For single private and online sessions, please give at least twenty four hours notice to reschedule or cancel, so the time can be offered to someone else. Late cancellations and no-shows may be charged.",
        "Retreats and programs follow the dedicated cancellation and refund schedule on our Retreat Policies page, which you accept when you book."),
      rt("Health disclosure and contraindications.", "sand",
        "Breathwork has contraindications. You agree to read our Contraindications page and to disclose, honestly and in advance, any relevant physical or mental health condition, medication, or pregnancy. We may decline or adapt a session for your safety. Withholding relevant information is at your own risk."),
      rt("Assumption of risk and release.", "cream",
        "Breathwork can bring up strong physical sensations and emotions. You take part of your own free will, accept the inherent risks, and agree that, to the fullest extent permitted by law, Breathwork Tulum and Sabine Binns are not liable for any injury, loss, or outcome arising from your participation, except in the case of gross negligence or willful misconduct."),
      rt("Conduct.", "sand",
        "We hold a safe, respectful space. We may ask anyone whose behavior compromises the safety or experience of others to leave a session or retreat, without refund. Recording of sessions is not permitted without consent."),
      rt("Intellectual property.", "cream",
        "All content on this site, including text, images, the method, and the Breathe. Heal. Transform. mark, belongs to Breathwork Tulum or its licensors and may not be copied, reproduced, or used commercially without written permission."),
      rt("Liability, indemnity, and governing law.", "sand",
        "To the fullest extent permitted by law, our total liability for any service is limited to the amount you paid for it. You agree to indemnify us against claims arising from your breach of these terms or your conduct during a service.",
        "These terms are governed by the laws of Mexico, and any dispute falls under the courts of Quintana Roo, Mexico. If any provision is found unenforceable, the rest remains in effect."),
      { blockType: "ctaSection", heading: "Questions before you book?", width: "narrow", align: "left", tone: "cream",
        body: `Write ${EMAIL} or message us on WhatsApp. We update these terms from time to time; the date above reflects the current version.` },
    ],
  });

  // ===================== CONTRAINDICATIONS =====================
  await page("legal/contraindications", {
    title: "Health and Safety. Contraindications",
    metaTitle: "Breathwork Contraindications and Safety · Breathwork Tulum",
    metaDescription: "Breathwork has health contraindications. Conditions that need medical clearance or a conversation first, what to expect, and your responsibility to disclose.",
    layout: [
      { blockType: "ctaSection", heading: "Health and safety. Contraindications.", width: "narrow", align: "left", tone: "cream",
        body: `${UPDATED} Conscious connected breathwork is powerful and, for most people, very safe. For some conditions it is not advised, or needs a doctor's clearance first. Please read this before you book, and tell us about anything relevant. This page is general information, not medical advice.` },
      rt("What this practice is.", "sand",
        "We use conscious, connected breathing together with somatic awareness. It can shift body chemistry, bring up emotion, and change how you feel physically during a session. That is part of how it works. It is not a treatment for any illness and does not replace medical or psychological care.",
        "If you are in doubt about whether breathwork is right for you, speak with your physician, and speak with us. We would rather adapt or decline a session than put you at risk."),
      list("Talk to your doctor, and to us, first.", "cream",
        "Please get medical clearance and let us know in advance if any of the following apply. Many are workable with adjustments. Some are not, and we will tell you honestly:",
        [
          "Cardiovascular conditions, including heart disease, irregular heartbeat, or uncontrolled high or low blood pressure.",
          "History of aneurysm, stroke, or a family history of aneurysm.",
          "Pregnancy, at any stage.",
          "Epilepsy or a seizure disorder.",
          "Glaucoma or retinal detachment.",
          "Severe asthma or respiratory conditions. If you use an inhaler, bring it.",
          "Recent surgery, injury, or fractures still healing.",
          "Osteoporosis, where intense physical movement may be a concern.",
          "Diabetes that is not well managed.",
          "A diagnosis of schizophrenia, psychosis, or bipolar disorder.",
          "Severe PTSD or recent acute trauma without parallel therapeutic support.",
          "Use of heavy psychiatric medication, or recent psychiatric hospitalization.",
        ],
        "This list is not exhaustive. If something about your health concerns you and it is not listed, raise it anyway."),
      rt("What is normal during a session.", "sand",
        "Tingling in the hands or face, temperature changes, muscle tension or tightness, strong emotion, and the urge to move or make sound are common and usually pass. You set the pace. You can slow down, pause, or stop at any time, and we stay with you throughout."),
      rt("Your responsibility.", "cream",
        "You agree to disclose relevant health information honestly and in advance, to follow guidance during the session, and to consult your own doctor where appropriate. Taking part is voluntary and at your own risk. Withholding relevant information removes our ability to keep you safe."),
      rt("This is not a substitute for care.", "sand",
        "Breathwork complements, but does not replace, medical treatment or therapy. If you are in crisis or experiencing a medical or mental health emergency, contact your local emergency services or a qualified professional immediately. Continue any treatment you are already receiving."),
      { blockType: "ctaSection", heading: "Not sure if it is right for you?", width: "narrow", align: "left", tone: "cream",
        body: `Write ${EMAIL} or message us before booking. A short conversation usually makes it clear, and there is no pressure either way.` },
    ],
  });

  // ===================== RETREAT POLICIES =====================
  await page("legal/retreat-policies", {
    title: "Retreat Policies",
    metaTitle: "Retreat Booking and Cancellation Policies · Breathwork Tulum",
    metaDescription: "Booking, deposits, payment schedule, cancellation and refunds, travel and insurance, health disclosure, conduct, and liability for Breathwork Tulum retreats.",
    layout: [
      { blockType: "ctaSection", heading: "Retreat policies.", width: "narrow", align: "left", tone: "cream",
        body: `${UPDATED} These policies apply to all Breathwork Tulum retreats and multi-day programs, in person and virtual. They sit alongside our Terms of Service and Contraindications. You accept them when you book. Specific details are confirmed in writing before any payment is made.` },
      rt("Booking and deposit.", "sand",
        "Your place is secured once your deposit is received. The deposit is non-refundable and non-transferable, as it reserves your spot and covers commitments we make on your behalf. Places are limited and confirmed in order of deposit."),
      rt("Payment schedule.", "cream",
        "The remaining balance is due by the date stated at confirmation, usually a set number of weeks before the start date. If the balance is not received on time, we may release your place and treat it as a cancellation. Prices are agreed in writing and paid through secure processors."),
      list("Cancellation and refunds.", "sand",
        "If you need to cancel, let us know in writing as soon as possible. Refunds of amounts paid beyond the deposit follow this schedule, based on how far ahead of the start date you cancel:",
        [
          "Sixty days or more before the start date: full refund of payments made, less the non-refundable deposit.",
          "Thirty to fifty nine days before: fifty percent refund of payments made, less the deposit.",
          "Fewer than thirty days before, or no-show: no refund, as costs are already committed.",
        ],
        "Where possible, we will let you apply what you paid to a future retreat instead. Travel insurance is the right tool for circumstances outside this schedule."),
      rt("Rescheduling and transfers.", "cream",
        "If a date no longer works, contact us. Subject to availability, we will try to move your booking to another edition. You may transfer your place to another person, with our agreement, provided they meet the health requirements and accept these policies."),
      rt("Travel, accommodation, and insurance.", "sand",
        "Unless stated otherwise in your retreat details, you arrange and pay for your own travel to and from the venue. We provide arrival logistics and recommended options. We strongly recommend comprehensive travel insurance that covers cancellation, medical care, and repatriation. For in-person retreats in the Riviera Maya, a valid passport and any required entry documents are your responsibility."),
      rt("Health disclosure.", "cream",
        "Retreats involve repeated breathwork and somatic practice. You agree to read our Contraindications page, to disclose relevant health conditions, medication, and pregnancy in advance, and to obtain medical clearance where needed. We may decline participation, before or during a retreat, where safety requires it, and in such cases the cancellation schedule applies."),
      list("What is included.", "sand",
        "Exactly what is included is listed in each retreat's details. As a guide, in-person retreats generally include:",
        [
          "All programmed breathwork sessions, somatic coaching, and integration.",
          "Use of the retreat space and curated setting.",
          "Meals and logistics as specified for that retreat.",
          "Pre-retreat preparation and a post-retreat integration window.",
        ],
        "Flights, transfers unless stated, personal expenses, and insurance are not included."),
      rt("Conduct and safety.", "cream",
        "Retreats depend on a safe, respectful container. We may ask anyone whose behavior endangers or seriously disrupts the group to leave, without refund. The use of alcohol or recreational substances during the program is not permitted, as it is unsafe alongside this work."),
      rt("Changes, minimum numbers, and force majeure.", "sand",
        "Retreats run with a minimum number of participants. If we have to cancel a retreat for low enrolment or reasons within our control, you receive a full refund of payments made, including the deposit, or the option to move to another date.",
        "We are not liable for losses caused by events beyond our reasonable control, such as natural events, severe weather, illness, travel disruption, or government action. In those cases we will offer a credit or rescheduling where we can, but cannot guarantee a cash refund. Again, travel insurance is the protection for this."),
      rt("Media and liability.", "cream",
        "We sometimes photograph or film retreats. We will ask for your consent and never use images you are not comfortable with. Participation is voluntary and at your own risk, and the assumption of risk and liability terms in our Terms of Service apply in full to retreats."),
      { blockType: "ctaSection", heading: "Questions about a retreat?", width: "narrow", align: "left", tone: "sand",
        body: `Write ${EMAIL} or message us on WhatsApp before you book. We will walk you through dates, payment, and what to expect.` },
    ],
  });

  payload.logger.info("✅ Legal pages seeded.");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
