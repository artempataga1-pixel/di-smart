"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { Price } from "@/components/ui/Price";
import { useCart } from "@/lib/cart-context";

export function ProductInfo({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-accent-ink)]">
          {product.brand}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-text)] md:text-3xl">
          {product.name}
        </h1>
      </div>

      <Price price={product.price} oldPrice={product.oldPrice} size="lg" />

      <p className="text-[var(--color-muted)]">{product.shortDescription}</p>

      <p className="text-sm">
        {product.inStock ? (
          <span className="text-[var(--color-success)]">В наличии</span>
        ) : (
          <span className="text-[var(--color-warning)]">Под заказ</span>
        )}
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-[var(--color-line)]">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Уменьшить количество"
            className="flex size-10 items-center justify-center text-[var(--color-text)]"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-6 text-center tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Увеличить количество"
            className="flex size-10 items-center justify-center text-[var(--color-text)]"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => addItem(product.id, qty)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)]"
        >
          <ShoppingBag className="size-4" />
          {product.inStock ? "В корзину" : "Заказать"}
        </button>
      </div>
    </div>
  );
}
