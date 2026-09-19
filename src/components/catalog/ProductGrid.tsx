"use client";

import type { CatalogCardData } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card/ProductCard";
import {
  EditorialCatalogCard,
  type EditorialCatalogCardData,
} from "@/components/catalog/EditorialCatalogCard";
import { useStaggerReveal } from "@/components/ui/useStaggerReveal";

export function ProductGrid({
  products,
  editorialItem,
}: {
  products: CatalogCardData[];
  editorialItem?: EditorialCatalogCardData | null;
}) {
  const ref = useStaggerReveal<HTMLDivElement>({ count: products.length + (editorialItem ? 1 : 0) });

  if (products.length === 0 && !editorialItem) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line)] text-[var(--color-muted)]">
        По выбранным фильтрам ничего не найдено
      </div>
    );
  }

  return (
    <div ref={ref} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {editorialItem && <EditorialCatalogCard item={editorialItem} />}
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
