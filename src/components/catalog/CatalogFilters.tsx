"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { PriceRangeSlider } from "@/components/catalog/PriceRangeSlider";
import { CheckboxFilterGroup } from "@/components/catalog/CheckboxFilterGroup";
import { cn } from "@/lib/utils";

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
  /** «Аксессуары» — раздел каталога, а не бренд: показываем их отдельной группой. */
  showAccessoriesOption: boolean;
  accessoriesOnly: boolean;
  onToggleAccessories: () => void;
  activeFilterCount: number;
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
  showAccessoriesOption,
  accessoriesOnly,
  onToggleAccessories,
  activeFilterCount,
  hasActiveFilters,
  onReset,
}: CatalogFiltersProps) {
  // На телефоне фильтры свёрнуты в одну кнопку, чтобы товары начинались
  // на первом экране; на десктопе панель всегда открыта слева.
  const [open, setOpen] = useState(false);
  const brandNameBySlug = new Map(availableBrands.map((b) => [b.slug, b.name]));

  return (
    <div className="min-w-0 lg:sticky lg:top-24 lg:h-fit">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="catalog-filters-panel"
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-5 text-sm font-medium text-[var(--color-text)] lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        {open ? "Скрыть фильтры" : "Фильтры"}
        {activeFilterCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      <aside
        id="catalog-filters-panel"
        className={cn(
          "mt-3 min-w-0 flex-col gap-7 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 lg:mt-0 lg:flex",
          open ? "flex" : "hidden"
        )}
      >
        <div className="flex items-center justify-between">
          <p className="font-medium text-[var(--color-text)]">Фильтры</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="text-sm text-[var(--color-accent-ink)] hover:underline"
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

        {availableBrands.length > 1 && (
          <CheckboxFilterGroup
            title="Бренд"
            options={availableBrands.map((b) => b.slug)}
            selected={selectedBrands}
            onToggle={onToggleBrand}
            formatLabel={(slug) => brandNameBySlug.get(slug) ?? slug}
          />
        )}

        {showAccessoriesOption && (
          <CheckboxFilterGroup
            title="Категория"
            options={["accessories"]}
            selected={accessoriesOnly ? ["accessories"] : []}
            onToggle={onToggleAccessories}
            formatLabel={() => "Аксессуары"}
          />
        )}
      </aside>
    </div>
  );
}
