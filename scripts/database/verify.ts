import "dotenv/config";
import assert from "node:assert/strict";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";
import { databaseProvider } from "../../src/lib/database-provider";
const prisma = new PrismaClient({ adapter: createDatabaseAdapter() });
const rollback = new Error("verification-rollback");
async function main() {
  if (databaseProvider() !== "mysql") throw new Error("Run this check against MySQL 8.4 test database");
  const version = await prisma.$queryRaw<{ version: string }[]>`SELECT VERSION() AS version`;
  assert.match(version[0].version, /^8\.4\./);
  try {
    await prisma.$transaction(async tx => {
      const slug = `verify-${crypto.randomUUID()}`;
      const brand = await tx.brand.create({ data: { slug, name: "Проверка" } });
      const category = await tx.category.create({ data: { slug, name: "Проверка", brandId: brand.id } });
      const product = await tx.product.create({ data: { slug, name: "Тестовый Телефон", brandId: brand.id,
        categoryId: category.id, description: "Длинное описание ".repeat(500), basePriceUsd: "123.45", basePriceByn: "987.65" } });
      assert.equal(product.basePriceByn?.toString(), "987.65");
      assert.ok(product.description!.length > 191);
      const found = await tx.product.findMany({ where: { id: product.id, name: { contains: "тестовый телефон" } } });
      assert.equal(found.length, 1);
      await tx.product.update({ where: { id: product.id }, data: { basePriceByn: "1234.56" } });
      const order = await tx.order.create({ data: { name: "Тест", phone: "test-only", totalByn: "1234.56",
        exchangeRateUsed: "3.1234", legalAcknowledgment: { version: "test" },
        items: { create: { productId: product.id, productNameSnapshot: product.name,
          priceUsdSnapshot: "123.45", priceBynSnapshot: "1234.56", quantity: 1 } } }, include: { items: true } });
      assert.equal(order.items[0].priceBynSnapshot.toString(), "1234.56");
      assert.equal(order.exchangeRateUsed.toString(), "3.1234");
      assert.deepEqual(order.legalAcknowledgment, { version: "test" });
      const image = await tx.productImage.create({ data: { productId: product.id, url: `/uploads/${"a".repeat(250)}.webp` } });
      assert.ok(image.url.length > 191);
      throw rollback; // Test records are never committed, even on success.
    }, { timeout: 30_000 });
  } catch (error) {
    if (error !== rollback) throw error;
  }
  console.log("MySQL 8.4: decimal, text, Cyrillic search, admin updates, orders, JSON and images verified; rolled back.");
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
