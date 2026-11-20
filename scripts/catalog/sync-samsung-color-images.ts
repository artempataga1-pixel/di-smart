import { config } from "dotenv";
import { access, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";
import manifest from "../../prisma/samsung-color-images.json";
import { syncSamsungColorImages } from "../../prisma/sync-samsung-color-images";
config({ path: ".env.local", quiet: true }); config({ quiet: true });
const db = new PrismaClient({ adapter: createDatabaseAdapter() });
async function main() {
  for (const colors of Object.values(manifest)) for (const url of Object.values(colors)) {
    if (!url.startsWith("/media/")) throw new Error("Expected local product image");
    await access(resolve("public", url.slice(1)));
  }
  const products = await db.product.findMany({ where: { slug: { in: Object.keys(manifest) } },
    include: { images: true, variants: true, colorValues: { include: { attributeValue: true, offers: true } } } });
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({ products: products.length, colors: Object.values(manifest).reduce((n, c) => n + Object.keys(c).length, 0), mode: "preview" })); return;
  }
  await mkdir("docs/catalog", { recursive: true });
  const backup = `docs/catalog/samsung-color-images-before-sync-${new Date().toISOString().replaceAll(":", "-")}.json`;
  await writeFile(backup, JSON.stringify({ capturedAt: new Date().toISOString(), products }, null, 2), { flag: "wx", mode: 0o600 });
  console.log(JSON.stringify(await syncSamsungColorImages(db))); console.log("Backup:", backup);
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Samsung image sync failed"); process.exitCode = 1; }).finally(() => db.$disconnect());
