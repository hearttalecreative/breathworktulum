// Non-destructive content patch: applies the site-consistency audit fixes to
// the live pages in the DB, mirroring the edits made in scripts/seed.ts and
// scripts/seed-phase2.ts. Idempotent: string replaces skip when the old text
// is already gone; block inserts skip when a guard heading is already present.
//
//   npx tsx scripts/apply-audit-fixes.ts --dry   (log changes, write nothing)
//   npx tsx scripts/apply-audit-fixes.ts         (apply)
// Load env before importing the Payload config (it reads DATABASE_URI /
// PAYLOAD_SECRET at module load), so the import is dynamic and happens after.
process.loadEnvFile(".env.local");

const DRY = process.argv.includes("--dry");

const lex = (...paras: string[]) => ({
  root: {
    type: "root", format: "", indent: 0, version: 1, direction: "ltr" as const,
    children: paras.map((t) => ({
      type: "paragraph", version: 1, format: "", indent: 0, direction: "ltr" as const, textFormat: 0,
      children: [{ type: "text", version: 1, text: t, format: 0, detail: 0, mode: "normal", style: "" }],
    })),
  },
});

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
  const mediaId = async (filename: string) => {
    const r = await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1 });
    return r.docs[0]?.id;
  };

  // Recursively replace exact substrings in every string value of a layout.
  const deepReplace = (node: unknown, pairs: [string, string][]): number => {
    let n = 0;
    if (typeof node === "string") return 0; // strings handled by their container
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        if (typeof node[i] === "string") {
          let s = node[i] as string;
          // Guard `!s.includes(b)` keeps superset replacements (b contains a)
          // idempotent so re-runs don't append repeatedly.
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
          // Guard `!s.includes(b)` keeps superset replacements (b contains a)
          // idempotent so re-runs don't append repeatedly.
          for (const [a, b] of pairs) if (s.includes(a) && !s.includes(b)) { s = s.split(a).join(b); n++; }
          rec[k] = s;
        } else n += deepReplace(rec[k], pairs);
      }
    }
    return n;
  };

  const findByAnchor = (layout: Rec[], anchor: string) =>
    layout.find((b) => b.anchor === anchor);

  const patch = async (
    slug: string,
    mutate: (layout: Rec[]) => number
  ) => {
    const page = await getPage(slug);
    if (!page) return log(`  ! ${slug} not found`);
    const layout = (page.layout as Rec[]) || [];
    const before = JSON.stringify(layout);
    const hits = mutate(layout);
    if (JSON.stringify(layout) === before) return log(`  = ${slug} no change`);
    changed++;
    if (DRY) return log(`  ~ ${slug} would change (${hits} edits)`);
    await payload.update({ collection: "pages", id: page.id as never, data: { layout } as never });
    log(`  ✓ ${slug} (${hits} edits)`);
  };

  // ---------- HOME ----------
  await patch("home", (layout) => {
    let n = 0;
    // 1. H1 + sub
    const hero = layout.find((b) => b.blockType === "hero") as Rec | undefined;
    if (hero && hero.heading !== "Breathwork in Tulum for life transitions and deeper emotional work.") {
      hero.heading = "Breathwork in Tulum for life transitions and deeper emotional work.";
      hero.lede = "For people who are functioning on the outside, but know something deeper is asking for change.";
      n++;
    }
    // 7. drop-in card + 4. retreat date
    n += deepReplace(layout, [
      ["Open to drop ins.", "Open group formats, booked ahead."],
      ["Limited to twenty places. First retreat Q1 2026.", "Limited to twenty places. First edition late 2026 or early 2027, announced to the waitlist first."],
    ]);
    // 2. core wounds bridge, after the situations block
    const hasBridge = layout.some((b) => b.heading === "Underneath the surface.");
    if (!hasBridge) {
      const idx = layout.findIndex((b) => b.blockType === "situations");
      const at = idx >= 0 ? idx + 1 : 1;
      layout.splice(at, 0, {
        blockType: "richText", heading: "Underneath the surface.", tone: "cream", width: "narrow",
        body: lex("Many of the challenges we experience on the surface, stress, overthinking, relationship patterns, burnout, are often connected to deeper emotional imprints, sometimes referred to as core wounds. This work helps you access and understand those patterns through the body, not just the mind."),
      });
      n++;
    }
    return n;
  });

  // ---------- THE METHOD ----------
  await patch("the-method", (layout) => {
    let n = 0;
    const hasCW = layout.some((b) => b.heading === "Core wounds, and why we work through the body.");
    if (!hasCW) {
      const idx = layout.findIndex((b) => b.heading === "What it actually feels like.");
      const at = idx >= 0 ? idx + 1 : layout.length;
      layout.splice(at, 0, {
        blockType: "richText", heading: "Core wounds, and why we work through the body.", tone: "cream", width: "narrow",
        body: lex(
          "A lot of what we struggle with on the surface, the overthinking, the same relationship pattern on repeat, the burnout that rest doesn't fix, traces back to something older. Emotional imprints from earlier moments that taught your nervous system how to brace. These are what I mean by core wounds.",
          "They don't live in the thinking mind, which is why understanding them rarely resolves them. They live in the body, in how you hold tension, in what your system reaches for under pressure before you've decided anything.",
          "When the breath softens the nervous system, those imprints become reachable. Not to relive them, but to let the body finish what it never got to. That's the layer talking alone keeps circling but can't quite touch."),
      });
      n++;
    }
    return n;
  });

  // ---------- PRIVATE SESSIONS ----------
  await patch("work-with-me/private-sessions", (layout) => {
    let n = 0;
    // 9. Foundation duration
    n += deepReplace(layout, [["The Foundation is the entry point. Two hours,", "The Foundation is the entry point. 2 to 2.5 hours,"]]);
    // 3. prices (per anchor)
    const found = findByAnchor(layout, "foundation");
    if (found && found.investment !== "Investment shared when we talk. Couples welcome.") { found.investment = "Investment shared when we talk. Couples welcome."; n++; }
    const imm = findByAnchor(layout, "immersive");
    if (imm && imm.investment !== "Investment shared when we talk. Couples welcome.") { imm.investment = "Investment shared when we talk. Couples welcome."; n++; }
    const oneDay = findByAnchor(layout, "one-day");
    if (oneDay && oneDay.investment !== "Investment shared when we talk. Available for one or two people.") { oneDay.investment = "Investment shared when we talk. Available for one or two people."; n++; }
    // 2. core wound included items
    const addIncl = (block: Rec | undefined, text: string, afterContains: string) => {
      if (!block) return 0;
      const inc = (block.included as Rec[]) || [];
      if (inc.some((i) => i.text === text)) return 0;
      const at = inc.findIndex((i) => typeof i.text === "string" && (i.text as string).includes(afterContains));
      inc.splice(at >= 0 ? at + 1 : inc.length, 0, { text });
      block.included = inc;
      return 1;
    };
    n += addIncl(found, "A Life Alignment or Core Wound snapshot, so you leave with a sense of the deeper pattern.", "guided breathwork");
    n += addIncl(imm, "Core wound decoding, connecting what surfaces to the pattern underneath.", "conversational integration");
    return n;
  });

  // ---------- PERSONALIZED RETREATS ----------
  const jungleImg = await mediaId("bw-group-jungle.jpg");
  await patch("work-with-me/personalized-retreats", (layout) => {
    let n = 0;
    const setInv = (anchor: string, value: string) => {
      const b = findByAnchor(layout, anchor);
      if (b && b.investment !== value) { b.investment = value; return 1; }
      return 0;
    };
    n += setInv("formats", "From $18,000 MXN + IVA.");
    n += setInv("five-day", "From $26,000 MXN.");
    n += setInv("custom", "Custom quotes after a discovery call.");
    n += setInv("virtual", "From $15,000 MXN for three sessions, $21,000 MXN for five.");
    // 8. Breathwork Spaces + Diamantek, after the Riviera Maya photoBand
    const hasSpaces = layout.some((b) => b.heading === "The spaces I work in.");
    if (!hasSpaces) {
      const idx = layout.findIndex((b) => b.blockType === "photoBand" && b.eyebrow === "Riviera Maya");
      const at = idx >= 0 ? idx + 1 : layout.length;
      layout.splice(at, 0,
        {
          blockType: "richText", heading: "The spaces I work in.", tone: "cream", width: "narrow",
          body: lex(
            "Where the work happens matters. My primary breathwork deck is at Diamantek, a featured location between Tulum and Playa del Carmen, open to the jungle and built for this kind of stillness.",
            "I also hold work on a deck inside a national park, and in a jungle space near Playa. Each one is chosen so the setting can hold the work, not pull you out of it."),
        },
        {
          blockType: "photoBand", image: jungleImg, height: "standard",
          eyebrow: "Diamantek · the jungle deck", caption: "My primary breathwork deck, open to the jungle.",
        }
      );
      n++;
    }
    return n;
  });

  // ---------- GROUP PRACTICE ----------
  await patch("work-with-me/group-practice", (layout) =>
    deepReplace(layout, [
      ["Group practice. Two ways to drop in.", "Group practice. Two ways in."],
      ["Same method, two containers, both open to drop ins.", "Same method, two containers, both booked ahead."],
      ["Drop in.", "Find a date."],
    ])
  );

  // ---------- WORK WITH ME (hub) ----------
  await patch("work-with-me", (layout) =>
    deepReplace(layout, [["Open to drop ins.", "Open group formats, booked ahead."]])
  );

  // ---------- CORPORATE ----------
  await patch("work-with-me/corporate", (layout) =>
    deepReplace(layout, [
      ["I know what kind of intervention actually integrates into a working schedule.", "I know what kind of work actually integrates into a working schedule."],
      ["The reason this works where other interventions don't:", "The reason this works where other approaches don't:"],
    ])
  );

  // ---------- SIGNATURE RETREAT ----------
  await patch("retreat-riviera-maya-2026", (layout) =>
    deepReplace(layout, [
      ["Signature Event · Riviera Maya · 2026", "Signature Event · Riviera Maya · 2026/2027"],
      ["Five days. Twenty people. One process. Riviera Maya, 2026.", "Five days. Twenty people. One process. Riviera Maya."],
      ["ONZE Xpu Ha · Q1 2026", "ONZE Xpu Ha · 2026/2027"],
      ["First retreat: Q1 2026.", "First edition: late 2026 or early 2027."],
      ["The first edition is scheduled for Q1 2026.", "The first edition is being scheduled for late 2026 or early 2027."],
      ["Investment: $[price on inquiry]. Payment plan available.", "Investment shared with the waitlist first. Payment plan available."],
      ["$[price on inquiry] per person. Includes accommodation, meals, all sessions, materials.", "The investment covers accommodation, meals, all sessions, and materials. I share the full figure with the waitlist first, along with the payment plan."],
      ["First edition Q1 2026. Dates to be confirmed", "First edition is being scheduled for late 2026 or early 2027. Dates to be confirmed"],
    ])
  );

  // metaDescription is a top-level field, not part of layout — patch it too.
  const patchMeta = async (slug: string, next: Rec) => {
    const page = await getPage(slug);
    if (!page) return log(`  ! ${slug} not found`);
    const changes: Rec = {};
    const cur = page as unknown as Rec;
    for (const k of Object.keys(next)) if (cur[k] !== next[k]) changes[k] = next[k];
    if (!Object.keys(changes).length) return log(`  = ${slug} meta no change`);
    changed++;
    if (DRY) return log(`  ~ ${slug} meta would change (${Object.keys(changes).join(", ")})`);
    await payload.update({ collection: "pages", id: page.id as never, data: changes as never });
    log(`  ✓ ${slug} meta (${Object.keys(changes).join(", ")})`);
  };
  await patchMeta("retreat-riviera-maya-2026", {
    metaDescription: "Five day group breathwork retreat in Xpu Ha, Riviera Maya. Limited to twenty places. First edition late 2026 or early 2027. Join the waitlist.",
  });

  // ---------- CONTACT ----------
  await patch("contact", (layout) =>
    deepReplace(layout, [["Booking link coming soon", "By WhatsApp or email"]])
  );

  // ---------- RESOURCES ----------
  await patch("resources", (layout) => {
    if (layout.some((b) => b.heading === "In the works.")) return 0;
    layout.push({
      blockType: "list", heading: "In the works.", tone: "cream", width: "narrow",
      intro: "A few things I'm building for when you want to keep the work going between sessions.",
      items: [
        { text: "Audio practices. Short guided breath and regulation practices to use at home." },
        { text: "Mini-courses. Self-paced material on the nervous system, core wounds, and integration." },
        { text: "The monthly letter. Live now, and the easiest way to hear when the rest arrives. Sign up in the footer." },
      ],
      note: "No dates yet, and no noise. Just these when they're ready.",
    });
    return 1;
  });

  log(DRY ? `\nDRY RUN. ${changed} page(s) would change.` : `\n✅ Applied. ${changed} page(s) changed.`);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });

export {};
