"use client";

import { useState } from "react";
import type { CatalogResult, CatalogSort } from "@/lib/catalog";
import { useCatalogUrl } from "@/components/catalog/useCatalogUrl";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { SortSelect } from "@/components/catalog/SortSelect";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import type { EditorialCatalogCardData } from "@/components/catalog/EditorialCatalogCard";
import { Pagination } from "@/components/catalog/Pagination";
import { SearchField } from "@/components/ui/SearchField";
import { cn } from "@/lib/utils";

export function CatalogView({
  result,
  editorialItem,
}: {
  result: CatalogResult;
  editorialItem?: EditorialCatalogCardData | null;
}) {
  const { searchParams, setParams, isPending } = useCatalogUrl();

  const query = searchParams.get("q") ?? "";
  // Сброс локального черновика поиска при смене `q` извне (например, кнопкой
  // "Сбросить") — без эффекта, паттерн React "adjusting state on prop change".
  const [queryDraft, setQueryDraft] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setQueryDraft(query);
  }

  const selectedBrands = (searchParams.get("brand") ?? "").split(",").filter(Boolean);
  const maxPriceParam = searchParams.get("maxPrice");
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : result.priceBoundsByn.max;
  const sort = (searchParams.get("sort") as CatalogSort | null) ?? "default";

  function toggleBrand(slug: string) {
    const next = selectedBrands.includes(slug)
      ? selectedBrands.filter((b) => b !== slug)
      : [...selectedBrands, slug];
    setParams({ brand: next.length ? next.join(",") : null });
  }

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    maxPrice < result.priceBoundsByn.max ||
    query.trim().length > 0 ||
    sort !== "default";
  const showFilters = result.availableBrands.length > 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <SearchField
          value={queryDraft}
          onChange={setQueryDraft}
          onSubmit={(value) => setParams({ q: value.trim() || null })}
          placeholder="Найти товар по названию"
          className="max-w-md flex-1"
        />
        <SortSelect value={sort} onChange={(value) => setParams({ sort: value === "default" ? null : value })} />
      </div>

      <div className={showFilters ? "grid gap-8 lg:grid-cols-[260px_1fr]" : "grid gap-8"}>
        {showFilters && (
          <CatalogFilters
            priceBounds={result.priceBoundsByn}
            maxPrice={maxPrice}
            onMaxPriceChange={(value) => setParams({ maxPrice: String(value) })}
            availableBrands={result.availableBrands}
            selectedBrands={selectedBrands}
            onToggleBrand={toggleBrand}
            hasActiveFilters={hasActiveFilters}
            onReset={() => setParams({ brand: null, maxPrice: null, q: null, sort: null })}
          />
        )}

        <div
          aria-busy={isPending}
          className={cn(
            "transition-opacity duration-200",
            isPending && "pointer-events-none opacity-50"
          )}
        >
          <ProductGrid products={result.items} editorialItem={editorialItem} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onChange={(page) => setParams({ page: String(page) })}
          />
        </div>
      </div>
    </div>
  );
}
