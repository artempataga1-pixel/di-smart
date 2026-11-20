/** Save a built-in imagegen result as a compact, project-local WebP. */
import sharp from "sharp";
import { mkdir, appendFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
const [source, destination] = process.argv.slice(2);
if (!source || !destination) throw new Error("Expected source and project destination");
const output = resolve(destination);
if (!output.startsWith(resolve("public/media/samsung-color-variants") + "/")) throw new Error("Unexpected destination");
await mkdir(dirname(output), { recursive: true });
await sharp(source).resize({ width: 1254, height: 1254, fit: "inside", withoutEnlargement: true }).webp({ quality: 88, effort: 6 }).toFile(output);
await appendFile("docs/catalog/samsung-color-generation-files.jsonl", JSON.stringify({ source, output, savedAt: new Date().toISOString(), tool: "built-in imagegen" }) + "\n");
console.log(output);
