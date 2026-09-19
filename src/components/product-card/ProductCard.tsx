"use client";

import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import type { CatalogCardData } from "@/lib/catalog";
import { Price } from "@/components/ui/Price";
import { CatalogVisual } from "@/components/ui/visuals/CatalogVisual";
import { useCart } from "@/lib/cart-context";
import {
  isCatalogStudioImage,
  shouldCoverCatalogCardImage,
} from "@/constants/content/catalog-media";

export function ProductCard({ product }: { product: CatalogCardData }) {
  const { addItem } = useCart();
  const inStock = product.availability === "IN_STOCK";

  return (
    <div
      data-stagger-item
      className="group flex flex-col overflow-hidden rounded-[22px] border border-[#e8e8ed] bg-[var(--color-surface)] transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-[#c7c7cc]"
    >
      <Link
        href={product.canonicalPath || `/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-[#f5f5f7]"
      >
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none">
          {product.mainImageUrl ? <CatalogVisual
            imageFit={
              shouldCoverCatalogCardImage(product.mainImageUrl)
                ? "cover"
                : isCatalogStudioImage(product.mainImageUrl)
                  ? "studio"
                  : "contain"
            }
            sizesAttr="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            imageUrl={product.mainImageUrl}
            alt={product.name}
            iconHint={`${product.categoryName} ${product.name}`}
            gradientSeed={product.categorySlug}
          /> : <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">Фотография скоро появится</div>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="mb-1 text-sm text-[var(--color-muted)]">{product.brandName}</p>
          <Link href={product.canonicalPath || `/product/${product.slug}`} className="block min-h-11">
          <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.015em] text-[var(--color-text)] transition-colors hover:text-[var(--color-accent-ink)]">
            {product.name}
          </h3>
          </Link>
        </div>

        <Price price={product.priceByn} />

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-2">
          <button
            type="button"
            onClick={() =>
              addItem({ productId: product.id, variantId: product.defaultVariantId, colorValueId: null })
            }
            disabled={!inStock}
            className="btn-command flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="size-4" />
            {inStock ? "Купить" : "Нет в наличии"}
          </button>
          <Link
            href={product.canonicalPath || `/product/${product.slug}`}
            aria-label={`Подробнее о ${product.name}`}
            className="flex size-10 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
          >
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
