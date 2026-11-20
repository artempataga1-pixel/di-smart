#!/usr/bin/env node
/** Exact merchant BYN prices for MacBook Air 15 M5: storage × finish. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const expected = {
  "Небесно-голубой": { slug: "apple-macbook-air-15-m5-sky-blue", prices: { "512 ГБ": 5103, "1 ТБ": 5953.5 } },
  "Серебристый": { slug: "apple-macbook-air-15-m5-silver", prices: { "512 ГБ": 5229, "1 ТБ": 6111 } },
  "Звёздный": { slug: "apple-macbook-air-15-m5-starlight", prices: { "512 ГБ": 5134.5, "1 ТБ": 5985 } },
  "Полночный": { slug: "apple-macbook-air-15-m5-midnight", prices: { "512 ГБ": 5134.5, "1 ТБ": 6079.5 } },
};
const source = JSON.parse(await readFile(resolve("docs/catalog/source-snapshot-2026-09-25.json"), "utf8"));
const sourceAgeHours = (Date.now() - Date.parse(source.capturedAt)) / 3_600_000;
if (!Number.isFinite(sourceAgeHours) || sourceAgeHours < 0 || sourceAgeHours > 72) {
  throw new Error("Client-shop snapshot is older than 72 hours; refresh prices before applying");
}
for (const [color, config] of Object.entries(expected)) {
  const row = source.products.find((item) => item.slug === config.slug);
  if (!row?.inStock || row.variations.length !== 2) throw new Error(`Source product changed: ${config.slug}`);
  for (const variant of row.variations) {
    const memory = variant.attributes.attribute_pa_memory === "512-gb" ? "512 ГБ" :
      variant.attributes.attribute_pa_memory === "1tb" ? "1 ТБ" : null;
    if (!memory || variant.attributes["attribute_pa_obem-operativnoj-pamyati"] !== "16gb" ||
        !variant.inStock || variant.priceByn !== config.prices[memory]) {
      throw new Error(`Source price/configuration changed: ${color} / ${memory}`);
    }
  }
}

const env = parse(await readFile(resolve(".env.local")));
const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
const apply = process.argv.includes("--apply");
try {
  await client.query(apply ? "BEGIN" : "BEGIN READ ONLY");
  await client.query("SET LOCAL lock_timeout = '5s'");
  const product = (await client.query(`SELECT id,slug,"basePriceByn","priceKind",availability FROM "Product" WHERE slug='macbook-air-15-m5'`)).rows[0];
  if (!product) throw new Error("MacBook Air 15 M5 not found");
  const variants = (await client.query(`
    SELECT v.id,v."priceByn",v.availability,av.value AS memory
    FROM "ProductVariant" v
    JOIN "ProductVariantOption" opt ON opt."variantId"=v.id
    JOIN "VariantAttributeValue" av ON av.id=opt."attributeValueId"
    JOIN "VariantAttribute" a ON a.id=av."attributeId" AND a.slug='memory'
    WHERE v."productId"=$1
  `, [product.id])).rows;
  const colors = (await client.query(`
    SELECT cv.id,av.value FROM "ProductColorValue" cv
    JOIN "VariantAttributeValue" av ON av.id=cv."attributeValueId"
    WHERE cv."productId"=$1
  `, [product.id])).rows;
  if (variants.length !== 2 || colors.length !== 4 ||
      variants.some((row) => !["512 ГБ", "1 ТБ"].includes(row.memory)) ||
      colors.some((row) => !(row.value in expected))) {
    throw new Error("Target options changed; refusing to sync prices");
  }
  const oldOffers = (await client.query(`SELECT * FROM "ProductColorOffer" WHERE "colorValueId"=ANY($1)`, [colors.map((row) => row.id)])).rows;
  if (oldOffers.length) throw new Error("Existing color offers require manual review");
  for (const color of colors) for (const variant of variants) {
    console.log(`${color.value} / ${variant.memory}: ${expected[color.value].prices[variant.memory]} BYN`);
  }
  if (apply) {
    const backup = resolve(`docs/catalog/macbook-air-15-m5-prices-before-sync-${new Date().toISOString().slice(0, 10)}.json`);
    await writeFile(backup, `${JSON.stringify({ capturedAt: new Date().toISOString(), product, variants, colors, oldOffers }, null, 2)}\n`, { flag: "wx" });
    await client.query(`UPDATE "Product" SET "basePriceByn"=5103,"priceKind"='VERIFIED_SHOP' WHERE id=$1`, [product.id]);
    for (const variant of variants) {
      await client.query(`UPDATE "ProductVariant" SET "priceByn"=$1 WHERE id=$2`,
        [variant.memory === "512 ГБ" ? 5103 : 5953.5, variant.id]);
    }
    for (const color of colors) for (const variant of variants) {
      await client.query(`
        INSERT INTO "ProductColorOffer" (id,"colorValueId","variantId","priceByn",availability)
        VALUES ($1,$2,$3,$4,'IN_STOCK')
      `, [`merchant-mba15m5-${color.id}-${variant.id}`, color.id, variant.id, expected[color.value].prices[variant.memory]]);
    }
    await client.query("COMMIT");
    console.log(`Applied 8 exact client-shop prices; backup: ${backup}`);
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
