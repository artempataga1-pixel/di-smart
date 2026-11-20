import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Build-time metadata only; original pixels are never resized or cropped.
const dimensions = {};
async function visit(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) await visit(file);
    else if (/\.(png|webp|jpe?g|avif)$/i.test(item.name) && !item.name.startsWith("._")) {
      const { width, height } = await sharp(file).metadata();
      if (width && height) dimensions[`/${file.replace(/^public\//, "")}`] = [width, height];
    }
  }
}
await visit("public/media");
await writeFile("src/constants/content/product-photo-dimensions.json", JSON.stringify(dimensions, null, 2) + "\n");
console.log(`Indexed ${Object.keys(dimensions).length} image dimensions`);
