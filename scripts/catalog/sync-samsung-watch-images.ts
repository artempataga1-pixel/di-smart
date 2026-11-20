import assert from "node:assert/strict";
import { config } from "dotenv";
import { access, mkdir, writeFile } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";
import { CLIENT_SAMSUNG_ASSORTMENT } from "../../prisma/client-samsung-assortment";

config({ path: ".env.local", quiet: true });
config({ quiet: true });
const db = new PrismaClient({ adapter: createDatabaseAdapter() });
const definitions = CLIENT_SAMSUNG_ASSORTMENT.filter(product => product.category === "watch");
const include = {
  brand: true,
  images: true,
  variants: { include: { options: true, colorOffers: true } },
  colorValues: { include: { offers: true } },
  specs: true,
  variantAttributes: true,
} as const;

async function main() {
  try {
    assert.equal(definitions.length, 12);
    for (const definition of definitions) {
      assert.ok(definition.image?.startsWith("/media/catalog/samsung-watch-studio/"));
      await access(`public${definition.image}`);
    }
    const where = { slug: { in: definitions.map(product => product.slug) } };
    const before = await db.product.findMany({ where, include, orderBy: { slug: "asc" } });
    assert.equal(before.length, definitions.length);
    for (const product of before) {
      assert.equal(product.brand.slug, "samsung");
      assert.ok(product.isActive);
      assert.equal(product.images.length, 1, `Expected one original image: ${product.slug}`);
    }
    console.log(JSON.stringify(before.map(product => ({
      slug: product.slug,
      from: product.images[0].url,
      to: definitions.find(definition => definition.slug === product.slug)!.image,
    })), null, 2));
    if (!process.argv.includes("--apply")) return;
    await mkdir("docs/catalog", { recursive: true });
    const backup = `docs/catalog/samsung-watch-images-before-${new Date().toISOString().replaceAll(":", "-")}.json`;
    await writeFile(backup, JSON.stringify({ products: before }, null, 2), { mode: 0o600, flag: "wx" });
    await db.$transaction(async transaction => {
      for (const product of before) {
        const definition = definitions.find(definition => definition.slug === product.slug)!;
        await transaction.productImage.update({
          where: { id: product.images[0].id },
          data: { url: definition.image, alt: `${product.name}, студийное фото`, isMain: true },
        });
      }
    }, { timeout: 60_000, maxWait: 15_000 });
    const after = await db.product.findMany({ where, include, orderBy: { slug: "asc" } });
    const withoutImages = (products: typeof before) => products.map(product =>
      Object.fromEntries(Object.entries(product).filter(([key]) => key !== "images")));
    assert.deepEqual(withoutImages(after), withoutImages(before), "Product configurations, colours and prices must stay unchanged");
    for (const product of after) {
      const previous = before.find(old => old.id === product.id)!;
      assert.equal(product.images[0].id, previous.images[0].id);
      assert.equal(product.images[0].url, definitions.find(definition => definition.slug === product.slug)!.image);
    }
    console.log(JSON.stringify({ updatedImages: after.length, configurationsAndPricesUnchanged: true, backup }));
  } finally {
    await db.$disconnect();
  }
}

void main().catch(error => {
  console.error(error instanceof Error ? error.message : "Samsung watch photo update failed");
  process.exitCode = 1;
});
