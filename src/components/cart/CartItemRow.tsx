"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import type { CartItemKey, ResolvedCartItem } from "@/types/cart";
import { Price } from "@/components/ui/Price";
import { CatalogVisual } from "@/components/ui/visuals/CatalogVisual";
import { useCart } from "@/lib/cart-context";

export function CartItemRow({ item }: { item: ResolvedCartItem }) {
  const { setQuantity, removeItem } = useCart();
  const itemKey: CartItemKey = {
    productId: item.productId,
    variantId: item.variantId,
    colorValueId: item.colorValueId,
  };
  const outOfStock = item.availability === "OUT_OF_STOCK";
  const configLabel = [item.variantLabel, item.colorName].filter(Boolean).join(" · ");

  return (
    <div className="flex gap-3 py-4">
      <Link
        href={`/product/${item.slug}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface-soft)]"
      >
        <CatalogVisual
          imageUrl={item.imageUrl}
          alt={item.name}
          iconHint={item.name}
          gradientSeed={item.productId}
          size="sm"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/product/${item.slug}`}
              className="text-sm font-medium leading-snug text-[var(--color-text)] hover:text-[var(--color-accent-ink)]"
            >
              {item.name}
            </Link>
            {configLabel && (
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">{configLabel}</p>
            )}
            {outOfStock && (
              <p className="mt-0.5 text-xs font-medium text-[var(--color-warning)]">Нет в наличии</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(itemKey)}
            aria-label="Удалить товар"
            className="shrink-0 text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-full border border-[var(--color-line)]">
            <button
              type="button"
              onClick={() => setQuantity(itemKey, item.quantity - 1)}
              aria-label="Уменьшить количество"
              className="flex size-7 items-center justify-center text-[var(--color-text)]"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-5 text-center text-sm tabular-nums">{item.quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(itemKey, item.quantity + 1)}
              aria-label="Увеличить количество"
              className="flex size-7 items-center justify-center text-[var(--color-text)]"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <Price price={item.priceByn * item.quantity} size="sm" />
        </div>
      </div>
    </div>
  );
}
