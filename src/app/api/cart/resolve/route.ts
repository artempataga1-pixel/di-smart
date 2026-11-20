import { NextRequest, NextResponse } from "next/server";
import { getCurrentRate } from "@/lib/pricing";
import { isRawCartItem, resolveCartLines, type RawCartItem } from "@/lib/cart-resolve";
import type { ResolvedCartItem } from "@/types/cart";

import { MAX_CART_ITEMS } from "@/lib/cart-validation";
import { readJsonObject, RequestBodyError } from "@/lib/http-json";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

async function resolve(request: NextRequest) {
  const globalLimit = checkRateLimit("cart:global", { limit: 600, windowMs: 60_000 });
  const ip = getClientIp(request.headers);
  const localLimit = ip === "unknown" ? globalLimit : checkRateLimit(`cart:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!globalLimit.allowed || !localLimit.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: {
      "Retry-After": String(Math.max(globalLimit.retryAfterSeconds, localLimit.retryAfterSeconds)),
    } });
  }
  const body = await readJsonObject(request);
  const rawItemsInput: unknown[] = Array.isArray(body?.items) ? body.items : [];
  if (rawItemsInput.length > MAX_CART_ITEMS || !rawItemsInput.every(isRawCartItem)) {
    return NextResponse.json({ error: "invalid_cart" }, { status: 400 });
  }
  const rawItems: RawCartItem[] = rawItemsInput;

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

export async function POST(request: NextRequest) {
  try {
    return await resolve(request);
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ error: error.code }, { status: error.status });
    console.error("[cart] resolve failed", error);
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
}
