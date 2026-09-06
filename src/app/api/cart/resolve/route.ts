import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentRate, usdToByn } from "@/lib/pricing";
import type { ResolvedCartItem } from "@/types/cart";

interface RawCartItem {
  productId: string;
  variantId: string | null;
  colorValueId: string | null;
  qty: number;
}

function isRawCartItem(v: unknown): v is RawCartItem {
  if (!v || typeof v !== "object") return false;
  const item = v as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    (item.variantId === null || typeof item.variantId === "string") &&
    (item.colorValueId === null || typeof item.colorValueId === "string") &&
    typeof item.qty === "number" &&
    item.qty > 0
  );
}

/** Резолв корзины: один batch-запрос по уникальным productId, не по одному
 * товару за раз. Если вариант строки пропал — строка помечается
 * OUT_OF_STOCK (цена товара по умолчанию), не выбрасывается. Если пропал
 * сам товар — строка тихо выбрасывается из ответа. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const rawItemsInput: unknown[] = Array.isArray(body?.items) ? body.items : [];
  const rawItems: RawCartItem[] = rawItemsInput.filter(isRawCartItem);

  if (rawItems.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const productIds = Array.from(new Set(rawItems.map((i) => i.productId)));
  const rate = await getCurrentRate();

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

  const items: ResolvedCartItem[] = [];

  for (const raw of rawItems) {
    const product = productById.get(raw.productId);
    if (!product) continue;

    const variant = raw.variantId ? product.variants.find((v) => v.id === raw.variantId) : undefined;
    const variantMissing = Boolean(raw.variantId) && !variant;

    const priceUsd = variant ? variant.priceUsd.toNumber() : product.basePriceUsd.toNumber();
    const availability = variantMissing
      ? "OUT_OF_STOCK"
      : variant
        ? variant.availability
        : product.availability;

    const variantLabel = variant
      ? variant.options
          .slice()
          .sort((a, b) => a.attributeValue.attribute.sortOrder - b.attributeValue.attribute.sortOrder)
          .map((o) => o.attributeValue.value)
          .join(", ") || null
      : null;

    const colorValue = raw.colorValueId
      ? product.colorValues.find((cv) => cv.id === raw.colorValueId)
      : undefined;
    const colorName = colorValue ? colorValue.attributeValue.value : null;

    const colorImage = raw.colorValueId
      ? product.images.find((img) => img.colorValueId === raw.colorValueId)
      : undefined;
    const mainImage = product.images.find((img) => img.isMain) ?? product.images[0];
    const imageUrl = colorImage?.url ?? mainImage?.url ?? null;

    items.push({
      productId: product.id,
      variantId: raw.variantId,
      colorValueId: raw.colorValueId,
      quantity: raw.qty,
      slug: product.slug,
      name: product.name,
      variantLabel,
      colorName,
      priceByn: usdToByn(priceUsd, rate),
      imageUrl,
      availability,
    });
  }

  return NextResponse.json({ items });
}
