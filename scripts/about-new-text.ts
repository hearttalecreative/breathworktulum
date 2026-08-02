import { getPayload } from "payload";
import config from "../payload.config";

// Brief G-1/G-2/G-3 — About rebuilt with Sabine's 30 July text.
// "How I got here" becomes three chapters; the first stays visible and the two
// that follow sit behind a Read more that expands in place. Idempotent.

const lex = (...paras: string[]) => ({
  root: {
    type: "root", format: "", indent: 0, version: 1, direction: "ltr" as const,
    children: paras.map((t) => ({
      type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr" as const,
      children: [{ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: t, version: 1 }],
    })),
  },
});

const STORY = {
  blockType: "expandableStory",
  heading: "How I got here.",
  moreLabel: "Read more",
  tone: "cream",
  width: "narrow",
  chapters: [
    {
      title: "The life I had created",
      collapsed: false,
      body: lex(
        "I spent twenty years building an international corporate career, including global management and leadership roles, while living and working across seven countries. From the outside, I had created a successful life. But beneath it, I was becoming increasingly disconnected from my body, and from myself.",
        "Around my thirtieth birthday, following another career change and the end of my marriage, chronic stress began to take hold. At the time, I did not understand what was happening or what my body was trying to communicate. I continued moving forward, adapting and achieving, while becoming increasingly anxious, overwhelmed and disconnected within."
      ),
    },
    {
      title: "The turning point",
      collapsed: true,
      body: lex(
        "Breathwork found me in Amsterdam in 2015, during one of the most challenging periods of my life. It also marked the beginning of one of the most profound chapters of my personal development.",
        "Through the breath, I began listening to my body differently. I wanted to understand why I was not breathing fully, how my nervous system had adapted to years of stress, and how deeper emotional wounds and patterns were influencing the life I had created.",
        "Then, one day during a meeting, something became unmistakably clear: this life was no longer healthy for me. I stood up, walked out and never returned to an office. It was not an impulsive escape. It was the moment I finally listened to what my body had been telling me for years.",
        "I stepped away from corporate life and gave myself two years to travel, reset and reconnect with who I was beneath the roles, expectations and life I had known."
      ),
    },
    {
      title: "My calling",
      collapsed: true,
      body: lex(
        "What began as my own healing journey gradually became the work I now share with others. I trained directly with the founders of Clarity Breathwork™ and continued deepening my understanding of somatic work, the nervous system, emotional patterns and personal transformation.",
        "Today, I do not guide people to immediately walk away from the lives, relationships or businesses they have built simply because something has become difficult. I guide them to first turn inward, listen to what their bodies are communicating and understand the deeper wounds, patterns and responses shaping their experience.",
        "When we begin to understand our inner world, we also begin to see our outer world more clearly. We gain a deeper understanding of ourselves, our relationships and the circumstances we have created or remained within. From that place, we may discover how to create a better alignment with the life we already have and reconnect with a deeper sense of meaning and purpose in what we do. And when change is needed, it is no longer driven only by fear, overwhelm or the desire to escape, but by greater awareness, clarity and connection with who we truly are."
      ),
    },
  ],
};

const HOLD_BODY = lex(
  "I meet every person with presence, compassion and curiosity. I am not here to heal you or tell you who to become. I create a safe and supportive space in which your body can reveal what is ready to be felt, understood and transformed.",
  "I work gently and intuitively, without rushing the process. We make space for your story, while also listening beneath it, to the breath, the body, the nervous system and the deeper patterns that words alone may not reach.",
  "Sometimes the work calls for stillness. Sometimes it asks us to explore more deeply or gently move beyond what feels familiar. I meet you where you are, while supporting you in moving towards where you are ready to go.",
  "The work is yours, but you do not have to move through it alone."
);

(async () => {
  const p = await getPayload({ config });
  const d = (await p.find({ collection: "pages", where: { slug: { equals: "about" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;

  let replacedStory = 0, replacedHold = 0, renamedTraining = 0;

  let layout = (d.layout || []).map((b: any) => {
    const heading = (b.heading || "").toLowerCase();

    // G-1/G-2/G-3 — "How I got here" becomes the chaptered, expandable story.
    if ((b.blockType === "richText" || b.blockType === "expandableStory") && heading.includes("how i got here")) {
      replacedStory++;
      return { ...STORY, anchor: b.anchor };
    }

    // "How I hold the work" — her new text.
    if (b.blockType === "richText" && heading.includes("how i hold the work")) {
      replacedHold++;
      return { ...b, heading: "How I hold the work.", body: HOLD_BODY };
    }

    // Section 3 title only; her copy for it hasn't arrived, so the existing
    // training content stays as-is under the new heading.
    if (heading.includes("training")) {
      renamedTraining++;
      return { ...b, heading: "Training, certifications and lineage." };
    }

    return b;
  });

  await p.update({ collection: "pages", id: d.id, data: { layout } as any, overrideAccess: true });
  console.log("G-3 story block:", replacedStory, "| how-i-hold:", replacedHold, "| training heading:", renamedTraining);

  // Verify the retired copy is gone and the new copy is in.
  const after = JSON.stringify((await p.find({ collection: "pages", where: { slug: { equals: "about" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]);
  console.log("old copy (Orbitz/Booking) still present:", /Orbitz|Booking/.test(after));
  console.log("new copy present:", after.includes("seven countries"), "| chapters:", (after.match(/The turning point|My calling|The life I had created/g) || []).length);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
