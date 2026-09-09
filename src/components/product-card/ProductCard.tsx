"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { CatalogCardData } from "@/lib/catalog";
import { Price } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
import { CatalogVisual } from "@/components/ui/visuals/CatalogVisual";
import { useCart } from "@/lib/cart-context";

export function ProductCard({ product }: { product: CatalogCardData }) {
  const { addItem } = useCart();
  const inStock = product.availability === "IN_STOCK";

  return (
    <div
      data-stagger-item
      className="group flex flex-col overflow-hidden rounded-[6px_var(--radius-xl)_6px_var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-[var(--color-accent-soft)]"
      >
        {product.isFlagship && (
          <Badge tone="dark" className="absolute left-3 top-3 z-10">
            Флагман
          </Badge>
        )}
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
          <CatalogVisual
            imageUrl={product.mainImageUrl}
            alt={product.name}
            iconHint={`${product.categoryName} ${product.name}`}
            gradientSeed={product.categorySlug}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={`/product/${product.slug}`} className="min-h-11">
          <h3 className="text-sm font-medium leading-snug text-[var(--color-text)] transition-colors hover:text-[var(--color-accent-ink)]">
            {product.name}
          </h3>
        </Link>

        <Price price={product.priceByn} />

        <div className="mt-auto flex gap-2 pt-1">
          <button
            type="button"
            onClick={() =>
              addItem({ productId: product.id, variantId: product.defaultVariantId, colorValueId: null })
            }
            disabled={!inStock}
            className="btn-command flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="size-4" />
            {inStock ? "Купить" : "Нет в наличии"}
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
