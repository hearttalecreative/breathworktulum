import { getPayload } from "payload";
import config from "../payload.config";

// Sección H — Gallery. Recorrido visual, no galería convencional.
//
// Su copy se respeta y no se inventa: las secciones cuyo texto todavía no
// escribió quedan creadas pero ocultas (el toggle "Hide this section"), así
// están listas en el panel sin publicar encabezados vacíos.
// Los textos de los espacios son los borradores que ella misma escribió.

const IMG = {
  oceanDeck: 26,      // bw-deck-sea
  jungleTemplo: 11,   // breathwork-tulum-palapa-space
  jungleTulum: 18,    // bw-group-jungle
  practice: [13, 19, 22, 24, 139, 25],
};

const text = (t: string) => ({ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: t, version: 1 });
const para = (t: string) => ({ type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr" as const, children: [text(t)] });
const doc = (...ts: string[]) => ({ root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr" as const, children: ts.map(para) } });

(async () => {
  const p = await getPayload({ config });
  const d = (await p.find({ collection: "pages", where: { slug: { equals: "gallery" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  const hero = (d.layout || []).find((b: any) => b.blockType === "hero");

  const layout = [
    // 1 — hero (su copy actual)
    hero,

    // 1b — texto de apertura. Oculto: lo escribe ella.
    {
      blockType: "richText", hidden: true, tone: "cream", width: "narrow", align: "left",
      heading: "Welcome", body: doc(""),
    },

    // 2 — video drone a todo el ancho. El campo Video URL espera su link;
    // mientras tanto se ve la foto del deck como póster.
    {
      blockType: "mediaFeature", format: "fullScreen", image: IMG.oceanDeck, videoUrl: "",
      eyebrow: "Tulum Jaguar National Park", heading: "", body: "", ctas: [], tone: "night",
    },

    // 3 — Breathwork en práctica
    {
      blockType: "gallery", tone: "cream", width: "wide",
      heading: "Breathwork in practice.",
      images: IMG.practice.map((id) => ({ image: id })),
    },

    // 4 — los espacios. Una imagen grande por espacio, no varias chicas.
    {
      blockType: "richText", tone: "sand", width: "narrow", align: "left",
      eyebrow: "The spaces", heading: "The spaces that hold the work.", body: doc(""),
      hidden: true, // intro de la sección: la escribe ella
    },
    {
      blockType: "mediaFeature", format: "portrait", image: IMG.oceanDeck, videoUrl: "",
      eyebrow: "Space 1 · DiamanteK", heading: "Oceanfront Breathwork Deck",
      body: "A private space part of a boutique hotel overlooking Tulum Beach in Jaguar National Park.",
      ctas: [], tone: "cream",
    },
    {
      blockType: "mediaFeature", format: "portrait", image: IMG.jungleTemplo, videoUrl: "",
      eyebrow: "Space 2 · Playa del Carmen", heading: "Jungle Space, Playa del Carmen",
      body: "A peaceful setting in a private community immersed in the Mayan jungle, surrounded by tropical nature and dedicated wellness spaces.",
      ctas: [], tone: "sand",
    },
    {
      blockType: "mediaFeature", format: "portrait", image: IMG.jungleTulum, videoUrl: "",
      eyebrow: "Space 3 · Tulum", heading: "Jungle Space, Tulum",
      body: "",
      ctas: [], tone: "cream",
      hidden: true, // espera su texto para este espacio
    },

    // 5 — integración en agua. Oculto: está buscando el material.
    {
      blockType: "richText", hidden: true, tone: "sand", width: "narrow", align: "left",
      eyebrow: "In the water", heading: "Water integration", body: doc(""),
    },

    // 6 — invitación de cierre, enlaza a los retiros privados
    {
      blockType: "ctaSection", tone: "cream", width: "narrow", align: "center",
      heading: "Come and breathe here.",
      body: "These spaces are where the private retreats happen. If something here speaks to you, the next step is a conversation.",
      ctas: [
        { label: "Explore Personalized Retreats", variant: "primary", action: "internal", href: "/work-with-me/personalized-retreats/" },
        { label: "Message me", variant: "whatsapp", action: "whatsapp", whatsappContext: "general" },
      ],
    },

    // H-3 — información práctica del parque nacional. Oculto: la escribe ella.
    {
      blockType: "list", hidden: true, tone: "sand", width: "default",
      heading: "Getting to the National Park",
      intro: "",
      items: [],
      note: "",
    },
  ].filter(Boolean);

  await p.update({ collection: "pages", id: d.id, data: { layout } as any, overrideAccess: true });

  const after = (await p.find({ collection: "pages", where: { slug: { equals: "gallery" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any;
  console.log("bloques:", (after.layout || []).map((b: any) => `${b.blockType}${b.format ? ":" + b.format : ""}${b.hidden ? "[oculto]" : ""}`).join(" > "));
  console.log("visibles:", (after.layout || []).filter((b: any) => !b.hidden).length, "| ocultos (esperan su copy):", (after.layout || []).filter((b: any) => b.hidden).length);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
