import sharp from "sharp";
import { readFileSync } from "fs";

// Which parts of the logo carry .cls-1 (the gold) — the wordmark or the slogan?
// Paint it red, render, and report where the red ink lands relative to the rule.
const VB_W = 612.18, VB_H = 128.25, SCALE = 6, DIVIDER_X = 406.79;

(async () => {
  const raw = readFileSync("public/brand/logo-color.svg", "utf8");
  const probe = raw.split("#a59449").join("#ff0000");
  const W = Math.round(VB_W * SCALE), H = Math.round(VB_H * SCALE);
  const { data, info } = await sharp(Buffer.from(probe), { density: 72 * SCALE })
    .resize(W, H, { fit: "fill" }).flatten({ background: "#ffffff" })
    .raw().toBuffer({ resolveWithObject: true });

  const dx = Math.round(DIVIDER_X * SCALE);
  let redLeft = 0, redRight = 0, darkLeft = 0, darkRight = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const isRed = r > 150 && g < 90 && b < 90;
      const isDark = r < 90 && g < 90 && b < 90;
      if (isRed) (x < dx ? redLeft++ : redRight++);
      if (isDark) (x < dx ? darkLeft++ : darkRight++);
    }
  }
  console.log("RED (.cls-1) px  — wordmark side:", redLeft, " slogan side:", redRight);
  console.log("DARK px          — wordmark side:", darkLeft, " slogan side:", darkRight);
  console.log(redRight > redLeft ? "=> .cls-1 = SLOGAN (gold)" : "=> .cls-1 = WORDMARK (gold)");
  process.exit(0);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
