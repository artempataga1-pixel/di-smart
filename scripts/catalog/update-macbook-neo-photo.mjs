/** Switch only the silver MacBook Neo variant to the customer-supplied original PNG. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const env = parse(await readFile(resolve(".env.local")));
if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing");
const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
const newUrl = "/media/catalog/products/macbook-neo-2026.png";
await client.connect();
try {
  await client.query("BEGIN");
  const result = await client.query(`
    SELECT i.id, i.url FROM "ProductImage" i
    JOIN "Product" p ON p.id = i."productId"
    JOIN "ProductColorValue" cv ON cv.id = i."colorValueId"
    JOIN "VariantAttributeValue" av ON av.id = cv."attributeValueId"
    WHERE p.slug = $1 AND av.value = $2 FOR UPDATE OF i
  `, ["macbook-neo", "Серебристый"]);
  if (result.rowCount !== 1) throw new Error(`Expected one silver Neo image, got ${result.rowCount}`);
  await writeFile(resolve("docs/catalog/macbook-neo-photo-before-2026-09-27.json"), `${JSON.stringify(result.rows, null, 2)}\n`);
  await client.query('UPDATE "ProductImage" SET url = $2 WHERE id = $1', [result.rows[0].id, newUrl]);
  await client.query("COMMIT");
  console.log(`Silver MacBook Neo: ${result.rows[0].url} → ${newUrl}`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
