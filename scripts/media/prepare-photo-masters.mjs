import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import sharp from "sharp";

// Encoding only: no resizing, sharpening, color grading, cropping, or generation.
// Input pairs were matched by equal dimensions and verified pixel similarity.
const input = process.argv[2];
if (!input) throw new Error("Pass the verified source/master match list");
const matches = JSON.parse(await readFile(input, "utf8"));
const root = "public/media/quality-2026-10-24";
await mkdir(root, { recursive: true });
await mkdir("docs/media", { recursive: true });
const aliases = {};
const assets = [];
const prepared = new Map();
for (const item of matches) {
  if (item.psnrAgainstCurrent < 40) throw new Error(`Uncertain master: ${item.originalUrl}`);
  const source = await sharp(item.master).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (source.info.width !== item.width || source.info.height !== item.height) throw new Error("Master dimensions changed");
  const hash = createHash("sha256").update(source.data).update(`${item.width}x${item.height}`).digest("hex").slice(0, 20);
  const url = `/media/quality-2026-10-24/${hash}.webp`;
  if (!prepared.has(hash)) {
    const file = `public${url}`;
    await sharp(item.master).webp({ lossless: true, effort: 6 }).toFile(file);
    const decoded = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (!source.data.equals(decoded.data)) throw new Error(`Lossless pixel check failed: ${item.originalUrl}`);
    prepared.set(hash, (await stat(file)).size);
  }
  aliases[item.originalUrl] = url;
  assets.push({ ...item, masterUrl: url, masterBytes: prepared.get(hash), pixelExactAgainstPng: true });
}
await writeFile("src/constants/content/photo-masters.json", JSON.stringify(aliases, null, 2) + "\n");
await writeFile("docs/media/photo-quality-2026-10-24.json", JSON.stringify({
  date: "2026-10-24", deliveryQuality: 90, previousDeliveryQuality: 75,
  originalImageCount: matches.length, uniqueMasters: prepared.size,
  masterBytes: [...prepared.values()].reduce((a, b) => a + b, 0),
  geometryAndColorsPreserved: true, assets,
}, null, 2));
console.log(JSON.stringify({ photographs: matches.length, uniqueMasters: prepared.size,
  totalMasterBytes: [...prepared.values()].reduce((a, b) => a + b, 0), pixelExact: true }));
