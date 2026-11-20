-- Бренд принадлежит товару, а не определяется исключительно категорией.
-- Это позволяет держать Xiaomi Pad и Galaxy Tab в одной категории
-- «Планшеты», не искажая бренд карточки и фильтра каталога.
ALTER TABLE "Product" ADD COLUMN "brandId" TEXT;

UPDATE "Product" AS p
SET "brandId" = c."brandId"
FROM "Category" AS c
WHERE p."categoryId" = c."id";

ALTER TABLE "Product" ALTER COLUMN "brandId" SET NOT NULL;

CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");

ALTER TABLE "Product"
ADD CONSTRAINT "Product_brandId_fkey"
FOREIGN KEY ("brandId") REFERENCES "Brand"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
