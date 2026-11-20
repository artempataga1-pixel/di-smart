import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { PrismaClient, Prisma } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";
import { databaseProvider } from "../../src/lib/database-provider";

// Parent tables precede children; existing IDs and order snapshots are preserved.
const models = ["brand", "category", "variantAttribute", "variantAttributeValue", "product",
  "productVariant", "productVariantAttribute", "productVariantOption", "productColorValue",
  "productColorOffer", "productImage", "productSpec", "exchangeRate", "order", "orderItem"] as const;
const dates = new Set(["createdAt", "updatedAt", "setAt", "telegramSentAt"]);
const jsonFields = new Set(["legalAcknowledgment", "telegramDeliveryLog"]);
const prisma = new PrismaClient({ adapter: createDatabaseAdapter() });
// Dynamic delegates have different generated argument signatures, but the export
// protocol uses only findMany/count/createMany common to all listed models.
type Delegate = { findMany(): Promise<Record<string, unknown>[]>; count(): Promise<number>;
  createMany(args: { data: Record<string, unknown>[] }): Promise<unknown> };
function delegate(client: unknown, model: string): Delegate {
  return (client as Record<string, Delegate>)[model];
}
function checksum(data: unknown) {
  return createHash("sha256").update(JSON.stringify(data)).digest("hex");
}
async function main() {
  const [action, file] = process.argv.slice(2);
  if (!file || !["export", "import"].includes(action)) throw new Error("Usage: tsx scripts/database/transfer.ts export|import /path/snapshot.json");
  if (action === "export") {
    const rows = await prisma.$transaction(async tx => {
      const result: Record<string, unknown[]> = {};
      for (const model of models) result[model] = await delegate(tx, model).findMany();
      return result;
    }, { isolationLevel: "RepeatableRead", timeout: 120_000 });
    // Serializes Dates as ISO and Decimals as exact strings, without Number rounding.
    const normalized = JSON.parse(JSON.stringify(rows));
    await writeFile(file, JSON.stringify({ format: 1, provider: databaseProvider(), exportedAt: new Date().toISOString(),
      checksum: checksum(normalized), rows: normalized }, null, 2), { mode: 0o600, flag: "wx" });
    console.log("Exported:", Object.fromEntries(models.map(model => [model, rows[model].length])));
    return;
  }
  const snapshot = JSON.parse(await readFile(file, "utf8"));
  if (snapshot.format !== 1 || checksum(snapshot.rows) !== snapshot.checksum) throw new Error("Invalid or damaged snapshot");
  for (const model of models) if (!Array.isArray(snapshot.rows[model])) throw new Error(`Missing table ${model}`);
  await prisma.$transaction(async tx => {
    for (const model of models) {
      if (await delegate(tx, model).count() !== 0) throw new Error(`Target table ${model} is not empty; use a new database`);
    }
    for (const model of models) {
      const data = snapshot.rows[model].map((row: Record<string, unknown>) => Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key,
          jsonFields.has(key) && value === null ? Prisma.DbNull : dates.has(key) && value !== null ? new Date(value as string) : value])));
      for (let i = 0; i < data.length; i += 100) await delegate(tx, model).createMany({ data: data.slice(i, i + 100) });
      if (await delegate(tx, model).count() !== data.length) throw new Error(`Count mismatch: ${model}`);
    }
  }, { timeout: 120_000 });
  console.log("Imported and verified row counts. Source database was not modified.");
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Transfer failed"); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
