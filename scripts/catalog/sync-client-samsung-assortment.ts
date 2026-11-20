import { config } from "dotenv";
import { mkdir, writeFile } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";
import { CLIENT_SAMSUNG_ASSORTMENT } from "../../prisma/client-samsung-assortment";
import { syncClientSamsung } from "../../prisma/sync-client-samsung";
import { syncSamsungColorImages } from "../../prisma/sync-samsung-color-images";
config({ path: ".env.local", quiet: true });
config({ quiet: true });
const slugs = process.argv.find(arg => arg.startsWith("--slugs="))?.slice(8).split(",");
const definitions = slugs ? CLIENT_SAMSUNG_ASSORTMENT.filter(p => slugs.includes(p.slug)) : CLIENT_SAMSUNG_ASSORTMENT;
if (slugs && definitions.length !== new Set(slugs).size) throw new Error("Unknown Samsung assortment slug");
const db = new PrismaClient({ adapter: createDatabaseAdapter() });
async function main() {
try {
  const current = await db.product.findMany({ where: { slug: { in: definitions.map(p => p.slug) } },
    include: { variants: { include: { options: true, colorOffers: true } }, colorValues: true, images: true, specs: true, variantAttributes: true } });
  console.log(JSON.stringify({ expectedProducts: definitions.length, configurations: definitions.reduce((n, p) => n + p.configurations.length, 0),
    create: definitions.filter(p => !current.some(c => c.slug === p.slug)).map(p => p.slug) }, null, 2));
  if (process.argv.includes("--apply")) {
    await mkdir("docs/catalog", { recursive: true });
    const backup = `docs/catalog/client-samsung-before-sync-${new Date().toISOString().replaceAll(":", "-")}.json`;
    await writeFile(backup, JSON.stringify({ capturedAt: new Date().toISOString(), products: current }, null, 2), { flag: "wx", mode: 0o600 });
    console.log("Backup:", backup);
    console.log(JSON.stringify(await syncClientSamsung(db, slugs), null, 2));
    console.log(JSON.stringify(await syncSamsungColorImages(db, slugs), null, 2));
  } else console.log("Read-only preview. Add --apply to sync.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Samsung sync failed");
  process.exitCode = 1;
} finally { await db.$disconnect(); }
}
void main();
