"use client";

import type { Product } from "@/types/product";
import { useCatalogFilters } from "@/components/catalog/useCatalogFilters";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Pagination } from "@/components/catalog/Pagination";
import { SearchField } from "@/components/ui/SearchField";

export function CatalogView({
  products,
  initialQuery = "",
}: {
  products: Product[];
  initialQuery?: string;
}) {
  const {
    priceBounds,
    maxPrice,
    setMaxPrice,
    availableBrands,
    selectedBrands,
    toggleBrand,
    availableMemory,
    selectedMemory,
    toggleMemory,
    query,
    setQuery,
    pageItems,
    page,
    setPage,
    totalPages,
    resetFilters,
    hasActiveFilters,
  } = useCatalogFilters(products, initialQuery);

  return (
    <div className="flex flex-col gap-6">
      <SearchField
        value={query}
        onChange={setQuery}
        onSubmit={setQuery}
        placeholder="Найти товар по названию"
        className="max-w-md"
      />

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <CatalogFilters
          priceBounds={priceBounds}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          availableBrands={availableBrands}
          selectedBrands={selectedBrands}
          onToggleBrand={toggleBrand}
          availableMemory={availableMemory}
          selectedMemory={selectedMemory}
          onToggleMemory={toggleMemory}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />

        <div>
          <ProductGrid products={pageItems} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
