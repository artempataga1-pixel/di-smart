#!/usr/bin/env node
/** Apply only unambiguous matches from the dated client-site snapshot.
 * Default is a read-only preview. This is intentionally not a general import. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const apply = process.argv.includes("--apply");
const plan = JSON.parse(await readFile(resolve("scripts/catalog/match-plan-current.json"), "utf8"));
const source = JSON.parse(await readFile(resolve("docs/catalog/source-snapshot-2026-09-25.json"), "utf8"));
const env = parse(await readFile(resolve(".env.local")));
if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing");
if (!plan.targetSchemaReadyForByn) throw new Error("BYN migration not present in plan; regenerate it first");
if (plan.sourceCapturedAt !== source.capturedAt) throw new Error("Snapshot and plan disagree");
const ageHours = (Date.now() - Date.parse(source.capturedAt)) / 3_600_000;
if (!Number.isFinite(ageHours) || ageHours < 0 || ageHours > 72) {
  throw new Error("Snapshot is older than 72 hours; refresh source before changing prices");
}
const exact = plan.matches.filter((match) => match.status === "exact");
if (exact.length !== 9) throw new Error(`Expected 9 reviewed exact matches, found ${exact.length}`);
const expectedSlugs = new Set(["airpods-pro-3", "airpods-max", "airpods-4", "airpods-4-anc", "apple-20w-adapter"]);
if (new Set(exact.map((match) => match.destinations[0]?.slug)).size !== expectedSlugs.size ||
    exact.some((match) => !expectedSlugs.has(match.destinations[0]?.slug))) {
  throw new Error("Exact match set changed; review it manually");
}
const destinationKeys = exact.map((match) => {
  const dest = match.destinations[0];
  if (!dest || dest.variantId || !Number.isFinite(match.sourcePriceByn) || match.sourcePriceByn <= 0) {
    throw new Error(`Unsupported destination or price: ${match.sourceName}`);
  }
  return `${dest.productId}:${dest.colorId ?? ""}`;
});
if (new Set(destinationKeys).size !== destinationKeys.length) throw new Error("Duplicate destination in plan");

const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
try {
  await client.query(apply ? "BEGIN" : "BEGIN READ ONLY");
  await client.query("SET LOCAL lock_timeout = '5s'");
  const ids = [...new Set(exact.map((match) => match.destinations[0].productId))];
  const products = (await client.query(`
    SELECT id, slug, "basePriceByn", "priceKind", availability, "isActive"
    FROM "Product" WHERE id = ANY($1) ${apply ? "FOR UPDATE" : ""}
  `, [ids])).rows;
  const colors = (await client.query(`
    SELECT id, "productId" FROM "ProductColorValue" WHERE "productId" = ANY($1)
  `, [ids])).rows;
  const variants = (await client.query(`
    SELECT "productId", count(*)::int AS count FROM "ProductVariant"
    WHERE "productId" = ANY($1) GROUP BY "productId"
  `, [ids])).rows;
  const existingOffers = (await client.query(`
    SELECT id, "colorValueId", "variantId", "priceByn", availability
    FROM "ProductColorOffer" WHERE "colorValueId" = ANY($1)
  `, [colors.map((color) => color.id)])).rows;
  const byId = new Map(products.map((product) => [product.id, product]));
  for (const match of exact) {
    const dest = match.destinations[0];
    const product = byId.get(dest.productId);
    if (!product || product.slug !== dest.slug || !product.isActive) throw new Error(`Product changed: ${dest.slug}`);
    if (variants.some((variant) => variant.productId === dest.productId && variant.count > 0)) {
      throw new Error(`Unexpected variants: ${dest.slug}`);
    }
    const productColors = colors.filter((color) => color.productId === dest.productId);
    if (dest.colorId) {
      if (!productColors.some((color) => color.id === dest.colorId)) throw new Error(`Color changed: ${dest.slug}`);
    } else if (productColors.length) throw new Error(`Unpriced colors on ${dest.slug}`);
  }
  const maxId = products.find((product) => product.slug === "airpods-max")?.id;
  const maxColors = colors.filter((color) => color.productId === maxId);
  const matchedMaxColors = exact.filter((match) => match.destinations[0].productId === maxId);
  if (maxColors.length !== 5 || matchedMaxColors.length !== maxColors.length ||
      new Set(matchedMaxColors.map((match) => match.sourcePriceByn)).size !== 1) {
    throw new Error("AirPods Max colors/prices no longer fully covered");
  }
  console.log("Verified price candidates:");
  for (const match of exact) {
    console.log(`${match.destinations[0].slug}${match.destinations[0].color ? ` / ${match.destinations[0].color}` : ""}: ${match.sourcePriceByn} BYN (${match.sourceInStock ? "in stock" : "out of stock"})`);
  }
  if (apply) {
    const backupPath = resolve(`docs/catalog/prices-before-sync-${new Date().toISOString().slice(0, 10)}.json`);
    await writeFile(backupPath, `${JSON.stringify({ capturedAt: new Date().toISOString(), products, colorOffers: existingOffers }, null, 2)}\n`, { flag: "wx" });
    for (const match of exact) {
      const dest = match.destinations[0];
      const availability = match.sourceInStock ? "IN_STOCK" : "OUT_OF_STOCK";
      if (dest.colorId) {
        await client.query(`
          INSERT INTO "ProductColorOffer" (id, "colorValueId", "variantId", "priceByn", availability)
          VALUES ($1, $2, NULL, $3, $4::"Availability")
          ON CONFLICT ("colorValueId") WHERE "variantId" IS NULL
          DO UPDATE SET "priceByn" = EXCLUDED."priceByn", availability = EXCLUDED.availability
        `, [`source-${dest.colorId}`, dest.colorId, match.sourcePriceByn, availability]);
      } else {
        await client.query(`UPDATE "Product" SET "basePriceByn"=$1, availability=$2::"Availability" WHERE id=$3`,
          [match.sourcePriceByn, availability, dest.productId]);
      }
    }
    await client.query(`UPDATE "Product" SET "basePriceByn"=$1 WHERE id=$2`,
      [matchedMaxColors[0].sourcePriceByn, maxId]);
    await client.query(`UPDATE "Product" SET "priceKind"='VERIFIED_SHOP' WHERE id = ANY($1)`, [ids]);
    await client.query("COMMIT");
    console.log(`Applied 9 source prices to 5 products; pre-change values saved to ${backupPath}`);
  } else {
    await client.query("ROLLBACK");
    console.log("Read-only preview. Run with --apply after reviewing exact matches.");
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
