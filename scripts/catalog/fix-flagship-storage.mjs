#!/usr/bin/env node
/** One-time, guarded storage correction; keeps product/color/image IDs intact. */
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const env = parse(await readFile(resolve(".env.local")));
if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing");
const priceUsd = {
  "iphone-18-pro": { "256 ГБ": 1199, "512 ГБ": 1399, "1 ТБ": 1799, "2 ТБ": 2399 },
  "iphone-18-pro-max": { "256 ГБ": 1299, "512 ГБ": 1499, "1 ТБ": 1899, "2 ТБ": 2499 },
};
const slugs = ["iphone-18-pro", "iphone-18-pro-max", "galaxy-s26-ultra"];
const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query(`SELECT id FROM "Product" WHERE slug=ANY($1) FOR UPDATE`, [slugs]);
  const rows = (await client.query(`
    SELECT p.id AS product_id, p.slug, v.id AS variant_id, v."isDefault" AS is_default,
      v."priceUsd" AS price_usd, v."priceByn" AS price_byn,
      max(CASE WHEN a.slug='memory' THEN av.value END) AS memory,
      max(CASE WHEN a.slug='sim' THEN av.value END) AS sim,
      count(DISTINCT oi.id)::int AS order_count,
      count(DISTINCT o.id)::int AS offer_count
    FROM "Product" p JOIN "ProductVariant" v ON v."productId"=p.id
    LEFT JOIN "ProductVariantOption" vo ON vo."variantId"=v.id
    LEFT JOIN "VariantAttributeValue" av ON av.id=vo."attributeValueId"
    LEFT JOIN "VariantAttribute" a ON a.id=av."attributeId"
    LEFT JOIN "OrderItem" oi ON oi."variantId"=v.id
    LEFT JOIN "ProductColorOffer" o ON o."variantId"=v.id
    WHERE p.slug=ANY($1)
    GROUP BY p.id,p.slug,v.id
  `, [slugs])).rows;
  const counts = Object.fromEntries(slugs.map((slug) => [slug, rows.filter((row) => row.slug === slug).length]));
  if (counts["iphone-18-pro"] !== 12 || counts["iphone-18-pro-max"] !== 15 || counts["galaxy-s26-ultra"] !== 4) {
    throw new Error(`Unexpected variant counts: ${JSON.stringify(counts)}`);
  }
  if (rows.some((row) => row.order_count || row.offer_count || row.price_byn !== null)) {
    throw new Error("A variant has orders or overrides; refusing automatic correction");
  }
  const invalid = rows.filter((row) => row.memory === "128 ГБ");
  if (invalid.length !== 7) throw new Error(`Expected seven unsupported 128 GB variants, found ${invalid.length}`);
  const invalidIds = invalid.map((row) => row.variant_id);
  await client.query(`DELETE FROM "ProductVariantOption" WHERE "variantId"=ANY($1)`, [invalidIds]);
  await client.query(`DELETE FROM "ProductVariant" WHERE id=ANY($1)`, [invalidIds]);

  for (const [slug, tiers] of Object.entries(priceUsd)) {
    const productRows = rows.filter((row) => row.slug === slug && row.memory !== "128 ГБ");
    const productId = productRows[0]?.product_id;
    if (!productId) throw new Error(`Missing ${slug}`);
    await client.query(`UPDATE "Product" SET "basePriceUsd"=$1 WHERE id=$2`, [tiers["256 ГБ"], productId]);
    for (const row of productRows) {
      const expected = tiers[row.memory];
      if (!expected || !row.sim) throw new Error(`Unknown option ${slug}: ${row.memory}/${row.sim}`);
      await client.query(`UPDATE "ProductVariant" SET "priceUsd"=$1,"isDefault"=$2 WHERE id=$3`,
        [expected, row.memory === "256 ГБ" && row.sim === "SIM", row.variant_id]);
    }
  }
  const proId = rows.find((row) => row.slug === "iphone-18-pro")?.product_id;
  const simLabels = ["SIM", "eSIM", "SIM + eSIM"];
  const values = (await client.query(`
    SELECT av.id, a.slug, av.value FROM "VariantAttributeValue" av
    JOIN "VariantAttribute" a ON a.id=av."attributeId"
    WHERE (a.slug='memory' AND av.value='2 ТБ') OR (a.slug='sim' AND av.value=ANY($1))
  `, [simLabels])).rows;
  const memoryId = values.find((value) => value.slug === "memory")?.id;
  if (!memoryId || values.filter((value) => value.slug === "sim").length !== 3) throw new Error("Missing 2 TB/SIM attribute values");
  for (const [index, sim] of simLabels.entries()) {
    const simId = values.find((value) => value.slug === "sim" && value.value === sim)?.id;
    if (!simId) throw new Error(`Missing SIM value ${sim}`);
    const id = randomUUID();
    await client.query(`INSERT INTO "ProductVariant" (id,"productId","priceUsd",availability,"isDefault","sortOrder","createdAt","updatedAt") VALUES ($1,$2,2399,'IN_STOCK',false,$3,now(),now())`,
      [id, proId, 12 + index]);
    await client.query(`INSERT INTO "ProductVariantOption" ("variantId","attributeValueId") VALUES ($1,$2),($1,$3)`,
      [id, memoryId, simId]);
  }
  const ultraId = rows.find((row) => row.slug === "galaxy-s26-ultra")?.product_id;
  const ultraDefault = rows.find((row) => row.slug === "galaxy-s26-ultra" && row.memory === "256 ГБ")?.variant_id;
  await client.query(`UPDATE "ProductVariant" SET "isDefault"=(id=$1) WHERE "productId"=$2`, [ultraDefault, ultraId]);
  await client.query("COMMIT");
  console.log("Corrected iPhone 18 Pro/Max and Galaxy S26 Ultra storage options; preserved product photos/colors.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
