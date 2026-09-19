-- Preserve Samsung category identity, products and existing links.
UPDATE "Category" SET "name" = 'Samsung', "h1" = 'Samsung', "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'samsung-smartphones';

INSERT INTO "Brand" ("id", "slug", "name", "sortOrder", "updatedAt")
VALUES ('brand-xiaomi-storefront', 'xiaomi', 'Xiaomi', 2, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Category" ("id", "slug", "name", "brandId", "sortOrder", "h1", "seoTitle", "seoDescription", "updatedAt")
SELECT 'category-xiaomi-smartphones', 'xiaomi-smartphones', 'Xiaomi', "id", 0, 'Xiaomi', 'Смартфоны Xiaomi — Di-SMART', 'Смартфоны Xiaomi: выберите свою модель в Di-SMART.', CURRENT_TIMESTAMP
FROM "Brand" WHERE "slug" = 'xiaomi'
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Category" ("id", "slug", "name", "brandId", "sortOrder", "h1", "seoTitle", "seoDescription", "updatedAt")
SELECT 'category-xiaomi-laptops', 'laptops', 'Ноутбуки', "id", 1, 'Ноутбуки', 'Ноутбуки Xiaomi Book и RedmiBook — Di-SMART', 'Ноутбуки для работы, учёбы и творчества в Di-SMART.', CURRENT_TIMESTAMP
FROM "Brand" WHERE "slug" = 'xiaomi'
ON CONFLICT ("slug") DO NOTHING;
