"use client";

import type { CatalogResult, CatalogSort } from "@/lib/catalog";
import { useCatalogUrl } from "@/components/catalog/useCatalogUrl";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { SortSelect } from "@/components/catalog/SortSelect";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import type { EditorialCatalogCardData } from "@/components/catalog/EditorialCatalogCard";
import { Pagination } from "@/components/catalog/Pagination";
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
  const selectedBrands = (searchParams.get("brand") ?? "").split(",").filter(Boolean);
  const maxPriceParam = searchParams.get("maxPrice");
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : result.priceBoundsByn.max;
  const sort = (searchParams.get("sort") as CatalogSort | null) ?? "default";


  const ACCESSORIES = "accessories";
  const realBrands = result.availableBrands.filter((b) => b.slug !== ACCESSORIES);
  const selectedRealBrands = selectedBrands.filter((b) => b !== ACCESSORIES);
  const accessoriesOnly = searchParams.get("group") === ACCESSORIES || selectedBrands.includes(ACCESSORIES);
  const showAccessoriesOption = accessoriesOnly || (realBrands.length > 0 && realBrands.length < result.availableBrands.length);

  function toggleAccessories() {
    // Аксессуары и бренды техники не пересекаются: включая раздел, снимаем
    // выбор брендов, иначе выдача окажется пустой.
    setParams(accessoriesOnly ? { group: null, brand: selectedRealBrands.length ? selectedRealBrands.join(",") : null } : { group: ACCESSORIES, brand: null });
  }

  function toggleRealBrand(slug: string) {
    const next = selectedRealBrands.includes(slug)
      ? selectedRealBrands.filter((b) => b !== slug)
      : [...selectedRealBrands, slug];
    setParams({ brand: next.length ? next.join(",") : null, group: null });
  }

  const priceFiltered = maxPrice < result.priceBoundsByn.max;
  const activeFilterCount = selectedRealBrands.length + (accessoriesOnly ? 1 : 0) + (priceFiltered ? 1 : 0);

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    accessoriesOnly ||
    maxPrice < result.priceBoundsByn.max ||
    query.trim().length > 0 ||
    sort !== "default";
  const showFilters = realBrands.length > 1 || showAccessoriesOption;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SortSelect value={sort} onChange={(value) => setParams({ sort: value === "default" ? null : value })} />
      </div>

      <div className={showFilters ? "grid min-w-0 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8" : "grid min-w-0 gap-6 lg:gap-8"}>
        {showFilters && (
          <CatalogFilters
            priceBounds={result.priceBoundsByn}
            maxPrice={maxPrice}
            onMaxPriceChange={(value) => setParams({ maxPrice: String(value) })}
            availableBrands={realBrands}
            selectedBrands={selectedRealBrands}
            onToggleBrand={toggleRealBrand}
            showAccessoriesOption={showAccessoriesOption}
            accessoriesOnly={accessoriesOnly}
            onToggleAccessories={toggleAccessories}
            activeFilterCount={activeFilterCount}
            hasActiveFilters={hasActiveFilters}
            onReset={() => setParams({ brand: null, group: null, maxPrice: null, q: null, sort: null })}
          />
        )}

        <div
          aria-busy={isPending}
          className={cn(
            "min-w-0 transition-opacity duration-200",
            isPending && "pointer-events-none opacity-50"
          )}
        >
          <ProductGrid products={result.items} editorialItem={editorialItem} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </div>
    </div>
  );
}
