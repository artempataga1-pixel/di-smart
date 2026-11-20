-- CreateTable
CREATE TABLE `Brand` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `logoUrl` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Brand_slug_key`(`slug`),
    INDEX `Brand_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `seoTitle` TEXT NULL,
    `seoDescription` TEXT NULL,
    `h1` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_brandId_idx`(`brandId`),
    INDEX `Category_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VariantAttribute` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isColor` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `VariantAttribute_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VariantAttributeValue` (
    `id` VARCHAR(191) NOT NULL,
    `attributeId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `colorHex` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VariantAttributeValue_attributeId_idx`(`attributeId`),
    UNIQUE INDEX `VariantAttributeValue_attributeId_value_key`(`attributeId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `shortDescription` TEXT NULL,
    `description` TEXT NULL,
    `isFlagship` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `basePriceUsd` DECIMAL(10, 2) NOT NULL,
    `basePriceByn` DECIMAL(10, 2) NULL,
    `priceKind` ENUM('VERIFIED_SHOP', 'MARKET_ESTIMATE') NOT NULL DEFAULT 'MARKET_ESTIMATE',
    `availability` ENUM('IN_STOCK', 'OUT_OF_STOCK') NOT NULL DEFAULT 'IN_STOCK',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `seoTitle` TEXT NULL,
    `seoDescription` TEXT NULL,
    `canonicalPath` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    INDEX `Product_categoryId_idx`(`categoryId`),
    INDEX `Product_brandId_idx`(`brandId`),
    INDEX `Product_isFlagship_idx`(`isFlagship`),
    INDEX `Product_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariant` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `priceUsd` DECIMAL(10, 2) NOT NULL,
    `priceByn` DECIMAL(10, 2) NULL,
    `sku` TEXT NULL,
    `availability` ENUM('IN_STOCK', 'OUT_OF_STOCK') NOT NULL DEFAULT 'IN_STOCK',
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductVariant_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariantAttribute` (
    `productId` VARCHAR(191) NOT NULL,
    `attributeId` VARCHAR(191) NOT NULL,

    INDEX `ProductVariantAttribute_attributeId_idx`(`attributeId`),
    PRIMARY KEY (`productId`, `attributeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariantOption` (
    `variantId` VARCHAR(191) NOT NULL,
    `attributeValueId` VARCHAR(191) NOT NULL,

    INDEX `ProductVariantOption_attributeValueId_idx`(`attributeValueId`),
    PRIMARY KEY (`variantId`, `attributeValueId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductColorValue` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `attributeValueId` VARCHAR(191) NOT NULL,

    INDEX `ProductColorValue_attributeValueId_idx`(`attributeValueId`),
    UNIQUE INDEX `ProductColorValue_productId_attributeValueId_key`(`productId`, `attributeValueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductColorOffer` (
    `id` VARCHAR(191) NOT NULL,
    `colorValueId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `priceByn` DECIMAL(10, 2) NULL,
    `availability` ENUM('IN_STOCK', 'OUT_OF_STOCK') NULL,

    INDEX `ProductColorOffer_variantId_idx`(`variantId`),
    UNIQUE INDEX `ProductColorOffer_colorValueId_variantId_key`(`colorValueId`, `variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `alt` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isMain` BOOLEAN NOT NULL DEFAULT false,
    `colorValueId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductImage_productId_idx`(`productId`),
    INDEX `ProductImage_colorValueId_idx`(`colorValueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSpec` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `value` TEXT NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ProductSpec_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExchangeRate` (
    `id` VARCHAR(191) NOT NULL,
    `usdToByn` DECIMAL(10, 4) NOT NULL,
    `setAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `setBy` TEXT NULL,

    INDEX `ExchangeRate_setAt_idx`(`setAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `phone` TEXT NOT NULL,
    `comment` TEXT NULL,
    `legalAcknowledgment` JSON NULL,
    `status` ENUM('NEW', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
    `totalByn` DECIMAL(12, 2) NOT NULL,
    `exchangeRateUsed` DECIMAL(10, 4) NOT NULL,
    `telegramSentAt` DATETIME(3) NULL,
    `telegramDeliveryLog` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Order_createdAt_idx`(`createdAt`),
    INDEX `Order_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `variantId` VARCHAR(191) NULL,
    `productNameSnapshot` TEXT NOT NULL,
    `variantLabelSnapshot` TEXT NULL,
    `colorLabelSnapshot` TEXT NULL,
    `priceUsdSnapshot` DECIMAL(10, 2) NOT NULL,
    `priceBynSnapshot` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER NOT NULL,

    INDEX `OrderItem_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VariantAttributeValue` ADD CONSTRAINT `VariantAttributeValue_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `VariantAttribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantAttribute` ADD CONSTRAINT `ProductVariantAttribute_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantAttribute` ADD CONSTRAINT `ProductVariantAttribute_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `VariantAttribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantOption` ADD CONSTRAINT `ProductVariantOption_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantOption` ADD CONSTRAINT `ProductVariantOption_attributeValueId_fkey` FOREIGN KEY (`attributeValueId`) REFERENCES `VariantAttributeValue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductColorValue` ADD CONSTRAINT `ProductColorValue_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductColorValue` ADD CONSTRAINT `ProductColorValue_attributeValueId_fkey` FOREIGN KEY (`attributeValueId`) REFERENCES `VariantAttributeValue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductColorOffer` ADD CONSTRAINT `ProductColorOffer_colorValueId_fkey` FOREIGN KEY (`colorValueId`) REFERENCES `ProductColorValue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductColorOffer` ADD CONSTRAINT `ProductColorOffer_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_colorValueId_fkey` FOREIGN KEY (`colorValueId`) REFERENCES `ProductColorValue`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSpec` ADD CONSTRAINT `ProductSpec_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

