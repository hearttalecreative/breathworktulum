import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const img = (f: string) => path.resolve(dirname, "../public/images", f);

// Minimal Lexical editor state from plain paragraphs.
const lex = (...paras: string[]) => ({
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    children: paras.map((t) => ({
      type: "paragraph",
      version: 1,
      format: "",
      indent: 0,
      direction: "ltr" as const,
      textFormat: 0,
      children: [
        { type: "text", version: 1, text: t, format: 0, detail: 0, mode: "normal", style: "" },
      ],
    })),
  },
});

const wa = (label: string, context: string, variant = "primary") => ({
  label,
  variant,
  action: "whatsapp",
  whatsappContext: context,
});
const link = (label: string, href: string, variant = "primary") => ({
  label,
  variant,
  action: "internal",
  href,
});
const email = (label: string, variant = "secondary") => ({ label, variant, action: "email" });

async function run() {
  const payload = await getPayload({ config });

  // --- reset ---
  for (const collection of ["pages", "testimonials", "media"] as const) {
    await payload.delete({ collection, where: {} as never });
  }

  // --- media ---
  const media = async (file: string, alt: string) =>
    (await payload.create({ collection: "media", data: { alt }, filePath: img(file) })).id;

  const palapa = await media("breathwork-tulum-palapa-space.jpg", "A breathwork session under an open A-frame palapa with natural light, surrounded by jungle in Tulum");
  const portrait = await media("breathwork-tulum-sabine-portrait.jpg", "Portrait of Sabine Binns in a garden in Tulum, eyes softly closed");
  const somatic = await media("breathwork-tulum-somatic-session.jpg", "Sabine doing hands-on somatic work with a client during a breathwork session");
  const privateImg = await media("breathwork-tulum-private-session.jpg", "Sabine outdoors in Tulum, relaxed and present");
  const riviera = await media("breathwork-tulum-riviera-maya.jpg", "Turquoise water of Riviera Maya");
  // Sabine photo set (CHOSEN/SABINE, processed to head-safe crops).
  const sabineJungleBench = await media("sabine-jungle-bench.jpg", "Sabine Binns smiling, seated on a wooden bench in the Tulum jungle");
  const sabineJungleSeated = await media("sabine-jungle-seated.jpg", "Sabine Binns sitting cross-legged on a jungle branch in Tulum, smiling");
  const sabineBeachSky = await media("sabine-beach-sky.jpg", "Sabine Binns on the beach with open arms, face lifted to the sky");
  const sabineBeachRock = await media("sabine-beach-rock.jpg", "Sabine Binns seated on beach rocks under a palm tree, calm and present");
  const sabineMeditation = await media("sabine-meditation.jpg", "Sabine Binns meditating cross-legged with open palms");

  // --- testimonials ---
  const t = async (quote: string) =>
    (await payload.create({ collection: "testimonials", data: { quote, source: "Google Review" } })).id;
  const t1 = await t("I was dealing with some personal issues and almost didn't go. I'm so grateful I did. I struggle with ADHD and usually can't stay focused for more than fifteen minutes. With Sabine I didn't lose focus once. My session was scheduled for two hours and ended up lasting almost four. That alone says everything.");
  const t2 = await t("I came in carrying decades of emotional weight, from trauma, burnout, and grief. What I found was a space of deep healing, connection, and clarity. Sabine held such a powerful safe space that I felt free to let go in ways I never had before.");
  const t3 = await t("Endlessly grateful. The 1:1 private session was one of the most transformative moments I'll cherish forever. Her presence alone was a catalyst.");
  const t4 = await t("Sabine has an incredible way of speaking that keeps you fully engaged the entire time. What stood out to me the most is that money is clearly not her priority. My session was scheduled for two hours and ended up lasting almost four. That alone says everything.");

  // --- globals ---
  await payload.updateGlobal({
    slug: "siteSettings",
    data: {
      brandName: "Breathwork Tulum",
      slogan: "Breathe. Heal. Transform.®",
      description: "Trauma informed breathwork and somatic coaching for people moving through life transitions. In Tulum, online, or in a personalized retreat.",
      email: "breathe@breathworktulum.com",
      phoneDisplay: "+52 55 4109 8336",
      whatsappNumber: "525541098336",
      instagram: "https://instagram.com/breathworktulum",
      googleReviews: "https://g.page/r/CXT0CCkbKfFWEBM/review",
      whatsappMessages: [
        { context: "general", message: "Hi Sabine, I saw your website. I'd like to learn more." },
        { context: "foundation", message: "Hi Sabine, I'm interested in a Foundation Session." },
        { context: "immersive", message: "Hi Sabine, I'm interested in an Immersive Session." },
        { context: "oneDayPrivate", message: "Hi Sabine, I'm interested in a 1 Day Private Retreat." },
        { context: "couples", message: "Hi Sabine, I'm interested in a couples breathwork session." },
        { context: "personalizedRetreat", message: "Hi Sabine, I'm interested in a Personalized Retreat." },
        { context: "curated", message: "Hi Sabine, I'm inquiring about a curated group experience." },
        { context: "corporate", message: "Hi Sabine, I'm reaching out about a corporate program." },
        { context: "signature", message: "Hi Sabine, I'm interested in the Riviera Maya 2026 retreat." },
        { context: "discoveryCall", message: "Hi Sabine, I'd like to book a discovery call about a retreat." },
        { context: "contact", message: "Hi Sabine, I saw your website." },
      ],
    },
  });

  await payload.updateGlobal({
    slug: "header",
    data: {
      workWithMe: [
        { label: "Private Sessions", href: "/work-with-me/private-sessions/", description: "Find the right starting point for where you are right now." },
        { label: "Personalized Retreats", href: "/work-with-me/personalized-retreats/", description: "A multi-day process, designed around you." },
        { label: "Curated Group Experiences", href: "/work-with-me/curated-group-experiences/", description: "Private groups, families, and events." },
        { label: "Corporate", href: "/work-with-me/corporate/", description: "For teams carrying real pressure." },
      ],
      retreats: [
        { label: "Personalized Retreats", href: "/work-with-me/personalized-retreats/", description: "Built around you, in person or online." },
        { label: "1 Day Group Retreat", href: "/work-with-me/group-practice/", description: "A day in a national park, small group." },
        { label: "Signature Retreat", href: "/retreat-riviera-maya-2026/", description: "Five days in community, Riviera Maya." },
      ],
      couples: [
        { label: "Couples Sessions", href: "/work-with-me/couples/", description: "A shared space for two." },
      ],
      primary: [
        { label: "The Method", href: "/the-method/" },
        { label: "Blog", href: "/blog/" },
        { label: "About", href: "/about/" },
        { label: "Contact", href: "/contact/" },
      ],
    },
  });

  await payload.updateGlobal({
    slug: "footer",
    data: {
      brandBlurb: "Trauma informed breathwork and somatic coaching for people moving through life transitions.",
      locationBlurb: "Based in Tulum, Mexico. Working in person across Riviera Maya and online worldwide.",
      subBrandTitle: "Sister project",
      subBrandName: "My Retreat Events · Riviera Maya",
      subBrandBlurb: "Retreat service provider and planner for private and corporate retreats.",
      workWithMe: [
        { label: "Private Sessions", href: "/work-with-me/private-sessions/" },
        { label: "Personalized Retreats", href: "/work-with-me/personalized-retreats/" },
        { label: "Curated Group Experiences", href: "/work-with-me/curated-group-experiences/" },
        { label: "Corporate", href: "/work-with-me/corporate/" },
        { label: "Signature Retreat 2026", href: "/retreat-riviera-maya-2026/" },
      ],
      explore: [
        { label: "The Method", href: "/the-method/" },
        { label: "About", href: "/about/" },
        { label: "Resources", href: "/resources/" },
        { label: "Newsletter", href: "/resources/newsletter/" },
        { label: "Contact", href: "/contact/" },
      ],
      newsletterBlurb: "A short letter once a month. New writing, occasional audio practices, early access to retreat dates.",
      legal: [
        { label: "Privacy", href: "/legal/privacy/" },
        { label: "Terms", href: "/legal/terms/" },
        { label: "Contraindications", href: "/legal/contraindications/" },
        { label: "Retreat Policies", href: "/legal/retreat-policies/" },
      ],
      bottomNote: "Clarity Breathwork™ Specialist · Breathe. Heal. Transform.®",
    },
  });

  // --- pages ---
  const page = async (data: Record<string, unknown>) =>
    payload.create({ collection: "pages", data: { _status: "published", ...data } as never });

  // HOME
  await page({
    title: "Home",
    slug: "home",
    metaTitle: "Breathwork Tulum. Somatic Coaching for Life Transitions",
    metaDescription: "Trauma informed breathwork and somatic coaching for people moving through burnout, transitions, and change. In Tulum, online, and personalized retreats.",
    ogImage: palapa,
    layout: [
      {
        blockType: "hero",
        heading: "Breathwork in Tulum for life transitions and deeper emotional work.",
        lede: "For people who are functioning on the outside, but know something deeper is asking for change.",
        image: palapa,
        imageSide: "right",
        ctas: [link("Book an Immersive Session", "/work-with-me/private-sessions/#immersive"), link("Explore the Method", "/the-method/", "secondary")],
      },
      {
        blockType: "situations",
        heading: "If anything below sounds familiar.",
        tone: "sand",
        items: [
          { text: "You're going through a change that hasn't quite landed yet. A career shift, a relationship ending, a relocation, a new chapter that's asking something different from you." },
          { text: "Your body is asking you to stop. Burnout, chronic stress, anxiety that lives in your chest or your jaw. You're functional on the outside and tired in a way sleep doesn't fix." },
          { text: "You've done the work. Therapy, books, courses. You understand a lot. But understanding hasn't been enough. Something is still stuck somewhere your mind can't reach." },
          { text: "You're moving through midlife, menopause, or a quiet identity shift. You're not in crisis. You just want to meet what's underneath, with someone who knows how to hold it." },
        ],
        closing: "This is the work.",
      },
      {
        blockType: "richText",
        heading: "Underneath the surface.",
        tone: "cream",
        width: "narrow",
        body: lex(
          "Many of the challenges we experience on the surface, stress, overthinking, relationship patterns, burnout, are often connected to deeper emotional imprints, sometimes referred to as core wounds. This work helps you access and understand those patterns through the body, not just the mind."
        ),
      },
      {
        blockType: "threePhases",
        eyebrow: "The Method",
        heading: "A method, not a moment.",
        tone: "cream",
        image: sabineMeditation,
        body: lex(
          "Every session and every retreat follows the same three phase process. Breathe to open the body. Heal to meet what's stored beneath the surface. Transform to integrate what shifted, in language and choices that hold beyond the session.",
          "The technical backbone is Clarity Breathwork™, a soft, trauma informed approach I've practiced for over ten years and trained under its founders."
        ),
        cta: { ...link("See the full method", "/the-method/", "secondary"), enabled: true },
      },
      {
        blockType: "waysGrid",
        heading: "Ways to work together.",
        tone: "sand",
        cards: [
          { title: "Private Sessions", body: "Foundation, Immersive, or a full 1 Day Private Retreat. Online or in Tulum. For one person, or two.", ctaLabel: "Explore private sessions", href: "/work-with-me/private-sessions/" },
          { title: "Personalized Retreats", body: "Multi-day retreats designed around you. 3 Day, 5 Day, custom, or virtual. For individuals and couples ready for depth.", ctaLabel: "Explore retreats", href: "/work-with-me/personalized-retreats/" },
          { title: "Group Practice", body: "Weekly 1 Day Group Retreats in a national park. An open group format, booked ahead.", ctaLabel: "Explore group practice", href: "/work-with-me/group-practice/" },
          { title: "Curated Group Experiences", body: "Private group breathwork for retreat leaders, families, wellness events, and luxury groups. Designed on request.", ctaLabel: "Inquire about group experiences", href: "/work-with-me/curated-group-experiences/" },
          { title: "Corporate Breathwork", body: "Workshops, talks, and team programs for organizations that take wellbeing seriously.", ctaLabel: "Corporate programs", href: "/work-with-me/corporate/" },
        ],
      },
      {
        blockType: "splitImageText",
        image: sabineJungleBench,
        imageSide: "left",
        heading: "I lived the version of you that's reading this.",
        body: lex(
          "I'm Sabine. I spent fifteen years moving through burnout, identity shifts, and the kind of slow undoing that doesn't make sense from the outside. Breathwork is what brought me back to my body, and to a way of working that doesn't require leaving any part of you behind.",
          "Over ten years later, I work in Tulum with people in transition. With a clinical structure, a soft technique, and the energy of someone who has been on both sides of this."
        ),
        cta: { ...link("Read more about Sabine", "/about/", "secondary"), enabled: true },
      },
      {
        blockType: "testimonialsBlock",
        heading: "What people say after.",
        tone: "sand",
        items: [t1, t2, t3],
        reviewsLabel: "Read more reviews on Google",
        reviewsUrl: "https://g.page/r/CXT0CCkbKfFWEBM/review",
      },
      {
        blockType: "signatureBand",
        eyebrow: "Signature Event · 2026",
        heading: "Five days. Twenty people. One process. Riviera Maya.",
        body: "A residential breathwork retreat in Xpu Ha, designed for people ready to step out of daily life for a week and walk through the full method in community. Limited to twenty places. First edition late 2026 or early 2027, announced to the waitlist first.",
        image: riviera,
        cta: { ...link("Join the waitlist", "/retreat-riviera-maya-2026/"), enabled: true },
      },
      {
        blockType: "ctaSection",
        heading: "Not sure where to start?",
        width: "narrow",
        align: "center",
        body: "The honest answer is most people just write me. We talk for a few minutes, I get a sense of what you're moving through, and we figure out the right starting point together. There's no script.",
        ctas: [wa("Message me on WhatsApp", "general", "whatsapp"), email("Send me an email")],
      },
    ],
  });

  // THE METHOD
  await page({
    title: "The Method",
    slug: "the-method",
    metaTitle: "The Method. Breathe. Heal. Transform.®",
    metaDescription: "A three phase process built on Clarity Breathwork™ and somatic work. Trauma informed, structured, and designed to transform what the mind alone can't reach.",
    ogImage: somatic,
    layout: [
      {
        blockType: "hero",
        eyebrow: "The Method",
        heading: "The method behind the work.",
        lede: "Every person arrives with their own story. But the process of coming back to the body, meeting what's stored there, and choosing from a different place, has a shape. This is mine.",
        image: sabineBeachSky,
        ctas: [link("See the three phases", "#phases"), link("Experience the method", "/work-with-me/private-sessions/", "secondary")],
      },
      {
        blockType: "threePhases",
        id: "phases",
        heading: "Breathe. Heal. Transform.®",
        lede: "A three phase process. Not a metaphor. The actual arc of every session and every retreat.",
        tone: "sand",
        body: lex(
          "Breathe. The body enters the work. The technique opens what's been held. You might notice tingling, warmth, vibration, your awareness moving from your head into the rest of you. This is your nervous system shifting state.",
          "Heal. The emotional layer surfaces. Core wounds, old patterns, the things the mind has named already but the body never finished. Tears that surprise you, sometimes laughter, sometimes a deep stillness. This phase is release of what's ready to move.",
          "Transform. Integration. What surfaced gets language so it can be recognized when it comes back. Without this phase, the work doesn't land. The Transform phase is what makes the shift sustainable."
        ),
      },
      {
        blockType: "richText",
        heading: "Clarity Breathwork™. The technique that makes this possible.",
        tone: "cream",
        body: lex(
          "The breathwork I practice is Clarity Breathwork™, a soft, trauma informed technique developed over forty years and designed to access what's stored in the body without forcing the nervous system into a stress response.",
          "I'm certified as a Clarity Breathwork™ Specialist directly with the founders of the technique. To my knowledge, I'm the only one with this formal certification in Riviera Maya.",
          "Soft, not strong. Most popular breathwork techniques use intensity. Clarity Breathwork uses softness. Less spectacle, more landing. And it's trauma informed by design: the pacing and cueing are built to avoid retraumatizing the system."
        ),
      },
      {
        blockType: "richText",
        heading: "What it actually feels like.",
        tone: "sand",
        width: "narrow",
        body: lex(
          "Once you start the active breathing, the body shifts physiologically. CO2 levels drop. You might feel tingling in your hands, a lightness in your head, sometimes cramping in the hands or face. The technical name is tetany. It's normal. It passes.",
          "Then emotions start moving. They tend to come from the center of the body, not the head. The chest carries grief. The stomach is the center of personal power. The lower belly carries womb history and generational pain.",
          "My job is to read what's there, hold the space, and respond. I don't push. I trust the body's intelligence and stay with you while it does its thing."
        ),
      },
      {
        blockType: "richText",
        heading: "Core wounds, and why we work through the body.",
        tone: "cream",
        width: "narrow",
        body: lex(
          "A lot of what we struggle with on the surface, the overthinking, the same relationship pattern on repeat, the burnout that rest doesn't fix, traces back to something older. Emotional imprints from earlier moments that taught your nervous system how to brace. These are what I mean by core wounds.",
          "They don't live in the thinking mind, which is why understanding them rarely resolves them. They live in the body, in how you hold tension, in what your system reaches for under pressure before you've decided anything.",
          "When the breath softens the nervous system, those imprints become reachable. Not to relive them, but to let the body finish what it never got to. That's the layer talking alone keeps circling but can't quite touch."
        ),
      },
      {
        blockType: "list",
        heading: "A few honest disclaimers.",
        tone: "cream",
        width: "narrow",
        intro: "The work is real. But there are claims I won't make.",
        items: [
          { text: "This is not a medical or psychological treatment. It complements but doesn't replace therapy or medical care." },
          { text: "It doesn't promise healing, cure, or instant change. The body does what it's ready to do, when it's ready." },
          { text: "It's not a spiritual ceremony or a religious practice. There's no belief system you need to adopt." },
          { text: "It's not a one-session fix. The method is built to be cumulative." },
          { text: "It's not for every body or every nervous system in every moment. There are contraindications and times when this isn't the right tool." },
        ],
        cta: { ...link("Read full health contraindications", "/legal/contraindications/", "secondary"), enabled: true },
      },
      {
        blockType: "ctaSection",
        heading: "Ready to experience it?",
        width: "narrow",
        align: "center",
        tone: "sand",
        body: "Reading about a method has its limits. The work shows up when you're in the room.",
        ctas: [link("Explore private sessions", "/work-with-me/private-sessions/"), link("Meet Sabine", "/about/", "secondary")],
      },
    ],
  });

  // PRIVATE SESSIONS
  await page({
    title: "Private Sessions",
    slug: "work-with-me/private-sessions",
    metaTitle: "Private Breathwork Sessions in Tulum. Foundation, Immersive, 1 Day",
    metaDescription: "One on one breathwork sessions in Tulum or online. Foundation, Immersive, and 1 Day Private Retreat formats. Couples and 2 person sessions available.",
    ogImage: privateImg,
    layout: [
      {
        blockType: "hero",
        eyebrow: "Private Sessions",
        heading: "Private breathwork sessions, in Tulum or online.",
        lede: "One on one, or two on the mat together. Three formats, one process. Choose the one that fits where you are.",
        image: sabineBeachRock,
        ctas: [wa("Message me on WhatsApp", "general", "whatsapp"), link("Compare formats", "#compare", "secondary")],
      },
      {
        blockType: "formatDetail",
        anchor: "foundation",
        title: "Foundation Session",
        tagline: "Where most people start.",
        tone: "cream",
        body: lex(
          "The Foundation is the entry point. 2 to 2.5 hours, an intake conversation, a Clarity Breathwork™ session, and time to come back to the room together at the end.",
          "If you've never done breathwork before, this is the right format. Softer. Slower. Trauma informed. By the end you'll have a clearer sense of what's stored where in your body, and a first felt experience of working with it instead of around it."
        ),
        included: [
          { text: "Pre-session intake conversation (around 30 minutes)." },
          { text: "Around 60 to 75 minutes of guided breathwork." },
          { text: "A Life Alignment or Core Wound snapshot, so you leave with a sense of the deeper pattern." },
          { text: "Integration conversation at the end." },
          { text: "A simple practice to take with you." },
        ],
        investment: "Investment shared when we talk. Couples welcome.",
        cta: wa("Book a Foundation", "foundation", "whatsapp"),
      },
      {
        blockType: "formatDetail",
        anchor: "immersive",
        title: "Immersive Session",
        tag: "Signature",
        tagline: "The format the method was built for.",
        tone: "sand",
        body: lex(
          "The Immersive is what I do when I have enough time to actually work. Half a day, body-led, with room to read what's coming up and respond instead of rush.",
          "The intake goes deeper. The breathwork goes longer. The integration isn't squeezed into the last ten minutes. Some people do it once. Others extend it into multiple Immersive sessions across a few weeks. This is what I recommend to most people who can give it the time."
        ),
        included: [
          { text: "Deeper intake (around 45 minutes)." },
          { text: "Around 90 minutes of guided breathwork." },
          { text: "Somatic and conversational integration." },
          { text: "Core wound decoding, connecting what surfaces to the pattern underneath." },
          { text: "Time for whatever is asking for time." },
          { text: "Pre-session and post-session voice notes via WhatsApp." },
        ],
        investment: "Investment shared when we talk. Couples welcome.",
        cta: wa("Book an Immersive", "immersive", "whatsapp"),
      },
      {
        blockType: "formatDetail",
        anchor: "one-day",
        title: "1 Day Private Retreat",
        tagline: "A full day with no other agenda.",
        tone: "cream",
        body: lex(
          "If the Immersive is a deep session, this is a deep day. You arrive in the morning, you leave at sunset. In between we move through more than one breathwork session, somatic and conversational work, time alone with the process, a quiet meal, and proper integration.",
          "Designed for repeat clients ready to go further, or for someone arriving at a clear transition who needs to land the work in one focused container before going back to their life."
        ),
        included: [
          { text: "A full day, sunrise to sunset roughly." },
          { text: "Two breathwork sessions with integration between them." },
          { text: "Somatic coaching and conversation, with space for inner child themes when they surface." },
          { text: "Quiet meal or nourishment break." },
          { text: "Follow-up WhatsApp check-in within 72 hours." },
        ],
        investment: "Investment shared when we talk. Available for one or two people.",
        cta: wa("Inquire about a 1 Day Private Retreat", "oneDayPrivate", "whatsapp"),
      },
      {
        blockType: "formatDetail",
        anchor: "couples",
        title: "Couples and 2-person sessions.",
        tone: "sand",
        body: lex(
          "Any of the three formats is available for two people. The most common combinations are couples, but the second person can also be a friend, a sibling, a parent and adult child, anyone you share a process with.",
          "When two people breathe in the same room, the work expands. Patterns that were invisible on your own become legible together. The container changes, but the method doesn't soften, it deepens.",
          "What this is not: couples therapy with breath. We're here to give both of you access to what's underneath the talking, at the same time."
        ),
        cta: wa("Inquire about a 2-person session", "couples", "whatsapp"),
      },
      {
        blockType: "richText",
        heading: "A few honest notes on safety.",
        tone: "cream",
        body: lex(
          "Breathwork is not a medical or psychological treatment. It complements but does not replace therapy or medical care.",
          "Clarity Breathwork™ is a trauma informed technique, built to avoid retraumatization. That said, there are conditions where breathwork is not advised or where we'd modify the approach: pregnancy, recent cardiovascular events, epilepsy, glaucoma, severe asthma, recent surgery, untreated psychosis, severe PTSD without parallel therapeutic support.",
          "Please don't book a session without sharing relevant health context. Many of these are workable with adjustments. Some aren't, and I'll tell you."
        ),
        cta: { ...link("Read full health contraindications", "/legal/contraindications/", "secondary"), enabled: true },
      },
      {
        blockType: "faq",
        heading: "Questions, answered.",
        tone: "sand",
        items: [
          { question: "Do I need breathwork experience?", answer: "No. The Foundation Session exists specifically for first-timers. The technique is soft by design." },
          { question: "How is this different from Wim Hof, Holotropic, or Pranayama?", answer: "Different lineage, different goal. Clarity Breathwork™ is built for emotional work, not performance or peak experience. The pace is slower and the focus is on what's stored in the body, not on catharsis." },
          { question: "Will I feel a release?", answer: "Maybe, maybe not. I don't aim for catharsis. I aim for what's actually ready. Sometimes that's emotional, sometimes a quiet shift. Both count." },
          { question: "What if I cry, or shake, or feel overwhelmed?", answer: "That's all part of the territory. My job is to stay with you, regulate the room, and make sure the experience completes safely." },
          { question: "How long until I see effects?", answer: "Some shifts land within hours, others over weeks. Most people notice a difference in how they sleep and how they respond to stress within the first few days." },
          { question: "Is online really equivalent to in person?", answer: "Functionally yes, with some honest differences. In person, I can read your body more directly. Online, you're in your own space which has its own value. Both work." },
          { question: "Can I do this if I'm in therapy?", answer: "Yes, and it often pairs well. Bring it up so I know the context. If your therapist wants to coordinate, I'm open to it." },
          { question: "What language are sessions in?", answer: "Sessions are held in English." },
          { question: "How do I book?", answer: "WhatsApp is the fastest. Email also works. We'll exchange a few messages, decide on format and timing, and book it from there." },
        ],
      },
      {
        blockType: "ctaSection",
        heading: "Ready, or close to ready?",
        width: "narrow",
        align: "center",
        body: "The first message doesn't need to be long. “Hi, I'm thinking about a session” is enough. We'll take it from there.",
        ctas: [wa("Message me on WhatsApp", "general", "whatsapp"), email("Send me an email")],
      },
    ],
  });

  // ABOUT
  await page({
    title: "About",
    slug: "about",
    metaTitle: "About Sabine Binns. Breathwork Tulum Founder",
    metaDescription: "Sabine Binns is a Clarity Breathwork™ Specialist with twenty years in wellness and an international corporate background spanning Orbitz and Booking. Based in Tulum, Mexico.",
    ogImage: portrait,
    layout: [
      {
        blockType: "hero",
        eyebrow: "Hi. I'm Sabine Binns.",
        heading: "I lived the burnout. I learned to breathe through it. Now I guide others through theirs.",
        image: sabineJungleSeated,
      },
      {
        blockType: "richText",
        heading: "How I got here.",
        tone: "sand",
        width: "narrow",
        body: lex(
          "I spent twenty years in international corporate leadership, including roles at Orbitz and Booking, working across travel, hospitality, and global teams. Long enough to understand that environment from the inside, and long enough to start unraveling inside it.",
          "Somewhere in there I found breathwork. Not as a wellness trend. As a way through.",
          "What started as my own work eventually became my practice. I trained in Clarity Breathwork™ directly with its founders. I moved to Mexico. That's been ten years and counting. The work is the same. The clients change."
        ),
      },
      {
        blockType: "richText",
        heading: "A few honest notes on how I show up.",
        tone: "cream",
        body: lex(
          "I don't heal anyone. I hold the space and let your body do its work. The responsibility for your process stays with you, which is the only place it belongs.",
          "I work slowly. The technique I use is soft on purpose. I'm interested in what's actually ready to move, and in the kind of integration that lasts beyond the session.",
          "I stay with the body, not the story. People often arrive wanting to talk through their situation. I welcome that. But the work happens when we move from talking about it to feeling it.",
          "I don't perform. I'm a person sitting with another person. Sometimes the work asks for stillness. Sometimes it asks for me to lean in and gently push. Sometimes it asks for nothing."
        ),
      },
      {
        blockType: "list",
        heading: "Training, certifications, and lineage.",
        tone: "sand",
        items: [
          { text: "Certified Clarity Breathwork™ Specialist. Trained directly under the founders of the technique. To my knowledge, the only one with this formal certification in Riviera Maya." },
          { text: "Over 10 years of dedicated breathwork practice." },
          { text: "Over 20 years in the wellness and healing space." },
          { text: "MA, Master of Arts." },
          { text: "Background in international corporate leadership across multiple countries, including roles at Orbitz and Booking." },
          { text: "Continued training in somatic experiencing, nervous system regulation, and trauma informed practice." },
        ],
        note: "A complete training timeline is available on request for corporate partners, retreat centers, or professionals considering a collaboration.",
      },
      {
        blockType: "twoColumnLists",
        heading: "Honest about fit.",
        tone: "cream",
        intro: "Not everyone needs me. Sometimes the work I do is exactly right. Sometimes another practitioner, modality, or moment makes more sense.",
        leftTitle: "I'm not the right person if",
        left: [
          { text: "You're looking for a fast catharsis or peak experience. Look at Holotropic or shamanic breathwork practitioners for that." },
          { text: "You want pure talk therapy. Find a good therapist; the work is different." },
          { text: "You're in acute psychiatric crisis. You need parallel medical support; I work alongside that, not instead of it." },
          { text: "You want to perform spirituality. This isn't that space." },
        ],
        rightTitle: "I am the right person if",
        right: [
          { text: "You're moving through a transition that's bigger than you expected." },
          { text: "You've done the cognitive work and now need something that goes deeper than thought." },
          { text: "You want depth without theatre." },
          { text: "You want a method, not just a session." },
        ],
      },
      {
        blockType: "ctaSection",
        heading: "If any of this lands.",
        width: "narrow",
        align: "center",
        tone: "sand",
        body: "The easiest way to start working together is a private session. The Immersive is what I usually recommend if you have the time. The Foundation if you're new or short on time. If you're not sure what fits, write me on WhatsApp.",
        ctas: [link("Explore private sessions", "/work-with-me/private-sessions/"), wa("Message me on WhatsApp", "general", "whatsapp")],
      },
    ],
  });

  // CONTACT
  await page({
    title: "Contact",
    slug: "contact",
    metaTitle: "Contact Breathwork Tulum. WhatsApp, Email, Booking",
    metaDescription: "Reach out by WhatsApp, email, or contact form. Sessions in Tulum, in person retreats in Riviera Maya, and worldwide online programs.",
    layout: [
      {
        blockType: "ctaSection",
        heading: "The easiest way to start is to write me.",
        width: "narrow",
        align: "center",
        body: "WhatsApp gets the fastest response. Email works too if you prefer to take more time. Forms are below for specific cases.",
        ctas: [wa("Message me on WhatsApp", "contact", "whatsapp"), email("Send me an email")],
      },
      {
        blockType: "contactTiles",
        tone: "sand",
        tiles: [
          { title: "WhatsApp", line: "Fastest response, usually same day.", value: "+52 55 4109 8336", ctaLabel: "Open WhatsApp", action: "whatsapp", whatsappContext: "contact" },
          { title: "Email", line: "For longer messages or when you want to take your time.", value: "breathe@breathworktulum.com", ctaLabel: "Send an email", action: "email" },
          { title: "Discovery Call", line: "30 minutes for retreats and corporate inquiries.", value: "By WhatsApp or email", ctaLabel: "Book a discovery call", action: "whatsapp", whatsappContext: "discoveryCall" },
        ],
      },
      {
        blockType: "richText",
        heading: "A few honest notes on what happens next.",
        tone: "cream",
        body: lex(
          "First message. Doesn't need to be long. “Hi, I'm thinking about a session” or “I have a question about retreats” is enough.",
          "My response. Usually a voice note on WhatsApp, around two minutes. I respond to what you actually asked, not with a template.",
          "Timing. WhatsApp: usually within hours during business hours (Mexico Central Time). Email: within 24 to 48 hours. Discovery calls: within a week.",
          "Language. Sessions are held in English.",
          "NUMA, my assistant on this site, can answer quick questions any time. When you message me, you're getting me."
        ),
      },
      {
        blockType: "contactForm",
        tone: "sand",
        heading: "Or use a form, if that's easier.",
        intro: "Tell me a little about what's bringing you here. For private sessions, a phone or WhatsApp number gets you a faster reply.",
      },
      {
        blockType: "ctaSection",
        heading: "One message away.",
        width: "narrow",
        align: "center",
        ctas: [wa("Message me on WhatsApp", "contact", "whatsapp")],
      },
    ],
  });

  // testimonials referenced in helper-less spots
  void t4;

  payload.logger.info("✅ Seed complete: 5 pages, globals, testimonials, media.");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
