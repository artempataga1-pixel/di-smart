CREATE TYPE "PriceKind" AS ENUM ('VERIFIED_SHOP', 'MARKET_ESTIMATE');

ALTER TABLE "Product" ADD COLUMN "basePriceByn" DECIMAL(10,2);
ALTER TABLE "Product" ADD COLUMN "priceKind" "PriceKind" NOT NULL DEFAULT 'MARKET_ESTIMATE';
ALTER TABLE "ProductVariant" ADD COLUMN "priceByn" DECIMAL(10,2);

ALTER TABLE "Order" ALTER COLUMN "totalByn" TYPE DECIMAL(12,2) USING "totalByn"::DECIMAL(12,2);
ALTER TABLE "OrderItem" ALTER COLUMN "priceBynSnapshot" TYPE DECIMAL(10,2) USING "priceBynSnapshot"::DECIMAL(10,2);

ALTER TABLE "Product" ADD CONSTRAINT "Product_basePriceByn_positive" CHECK ("basePriceByn" IS NULL OR "basePriceByn" > 0);
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_priceByn_positive" CHECK ("priceByn" IS NULL OR "priceByn" > 0);

CREATE TABLE "ProductColorOffer" (
  "id" TEXT NOT NULL,
  "colorValueId" TEXT NOT NULL,
  "variantId" TEXT,
  "priceByn" DECIMAL(10,2),
  "availability" "Availability",
  CONSTRAINT "ProductColorOffer_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductColorOffer_colorValueId_fkey" FOREIGN KEY ("colorValueId") REFERENCES "ProductColorValue"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProductColorOffer_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProductColorOffer_priceByn_positive" CHECK ("priceByn" IS NULL OR "priceByn" > 0),
  CONSTRAINT "ProductColorOffer_has_override" CHECK ("priceByn" IS NOT NULL OR "availability" IS NOT NULL)
);
CREATE UNIQUE INDEX "ProductColorOffer_colorValueId_variantId_key" ON "ProductColorOffer"("colorValueId", "variantId");
CREATE UNIQUE INDEX "ProductColorOffer_base_color_unique" ON "ProductColorOffer"("colorValueId") WHERE "variantId" IS NULL;
CREATE INDEX "ProductColorOffer_variantId_idx" ON "ProductColorOffer"("variantId");
