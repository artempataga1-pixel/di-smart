#!/usr/bin/env node
/** Dated, manually reviewed Belarusian market benchmarks. Never merchant prices. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const apply = process.argv.includes("--apply");
const benchmarks = [
  { slug: "galaxy-s26", memory: "256 ГБ", byn: 2340, sources: ["https://app-minsk.by/devices/smartfony/samsung/galaxy-s26", "https://i-gadget.by/smartfony-i-telefony/samsung-galaxy-s26-serii/"] },
  { slug: "galaxy-s26-plus", memory: "256 ГБ", byn: 2520, sources: ["https://i-gadget.by/smartfony-i-telefony/smartfony-samsung/samsung-galaxy-s26-serii/samsung-galaxy-s26-plus/", "https://texnomir.by/samsung-galaxy-s26plus-sm-s947b-12gb-256gb-belyj.html"] },
  { slug: "galaxy-s26-ultra", memory: "256 ГБ", byn: 3690, sources: ["https://theapple.by/samsung/galaxy-s26-ultra/smartfon-samsung-galaxy-s26-ultra-sm-s948b-12-256gb-chernyj/", "https://time-shop.by/mobile/samsung/sms948b12256bk"] },
  { slug: "galaxy-z-flip7", memory: "256 ГБ", byn: 3140, sources: ["https://i-gadget.by/smartfony-i-telefony/kupit-samsung-galaxy-z-flip7-12gb-256gb-blue-shadow/", "https://i-gadget.by/smartfony-i-telefony/kupit-samsung-galaxy-z-flip7-12gb-256gb-jet-black/"] },
  { slug: "galaxy-a56", memory: "128 ГБ", byn: 1170, sources: ["https://i-gadget.by/smartfony-i-telefony/kupit-samsung-galaxy-a56-8gb-128gb-graphite/", "https://vdo.by/product/galaxy-a56-8-128-gb-rose"] },
  { slug: "galaxy-tab-s11", memory: "128 ГБ", byn: 2495, sources: ["https://i-gadget.by/planshety/kupit-planshet-samsung-galaxy-tab-s11-wi-fi-12gb-128gb-gray/", "https://presli.by/product/planshet-samsung-galaxy-tab-s11-wifi-12gb-128gb-sm-x730nzsacau-serebristyj-66d6fdf895"] },
  { slug: "galaxy-buds4-pro", memory: null, byn: 620, sources: ["https://galaxy-store.by/galaxy-buds", "https://mobillife.by/katalog/samsung-galaxy-buds-4-pro-black.html"] },
  { slug: "xiaomi-17-ultra", memory: "512 ГБ", byn: 3520, sources: ["https://topmobile.by/mobile/xiaomi/xiaomi-17-ultra-16gb512gb", "https://redmi-shop.by/xiaomi-17-ultra"] },
  { slug: "xiaomi-17t-pro", memory: "256 ГБ", byn: 2250, sources: ["https://i-gadget.by/smartfony-i-telefony/xiaomi-17t-pro-12gb-256gb-black/", "https://5zv.by/xiaomi-17t-pro-12gb256gb-mezhdunarodnaya-versiya"] },
];
const targetSlugs = process.env.MARKET_TARGET_SLUGS
  ? new Set(process.env.MARKET_TARGET_SLUGS.split(",").map((slug) => slug.trim()).filter(Boolean))
  : null;
if (targetSlugs && [...targetSlugs].some((slug) => !benchmarks.some((row) => row.slug === slug))) {
  throw new Error("Unknown MARKET_TARGET_SLUGS entry");
}
const selectedBenchmarks = targetSlugs ? benchmarks.filter((row) => targetSlugs.has(row.slug)) : benchmarks;
const env = parse(await readFile(resolve(".env.local")));
if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing");
const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
try {
  await client.query(apply ? "BEGIN" : "BEGIN READ ONLY");
  await client.query("SET LOCAL lock_timeout = '5s'");
  const slugs = selectedBenchmarks.map((row) => row.slug);
  const products = (await client.query(`
    SELECT p.id,p.slug,p."basePriceByn",p."priceKind",p."isActive",b.slug AS brand
    FROM "Product" p JOIN "Brand" b ON b.id=p."brandId" WHERE p.slug=ANY($1)
    ${apply ? "FOR UPDATE OF p" : ""}
  `, [slugs])).rows;
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const variants = (await client.query(`
    SELECT v.id,v."productId",v."priceByn",max(CASE WHEN a.slug='memory' THEN av.value END) AS memory,
      count(DISTINCT oi.id)::int AS orders
    FROM "ProductVariant" v JOIN "Product" p ON p.id=v."productId"
    LEFT JOIN "ProductVariantOption" vo ON vo."variantId"=v.id
    LEFT JOIN "VariantAttributeValue" av ON av.id=vo."attributeValueId"
    LEFT JOIN "VariantAttribute" a ON a.id=av."attributeId"
    LEFT JOIN "OrderItem" oi ON oi."variantId"=v.id
    WHERE p.slug=ANY($1) GROUP BY v.id
  `, [slugs])).rows;
  const targets = selectedBenchmarks.map((benchmark) => {
    const product = productBySlug.get(benchmark.slug);
    if (!product || !product.isActive || product.priceKind === "VERIFIED_SHOP" || !["samsung", "xiaomi"].includes(product.brand)) {
      throw new Error(`Unsafe product: ${benchmark.slug}`);
    }
    const options = variants.filter((variant) => variant.productId === product.id);
    const selected = benchmark.memory ? options.filter((variant) => variant.memory === benchmark.memory) : [];
    if ((benchmark.memory && selected.length !== 1) || (!benchmark.memory && options.length)) {
      throw new Error(`Configuration is not unique: ${benchmark.slug}/${benchmark.memory ?? "base"}`);
    }
    if (selected[0]?.orders) throw new Error(`Ordered variant cannot be repriced automatically: ${benchmark.slug}`);
    if (benchmark.byn <= 0 || benchmark.sources.length < 2) throw new Error(`Insufficient price evidence: ${benchmark.slug}`);
    return { ...benchmark, product, variant: selected[0] ?? null };
  });
  console.log("Market estimates, not Di-SMART prices:");
  for (const target of targets) console.log(`${target.slug}${target.memory ? ` ${target.memory}` : ""}: ~${target.byn} BYN`);
  if (apply) {
    const path = resolve(`docs/catalog/market-prices-before-sync-${new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-")}.json`);
    await writeFile(path, `${JSON.stringify({ capturedAt: new Date().toISOString(), targets: targets.map(({ slug, memory, product, variant }) => ({ slug, memory, product, variant })) }, null, 2)}\n`, { flag: "wx" });
    for (const target of targets) {
      if (target.variant) await client.query(`UPDATE "ProductVariant" SET "priceByn"=$1 WHERE id=$2`, [target.byn, target.variant.id]);
      else await client.query(`UPDATE "Product" SET "basePriceByn"=$1 WHERE id=$2`, [target.byn, target.product.id]);
      await client.query(`UPDATE "Product" SET "priceKind"='MARKET_ESTIMATE' WHERE id=$1`, [target.product.id]);
    }
    await client.query("COMMIT");
    console.log(`Applied ${targets.length} explicitly labelled market estimates; previous values: ${path}`);
  } else {
    await client.query("ROLLBACK");
    console.log("Read-only preview. Use --apply to store these estimates.");
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
