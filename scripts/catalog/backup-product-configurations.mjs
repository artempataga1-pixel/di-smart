#!/usr/bin/env node
/** Read-only JSON snapshot before a targeted catalog configuration correction. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const slugs = process.argv.slice(2);
if (!slugs.length || new Set(slugs).size !== slugs.length) throw new Error("Pass unique product slugs");
const env = parse(await readFile(resolve(".env.local")));
if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing");
const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
try {
  await client.query("BEGIN READ ONLY");
  const products = (await client.query(`SELECT * FROM "Product" WHERE slug = ANY($1) ORDER BY slug`, [slugs])).rows;
  if (products.length !== slugs.length) throw new Error("One or more products do not exist");
  const ids = products.map((product) => product.id);
  const variants = (await client.query(`SELECT * FROM "ProductVariant" WHERE "productId" = ANY($1) ORDER BY "productId", "sortOrder"`, [ids])).rows;
  const colors = (await client.query(`SELECT * FROM "ProductColorValue" WHERE "productId" = ANY($1)`, [ids])).rows;
  const tables = {
    products,
    variants,
    variantOptions: (await client.query(`SELECT * FROM "ProductVariantOption" WHERE "variantId" = ANY($1)`, [variants.map((variant) => variant.id)])).rows,
    variantAttributes: (await client.query(`SELECT * FROM "ProductVariantAttribute" WHERE "productId" = ANY($1)`, [ids])).rows,
    colors,
    colorOffers: (await client.query(`SELECT * FROM "ProductColorOffer" WHERE "colorValueId" = ANY($1)`, [colors.map((color) => color.id)])).rows,
    images: (await client.query(`SELECT * FROM "ProductImage" WHERE "productId" = ANY($1)`, [ids])).rows,
    specs: (await client.query(`SELECT * FROM "ProductSpec" WHERE "productId" = ANY($1)`, [ids])).rows,
  };
  await client.query("ROLLBACK");
  const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const path = resolve(`docs/catalog/configurations-before-sync-${timestamp}.json`);
  await writeFile(path, `${JSON.stringify({ capturedAt: new Date().toISOString(), slugs, tables }, null, 2)}\n`, { flag: "wx" });
  console.log(`Read-only backup: ${path} (${products.length} products, ${variants.length} variants)`);
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
