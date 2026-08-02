import sharp from "sharp";
import { readFileSync } from "fs";

// Locate the top of the "k" (last letter of "Breathwork") and the bottom of the
// "m" (last letter of "Tulum") so the divider rule can span exactly that, per
// the client's reference — brief D-2.
const VB_W = 612.18, VB_H = 128.25;
const SCALE = 8;
const DIVIDER_X = 406.79;

(async () => {
  const svg = readFileSync("public/brand/logo-color.svg");
  const W = Math.round(VB_W * SCALE), H = Math.round(VB_H * SCALE);
  const { data, info } = await sharp(svg, { density: 72 * SCALE })
    .resize(W, H, { fit: "fill" })
    .flatten({ background: "#ffffff" })
    .greyscale().raw().toBuffer({ resolveWithObject: true });

  const ink = (x: number, y: number) => data[y * info.width + x] < 200;
  const dx = Math.round(DIVIDER_X * SCALE) - 6;
  const toVb = (v: number) => +(v / SCALE).toFixed(2);

  // Row profile of the wordmark area → find the two text bands.
  const rows: number[] = [];
  for (let y = 0; y < info.height; y++) {
    let n = 0;
    for (let x = 0; x < dx; x++) if (ink(x, y)) n++;
    rows.push(n);
  }
  const bands: { top: number; bottom: number }[] = [];
  let start = -1;
  for (let y = 0; y < rows.length; y++) {
    const on = rows[y] > 2;
    if (on && start < 0) start = y;
    if ((!on || y === rows.length - 1) && start >= 0) {
      if (y - start > SCALE * 2) bands.push({ top: start, bottom: y });
      start = -1;
    }
  }
  console.log("bands (vb):", bands.map((b) => `${toVb(b.top)}→${toVb(b.bottom)}`).join("  "));

  // Rightmost ink column per band → the final letter (k on line 1, m on line 2).
  const lastLetter = (band: { top: number; bottom: number }) => {
    let right = 0;
    for (let x = dx - 1; x >= 0; x--) {
      let has = false;
      for (let y = band.top; y <= band.bottom; y++) if (ink(x, y)) { has = true; break; }
      if (has) { right = x; break; }
    }
    // scan a window the width of one glyph back from the right edge
    const x0 = Math.max(0, right - Math.round(11 * SCALE));
    let top = -1, bottom = -1;
    for (let y = 0; y < info.height; y++) {
      let has = false;
      for (let x = x0; x <= right; x++) if (ink(x, y)) { has = true; break; }
      if (has) { if (top < 0) top = y; bottom = y; }
    }
    return { right, top, bottom };
  };

  const k = lastLetter(bands[0]);
  const m = lastLetter(bands[bands.length - 1]);
  console.log(`"k"  top: ${toVb(k.top)}   (rightmost x ${toVb(k.right)})`);
  console.log(`"m"  bottom: ${toVb(m.bottom)} (rightmost x ${toVb(m.right)})`);
  const y = toVb(k.top), h = +(toVb(m.bottom) - y).toFixed(2);
  console.log(`RULE → y="${y}" height="${h}"   (current y=12.12 height=104)`);
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
