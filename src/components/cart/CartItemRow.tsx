"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import type { ResolvedCartItem } from "@/types/cart";
import { Price } from "@/components/ui/Price";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { useCart } from "@/lib/cart-context";

export function CartItemRow({ item }: { item: ResolvedCartItem }) {
  const { setQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex gap-3 py-4">
      <Link
        href={`/product/${product.slug}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface-soft)]"
      >
        <ProductVisual icon={product.icon} category={product.category} size="sm" />
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="text-sm font-medium leading-snug text-[var(--color-text)] hover:text-[var(--color-accent-ink)]"
          >
            {product.name}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(product.id)}
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
              onClick={() => setQuantity(product.id, quantity - 1)}
              aria-label="Уменьшить количество"
              className="flex size-7 items-center justify-center text-[var(--color-text)]"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-5 text-center text-sm tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(product.id, quantity + 1)}
              aria-label="Увеличить количество"
              className="flex size-7 items-center justify-center text-[var(--color-text)]"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <Price price={product.price * quantity} size="sm" />
        </div>
      </div>
    </div>
  );
}
