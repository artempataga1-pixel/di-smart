/** Publish the four reviewed Neo images with fresh URLs to bypass old browser caches. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const images = {
  "Розовый Blush": "/media/catalog/products/macbook-neo-blush-2026-v2.webp",
  "Индиго": "/media/catalog/products/macbook-neo-indigo-2026-v2.webp",
  "Цитрусовый": "/media/catalog/products/macbook-neo-citrus-2026-v2.webp",
  "Серебристый": "/media/catalog/products/macbook-neo-silver-2026-v2.webp",
};

for (const url of Object.values(images)) {
  if (!existsSync(resolve("public", url.slice(1)))) throw new Error(`Image missing: ${url}`);
}

const env = parse(readFileSync(resolve(".env.local")));
if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing");
const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '5s'");
  const result = await client.query(`
    SELECT i.id, i.url, i."isMain", av.value AS color
    FROM "ProductImage" i
    JOIN "Product" p ON p.id = i."productId"
    JOIN "ProductColorValue" cv ON cv.id = i."colorValueId"
    JOIN "VariantAttributeValue" av ON av.id = cv."attributeValueId"
    WHERE p.slug = $1
    ORDER BY av.value
    FOR UPDATE OF i
  `, ["macbook-neo"]);
  const expected = Object.keys(images);
  if (result.rowCount !== expected.length || result.rows.some((row) => !expected.includes(row.color))) {
    throw new Error(`Unexpected Neo image rows: ${JSON.stringify(result.rows.map((row) => row.color))}`);
  }
  const changed = result.rows.filter((row) => row.url !== images[row.color]);
  if (changed.length) {
    writeFileSync(resolve("docs/catalog/macbook-neo-images-before-v2.json"), `${JSON.stringify(result.rows, null, 2)}\n`);
    for (const row of changed) {
      await client.query('UPDATE "ProductImage" SET url = $2 WHERE id = $1', [row.id, images[row.color]]);
    }
  }
  await client.query("COMMIT");
  console.log(`MacBook Neo: ${changed.length} image URLs updated; all four colours verified.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
