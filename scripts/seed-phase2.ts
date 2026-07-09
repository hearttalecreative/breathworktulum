import { getPayload } from "payload";
import config from "../payload.config";

// Non-destructive: upserts the phase-2 pages (does NOT touch the 5 MVP pages).
const lex = (...paras: string[]) => ({
  root: {
    type: "root", format: "", indent: 0, version: 1, direction: "ltr" as const,
    children: paras.map((t) => ({
      type: "paragraph", version: 1, format: "", indent: 0, direction: "ltr" as const, textFormat: 0,
      children: [{ type: "text", version: 1, text: t, format: 0, detail: 0, mode: "normal", style: "" }],
    })),
  },
});
const link = (label: string, href: string, variant = "primary") => ({ label, variant, action: "internal", href });
const wa = (label: string, context: string, variant = "whatsapp") => ({ label, variant, action: "whatsapp", whatsappContext: context });
const email = (label: string, variant = "secondary") => ({ label, variant, action: "email" });
const ext = (label: string, href: string, variant = "primary") => ({ label, variant, action: "external", href });
const items = (...xs: string[]) => xs.map((text) => ({ text }));
const incl = (...xs: string[]) => xs.map((text) => ({ text }));

async function run() {
  const payload = await getPayload({ config });

  const mediaId = async (filename: string) => {
    const r = await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1 });
    return r.docs[0]?.id;
  };
  const palapa = await mediaId("breathwork-tulum-palapa-space.jpg");
  const portrait = await mediaId("breathwork-tulum-sabine-portrait.jpg");
  const somatic = await mediaId("breathwork-tulum-somatic-session.jpg");
  const privateImg = await mediaId("breathwork-tulum-private-session.jpg");
  const riviera = await mediaId("breathwork-tulum-riviera-maya.jpg");
  // Themed photos for full-bleed bands that break long text sections.
  const deckSea = await mediaId("bw-deck-sea.jpg");
  const groupJungle = await mediaId("bw-group-jungle.jpg");
  const soundCircle = await mediaId("bw-curated-sound-circle.jpg");
  const corporateVilla = await mediaId("bw-corporate-villa.jpg");
  const bandPalapaWide = await mediaId("bw-band-palapa-wide.jpg");
  const retreatCoupleSea = await mediaId("bw-retreat-couple-sea.jpg");
  const cenote = await mediaId("bw-cenote.jpg");

  const reviews = await payload.find({ collection: "testimonials", limit: 3 });
  const tIds = reviews.docs.map((d) => d.id);

  const page = async (slug: string, data: Record<string, unknown>) => {
    await payload.delete({ collection: "pages", where: { slug: { equals: slug } } as never });
    await payload.create({ collection: "pages", data: { slug, _status: "published", ...data } as never });
    payload.logger.info(`  ✓ ${slug}`);
  };

  const WAYS = [
    { title: "Private Sessions", body: "Foundation, Immersive, or a full 1 Day Private Retreat. Online or in Tulum. For one person, or two.", ctaLabel: "Explore private sessions", href: "/work-with-me/private-sessions/" },
    { title: "Personalized Retreats", body: "Multi-day retreats designed around you. 3 Day, 5 Day, custom, or virtual. For individuals and couples ready for depth.", ctaLabel: "Explore retreats", href: "/work-with-me/personalized-retreats/" },
    { title: "Group Practice", body: "Weekly 1 Day Retreats in a national park and regular Group Sessions at Nomade. Open group formats, booked ahead.", ctaLabel: "Explore group practice", href: "/work-with-me/group-practice/" },
    { title: "Curated Group Experiences", body: "Private group breathwork for retreat leaders, families, wellness events, and luxury groups. Designed on request.", ctaLabel: "Inquire about group experiences", href: "/work-with-me/curated-group-experiences/" },
    { title: "Corporate Breathwork", body: "Workshops, talks, and team programs for organizations that take wellbeing seriously.", ctaLabel: "Corporate programs", href: "/work-with-me/corporate/" },
  ];

  // ---------- WORK WITH ME (hub) ----------
  await page("work-with-me", {
    title: "Work With Me",
    metaTitle: "Work With Me. Sessions, Retreats, Group and Corporate Programs",
    metaDescription: "Five ways to work with Sabine. Private breathwork sessions, personalized retreats, group practice, curated group experiences, and corporate programs.",
    ogImage: palapa,
    layout: [
      { blockType: "ctaSection", heading: "Five ways in, depending on where you are.", width: "default", align: "left", tone: "cream",
        body: "Some people come for one session. Others for a five day process. Some bring their partner, their team, or a private group. The work is the same. The container changes." },
      { blockType: "waysGrid", heading: "Ways to work together.", tone: "sand", cards: WAYS },
      { blockType: "photoBand", image: bandPalapaWide, height: "standard", eyebrow: "Tulum · Riviera Maya · Online",
        caption: "Wherever you start, the work meets you there." },
      { blockType: "richText", heading: "Honestly, if you're not sure.", tone: "cream", width: "narrow",
        body: lex(
          "Most people land on Private Sessions and start with an Immersive. It's the format that gives the method enough room without asking for a multi-day commitment.",
          "If you're traveling and have less time, Foundation. If you have more time, the 1 Day Private Retreat. If you're not traveling but you want depth, the Virtual Personalized Retreat is the online equivalent of in person work, not a watered down version.",
          "If none of that fits, write me. We'll figure it out in a few minutes."),
        cta: { ...wa("Message me on WhatsApp", "general"), enabled: true } },
      { blockType: "ctaSection", heading: "Not yet ready to choose a format?", width: "narrow", align: "center", tone: "sand",
        ctas: [link("See the method", "/the-method/"), link("Meet Sabine", "/about/", "secondary")] },
    ],
  });

  // ---------- PERSONALIZED RETREATS ----------
  await page("work-with-me/personalized-retreats", {
    title: "Personalized Retreats",
    metaTitle: "Personalized Breathwork Retreats. In Person or Virtual",
    metaDescription: "Multi-day breathwork retreats designed around you. In Riviera Maya or online. The same method, two formats. For individuals and couples.",
    ogImage: riviera,
    layout: [
      { blockType: "hero", eyebrow: "Personalized Retreats", heading: "A retreat built around you. In person, or online.",
        lede: "A multi-day process designed around your specific moment. The same method, two formats. Choose the container that fits your life right now.",
        image: riviera, ctas: [link("Book a discovery call", "/contact/"), link("Compare formats", "#formats", "secondary")] },
      { blockType: "richText", heading: "One process. Two containers.", tone: "sand",
        body: lex(
          "A Personalized Retreat is a custom designed multi-day breathwork and somatic coaching process, built around what you're moving through right now. Not a packaged program with set modules. We map the ground first, then design the days.",
          "Whether you choose in person in Riviera Maya or virtual across a few weeks, the method is the same. The depth is the same. The level of attention is the same. The difference is the container.") },
      { blockType: "list", heading: "Three things every Personalized Retreat has.", tone: "cream", width: "default",
        items: items(
          "A pre-retreat process. Before you arrive, we spend time mapping what you want to work with. Calls, voice notes, sometimes a written intake.",
          "The retreat itself. Multiple breathwork sessions across the days, somatic work, conversation, rest, integration. Nothing improvised, everything responsive.",
          "A post-retreat integration window. Following days or weeks where I'm reachable for the questions that surface after the work lands.") },
      { blockType: "formatDetail", anchor: "formats", title: "3 Day Retreat in Riviera Maya", tagline: "The shortest immersive container with the full arc.", tone: "sand",
        body: lex("Three days, in person, in Riviera Maya. Designed for someone who can step away for a long weekend without committing to a full week. Best for a first retreat experience, busy professionals carving real time off, or couples wanting a shared process in a contained window."),
        included: incl("3 days of programmed work.", "Multiple BREATHE.HEAL.TRANSFORM.® breathwork sessions.", "Somatic coaching and integration.", "Curated location.", "Meals and logistics handled or guided.", "Pre and post retreat integration."),
        investment: "From $18,000 MXN + IVA.", cta: link("Book a discovery call", "/contact/") },
      { blockType: "formatDetail", anchor: "five-day", title: "5 Day Immersive Retreat in Riviera Maya", tag: "Signature", tagline: "The format the method really opens up in.", tone: "cream",
        body: lex("Five days, in person, in Riviera Maya. There's space for the work to land in waves, with proper integration time in between. Best for someone arriving at a clear transition with the time and resources to step fully away, repeat clients ready to go deeper, or anyone who has done the 3 Day and wants more."),
        included: incl("5 days of programmed work.", "Multiple breathwork sessions spread across the days.", "Deeper somatic coaching and conversational integration.", "Curated location.", "All meals and logistics handled.", "Extended pre and post retreat integration window."),
        investment: "From $26,000 MXN.", cta: link("Book a discovery call", "/contact/") },
      { blockType: "formatDetail", anchor: "custom", title: "Custom In-Person Retreat", tagline: "Beyond the 3 and 5 day formats.", tone: "sand",
        body: lex("Seven days, ten days, or whatever the work asks for. Built around a specific moment in your life, with location, pacing, and content fully bespoke. Often booked by repeat clients or referrals."),
        included: incl("Fully custom duration and design.", "Multiple breathwork sessions and integration.", "Curated location matched to the retreat intention.", "All meals and logistics handled.", "Extended pre and post retreat integration."),
        investment: "Custom quotes after a discovery call.", cta: link("Book a discovery call", "/contact/") },
      { blockType: "formatDetail", anchor: "virtual", title: "Virtual Personalized Retreat", tagline: "Real depth, no travel required.", tone: "cream",
        body: lex("Three or five virtual sessions across a few weeks, designed to give online clients a real container without forcing them to travel. Not a watered down version of in person. A different way to work with the same depth. Best for someone who can't travel right now, or who wants to integrate the work into their actual life."),
        included: incl("3 or 5 long sessions across 4 to 8 weeks.", "Pre-retreat intake and design.", "Voice note check-ins between sessions.", "Integration practices customized to your life.", "A follow-up session 4 to 6 weeks after the last one."),
        investment: "From $15,000 MXN for three sessions, $21,000 MXN for five.", cta: link("Book a discovery call", "/contact/") },
      { blockType: "photoBand", image: deckSea, height: "tall", eyebrow: "Riviera Maya",
        caption: "Days built around you, in a place that holds the work." },
      { blockType: "richText", heading: "The spaces I work in.", tone: "cream", width: "narrow",
        body: lex(
          "Where the work happens matters. My primary breathwork deck is at Diamantek, a featured location between Tulum and Playa del Carmen, open to the jungle and built for this kind of stillness.",
          "I also hold work on a deck inside a national park, and in a jungle space near Playa. Each one is chosen so the setting can hold the work, not pull you out of it.") },
      { blockType: "photoBand", image: groupJungle, height: "standard", eyebrow: "Diamantek · the jungle deck",
        caption: "My primary breathwork deck, open to the jungle." },
      { blockType: "twoColumnLists", heading: "Not for everyone, on purpose.", tone: "sand",
        leftTitle: "Best fit if", left: items(
          "You're moving through a real transition and the time has come to do something bigger than a session.",
          "You've done some inner work already and you're ready for something that goes beyond what the mind has understood.",
          "You can give the process the time it needs without checking your phone every two hours.",
          "You're financially able to invest without it being a strain that becomes part of the process itself."),
        rightTitle: "Probably not, if", right: items(
          "You're looking for a fix. A retreat amplifies the work; it doesn't shortcut it.",
          "You're in acute crisis without psychological support in place.",
          "You want a wellness vacation. This is a working retreat, not spa days with breath.") },
      { blockType: "richText", heading: "The retreat is half the work.", tone: "cream", width: "narrow",
        body: lex("Most retreats land properly weeks after they end. The body keeps integrating. New choices start showing up in places you didn't expect. Old patterns come back to test whether the shift was real. That's why every retreat includes a post-retreat integration window. The work isn't done at the airport on the way home.") },
      { blockType: "list", heading: "The four steps to design your retreat.", tone: "sand",
        items: items(
          "Discovery call. A 30 minute conversation, no charge, no pressure. We talk about what's moving in your life and whether this format is right. If it's not, I'll tell you.",
          "Custom design. I design the retreat around your situation: days, locations, format of each session, balance of work and rest.",
          "Confirmation and pre-retreat preparation. Deposit, dates locked, location confirmed. The retreat starts before you arrive.",
          "The retreat and integration. The days themselves, then the integration window after."),
        cta: { ...link("Book a discovery call", "/contact/"), enabled: true } },
      { blockType: "testimonialsBlock", heading: "What people say after.", tone: "cream", items: tIds, reviewsLabel: "Read more reviews on Google", reviewsUrl: "https://g.page/r/CXT0CCkbKfFWEBM/review" },
      { blockType: "faq", heading: "Questions, answered.", tone: "sand", items: [
        { question: "How is a Personalized Retreat different from a private session?", answer: "A session is a moment in time. A retreat is a process across days or weeks. The method is the same; the depth available is different because we have more time and attention." },
        { question: "How is the in person version different from the virtual?", answer: "Same method, different containers. In person gives you immersion: leaving daily life, being in nature. Virtual gives you integration: doing the work inside your actual life, lower travel cost. Neither is better." },
        { question: "How many days is a typical in-person retreat?", answer: "Usually 3 to 7 days, depending on your design. Some do a focused 3 day intensive; others 5 to 7 days when the process needs more breathing room." },
        { question: "Can I bring my partner?", answer: "Yes. Couples retreats are designed differently; the work expands when there are two people in the room. We talk about that in the discovery call." },
        { question: "What's the cancellation policy?", answer: "Deposit is non-refundable to secure dates. The balance has a tiered cancellation schedule. Details in the retreat booking policies, sent before any payment." },
        { question: "Do I have to do plant medicine?", answer: "No. This work uses breath and the body, nothing else. It's compatible with people integrating plant medicine elsewhere, but the retreats themselves are entirely substance free." },
      ]},
      { blockType: "ctaSection", heading: "Want to see if this is right for you?", width: "narrow", align: "center", tone: "cream",
        body: "The discovery call is the easiest place to start. Thirty minutes, no commitment, and you'll leave with a clear sense of whether a Personalized Retreat is right for this moment.",
        ctas: [link("Book a discovery call", "/contact/"), wa("Message me on WhatsApp", "personalizedRetreat")] },
    ],
  });

  // ---------- GROUP PRACTICE ----------
  const EVENTBRITE = "https://www.eventbrite.com/e/breathe-heal-transform-1-day-clarity-breathworktm-retreat-national-park-tickets-469383477617?aff=breathworktulum_site";
  await page("work-with-me/group-practice", {
    title: "Group Practice",
    metaTitle: "Weekly Group Breathwork in Tulum. National Park and Nomade",
    metaDescription: "Two ways to experience Clarity Breathwork™ in a group setting. A weekly 1 Day Retreat in a national park, or a regular Group Session at Nomade in Tulum.",
    ogImage: palapa,
    layout: [
      { blockType: "hero", eyebrow: "Group Practice", heading: "Group practice. Two ways in.",
        lede: "A weekly 1 Day Retreat in a national park between Tulum and Playa del Carmen. And a regular Group Session at Nomade in Tulum. Same method, two containers, both booked ahead.",
        image: palapa, ctas: [ext("See dates on Eventbrite", EVENTBRITE), wa("Ask about Nomade", "general", "secondary")] },
      { blockType: "richText", heading: "Why this work changes in a group.", tone: "sand", width: "narrow",
        body: lex("Private sessions go deep one on one. Group sessions go wide. Different rhythm, different mirror.", "When people breathe together, the room becomes the work. Patterns you didn't know you carried surface in proximity to others moving through theirs.", "Most people who work with me do both. They start with a group session to feel the work, then book private. Or they start private and join the group for continuity.") },
      { blockType: "formatDetail", anchor: "one-day-retreat", title: "Breathe. Heal. Transform. 1 Day Retreat.", tag: "Weekly · Mid October to end of April", tagline: "A full day in a national park.", tone: "cream",
        body: lex("A full day in a national park between Tulum and Playa del Carmen, every week from mid October to the end of April. A small group, a curated location in nature, the full BREATHE.HEAL.TRANSFORM.® process in a single day. If you're traveling, in transition, or just want to do this work in nature without committing to multiple days, this is the way in."),
        included: incl("Arrival and group circle.", "Full Clarity Breathwork™ session with the method.", "Somatic integration in the natural setting.", "Group sharing.", "Light meal or nourishment break.", "Closing circle."),
        cta: ext("See dates and book on Eventbrite", EVENTBRITE) },
      { blockType: "formatDetail", anchor: "nomade", title: "Group Session at Nomade.", tag: "Regular · Tulum hotel zone", tagline: "The breathwork session, with a tight integration circle.", tone: "sand",
        body: lex("A regular group breathwork session held at Nomade in Tulum's hotel zone. Smaller container than the 1 Day Retreat, focused on the breathwork session itself with a tight integration circle after. Open to Nomade guests and to the public. A good way to experience the work without leaving the hotel zone. Around 2 hours. Message me for the next date."),
        cta: wa("Message me to join the next session", "general") },
      { blockType: "photoBand", image: groupJungle, height: "standard", eyebrow: "A national park, every week",
        caption: "The room becomes the work when people breathe together." },
      { blockType: "ctaSection", heading: "Where group fits in the full work.", width: "default", align: "left", tone: "cream",
        body: "Both formats are open practice. If after either one you want to go deeper, the next step is usually a Private Session or a Personalized Retreat.",
        ctas: [link("Explore Private Sessions", "/work-with-me/private-sessions/"), link("Explore Personalized Retreats", "/work-with-me/personalized-retreats/", "secondary")] },
      { blockType: "faq", heading: "Questions, answered.", tone: "sand", items: [
        { question: "Can I drop in without booking ahead?", answer: "For the 1 Day Retreat in the national park, no. Tickets are on Eventbrite and dates fill ahead. For Nomade, message me first to confirm availability." },
        { question: "Do I need breathwork experience?", answer: "No. Both formats are open to first timers. The method is soft and trauma informed." },
        { question: "What should I bring?", answer: "For the 1 Day Retreat: comfortable clothes, water, swimsuit if relevant. Full details sent after booking. For Nomade: come as you are." },
        { question: "What if I'm dealing with a health condition?", answer: "Bring it up before booking. There are conditions where breathwork isn't advised or needs to be modified. We talk first." },
        { question: "How is this different from a Private Session?", answer: "Group practice gives you a container with other people moving through their own work. Private goes deeper into your specific material. Many people do both." },
      ]},
      { blockType: "ctaSection", heading: "Find a date.", width: "narrow", align: "center", tone: "cream",
        ctas: [ext("See 1 Day Retreat dates on Eventbrite", EVENTBRITE), wa("Message me about Nomade", "general")] },
    ],
  });

  // ---------- CURATED GROUP EXPERIENCES ----------
  await page("work-with-me/curated-group-experiences", {
    title: "Curated Group Experiences",
    metaTitle: "Curated Group Breathwork. Private Groups, Families, Events",
    metaDescription: "Private breathwork experiences for groups. Available on request for retreat leaders, families, wellness events, and luxury travel groups.",
    ogImage: somatic,
    layout: [
      { blockType: "hero", eyebrow: "Curated Group Experiences", heading: "Breathwork for private groups, families, and events.",
        lede: "Privately curated, available on request. For retreat leaders, family gatherings, wellness brand events, milestone moments, and travel groups that want something quiet, well held, and real.",
        image: somatic, ctas: [link("Inquire about a group experience", "#inquiry"), wa("Send me a message", "curated", "secondary")] },
      { blockType: "richText", heading: "Private only, by design.", tone: "sand", width: "narrow",
        body: lex("I don't run public group breathwork in Tulum. The work I do benefits from a closed container with people who chose to be there together. So these experiences are private, designed for one group at a time.", "The group can be three people or twenty. It can be one ninety minute session or a multi-day arc. The structure is built around your group, not the other way around.") },
      { blockType: "waysGrid", heading: "Six types of groups that come back the most.", tone: "cream", cards: [
        { title: "Retreat Leaders Integration", body: "Facilitators running plant medicine retreats who need a trusted partner for the integration phase. Online for clients returning home, or in person when timing aligns." },
        { title: "Family Gatherings", body: "Multigenerational family groups around a meaningful moment: an anniversary, a milestone birthday, a reunion. Designed for mixed bodies and openness levels." },
        { title: "Wellness Brand Events", body: "Brands hosting wellness gatherings, activations, or guest experiences. From a single one hour session to a multi-day program inside a larger event." },
        { title: "Milestone Birthdays", body: "Especially decade birthdays (40, 50, 60). Designed to honor the moment without turning the work into a performance." },
        { title: "Curated Travel Groups", body: "Small group luxury travel curators (8 to 16 people) who include experiential wellness in their itineraries. Breathwork as one anchor experience." },
        { title: "Private Friend Groups", body: "Two to six friends traveling together who want a shared session or short retreat. Closer to private sessions, with the group dynamic added." },
      ]},
      { blockType: "photoBand", image: soundCircle, height: "standard", eyebrow: "Privately curated",
        caption: "One group at a time, in a closed and well held container." },
      { blockType: "richText", anchor: "retreat-integration", heading: "A note on retreat integration.", tone: "sand",
        body: lex("Of all the group work I do, the most consistent demand comes from retreat leaders and centers running plant medicine work who need a serious integration partner.", "When participants travel home, the nervous system is often still moving. Breathwork in the integration window helps the body process what came up without retraumatizing the system. I work with retreat centers who refer participants, independent facilitators, and therapists supporting clients post-retreat."),
        cta: { ...link("Inquire about retreat integration", "#inquiry"), enabled: true } },
      { blockType: "list", heading: "How we build it.", tone: "cream",
        items: items(
          "Inquiry and conversation. You fill the form below or write me. We have a short call to understand the group: who's in it, the context, the moment.",
          "Design. I send a proposal with format, duration, location options, pricing. We adjust until it fits.",
          "Delivery. The experience itself. I handle facilitation, music, structure, integration. You handle (or I help coordinate) logistics on your end.") },
      { blockType: "list", heading: "What you can expect when you book.", tone: "sand", intro: "Every curated experience is custom, so this is a baseline of what tends to be present.",
        items: items("Pre-event call with the organizer to align on intentions.", "Custom designed format based on group size, context, and time.", "Full facilitation: breathwork, integration, sometimes somatic exercises for group.", "Music and audio handled.", "Optional written materials for participants.", "Post-event check-in with the organizer."),
        note: "Pricing is custom and depends on group size, format, location, and duration. Inquire below for a quote." },
      { blockType: "contactForm", anchor: "inquiry", tone: "cream", heading: "Tell me about your group.", intro: "The more context you give, the better I can come back with a meaningful proposal. I respond personally to every inquiry within 48 hours." },
      { blockType: "richText", heading: "Need full retreat planning, not just facilitation?", tone: "sand",
        body: lex("Curated Group Experiences cover the breathwork facilitation side of group work. If you're looking for a fully planned retreat (location, accommodation, logistics, programming end to end), that lives under My Retreat Events | Riviera Maya, a sister project focused on retreat service and planning for private and corporate clients.") },
      { blockType: "ctaSection", heading: "Curious before you commit?", width: "narrow", align: "center", tone: "cream",
        body: "If you want to chat first before filling a form, WhatsApp is fine. Send me one line about your group and we'll take it from there.",
        ctas: [wa("Message me on WhatsApp", "curated")] },
    ],
  });

  // ---------- CORPORATE ----------
  await page("work-with-me/corporate", {
    title: "Corporate Breathwork",
    metaTitle: "Corporate Breathwork. Workshops, Talks, Team Programs",
    metaDescription: "Breathwork and somatic regulation programs for teams and leaders. Built on twenty years of experience across wellness and corporate leadership.",
    ogImage: palapa,
    layout: [
      { blockType: "hero", eyebrow: "Corporate", heading: "Breathwork and somatic regulation for teams.",
        lede: "Not a yoga class with breath. A structured program for nervous systems under load. Designed by someone who spent two decades in international corporate leadership, including roles at Orbitz and Booking, before becoming a facilitator.",
        image: palapa, ctas: [link("Inquire about a corporate program", "#inquiry"), email("Send me an email", "secondary")] },
      { blockType: "richText", heading: "The argument, briefly.", tone: "sand", width: "narrow",
        body: lex("Most corporate wellbeing programs are designed by people who haven't sat in a real performance pressure environment. People show up to a meditation class between deadlines and check their phone halfway through.", "I spent twenty years in international corporate leadership, including roles in travel and hospitality at Orbitz and Booking, before I trained in breathwork. I know the rhythm of those environments because I lived it. I know what kind of work actually integrates into a working schedule.", "What I offer isn't softer. It's more grounded.") },
      { blockType: "richText", heading: "Organizations that have invited me in.", tone: "cream", width: "narrow",
        body: lex("Selected clients include Monex, Sandstorm Gold, and Decelera, among others.", "If your team is considering this kind of work and wants to talk to someone who already booked me, I can connect you on request.") },
      { blockType: "waysGrid", heading: "Three formats, plus executive 1:1.", tone: "sand", cards: [
        { title: "Keynote or Talk", body: "45 to 90 minutes. A talk on stress, nervous system regulation, and what works under pressure, with a short guided breath practice. Best for offsites, company-wide events, conferences." },
        { title: "Workshop", body: "Half day to full day with a smaller group (10 to 40). Teaching, breathwork practice, regulation exercises, and conversation. Best for mid-size teams and departments going through change." },
        { title: "Team Program", body: "Multiple sessions across weeks or months, designed for sustained impact, with optional 1:1 work for leaders. Best for companies investing in real cultural change, not a one-off." },
        { title: "Executive 1:1", body: "Private breathwork and somatic coaching for senior leaders. Confidential, scheduled around your reality. Best for C-level or founders facing burnout, transitions, or high pressure periods." },
      ]},
      { blockType: "photoBand", image: corporateVilla, height: "standard", eyebrow: "For teams under load",
        caption: "Structured regulation for nervous systems under pressure." },
      { blockType: "list", heading: "The kind of changes that show up.", tone: "cream", intro: "I won't claim transformations. I'll name what people actually report.",
        items: items("More capacity under pressure, with less reactive escalation.", "Better quality of attention in meetings. Less context-switching cost.", "Shorter recovery time after high-stress periods.", "Real conversations about stress and burnout, instead of polite ones.", "Tools people use on Monday morning, not just remember from Friday's workshop.", "For leaders: better access to their own signal under load. Clearer decisions.") },
      { blockType: "richText", heading: "The technical backbone.", tone: "sand", width: "narrow",
        body: lex("The work is built on Clarity Breathwork™, a trauma informed technique I've practiced for over ten years, combined with somatic regulation and my three phase method, BREATHE.HEAL.TRANSFORM.®.", "The reason this works where other approaches don't: it's structured, body based, and doesn't ask anyone to adopt a belief system."),
        cta: { ...link("Read about the full method", "/the-method/", "secondary"), enabled: true } },
      { blockType: "list", heading: "The four steps to design a program for your team.", tone: "cream",
        items: items("Discovery call. 30 minutes. You explain the context, the team, the moment. I ask the questions that shape the right tool.", "Proposal. A written proposal: format, agenda, duration, logistics, investment. We refine until it fits your reality.", "Confirmation and pre-program preparation. Contracts signed, dates locked, room or virtual setup planned.", "Delivery and follow-up. The program runs, then a debrief call and tools sent to the team for self-led continuity.") },
      { blockType: "contactForm", anchor: "inquiry", tone: "sand", heading: "Bring this to your team.", intro: "Tell me a bit about your organization and we'll figure out if this is the right fit. I respond personally to every corporate inquiry within 48 hours." },
      { blockType: "ctaSection", heading: "Want a second opinion before deciding?", width: "narrow", align: "center", tone: "cream",
        body: "Some HR leads and founders prefer a quick call before filling a form. That's fine. WhatsApp or email, whatever's easier.",
        ctas: [wa("Message me on WhatsApp", "corporate"), email("Send me an email")] },
    ],
  });

  // ---------- SIGNATURE RETREAT ----------
  await page("retreat-riviera-maya-2026", {
    title: "Signature Retreat, Riviera Maya 2026",
    metaTitle: "Breathwork Retreat Riviera Maya 2026. Waitlist Open",
    metaDescription: "Five day group breathwork retreat in Xpu Ha, Riviera Maya. Limited to twenty places. First edition late 2026 or early 2027. Join the waitlist.",
    ogImage: riviera,
    layout: [
      { blockType: "hero", eyebrow: "Signature Event · Riviera Maya · 2026/2027", heading: "Five days. Twenty people. One process. Riviera Maya.",
        lede: "A residential breathwork retreat in Xpu Ha, designed for people ready to step out of daily life for a week and walk through the full method in community.",
        image: riviera, ctas: [link("Join the waitlist", "#waitlist"), link("Read more about the retreat", "#about-retreat", "secondary")] },
      { blockType: "richText", anchor: "about-retreat", heading: "The first edition.", tone: "sand", width: "narrow",
        body: lex("This is the residential retreat I've been preparing for years. Five days at ONZE Xpu Ha, a curated venue between Tulum and Playa del Carmen. Twenty places, no more. Not because exclusivity is a value of mine, but because the work needs that container size to do what it's designed to do.", "The full BREATHE.HEAL.TRANSFORM.® method walked through in community. Not a workshop. Not a wellness vacation. A residential process where the days are designed to land what daily life has been postponing.") },
      { blockType: "list", heading: "The arc.", tone: "cream",
        items: items(
          "Day 1. Arrival. You land, meet the group, share the first dinner. The container starts forming. No work yet, just presence and orientation.",
          "Day 2. Breathe. The first breathwork session. The body comes online. Most people don't know what they're really here for until this happens.",
          "Day 3. Heal (the longer day). Extended morning breathwork, somatic exploration in the afternoon, integration in the evening. The day the retreat was built around.",
          "Day 4. Transform. Integration. Language. Patterns named, new choices articulated. A second, shorter breathwork session in the late morning.",
          "Day 5. Coming back. Closing ceremony, last group conversation, a clear plan for landing what shifted into your life. You leave by midday."),
        note: "This is the architecture. The specifics adjust to the group that shows up. The container holds. The content responds." },
      { blockType: "richText", heading: "ONZE Xpu Ha.", tone: "sand", width: "narrow",
        body: lex("Xpu Ha is a beach town between Tulum and Playa del Carmen. Quieter, less crowded, surrounded by jungle on one side and the Caribbean on the other.", "ONZE is the venue. A curated property with breathwork spaces, accommodation, dining, and access to nature designed for this kind of work. We chose it because it can hold a group of twenty without losing intimacy.") },
      { blockType: "photoBand", image: retreatCoupleSea, height: "tall", eyebrow: "ONZE Xpu Ha · 2026/2027",
        caption: "Five days to land what daily life keeps postponing." },
      { blockType: "twoColumnLists", heading: "Is this for you?", tone: "cream",
        leftTitle: "Best fit if", left: items(
          "You've been considering a retreat for a while and the right one hasn't shown up yet.",
          "You're moving through a transition that deserves more than a weekend off.",
          "You want to do this kind of work in community, not just one on one.",
          "You can give the work five days without checking your phone every two hours.",
          "You're financially in a place where this is an investment, not a strain."),
        rightTitle: "Probably not, if", right: items(
          "You're looking for a wellness vacation. This is a working retreat.",
          "You're in acute crisis without psychological support in place.",
          "You have no prior experience with inner work and want to start with a high commitment format. Begin with a private session first.") },
      { blockType: "list", heading: "First edition: late 2026 or early 2027.", tone: "sand", intro: "The first edition is being scheduled for late 2026 or early 2027. Specific dates are being finalized and will be shared with the waitlist first. Sign up below to get the dates before they go public, with priority access to apply for one of the twenty seats.",
        items: items("Five days, four nights.", "Location: ONZE Xpu Ha, Riviera Maya, Mexico.", "Group size: 11 to 20 participants.", "All meals included.", "Accommodation included.", "Investment shared with the waitlist first. Payment plan available.") },
      { blockType: "list", heading: "How we get from waitlist to confirmed seat.", tone: "cream",
        items: items(
          "Join the waitlist below. You fill the form, get an automated confirmation, you're in.",
          "Get the dates first. Once dates are confirmed, waitlist members get them before public release, with around two weeks of priority access.",
          "Apply for a seat. A short application and a 15 minute intake call with me. Not a sales call, a fit conversation.",
          "Confirmation and deposit. If we both feel it's a fit, you confirm with a deposit. The balance follows a payment schedule.") },
      { blockType: "richText", heading: "Investment.", tone: "sand", width: "narrow",
        body: lex("The investment covers accommodation, meals, all sessions, and materials. I share the full figure with the waitlist first, along with the payment plan.", "Deposit is non-refundable to secure a seat. Balance is due in installments per a payment schedule sent at confirmation. Full terms in our retreat policies."),
        cta: { ...link("Read full retreat policies", "/legal/retreat-policies/", "secondary"), enabled: true } },
      { blockType: "contactForm", anchor: "waitlist", tone: "cream", heading: "Join the waitlist.", intro: "No commitment. You get the dates first, you decide later. You'll get a confirmation email and be the first to know when dates are announced. I read every form personally." },
      { blockType: "faq", heading: "Questions, answered.", tone: "sand", items: [
        { question: "When exactly is the first retreat?", answer: "First edition is being scheduled for late 2026 or early 2027. Dates to be confirmed and shared with the waitlist first." },
        { question: "Why so few people?", answer: "Twenty is the maximum size that still lets me hold the work properly. Beyond that, the container starts to dilute and depth becomes harder to sustain." },
        { question: "Do I need previous breathwork experience?", answer: "Not strictly. But if you've never done any inner work, start with a private session before committing to a residential format. The 15 minute intake call helps us figure that out." },
        { question: "Can I bring my partner?", answer: "Yes, partners are welcome. There's value in coming alone too." },
        { question: "What if I have a health condition?", answer: "Bring it up in the intake call. Some conditions are workable, some aren't. I'd rather tell you no upfront than have an issue mid-retreat." },
        { question: "What's the cancellation policy?", answer: "Deposit is non-refundable. Balance has a tiered cancellation schedule. Full terms sent at confirmation." },
        { question: "Are flights and transport included?", answer: "No. You arrange your own travel to ONZE Xpu Ha. We provide arrival logistics and recommended transport options." },
        { question: "What if the retreat is full?", answer: "You stay on the waitlist for the next edition. The community of people interested in this work tends to come back." },
      ]},
      { blockType: "ctaSection", heading: "Two minutes on the form. The rest is gradual.", width: "narrow", align: "center", tone: "cream",
        ctas: [link("Join the waitlist", "#waitlist"), wa("Or write me directly", "signature")] },
    ],
  });

  // ---------- RESOURCES (light) ----------
  await page("resources", {
    title: "Resources",
    metaTitle: "Resources. Breathwork Tulum Blog and Newsletter",
    metaDescription: "Articles, audio practices, and updates on breathwork, somatic coaching, and life transitions. From Sabine at Breathwork Tulum.",
    layout: [
      { blockType: "ctaSection", heading: "Articles, audio practices, and quiet updates.", width: "narrow", align: "center", tone: "cream",
        body: "Writing and short practices on breathwork, somatic coaching, and moving through life transitions. The blog is on its way." },
      { blockType: "richText", heading: "Coming soon.", tone: "sand", width: "narrow",
        body: lex("I'm putting together a small library of writing and audio practices: what happens during a session, nervous system regulation tools, notes on burnout and transitions, and the difference between release and transformation.", "Until then, the most direct way to follow along is the monthly letter. A short note once a month, with new writing and occasional audio practices. Sign up in the footer below."),
        cta: { ...wa("Or message me on WhatsApp", "general"), enabled: true } },
      { blockType: "list", heading: "In the works.", tone: "cream", width: "narrow",
        intro: "A few things I'm building for when you want to keep the work going between sessions.",
        items: items(
          "Audio practices. Short guided breath and regulation practices to use at home.",
          "Mini-courses. Self-paced material on the nervous system, core wounds, and integration.",
          "The monthly letter. Live now, and the easiest way to hear when the rest arrives. Sign up in the footer."),
        note: "No dates yet, and no noise. Just these when they're ready." },
    ],
  });

  // Legal pages live in scripts/seed-legal.ts (full content). Not seeded here
  // to avoid clobbering them.

  payload.logger.info("✅ Phase-2 pages seeded.");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
