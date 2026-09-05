"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { Price } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { useCart } from "@/lib/cart-context";

export function ProductCard({
  product,
  visual,
}: {
  product: Product;
  visual?: React.ReactNode;
}) {
  const { addItem } = useCart();

  return (
    <div
      data-stagger-item
      className="group flex flex-col overflow-hidden rounded-[6px_var(--radius-xl)_6px_var(--radius-xl)] border border-[var(--color-ink)]/15 bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-[var(--color-accent-soft)]"
      >
        {product.badge && (
          <Badge type={product.badge} className="absolute left-3 top-3 z-10" />
        )}
        <div className="transition-transform duration-500 group-hover:scale-105 h-full w-full">
          {visual ?? <ProductVisual icon={product.icon} category={product.category} />}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={`/product/${product.slug}`} className="min-h-11">
          <h3 className="text-sm font-medium leading-snug text-[var(--color-text)] hover:text-[var(--color-accent-ink)] transition-colors">
            {product.name}
          </h3>
        </Link>

        <Price price={product.price} oldPrice={product.oldPrice} />

        <div className="mt-auto flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => addItem(product.id)}
            className="btn-command flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-white"
          >
            <ShoppingBag className="size-4" />
            {product.inStock ? "Купить" : "Под заказ"}
          </button>
          <Link
            href={`/product/${product.slug}`}
            className="flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-line)] px-3 py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
}
