"use client";

import { productPath } from "@/lib/product-route";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CatalogCardData } from "@/lib/catalog";
import { Price } from "@/components/ui/Price";
import { CatalogVisual } from "@/components/ui/visuals/CatalogVisual";
import {
  isCatalogStudioImage,
} from "@/constants/content/catalog-media";

export function ProductCard({ product }: { product: CatalogCardData }) {
  return (
    <div
      data-stagger-item
      className="group flex min-w-0 flex-col overflow-hidden rounded-[16px] border border-[#e8e8ed] bg-[var(--color-surface)] transition-[border-color,transform] duration-300 hover:border-[#c7c7cc] sm:rounded-[22px] sm:hover:-translate-y-1"
    >
      <Link
        href={productPath(product.slug, product.canonicalPath)}
        prefetch
        className="relative block aspect-square overflow-hidden bg-[#f5f5f7]"
      >
        <div className="h-full w-full">
          <CatalogVisual
            imageFit={isCatalogStudioImage(product.mainImageUrl) ? "studio" : "contain"}
            sizesAttr="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 45vw"
            imageUrl={product.mainImageUrl}
            alt={product.name}
            iconHint={`${product.categoryName} ${product.name}`}
            gradientSeed={product.categorySlug}
          />
          {!product.mainImageUrl && (
            <span className="absolute inset-x-2 bottom-3 text-center text-xs font-medium tracking-wide text-white/80">
              Фото скоро появится
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
        <div>
          <p className="mb-1 text-[13px] text-[var(--color-muted)] sm:text-sm">{product.brandName}</p>
          <Link href={productPath(product.slug, product.canonicalPath)} prefetch className="block min-h-10 sm:min-h-11">
          <h3 className="text-[14px] font-semibold leading-[1.25] tracking-[-0.015em] text-[var(--color-text)] transition-colors hover:text-[var(--color-accent-ink)] sm:text-[17px] sm:leading-snug">
            {product.name}
          </h3>
          </Link>
        </div>

        <div className="sm:hidden">{product.priceIsFrom && <span className="mr-1 text-xs text-[var(--color-muted)]">от</span>}<Price price={product.priceByn} size="sm" /></div>
        <div className="hidden sm:block">{product.priceIsFrom && <span className="mr-1 text-sm text-[var(--color-muted)]">от</span>}<Price price={product.priceByn} /></div>
        {product.priceByn > 0 && product.priceKind === "MARKET_ESTIMATE" && (
          <p className="text-xs leading-tight text-[var(--color-muted)]">Ориентировочная цена · уточните у менеджера</p>
        )}

        <div className="mt-auto grid grid-cols-1 gap-2 pt-1 sm:grid-cols-[1fr_auto] sm:pt-2">
          <Link
            href={productPath(product.slug, product.canonicalPath)}
            prefetch
            aria-label={`Выбрать: ${product.name}`}
            className="btn-command flex min-h-10 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-medium text-white sm:px-4 sm:py-2.5 sm:text-sm"
          >
            Выбрать
          </Link>
          <Link
            href={productPath(product.slug, product.canonicalPath)}
            prefetch
            aria-label={`Подробнее о ${product.name}`}
            className="hidden size-10 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)] sm:flex"
          >
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
