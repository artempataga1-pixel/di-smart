import { PriceRangeSlider } from "@/components/catalog/PriceRangeSlider";
import { CheckboxFilterGroup } from "@/components/catalog/CheckboxFilterGroup";

interface BrandOption {
  slug: string;
  name: string;
}

interface CatalogFiltersProps {
  priceBounds: { min: number; max: number };
  maxPrice: number;
  onMaxPriceChange: (value: number) => void;
  availableBrands: BrandOption[];
  selectedBrands: string[];
  onToggleBrand: (slug: string) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function CatalogFilters({
  priceBounds,
  maxPrice,
  onMaxPriceChange,
  availableBrands,
  selectedBrands,
  onToggleBrand,
  hasActiveFilters,
  onReset,
}: CatalogFiltersProps) {
  const brandNameBySlug = new Map(availableBrands.map((b) => [b.slug, b.name]));

  return (
    <aside className="flex flex-col gap-7 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 lg:sticky lg:top-24 lg:h-fit">
      <div className="flex items-center justify-between">
        <p className="font-medium text-[var(--color-text)]">Фильтры</p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-[var(--color-accent-ink)] hover:underline"
          >
            Сбросить
          </button>
        )}
      </div>

      <PriceRangeSlider
        min={priceBounds.min}
        max={priceBounds.max}
        value={maxPrice}
        onChange={onMaxPriceChange}
      />

      <CheckboxFilterGroup
        title="Бренд"
        options={availableBrands.map((b) => b.slug)}
        selected={selectedBrands}
        onToggle={onToggleBrand}
        formatLabel={(slug) => brandNameBySlug.get(slug) ?? slug}
      />
    </aside>
  );
}
