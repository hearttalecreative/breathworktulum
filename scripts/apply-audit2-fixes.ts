// Non-destructive patch for audit-2 changes that live OUTSIDE the phase-2 seed
// (the 5 MVP pages + the header/siteSettings globals + the DB-only
// resources/newsletter page). Phase-2 pages are refreshed by re-running
// scripts/seed-phase2.ts. Idempotent.
//
//   npx tsx scripts/apply-audit2-fixes.ts --dry
//   npx tsx scripts/apply-audit2-fixes.ts
process.loadEnvFile(".env.local");

const DRY = process.argv.includes("--dry");
type Rec = Record<string, unknown>;

async function run() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  let changed = 0;
  const log = (m: string) => payload.logger.info(m);

  const getPage = async (slug: string) => {
    const r = await payload.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
    return r.docs[0];
  };

  const deepReplace = (node: unknown, pairs: [string, string][]): number => {
    let n = 0;
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        if (typeof node[i] === "string") {
          let s = node[i] as string;
          for (const [a, b] of pairs) if (s.includes(a) && !s.includes(b)) { s = s.split(a).join(b); n++; }
          node[i] = s;
        } else n += deepReplace(node[i], pairs);
      }
      return n;
    }
    if (node && typeof node === "object") {
      const rec = node as Rec;
      for (const k of Object.keys(rec)) {
        if (typeof rec[k] === "string") {
          let s = rec[k] as string;
          for (const [a, b] of pairs) if (s.includes(a) && !s.includes(b)) { s = s.split(a).join(b); n++; }
          rec[k] = s;
        } else n += deepReplace(rec[k], pairs);
      }
    }
    return n;
  };

  const patch = async (slug: string, mutate: (layout: Rec[]) => number) => {
    const page = await getPage(slug);
    if (!page) return log(`  ! ${slug} not found`);
    const layout = (page.layout as Rec[]) || [];
    const before = JSON.stringify(layout);
    mutate(layout);
    if (JSON.stringify(layout) === before) return log(`  = ${slug} no change`);
    changed++;
    if (DRY) return log(`  ~ ${slug} would change`);
    await payload.update({ collection: "pages", id: page.id as never, data: { layout } as never });
    log(`  ✓ ${slug}`);
  };

  // HOME — 1 Day Group Retreats naming
  await patch("home", (layout) =>
    deepReplace(layout, [["Weekly 1 Day Retreats", "Weekly 1 Day Group Retreats"]])
  );

  // PRIVATE SESSIONS — inner child on the 1 Day Private Retreat
  await patch("work-with-me/private-sessions", (layout) =>
    deepReplace(layout, [[
      "Somatic coaching and conversation.",
      "Somatic coaching and conversation, with space for inner child themes when they surface.",
    ]])
  );

  // CONTACT — Discovery Call tile now routes to WhatsApp
  await patch("contact", (layout) => {
    let n = 0;
    for (const b of layout) {
      if (b.blockType !== "contactTiles") continue;
      for (const tile of (b.tiles as Rec[]) || []) {
        if (tile.title === "Discovery Call" && tile.action !== "whatsapp") {
          tile.action = "whatsapp";
          tile.whatsappContext = "discoveryCall";
          n++;
        }
      }
    }
    return n;
  });

  // HEADER global — Retreats dropdown + submenu micro-copy, remove flat Retreats
  {
    const header = (await payload.findGlobal({ slug: "header" })) as unknown as Rec;
    const hasRetreats = Array.isArray(header.retreats) && (header.retreats as unknown[]).length > 0;
    if (hasRetreats) {
      log("  = header no change");
    } else {
      changed++;
      const data = {
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
        primary: [
          { label: "The Method", href: "/the-method/" },
          { label: "About", href: "/about/" },
          { label: "Contact", href: "/contact/" },
        ],
      };
      if (DRY) log("  ~ header would change");
      else { await payload.updateGlobal({ slug: "header", data: data as never }); log("  ✓ header"); }
    }
  }

  // SITE SETTINGS global — discoveryCall WhatsApp preset
  {
    const s = (await payload.findGlobal({ slug: "siteSettings" })) as unknown as Rec;
    const msgs = (s.whatsappMessages as Rec[]) || [];
    if (msgs.some((m) => m.context === "discoveryCall")) {
      log("  = siteSettings no change");
    } else {
      changed++;
      const next = [...msgs];
      const at = next.findIndex((m) => m.context === "contact");
      next.splice(at >= 0 ? at : next.length, 0, {
        context: "discoveryCall",
        message: "Hi Sabine, I'd like to book a discovery call about a retreat.",
      });
      if (DRY) log("  ~ siteSettings would change");
      else { await payload.updateGlobal({ slug: "siteSettings", data: { whatsappMessages: next } as never }); log("  ✓ siteSettings"); }
    }
  }

  // RESOURCES / NEWSLETTER page — swap the contact form for the newsletter
  // signup. Replace the whole block (fresh object, no id) so Drizzle doesn't
  // trip on the changed block discriminator.
  await patch("resources/newsletter", (layout) => {
    let n = 0;
    for (let i = 0; i < layout.length; i++) {
      if (layout[i].blockType === "contactForm") {
        layout[i] = {
          blockType: "newsletter",
          heading: (layout[i].heading as string) || "Join the letter.",
          intro: "Drop your email below. A short note once a month, and one-click unsubscribe.",
          tone: (layout[i].tone as string) || "cream",
        };
        n++;
      }
    }
    return n;
  });

  log(DRY ? `\nDRY RUN. ${changed} change(s).` : `\n✅ Applied. ${changed} change(s).`);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });

export {};
