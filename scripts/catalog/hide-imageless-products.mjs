#!/usr/bin/env node
/** Hide only reviewed products without any DB image or local media fallback. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const slugs = [
  "cable-braided-usbc", "cable-usbc-jack", "ipad-folio-case",
  "macbook-air-13-m4", "macbook-pro-16-m5", "samsung-cable-usbc-usbc",
];
const mediaRegistry = await readFile(resolve("src/constants/content/catalog-media.ts"), "utf8");
for (const slug of slugs) {
  if (mediaRegistry.includes(`"${slug}":`)) throw new Error(`${slug} has a local media fallback; review before hiding`);
}
const env = parse(await readFile(resolve(".env.local")));
const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
const apply = process.argv.includes("--apply");
try {
  await client.query(apply ? "BEGIN" : "BEGIN READ ONLY");
  await client.query("SET LOCAL lock_timeout = '5s'");
  const rows = (await client.query(`
    SELECT p.id,p.slug,p."isActive",count(i.id)::int AS images
    FROM "Product" p LEFT JOIN "ProductImage" i ON i."productId"=p.id
    WHERE p.slug=ANY($1)
    GROUP BY p.id ORDER BY p.slug
  `, [slugs])).rows;
  if (rows.length !== slugs.length || rows.some((row) => row.images !== 0)) {
    throw new Error("Target set changed or an image was added; refusing to hide");
  }
  console.log(rows.map((row) => `${row.slug}: ${row.isActive ? "active" : "already hidden"}`).join("\n"));
  if (apply) {
    const backup = resolve(`docs/catalog/imageless-visibility-before-${new Date().toISOString().slice(0, 10)}.json`);
    await writeFile(backup, `${JSON.stringify({ capturedAt: new Date().toISOString(), rows }, null, 2)}\n`, { flag: "wx" });
    await client.query(`UPDATE "Product" SET "isActive"=false WHERE slug=ANY($1)`, [slugs]);
    await client.query("COMMIT");
    console.log(`Hidden ${slugs.length} products; backup: ${backup}`);
  } else {
    await client.query("ROLLBACK");
    console.log("Read-only preview; pass --apply to hide.");
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
