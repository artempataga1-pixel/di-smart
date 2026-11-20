#!/usr/bin/env node
/** Link the reviewed Apple colour renders to catalog colours. Dry-run by default. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";
import appleColorImages from "../../prisma/apple-color-images.json" with { type: "json" };

const apply = process.argv.includes("--apply");
const env = parse(readFileSync(resolve(".env.local")));
if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing in .env.local");
const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
const slugs = Object.keys(appleColorImages);

for (const colors of Object.values(appleColorImages)) {
  for (const url of Object.values(colors)) {
    if (!url.startsWith("/media/") || !existsSync(resolve("public", url.slice(1)))) {
      throw new Error(`Missing local image: ${url}`);
    }
  }
}

await client.connect();
try {
  await client.query(apply ? "BEGIN" : "BEGIN READ ONLY");
  await client.query("SET LOCAL lock_timeout = '5s'");
  const colors = (await client.query(`
    SELECT p.id AS product_id, p.slug, p."isActive", b.slug AS brand,
           cv.id AS color_id, av.value AS color
    FROM "Product" p
    JOIN "Brand" b ON b.id=p."brandId"
    JOIN "ProductColorValue" cv ON cv."productId"=p.id
    JOIN "VariantAttributeValue" av ON av.id=cv."attributeValueId"
    WHERE p.slug=ANY($1)
    ORDER BY p.slug, av.value
  `, [slugs])).rows;
  const bySlug = new Map();
  for (const row of colors) {
    if (!bySlug.has(row.slug)) bySlug.set(row.slug, []);
    bySlug.get(row.slug).push(row);
  }
  for (const slug of slugs) {
    const rows = bySlug.get(slug) ?? [];
    if (!rows.length || rows.some((row) => row.brand !== "apple" || !row.isActive)) {
      throw new Error(`Expected active Apple product: ${slug}`);
    }
    const expected = Object.keys(appleColorImages[slug]).sort();
    const actual = rows.map((row) => row.color).sort();
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      throw new Error(`Colour mismatch for ${slug}: expected ${expected.join(", ")}; found ${actual.join(", ")}`);
    }
  }
  const before = (await client.query(`
    SELECT i.* FROM "ProductImage" i JOIN "Product" p ON p.id=i."productId"
    WHERE p.slug=ANY($1) ORDER BY p.slug, i."sortOrder"
  `, [slugs])).rows;
  const imageByColor = new Map();
  const mainByProduct = new Set();
  for (const image of before) {
    if (image.isMain) mainByProduct.add(image.productId);
    if (!image.colorValueId) continue;
    if (imageByColor.has(image.colorValueId)) throw new Error(`Multiple photos already linked to color ${image.colorValueId}`);
    imageByColor.set(image.colorValueId, image);
  }
  const planned = [];
  for (const slug of slugs) {
    const productColors = bySlug.get(slug);
    const productId = productColors[0].product_id;
    for (const [index, [name, url]] of Object.entries(appleColorImages[slug]).entries()) {
      const color = productColors.find((row) => row.color === name);
      const existing = imageByColor.get(color.color_id);
      planned.push({ slug, name, url, color, existing, isMain: !mainByProduct.has(productId) && index === 0, index });
    }
  }
  console.log(`${planned.length} colours across ${slugs.length} active Apple products; ${planned.filter((row) => row.existing).length} existing links, ${planned.filter((row) => !row.existing).length} inserts.`);
  if (apply) {
    const backupPath = resolve(`docs/catalog/apple-color-images-before-sync-${new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-")}.json`);
    writeFileSync(backupPath, JSON.stringify({ capturedAt: new Date().toISOString(), slugs, images: before }, null, 2) + "\n", { flag: "wx" });
    for (const row of planned) {
      const alt = `${row.slug}, цвет ${row.name}`;
      if (row.existing) {
        await client.query(`UPDATE "ProductImage" SET url=$1,alt=$2,"sortOrder"=$3 WHERE id=$4`,
          [row.url, alt, row.index, row.existing.id]);
      } else {
        await client.query(`INSERT INTO "ProductImage" (id,"productId",url,alt,"sortOrder","isMain","colorValueId","createdAt")
          VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
          [`apple-color-${row.color.color_id}`, row.color.product_id, row.url, alt, row.index, row.isMain, row.color.color_id]);
      }
    }
    const actual = (await client.query(`
      SELECT p.slug,av.value AS color,i.url
      FROM "Product" p JOIN "ProductColorValue" cv ON cv."productId"=p.id
      JOIN "VariantAttributeValue" av ON av.id=cv."attributeValueId"
      JOIN "ProductImage" i ON i."colorValueId"=cv.id
      WHERE p.slug=ANY($1)
    `, [slugs])).rows;
    for (const row of planned) {
      if (!actual.some((image) => image.slug === row.slug && image.color === row.name && image.url === row.url)) {
        throw new Error(`Verification failed: ${row.slug} / ${row.name}`);
      }
    }
    await client.query("COMMIT");
    console.log(`Applied and verified all ${planned.length} colour images. Backup: ${backupPath}`);
  } else {
    await client.query("ROLLBACK");
    console.log("Dry run only. Use --apply to update the catalog.");
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
