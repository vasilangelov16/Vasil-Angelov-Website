/**
 * Generates responsive hero WebP/AVIF under public/images/ and compresses biography JPEG.
 * Hero: place a full-size source PNG at `src/assets/hero-singer.png`, then run this script
 * (committed outputs live in `public/images/`; the source PNG is optional in the repo).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicImages = path.join(root, "public", "images");

fs.mkdirSync(publicImages, { recursive: true });

const heroSrc = path.join(root, "src", "assets", "hero-singer.png");
const biographySrc = path.join(root, "src", "assets", "biography-singer.jpg");

if (fs.existsSync(heroSrc)) {
  const widths = [1280, 1920, 2560];
  for (const w of widths) {
    const out = path.join(publicImages, `hero-${w}.webp`);
    await sharp(heroSrc)
      .resize(w, null, { withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toFile(out);
    const st = fs.statSync(out);
    console.log(`Wrote ${path.relative(root, out)} (${(st.size / 1024).toFixed(1)} KB)`);
  }

  for (const w of [1920, 2560]) {
    const out = path.join(publicImages, `hero-${w}.avif`);
    await sharp(heroSrc)
      .resize(w, null, { withoutEnlargement: true })
      .avif({ quality: 58, effort: 6 })
      .toFile(out);
    const st = fs.statSync(out);
    console.log(`Wrote ${path.relative(root, out)} (${(st.size / 1024).toFixed(1)} KB)`);
  }
} else {
  console.warn("Skip hero: missing", path.relative(root, heroSrc));
}

if (fs.existsSync(biographySrc)) {
  const tmp = path.join(root, "src", "assets", "biography-singer.jpg.tmp");
  await sharp(biographySrc)
    .resize(1600, null, { withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(tmp);
  fs.renameSync(tmp, biographySrc);
  const st = fs.statSync(biographySrc);
  console.log(`Updated biography-singer.jpg (${(st.size / 1024).toFixed(1)} KB)`);
} else {
  console.warn("Skip biography: missing", path.relative(root, biographySrc));
}

console.log("Done.");
