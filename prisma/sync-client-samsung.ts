import type { PrismaClient } from "../src/generated/prisma/client";
import { CLIENT_SAMSUNG_ASSORTMENT, samsungConfigurationLabel } from "./client-samsung-assortment";

/** Provider-neutral, idempotent sync. Existing prices, photos and ordered SKU IDs are retained. */
export async function syncClientSamsung(prisma: PrismaClient, slugs?: string[]) {
    const definitions = slugs ? CLIENT_SAMSUNG_ASSORTMENT.filter(p => slugs.includes(p.slug)) : CLIENT_SAMSUNG_ASSORTMENT;
    if (slugs && definitions.length !== new Set(slugs).size) throw new Error("Unknown Samsung assortment slug");
    const brand = await prisma.brand.upsert({ where: { slug: "samsung" }, update: { isActive: true }, create: { slug: "samsung", name: "Samsung" } });
    const attr = await prisma.variantAttribute.upsert({ where: { slug: "samsung-configuration" },
      update: {}, create: { slug: "samsung-configuration", name: "Конфигурация", sortOrder: 1 } });
    const colorAttr = await prisma.variantAttribute.upsert({ where: { slug: "color" }, update: {},
      create: { slug: "color", name: "Цвет", isColor: true, sortOrder: 5 } });
    const report: { slug: string; configurations: string[]; unpriced: number }[] = [];
    for (const def of definitions) {
      const result = await prisma.$transaction(async tx => {
      const category = await tx.category.upsert({ where: { slug: def.category }, update: { isActive: true,
        ...(def.category === "watch" ? { name: "Часы", h1: "Часы", seoTitle: "Часы Apple Watch и Samsung Galaxy Watch — Di-SMART",
          seoDescription: "Apple Watch и Samsung Galaxy Watch: варианты размера и связи, доставка по Беларуси." } : {}) },
        create: { slug: def.category, name: def.category === "watch" ? "Часы" : def.category === "samsung-tablets" ? "Планшеты" : "Samsung", brandId: brand.id } });
      const product = await tx.product.upsert({ where: { slug: def.slug },
        update: { name: def.name, brandId: brand.id, categoryId: category.id, isActive: true },
        create: { slug: def.slug, name: def.name, brandId: brand.id, categoryId: category.id, basePriceUsd: 0,
          shortDescription: def.configurations.map(samsungConfigurationLabel).join("; "),
          description: `${def.name}. ${def.configurations.map(samsungConfigurationLabel).join("; ")}.`, priceKind: "MARKET_ESTIMATE" } });
      const old = await tx.productVariant.findMany({ where: { productId: product.id },
        include: { options: { include: { attributeValue: { include: { attribute: true } } } }, _count: { select: { orderItems: true, colorOffers: true } } } });
      if (def.image && await tx.productImage.count({ where: { productId: product.id } }) === 0) {
        await tx.productImage.create({ data: { productId: product.id, url: def.image, alt: def.name, isMain: true } });
      }
      const used = new Set<string>();
      let unpriced = 0;
      for (const [index, configuration] of def.configurations.entries()) {
        const label = samsungConfigurationLabel(configuration);
        const value = await tx.variantAttributeValue.upsert({ where: { attributeId_value: { attributeId: attr.id, value: label } },
          update: {}, create: { attributeId: attr.id, value: label, sortOrder: index } });
        const exact = old.find(v => !used.has(v.id) && v.options.some(o => o.attributeValue.attributeId === attr.id && o.attributeValue.value === label));
        // Unqualified tablet prices cannot be assumed to be LTE prices. Reuse legacy Wi-Fi storage tiers only.
        const legacy = !configuration.connection || configuration.connection === "Wi-Fi" ? old.find(v => !used.has(v.id) &&
          v.options.length === 1 && v.options[0].attributeValue.attribute.slug === "memory" && v.options[0].attributeValue.value === `${configuration.storage} ГБ`) : undefined;
        const prior = exact ?? legacy;
        const variant = prior ? await tx.productVariant.update({ where: { id: prior.id }, data: { isDefault: index === 0, sortOrder: index,
          sku: prior.sku ?? `${def.slug}-${configuration.code ?? configuration.ram}-${configuration.storage ?? configuration.size}` } }) :
          await tx.productVariant.create({ data: { productId: product.id, priceUsd: 0, isDefault: index === 0, sortOrder: index,
            sku: `${def.slug}-${configuration.code ?? configuration.ram}-${configuration.storage ?? configuration.size}` } });
        used.add(variant.id);
        if (!variant.priceByn && variant.priceUsd.toNumber() <= 0) unpriced++;
        await tx.productVariantOption.deleteMany({ where: { variantId: variant.id } });
        await tx.productVariantOption.create({ data: { variantId: variant.id, attributeValueId: value.id } });
      }
      for (const v of old.filter(v => !used.has(v.id))) {
        if (v._count.orderItems || v._count.colorOffers) {
          // Historical order snapshots stay intact; removed options cannot remain selectable.
          await tx.productVariant.update({ where: { id: v.id }, data: { availability: "OUT_OF_STOCK", isDefault: false } });
          await tx.productVariantOption.deleteMany({ where: { variantId: v.id } });
          await tx.productColorOffer.updateMany({ where: { variantId: v.id }, data: { availability: "OUT_OF_STOCK" } });
        } else await tx.productVariant.delete({ where: { id: v.id } });
      }
      await tx.productVariantAttribute.deleteMany({ where: { productId: product.id } });
      await tx.productVariantAttribute.create({ data: { productId: product.id, attributeId: attr.id } });
      if (def.colors) {
        // Preserve photos, offers and colour IDs when the client's gray is the existing graphite finish.
        if (["galaxy-tab-s11", "galaxy-tab-s11-ultra"].includes(def.slug)) {
          const gray = await tx.variantAttributeValue.upsert({ where: { attributeId_value: { attributeId: colorAttr.id, value: "Серый" } },
            update: {}, create: { attributeId: colorAttr.id, value: "Серый", colorHex: "#85888c" } });
          const graphite = await tx.productColorValue.findFirst({ where: { productId: product.id, attributeValue: { value: "Графитовый", attributeId: colorAttr.id } } });
          const existingGray = await tx.productColorValue.findUnique({ where: { productId_attributeValueId: { productId: product.id, attributeValueId: gray.id } } });
          if (graphite && !existingGray) await tx.productColorValue.update({ where: { id: graphite.id }, data: { attributeValueId: gray.id } });
        }
        const desired: string[] = [];
        for (const [index, name] of def.colors.entries()) {
          const hex = name === "Синий" ? "#7895b3" : name === "Серебристый" ? "#d5d6d8" : name === "Коралловый красный" ? "#d85f67" : "#85888c";
          const value = await tx.variantAttributeValue.upsert({ where: { attributeId_value: { attributeId: colorAttr.id, value: name } },
            update: {}, create: { attributeId: colorAttr.id, value: name, colorHex: hex, sortOrder: index } });
          const cv = await tx.productColorValue.upsert({ where: { productId_attributeValueId: { productId: product.id, attributeValueId: value.id } },
            update: {}, create: { productId: product.id, attributeValueId: value.id } });
          desired.push(cv.id);
        }
        await tx.productImage.updateMany({ where: { productId: product.id, colorValueId: { notIn: desired } }, data: { colorValueId: null } });
        const extras = await tx.productColorValue.findMany({ where: { productId: product.id, id: { notIn: desired } } });
        for (const extra of extras) await tx.productColorValue.delete({ where: { id: extra.id } });
      }
      const facts: [string, string][] = [
        ["Конфигурации поставки", def.configurations.map(samsungConfigurationLabel).join("; ")],
        ...(def.year ? [["Год версии", String(def.year)] as [string, string]] : []),
        ...(def.clientName ? [["Название в прайсе", def.clientName] as [string, string]] : []),
      ];
      // Replace broad RAM/storage statements with the client's exact supplied configurations.
      await tx.productSpec.deleteMany({ where: { productId: product.id, name: { in: ["Оперативная память", "Память", ...facts.map(([name]) => name)] } } });
      await tx.productSpec.createMany({ data: facts.map(([name, value], index) => ({ productId: product.id, name, value, sortOrder: 20 + index })) });
      return { slug: def.slug, configurations: def.configurations.map(samsungConfigurationLabel), unpriced };
      }, { timeout: 120_000, maxWait: 15_000 });
      report.push(result);
    }
    return report;
}
