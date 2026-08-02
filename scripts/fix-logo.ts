import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";

// Brief D-1/D-2/D-3 — logo corrections applied to the exported SVGs.
//   D-1  slogan too light  → deepen the gold on light backgrounds (AA-safe
//        #8a6a18 from the palette); lift it on dark backgrounds.
//   D-2  divider rule was aligned to the slogan block (12.12→116.12), which
//        left it short and floating. Measured: top of "k" = 21.5, bottom of
//        "m" = 127 → y="21.5" height="105.5".
//   D-3  register mark was missing entirely; add it after "TRANSFORM."
const RULE_FROM = /<rect([^>]*?)y="12\.12"([^>]*?)height="104"/;
const RULE_TO = '<rect$1y="21.5"$2height="105.5"';

const VB_W = 612.18, VB_H = 128.25, SCALE = 6, DIVIDER_X = 406.79;

async function sloganAnchor(): Promise<{ right: number; bottom: number }> {
  const svg = readFileSync("public/brand/logo-color.svg");
  const W = Math.round(VB_W * SCALE), H = Math.round(VB_H * SCALE);
  const { data, info } = await sharp(svg, { density: 72 * SCALE })
    .resize(W, H, { fit: "fill" }).flatten({ background: "#ffffff" })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const ink = (x: number, y: number) => data[y * info.width + x] < 220;
  const dx = Math.round(DIVIDER_X * SCALE) + 12;
  // last slogan line = bottom-most band on the slogan side
  let bottom = 0, right = 0;
  for (let y = info.height - 1; y >= 0; y--) {
    let has = false;
    for (let x = dx; x < info.width; x++) if (ink(x, y)) { has = true; break; }
    if (has) { bottom = y; break; }
  }
  const bandTop = Math.max(0, bottom - Math.round(12 * SCALE));
  for (let x = info.width - 1; x >= dx; x--) {
    let has = false;
    for (let y = bandTop; y <= bottom; y++) if (ink(x, y)) { has = true; break; }
    if (has) { right = x; break; }
  }
  return { right: +(right / SCALE).toFixed(2), bottom: +(bottom / SCALE).toFixed(2) };
}

(async () => {
  const anchor = await sloganAnchor();
  console.log("slogan last line — right:", anchor.right, "bottom:", anchor.bottom);

  const files: { file: string; gold?: string; mark: string }[] = [
    { file: "logo-color.svg", gold: "#8a6a18", mark: "#8a6a18" }, // on light
    { file: "logo-white.svg", gold: "#c9b47c", mark: "#c9b47c" }, // on dark
    { file: "logo-allb.svg", mark: "#fff" },                       // all-white variant
  ];

  for (const f of files) {
    const path = `public/brand/${f.file}`;
    let svg = readFileSync(path, "utf8");

    // D-2 — realign the divider rule.
    const hadRule = RULE_FROM.test(svg);
    svg = svg.replace(RULE_FROM, RULE_TO);

    // D-1 — slogan contrast.
    if (f.gold) svg = svg.split("#a59449").join(f.gold);

    // D-3 — register mark after "TRANSFORM.". The slogan already runs to the
    // right edge of the artboard, so widen the viewBox to make room instead of
    // letting the mark clip.
    if (!svg.includes('id="regmark"')) {
      const PAD = 20;
      svg = svg.replace(
        /viewBox="0 0 612\.18 128\.25"/,
        `viewBox="0 0 ${(612.18 + PAD).toFixed(2)} 128.25"`
      );
      const x = anchor.right + 4;
      const y = anchor.bottom - 1; // sits on the last slogan line
      const reg = `<text id="regmark" x="${x}" y="${y}" font-family="Georgia, 'Times New Roman', serif" font-size="12" fill="${f.mark}">®</text>`;
      svg = svg.replace(/<\/svg>\s*$/, `  ${reg}\n</svg>\n`);
    }

    writeFileSync(path, svg);
    console.log(`${f.file}: rule ${hadRule ? "realigned" : "NOT FOUND"}${f.gold ? `, gold → ${f.gold}` : ""}, ® added`);
  }
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
