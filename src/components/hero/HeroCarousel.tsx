"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CatalogCardData } from "@/lib/catalog";
import { CatalogVisual } from "@/components/ui/visuals/CatalogVisual";
import { Price } from "@/components/ui/Price";
import { PillCta } from "@/components/ui/PillCta";

/** Ручное переключение стрелками, без автоплея — как доска объявлений.
 * Реальных фото флагманов пока нет, поэтому слайд использует ту же
 * градиент+иконка заглушку, что и остальной каталог (см. CatalogVisual). */
export function HeroCarousel({ products }: { products: CatalogCardData[] }) {
  const [index, setIndex] = useState(0);
  if (products.length === 0) return null;
  const product = products[index];

  function prev() {
    setIndex((i) => (i - 1 + products.length) % products.length);
  }
  function next() {
    setIndex((i) => (i + 1) % products.length);
  }

  return (
    <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <Link href={`/product/${product.slug}`} className="block h-full w-full">
        <CatalogVisual
          imageUrl={product.mainImageUrl}
          alt={product.name}
          iconHint={`${product.categoryName} ${product.name}`}
          gradientSeed={product.categorySlug}
          size="lg"
          imageFit="contain"
          sizesAttr="(min-width: 768px) 50vw, 100vw"
        />
      </Link>

      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)]/90 p-4 backdrop-blur-sm">
        <div>
          <p className="text-sm font-medium text-[var(--color-text)]">{product.name}</p>
          <Price price={product.priceByn} />
        </div>
        <PillCta href={`/product/${product.slug}`} size="sm">
          Смотреть
        </PillCta>
      </div>

      {products.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Предыдущий товар"
            className="absolute left-3 top-3 flex size-9 items-center justify-center rounded-full bg-[var(--color-surface)]/90 shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-surface)]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Следующий товар"
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-[var(--color-surface)]/90 shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-surface)]"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}
