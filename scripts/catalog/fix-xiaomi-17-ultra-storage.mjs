#!/usr/bin/env node
/** Xiaomi Global lists 16/512 GB and 16 GB/1 TB, not a 256 GB Ultra. */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const env = parse(await readFile(resolve(".env.local")));
const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '5s'");
  const product = (await client.query(`SELECT id FROM "Product" WHERE slug='xiaomi-17-ultra' FOR UPDATE`)).rows[0];
  if (!product) throw new Error("Xiaomi 17 Ultra missing");
  const variants = (await client.query(`
    SELECT v.id,v."priceByn",v."priceUsd",
      max(av.value) FILTER (WHERE a.slug='memory') AS memory,
      count(DISTINCT oi.id)::int AS orders,
      count(DISTINCT o.id)::int AS offers
    FROM "ProductVariant" v
    LEFT JOIN "ProductVariantOption" vo ON vo."variantId"=v.id
    LEFT JOIN "VariantAttributeValue" av ON av.id=vo."attributeValueId"
    LEFT JOIN "VariantAttribute" a ON a.id=av."attributeId"
    LEFT JOIN "OrderItem" oi ON oi."variantId"=v.id
    LEFT JOIN "ProductColorOffer" o ON o."variantId"=v.id
    WHERE v."productId"=$1 GROUP BY v.id
  `, [product.id])).rows;
  if (variants.length !== 3 || variants.some((row) => !["256 ГБ", "512 ГБ", "1 ТБ"].includes(row.memory))) {
    throw new Error("Unexpected Xiaomi 17 Ultra options");
  }
  const invalid = variants.find((row) => row.memory === "256 ГБ");
  const standard = variants.find((row) => row.memory === "512 ГБ");
  if (!invalid || !standard || invalid.orders || invalid.offers || invalid.priceByn !== null) {
    throw new Error("The unsupported option has orders or overrides");
  }
  await client.query(`DELETE FROM "ProductVariantOption" WHERE "variantId"=$1`, [invalid.id]);
  await client.query(`DELETE FROM "ProductVariant" WHERE id=$1`, [invalid.id]);
  await client.query(`UPDATE "ProductVariant" SET "isDefault"=(id=$1) WHERE "productId"=$2`, [standard.id, product.id]);
  await client.query(`UPDATE "Product" SET "basePriceUsd"=1449 WHERE id=$1`, [product.id]);
  await client.query("COMMIT");
  console.log("Removed unsupported 256 GB option; 512 GB is the default. Verified BYN estimate preserved.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
