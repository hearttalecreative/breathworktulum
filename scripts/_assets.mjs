import sharp from "sharp";
import { readFileSync } from "fs";

const dark = "#191b17";
const IMG_5306 = "../IMAGES/BW - Sabine profile pics 2020 - 2024/IMG_5306.JPG";

// --- App icons: gold square + white wave (app/icon.svg) ---
const square = readFileSync("app/icon.svg");
const iconTargets = [
  ["app/apple-icon.png", 180],
  ["app/icon.png", 64],
  ["public/brand/icon-192.png", 192],
  ["public/brand/icon-512.png", 512],
];
for (const [file, size] of iconTargets) {
  await sharp(square).resize(size, size).png().toFile(file);
  console.log("icon →", file);
}

// --- Hero poster (shown while the video loads) ---
await sharp(IMG_5306)
  .rotate()
  .resize({ width: 1920 })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/hero/hero-poster.jpg");
console.log("poster → public/hero/hero-poster.jpg");

// --- OG card: IMG_5306, cover-cropped to 1200×630, gentle scrim + white logo ---
const base = await sharp(IMG_5306)
  .rotate()
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .toBuffer();

const scrim = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${dark}" stop-opacity="0.10"/>
        <stop offset="55%" stop-color="${dark}" stop-opacity="0"/>
        <stop offset="100%" stop-color="${dark}" stop-opacity="0.72"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#g)"/>
  </svg>`
);

const logo = await sharp(readFileSync("public/brand/logo-allb.svg"))
  .resize({ width: 360 })
  .png()
  .toBuffer();
const logoH = Math.round(360 * (128.25 / 612.18));

await sharp(base)
  .composite([
    { input: scrim, top: 0, left: 0 },
    { input: logo, top: 630 - logoH - 46, left: 60 },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile("public/images/og-default.jpg");
console.log("og → public/images/og-default.jpg");
