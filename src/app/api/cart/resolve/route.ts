import { NextRequest, NextResponse } from "next/server";
import { getCurrentRate } from "@/lib/pricing";
import { isRawCartItem, resolveCartLines, type RawCartItem } from "@/lib/cart-resolve";
import type { ResolvedCartItem } from "@/types/cart";

const MAX_CART_ITEMS = 50;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const rawItemsInput: unknown[] = Array.isArray(body?.items) ? body.items : [];
  const rawItems: RawCartItem[] = rawItemsInput.filter(isRawCartItem).slice(0, MAX_CART_ITEMS);

  if (rawItems.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const rate = await getCurrentRate();
  const lines = await resolveCartLines(rawItems, rate);

  const items: ResolvedCartItem[] = lines.map((l) => ({
    productId: l.productId,
    variantId: l.variantId,
    colorValueId: l.colorValueId,
    quantity: l.quantity,
    slug: l.slug,
    name: l.name,
    variantLabel: l.variantLabel,
    colorName: l.colorName,
    priceByn: l.priceByn,
    imageUrl: l.imageUrl,
    availability: l.availability,
  }));

  return NextResponse.json({ items });
}
