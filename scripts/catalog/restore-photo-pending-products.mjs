#!/usr/bin/env node
/** Restore confirmed products; a missing photo is not a reason to hide them. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const productSlugs = [
  "cable-braided-usbc",
  "cable-usbc-jack",
  "ipad-folio-case",
  "samsung-cable-usbc-usbc",
];
const categorySlugs = ["vision-pro", "homepod", "apple-tv"];
const apply = process.argv.includes("--apply");
const env = parse(await readFile(resolve(".env.local")));
if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing");
const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
try {
  await client.query(apply ? "BEGIN" : "BEGIN READ ONLY");
  await client.query("SET LOCAL lock_timeout = '5s'");
  const products = (await client.query(`
    SELECT p.id,p.slug,p."isActive",count(i.id)::int AS images,
      count(DISTINCT oi.id)::int AS orders
    FROM "Product" p
    LEFT JOIN "ProductImage" i ON i."productId"=p.id
    LEFT JOIN "OrderItem" oi ON oi."productId"=p.id
    WHERE p.slug=ANY($1)
    GROUP BY p.id ORDER BY p.slug
  `, [productSlugs])).rows;
  const categories = (await client.query(`
    SELECT id,slug,"isActive" FROM "Category" WHERE slug=ANY($1) ORDER BY slug
  `, [categorySlugs])).rows;
  if (products.length !== productSlugs.length || categories.length !== categorySlugs.length) {
    throw new Error("Target product/category set changed");
  }
  if (products.some((row) => row.isActive || row.images || row.orders) || categories.some((row) => row.isActive)) {
    throw new Error("Target state changed; review manually before restore");
  }
  console.log(`Products to restore: ${products.map((row) => row.slug).join(", ")}`);
  console.log(`Categories to restore: ${categories.map((row) => row.slug).join(", ")}`);
  if (apply) {
    const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
    const path = resolve(`docs/catalog/photo-pending-visibility-before-${timestamp}.json`);
    await writeFile(path, `${JSON.stringify({ capturedAt: new Date().toISOString(), products, categories }, null, 2)}\n`, { flag: "wx" });
    await client.query(`UPDATE "Product" SET "isActive"=true WHERE slug=ANY($1)`, [productSlugs]);
    await client.query(`UPDATE "Category" SET "isActive"=true WHERE slug=ANY($1)`, [categorySlugs]);
    await client.query("COMMIT");
    console.log(`Restored. Previous states: ${path}`);
  } else {
    await client.query("ROLLBACK");
    console.log("Read-only preview. Pass --apply to restore.");
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
