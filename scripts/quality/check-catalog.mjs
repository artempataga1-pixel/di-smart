import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const envPath = process.argv[2] ?? ".env.local";
const env = parse(readFileSync(resolve(envPath)));
if (!env.DATABASE_URL) throw new Error(`DATABASE_URL отсутствует в ${envPath}`);
const mediaSource = readFileSync(resolve("src/constants/content/catalog-media.ts"), "utf8");
const fallbackFiles = new Map([...mediaSource.matchAll(/"([a-z0-9-]+)": "([a-z0-9-.]+)"/g)]
  .map((match) => [match[1], match[2]]));

const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000, query_timeout: 20_000 });

function normalize(value) {
  return value.normalize("NFKC").toLocaleLowerCase("ru").replace(/[\s\u00a0]+/g, " ").trim();
}

async function main() {
  await client.connect();
  await client.query("BEGIN READ ONLY");
  try {
    const products = (await client.query(`
      SELECT p.id, p.slug, p.name, p."isActive", p."basePriceUsd" AS price,
        p.availability, b.slug AS brand, b."isActive" AS brand_active,
        c.slug AS category, c."isActive" AS category_active,
        (SELECT count(*)::int FROM "ProductSpec" s WHERE s."productId" = p.id) AS spec_count,
        (SELECT count(*)::int FROM "ProductImage" i WHERE i."productId" = p.id) AS image_count
      FROM "Product" p
      JOIN "Brand" b ON b.id = p."brandId"
      JOIN "Category" c ON c.id = p."categoryId"
      ORDER BY p.slug
    `)).rows;
    const variants = (await client.query(`
      SELECT v.id, v."productId", v.sku, v."priceUsd", v."isDefault",
        coalesce(array_agg(o."attributeValueId" ORDER BY o."attributeValueId")
          FILTER (WHERE o."attributeValueId" IS NOT NULL), '{}') AS options
      FROM "ProductVariant" v
      LEFT JOIN "ProductVariantOption" o ON o."variantId" = v.id
      GROUP BY v.id
    `)).rows;

    const active = products.filter((product) => product.isActive && product.category_active && product.brand_active);
    const errors = [];
    const warnings = [];
    let fallbackImageCount = 0;
    let trulyImagelessCount = 0;
    const byName = new Map();
    for (const product of active) {
      const key = `${product.brand}:${normalize(product.name)}`;
      const previous = byName.get(key);
      if (previous) errors.push(`Повтор модели: ${previous.slug} и ${product.slug}`);
      else byName.set(key, product);
      if (Number(product.price) <= 0) errors.push(`Нулевая цена: ${product.slug}`);
      if (product.spec_count < 3) warnings.push(`Мало характеристик (${product.spec_count}): ${product.slug}`);
      if (product.image_count === 0) {
        const fallbackFile = fallbackFiles.get(product.slug);
        if (fallbackFile && existsSync(resolve("public/media/catalog/products", fallbackFile))) {
          fallbackImageCount += 1;
        } else {
          trulyImagelessCount += 1;
          warnings.push(`Нет фото ни в БД, ни в локальном каталоге: ${product.slug}`);
        }
      }
    }

    const productsById = new Set(active.map((product) => product.id));
    const activeVariants = variants.filter((variant) => productsById.has(variant.productId));
    const byVariant = new Map();
    const bySku = new Map();
    for (const variant of activeVariants) {
      const key = `${variant.productId}:${variant.options.join(",")}`;
      const previous = byVariant.get(key);
      if (previous) errors.push(`Повтор конфигурации: варианты ${previous.id} и ${variant.id}`);
      else byVariant.set(key, variant);
      if (variant.sku) {
        const sku = normalize(variant.sku);
        const sameSku = bySku.get(sku);
        if (sameSku) errors.push(`Повтор SKU: ${sameSku.id} и ${variant.id} (${variant.sku})`);
        else bySku.set(sku, variant);
      }
      if (Number(variant.priceUsd) <= 0) errors.push(`Нулевая цена варианта: ${variant.id}`);
    }

    console.log(`Товары: ${products.length}, активные: ${active.length}, варианты активных: ${activeVariants.length}`);
    console.log(`Фото через локальный fallback: ${fallbackImageCount}; совсем без фото: ${trulyImagelessCount}`);
    console.log(`Варианты без SKU: ${activeVariants.filter((variant) => !variant.sku).length}`);
    console.log(`Ошибки: ${errors.length}, предупреждения: ${warnings.length}`);
    for (const error of errors) console.error(`ERROR ${error}`);
    for (const warning of warnings) console.log(`WARN ${warning}`);
    if (errors.length) process.exitCode = 1;
  } finally {
    await client.query("ROLLBACK");
    await client.end();
  }
}

main().catch((error) => {
  console.error(`Проверка каталога не выполнена: ${error.message}`);
  process.exitCode = 1;
});
