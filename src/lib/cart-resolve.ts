import { prisma } from "@/lib/prisma";
import { usdToByn } from "@/lib/pricing";
import { getPreferredCatalogProductImage } from "@/constants/content/catalog-media";
import type { Availability } from "@/types/cart";

export interface RawCartItem {
  productId: string;
  variantId: string | null;
  colorValueId: string | null;
  qty: number;
}

/** Верхний предел количества одной позиции — разумный запас для реального
 * покупателя, отсекающий испорченные/подделанные значения (Infinity, дробные
 * qty и т.п.), которые иначе дошли бы до Int-полей БД и уронили бы запрос. */
const MAX_ITEM_QTY = 20;

export function isRawCartItem(v: unknown): v is RawCartItem {
  if (!v || typeof v !== "object") return false;
  const item = v as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    (item.variantId === null || typeof item.variantId === "string") &&
    (item.colorValueId === null || typeof item.colorValueId === "string") &&
    typeof item.qty === "number" &&
    Number.isInteger(item.qty) &&
    item.qty > 0 &&
    item.qty <= MAX_ITEM_QTY
  );
}

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
 * сам товар — строка тихо выбрасывается из ответа.
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
    where: { id: { in: productIds }, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      colorValues: { include: { attributeValue: true } },
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
    if (!product) continue;

    const variant = raw.variantId ? product.variants.find((v) => v.id === raw.variantId) : undefined;
    const variantMissing = Boolean(raw.variantId) && !variant;

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

    const colorImage = raw.colorValueId
      ? product.images.find((img) => img.colorValueId === raw.colorValueId)
      : undefined;
    const mainImage = product.images.find((img) => img.isMain) ?? product.images[0];
    const imageUrl = getPreferredCatalogProductImage(
      product.slug,
      colorImage?.url ?? mainImage?.url
    );

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
      priceByn: usdToByn(priceUsd, rate),
      imageUrl,
      availability,
    });
  }

  return lines;
}
