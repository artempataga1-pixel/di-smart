/** Add researched specifications without replacing seller edits or other product data. */
import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";
import { CATALOG_SPEC_ADDITIONS } from "../../prisma/catalog-spec-additions";

async function main() {
  const env = parse(await readFile(resolve(".env.local")));
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
  const apply = process.argv.includes("--apply");

  await client.connect();
  try {
  await client.query("BEGIN");
  const snapshot: Record<string, { id: string; name: string; value: string; sortOrder: number }[]> = {};
  let added = 0;
  for (const [slug, additions] of Object.entries(CATALOG_SPEC_ADDITIONS)) {
    const products = await client.query<{ id: string }>(
      'SELECT id FROM "Product" WHERE slug = $1 AND "isActive" = true FOR UPDATE', [slug],
    );
    if (products.rowCount !== 1) throw new Error(`Active product missing: ${slug}`);
    const productId = products.rows[0].id;
    const current = await client.query<{ id: string; name: string; value: string; sortOrder: number }>(
      'SELECT id, name, value, "sortOrder" FROM "ProductSpec" WHERE "productId" = $1 ORDER BY "sortOrder", id',
      [productId],
    );
    snapshot[slug] = current.rows;
    const names = new Set(current.rows.map((row) => row.name.toLocaleLowerCase("ru")));
    let order = Math.max(-1, ...current.rows.map((row) => row.sortOrder)) + 1;
    for (const [name, value] of additions) {
      const normalizedName = name.toLocaleLowerCase("ru");
      if (names.has(normalizedName)) continue;
      if (apply) {
        await client.query(
          'INSERT INTO "ProductSpec" (id, "productId", name, value, "sortOrder") VALUES ($1, $2, $3, $4, $5)',
          [randomUUID(), productId, name, value, order],
        );
      }
      order += 1;
      added += 1;
      names.add(normalizedName);
    }
    if (names.size < 3) throw new Error(`Still fewer than three specifications: ${slug}`);
  }
  if (apply) {
    const backup = resolve("docs/catalog/specs-before-enrichment-2026-09-27.json");
    await writeFile(backup, `${JSON.stringify(snapshot, null, 2)}\n`);
    await client.query("COMMIT");
    console.log(`Added ${added} specifications; backup: ${backup}`);
  } else {
    await client.query("ROLLBACK");
    console.log(`Dry run: ${added} specifications can be added. Pass --apply to save.`);
  }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
