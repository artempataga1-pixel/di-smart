-- Keep the newly added Xiaomi family ahead of accessories in the default seed order.
UPDATE "Brand" SET "sortOrder" = 3, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'accessories' AND "sortOrder" = 2;
