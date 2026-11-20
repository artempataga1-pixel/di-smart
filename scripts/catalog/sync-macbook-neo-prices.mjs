#!/usr/bin/env node
/** Synchronize the two MacBook Neo SSD prices verified on the client's shop.
 * Read-only by default; --apply writes a dated backup before the transaction. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const apply = process.argv.includes("--apply");
const source = JSON.parse(await readFile(resolve("docs/catalog/source-snapshot-2026-09-25.json"), "utf8"));
const sourceAgeHours = (Date.now() - Date.parse(source.capturedAt)) / 3_600_000;
if (!Number.isFinite(sourceAgeHours) || sourceAgeHours < 0 || sourceAgeHours > 72) {
  throw new Error("Client-shop snapshot is older than 72 hours; refresh prices before applying");
}
const sourceRows = source.products.filter((product) => product.slug.startsWith("macbook-neo-"));
const prices = { "256 ГБ": 2520, "512 ГБ": 2835 };
const colors = new Set(["blush", "indigo", "citrus", "silver"]);
if (sourceRows.length !== 4 || sourceRows.some((row) =>
  !colors.has(row.slug.slice("macbook-neo-".length)) || !row.inStock ||
  row.variations.length !== 2 || row.variations.some((variant) => {
    const storage = variant.attributes.attribute_pa_memory;
    return !variant.inStock ||
      (storage === "256gb" && variant.priceByn !== 2520) ||
      (storage === "512-gb" && variant.priceByn !== 2835) ||
      !["256gb", "512-gb"].includes(storage);
  }))) {
  throw new Error("MacBook Neo source assortment changed; review the client shop before sync");
}
for (const row of sourceRows) {
  if (new Set(row.variations.map((variant) => variant.priceByn)).size !== 2) {
    throw new Error(`Missing a 256/512 GB price for ${row.slug}`);
  }
}
const env = parse(await readFile(resolve(".env.local")));
if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing");
const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
try {
  await client.query(apply ? "BEGIN" : "BEGIN READ ONLY");
  await client.query("SET LOCAL lock_timeout = '5s'");
  const product = (await client.query(`
    SELECT id,slug,"basePriceByn","priceKind",availability,"isActive"
    FROM "Product" WHERE slug='macbook-neo' ${apply ? "FOR UPDATE" : ""}
  `)).rows[0];
  if (!product || !product.isActive) throw new Error("Active MacBook Neo product not found");
  const variants = (await client.query(`
    SELECT v.id,v."priceByn",v.availability,av.value AS memory
    FROM "ProductVariant" v
    JOIN "ProductVariantOption" opt ON opt."variantId"=v.id
    JOIN "VariantAttributeValue" av ON av.id=opt."attributeValueId"
    JOIN "VariantAttribute" a ON a.id=av."attributeId" AND a.slug='memory'
    WHERE v."productId"=$1 ORDER BY v."sortOrder"
  `, [product.id])).rows;
  const productColors = (await client.query(`
    SELECT av.value FROM "ProductColorValue" cv
    JOIN "VariantAttributeValue" av ON av.id=cv."attributeValueId"
    WHERE cv."productId"=$1
  `, [product.id])).rows.map((row) => row.value).sort();
  if (variants.length !== 2 || variants.some((row) => !(row.memory in prices)) ||
      productColors.join("|") !== ["Индиго", "Розовый Blush", "Серебристый", "Цитрусовый"].sort().join("|")) {
    throw new Error("MacBook Neo options changed; refusing to sync prices");
  }
  console.log(variants.map((row) => `${row.memory}: ${prices[row.memory]} BYN`).join("\n"));
  if (apply) {
    const backup = resolve(`docs/catalog/macbook-neo-prices-before-sync-${new Date().toISOString().slice(0, 10)}.json`);
    await writeFile(backup, `${JSON.stringify({ capturedAt: new Date().toISOString(), product, variants }, null, 2)}\n`, { flag: "wx" });
    await client.query(`UPDATE "Product" SET "basePriceByn"=$1,"priceKind"='VERIFIED_SHOP' WHERE id=$2`, [2520, product.id]);
    for (const row of variants) {
      await client.query(`UPDATE "ProductVariant" SET "priceByn"=$1 WHERE id=$2`, [prices[row.memory], row.id]);
    }
    await client.query("COMMIT");
    console.log(`Applied client-shop prices; backup: ${backup}`);
  } else {
    await client.query("ROLLBACK");
    console.log("Read-only preview; pass --apply to write.");
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
