"use client";

import type { CatalogSort } from "@/lib/catalog";

const OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "default", label: "По умолчанию" },
  { value: "price_asc", label: "Сначала дешевле" },
  { value: "price_desc", label: "Сначала дороже" },
  { value: "new", label: "Сначала новинки" },
];

export function SortSelect({
  value,
  onChange,
}: {
  value: CatalogSort;
  onChange: (value: CatalogSort) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CatalogSort)}
      aria-label="Сортировка"
      className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
