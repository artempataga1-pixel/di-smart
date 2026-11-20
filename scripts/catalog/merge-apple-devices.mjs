#!/usr/bin/env node
/** Merge Vision Pro, HomePod and Apple TV into one public Apple category. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const sourceSlugs = ["vision-pro", "homepod", "apple-tv"];
const targetSlug = "apple-devices";
const expectedProducts = [
  "apple-vision-pro-m5",
  "homepod-2",
  "apple-tv-4k-3-wifi-64",
  "apple-tv-4k-3-ethernet-128",
];
const apply = process.argv.includes("--apply");
const env = parse(await readFile(resolve(".env.local")));
if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing");

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
});
await client.connect();

try {
  await client.query(apply ? "BEGIN" : "BEGIN READ ONLY");
  await client.query("SET LOCAL lock_timeout = '5s'");
  const categories = (await client.query(`
    SELECT c.id, c.slug, c.name, c."brandId", c."sortOrder", c."isActive",
      c."seoTitle", c."seoDescription", c.h1, b.slug AS "brandSlug"
    FROM "Category" c JOIN "Brand" b ON b.id = c."brandId"
    WHERE c.slug = ANY($1)
    ORDER BY c.slug
  `, [[...sourceSlugs, targetSlug]])).rows;
  const products = (await client.query(`
    SELECT p.id, p.slug, p."categoryId", p."isActive", c.slug AS "categorySlug"
    FROM "Product" p JOIN "Category" c ON c.id = p."categoryId"
    WHERE c.slug = ANY($1) OR p.slug = ANY($2)
    ORDER BY p.slug
  `, [[...sourceSlugs, targetSlug], expectedProducts])).rows;
  const target = categories.find((row) => row.slug === targetSlug);
  const sources = categories.filter((row) => sourceSlugs.includes(row.slug));
  const actualProductSlugs = products.map((row) => row.slug).sort();
  if (sources.length !== sourceSlugs.length || sources.some((row) => row.brandSlug !== "apple")) {
    throw new Error("Source categories changed; inspect them before merging");
  }
  if (actualProductSlugs.join("|") !== [...expectedProducts].sort().join("|")) {
    throw new Error(`Unexpected products in Apple categories: ${actualProductSlugs.join(", ")}`);
  }

  const alreadyMerged = target?.isActive
    && target.name === "Другая техника Apple"
    && sources.every((row) => !row.isActive)
    && products.every((row) => row.categoryId === target.id);
  if (alreadyMerged) {
    await client.query("ROLLBACK");
    console.log("Already merged: all four products belong to apple-devices.");
  } else {
    if (target || sources.some((row) => !row.isActive) || products.some((row) => !sourceSlugs.includes(row.categorySlug))) {
      throw new Error("Partial merge or changed category state; inspect before applying");
    }
    console.log(`Will merge ${sourceSlugs.join(", ")} into ${targetSlug}: ${products.length} products`);
    if (!apply) {
      await client.query("ROLLBACK");
      console.log("Read-only preview. Pass --apply to merge.");
    } else {
      const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
      const backupPath = resolve(`docs/catalog/apple-categories-before-merge-${timestamp}.json`);
      await writeFile(backupPath, `${JSON.stringify({ capturedAt: new Date().toISOString(), categories, products }, null, 2)}\n`, { flag: "wx" });
      const newCategory = (await client.query(`
        INSERT INTO "Category" (id, slug, name, "brandId", "sortOrder", "isActive", "seoTitle", "seoDescription", h1, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, true, $6, $7, $3, now(), now())
        RETURNING id
      `, [
        `cat_apple_devices_${Date.now()}`,
        targetSlug,
        "Другая техника Apple",
        sources[0].brandId,
        Math.min(...sources.map((row) => row.sortOrder)),
        "Другая техника Apple: Vision Pro, HomePod и Apple TV — Di-SMART Electronics",
        "Apple Vision Pro, HomePod и Apple TV 4K в одном разделе. Характеристики и ориентировочные цены в BYN.",
      ])).rows[0];
      const moved = await client.query(`
        UPDATE "Product" SET "categoryId" = $1, "updatedAt" = now()
        WHERE "categoryId" = ANY($2)
      `, [newCategory.id, sources.map((row) => row.id)]);
      if (moved.rowCount !== products.length) throw new Error("Moved product count changed; transaction rolled back");
      await client.query(`
        UPDATE "Category" SET "isActive" = false, "updatedAt" = now()
        WHERE id = ANY($1)
      `, [sources.map((row) => row.id)]);
      await client.query("COMMIT");
      console.log(`Merged ${moved.rowCount} products. Previous state: ${backupPath}`);
    }
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
