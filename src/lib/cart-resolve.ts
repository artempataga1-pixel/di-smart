import { isStorefrontVariantAllowed } from "./storefront-variants";
import { prisma } from "@/lib/prisma";
import { resolveBynPrice } from "@/lib/pricing";
import { getCartProductImage } from "@/constants/content/catalog-media";
import type { Availability } from "@/types/cart";

import type { RawCartItem } from "./cart-validation";
export { isRawCartItem, type RawCartItem } from "./cart-validation";

/** Строка корзины, дополненная структурированными парами атрибутов
 * (имя атрибута + значение) — нужны для сообщения в Telegram и снимка
 * заказа, но не входят в публичный ResolvedCartItem (используется в
 * CartDrawer/CartItemRow), чтобы не менять уже согласованный формат. */
export interface ResolvedCartLine {
  productId: string;
  variantId: string | null;
  colorValueId: string | null;
  quantity: number;
  slug: string;
  name: string;
  variantLabel: string | null;
  variantAttributePairs: { attributeName: string; value: string }[];
  colorName: string | null;
  priceUsd: number;
  priceByn: number;
  imageUrl: string | null;
  availability: Availability;
}

/** Резолв корзины: один batch-запрос по уникальным productId, не по одному
 * товару за раз. Если вариант строки пропал — строка помечается
 * OUT_OF_STOCK (цена товара по умолчанию), не выбрасывается. Если пропал
 * сам товар — остаётся недоступная строка, которую покупатель может удалить.
 *
 * `rate` — обязательный параметр, получается вызывающим кодом РОВНО ОДИН
 * РАЗ на весь запрос: используется и для priceByn каждой строки, и (в
 * /api/order) для Order.exchangeRateUsed — иначе при смене курса между
 * двумя внутренними обращениями снимок цены разъедется с сохранённым
 * курсом. */
export async function resolveCartLines(
  rawItems: RawCartItem[],
  rate: number
): Promise<ResolvedCartLine[]> {
  if (rawItems.length === 0) return [];

  const productIds = Array.from(new Set(rawItems.map((i) => i.productId)));

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
      category: { isActive: true },
      brand: { isActive: true },
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      colorValues: { include: { attributeValue: true, offers: true } },
      variants: {
        include: {
          options: { include: { attributeValue: { include: { attribute: true } } } },
        },
      },
    },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  const lines: ResolvedCartLine[] = [];

  for (const raw of rawItems) {
    const product = productById.get(raw.productId);
    if (!product) {
      lines.push({ productId: raw.productId, variantId: raw.variantId, colorValueId: raw.colorValueId,
        quantity: raw.qty, slug: "", name: "Товар больше недоступен", variantLabel: null,
        variantAttributePairs: [], colorName: null, priceUsd: 0, priceByn: 0,
        imageUrl: null, availability: "OUT_OF_STOCK" });
      continue;
    }

    const variant = raw.variantId ? product.variants.find((v) => v.id === raw.variantId && isStorefrontVariantAllowed(product.slug, v.options)) : undefined;
    const variantMissing = (Boolean(raw.variantId) && !variant) || (!raw.variantId && product.variants.length > 0);

    const priceUsd = variant ? variant.priceUsd.toNumber() : product.basePriceUsd.toNumber();
    const availability: Availability = variantMissing
      ? "OUT_OF_STOCK"
      : variant
        ? variant.availability
        : product.availability;

    const sortedOptions = variant
      ? variant.options
          .slice()
          .sort((a, b) => a.attributeValue.attribute.sortOrder - b.attributeValue.attribute.sortOrder)
      : [];

    const variantLabel = sortedOptions.length
      ? sortedOptions.map((o) => o.attributeValue.value).join(", ")
      : null;

    const variantAttributePairs = sortedOptions.map((o) => ({
      attributeName: o.attributeValue.attribute.name,
      value: o.attributeValue.value,
    }));

    const colorValue = raw.colorValueId
      ? product.colorValues.find((cv) => cv.id === raw.colorValueId)
      : undefined;
    const colorName = colorValue ? colorValue.attributeValue.value : null;
    const colorOffer = variantMissing ? undefined : colorValue?.offers.find((offer) => offer.variantId === (variant?.id ?? null));

    const colorImage = raw.colorValueId
      ? product.images.find((img) => img.colorValueId === raw.colorValueId)
      : undefined;
    const mainImage = product.images.find((img) => img.isMain) ?? product.images[0];
    const imageUrl = getCartProductImage(
      product.slug,
      colorImage?.url,
      mainImage?.url
    );

    const resolvedPrice = colorOffer?.priceByn?.toNumber() ?? (variant
      ? resolveBynPrice(variant.priceByn, priceUsd, rate)
      : resolveBynPrice(product.basePriceByn, priceUsd, rate));
    lines.push({
      productId: product.id,
      variantId: raw.variantId,
      colorValueId: raw.colorValueId,
      quantity: raw.qty,
      slug: product.slug,
      name: product.name,
      variantLabel,
      variantAttributePairs,
      colorName,
      priceUsd,
      priceByn: resolvedPrice,
      imageUrl,
      availability: resolvedPrice <= 0 || (raw.colorValueId && !colorValue) || (!raw.colorValueId && product.colorValues.length > 0)
        ? "OUT_OF_STOCK" : availability === "OUT_OF_STOCK" ? availability : colorOffer?.availability ?? availability,
    });
  }

  return lines;
}
