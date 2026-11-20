#!/usr/bin/env node
/** Targeted corrections for cards with images/prices that must survive a seed sync. */
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const env = parse(await readFile(resolve(".env.local")));
if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing");
const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });

async function productId(slug) {
  const result = await client.query('SELECT id FROM "Product" WHERE slug = $1 FOR UPDATE', [slug]);
  if (result.rowCount !== 1) throw new Error(`Expected one product: ${slug}`);
  return result.rows[0].id;
}

async function updateSpec(id, name, value) {
  const result = await client.query(
    'UPDATE "ProductSpec" SET value = $3 WHERE "productId" = $1 AND name = $2',
    [id, name, value],
  );
  if (result.rowCount !== 1) throw new Error(`Expected one specification: ${name}`);
}

async function upsertSpec(id, name, value, sortOrder) {
  const existing = await client.query('SELECT id FROM "ProductSpec" WHERE "productId" = $1 AND name = $2', [id, name]);
  if (existing.rowCount > 1) throw new Error(`Duplicate specification: ${name}`);
  if (existing.rowCount === 1) {
    await updateSpec(id, name, value);
  } else {
    await client.query('INSERT INTO "ProductSpec" (id, "productId", name, value, "sortOrder") VALUES ($1, $2, $3, $4, $5)',
      [randomUUID(), id, name, value, sortOrder]);
  }
}

await client.connect();
try {
  await client.query("BEGIN");

  const macId = await productId("macbook-pro-16-m5-max");
  const macVariants = await client.query(`
    SELECT v.id, av.value AS memory,
      (SELECT count(*) FROM "OrderItem" oi WHERE oi."variantId" = v.id) AS orders,
      (SELECT count(*) FROM "ProductColorOffer" co WHERE co."variantId" = v.id) AS offers,
      v."priceByn"
    FROM "ProductVariant" v
    JOIN "ProductVariantOption" vo ON vo."variantId" = v.id
    JOIN "VariantAttributeValue" av ON av.id = vo."attributeValueId"
    JOIN "VariantAttribute" a ON a.id = av."attributeId" AND a.slug = 'memory'
    WHERE v."productId" = $1`, [macId]);
  const memories = macVariants.rows.map((row) => row.memory).sort();
  const expectedBefore = ["1 ТБ", "2 ТБ", "4 ТБ", "8 ТБ"].sort();
  const expectedAfter = ["2 ТБ", "4 ТБ", "8 ТБ"].sort();
  if (JSON.stringify(memories) !== JSON.stringify(expectedBefore) &&
      JSON.stringify(memories) !== JSON.stringify(expectedAfter)) {
    throw new Error(`Unexpected MacBook variants: ${memories.join(", ")}`);
  }
  const invalid = macVariants.rows.find((row) => row.memory === "1 ТБ");
  if (invalid) {
    if (Number(invalid.orders) || Number(invalid.offers) || invalid.priceByn !== null) {
      throw new Error("MacBook 1 TB variant has orders, offers, or seller price");
    }
    await client.query('DELETE FROM "ProductVariant" WHERE id = $1', [invalid.id]);
    await client.query('UPDATE "ProductVariant" SET "sortOrder" = GREATEST("sortOrder" - 1, 0) WHERE "productId" = $1', [macId]);
  }
  const defaultMac = macVariants.rows.find((row) => row.memory === "2 ТБ");
  await client.query('UPDATE "ProductVariant" SET "isDefault" = (id = $2) WHERE "productId" = $1', [macId, defaultMac.id]);

  const xiaomiId = await productId("xiaomi-17-ultra");
  await client.query(`UPDATE "Product" SET "shortDescription" = $2, description = $3 WHERE id = $1`, [
    xiaomiId,
    "Основная камера Leica 1 дюйм и телефото 200 Мп",
    "Xiaomi 17 Ultra — флагман с 1-дюймовой основной камерой Leica 50 Мп и отдельным телефото 200 Мп с переменным оптическим зумом 75–100 мм.",
  ]);
  await updateSpec(xiaomiId, "Камера", "Leica 50 Мп, 1-дюймовый сенсор; телефото 200 Мп, оптический зум 75–100 мм");

  const bookId = await productId("xiaomi-book-pro-14");
  await updateSpec(bookId, "Аккумулятор", "72 Вт·ч");

  const airpods4Id = await productId("airpods-4");
  await upsertSpec(airpods4Id, "Автономность", "До 5 ч без кейса / до 30 ч с кейсом", 0);
  await upsertSpec(airpods4Id, "Чип", "Apple H2", 2);
  await upsertSpec(airpods4Id, "Кейс", "Зарядка USB-C", 3);

  const airpods4AncId = await productId("airpods-4-anc");
  await upsertSpec(airpods4AncId, "Автономность", "До 4 ч без кейса / до 20 ч с кейсом при включённом ANC", 1);
  await upsertSpec(airpods4AncId, "Чип", "Apple H2", 2);
  await upsertSpec(airpods4AncId, "Кейс", "USB-C, Qi и зарядка Apple Watch", 3);

  await client.query("COMMIT");
  console.log("Corrected 3 photographed products and 2 seller-priced AirPods cards; images and BYN prices preserved.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
