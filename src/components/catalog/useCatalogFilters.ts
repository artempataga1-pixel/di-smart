import { useMemo, useState } from "react";
import type { Brand, Product } from "@/types/product";

const PAGE_SIZE = 9;

export function useCatalogFilters(products: Product[], initialQuery = "") {
  const priceBounds = useMemo(() => {
    const prices = products.map((p) => p.price);
    return {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    };
  }, [products]);

  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<number[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);

  const availableBrands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))),
    [products]
  );

  const availableMemory = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.memoryGb).filter((v): v is number => !!v))).sort(
        (a, b) => a - b
      ),
    [products]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((p) => {
      if (maxPrice !== null && p.price > maxPrice) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      if (selectedMemory.length > 0 && (!p.memoryGb || !selectedMemory.includes(p.memoryGb)))
        return false;
      if (normalizedQuery && !p.name.toLowerCase().includes(normalizedQuery)) return false;
      return true;
    });
  }, [products, maxPrice, selectedBrands, selectedMemory, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggleBrand(brand: Brand) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setPage(1);
  }

  function toggleMemory(memory: number) {
    setSelectedMemory((prev) =>
      prev.includes(memory) ? prev.filter((m) => m !== memory) : [...prev, memory]
    );
    setPage(1);
  }

  function updateMaxPrice(value: number) {
    setMaxPrice(value);
    setPage(1);
  }

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function resetFilters() {
    setMaxPrice(null);
    setSelectedBrands([]);
    setSelectedMemory([]);
    setQuery("");
    setPage(1);
  }

  return {
    priceBounds,
    maxPrice: maxPrice ?? priceBounds.max,
    setMaxPrice: updateMaxPrice,
    availableBrands,
    selectedBrands,
    toggleBrand,
    availableMemory,
    selectedMemory,
    toggleMemory,
    query,
    setQuery: updateQuery,
    filtered,
    pageItems,
    page: currentPage,
    setPage,
    totalPages,
    resetFilters,
    hasActiveFilters:
      maxPrice !== null ||
      selectedBrands.length > 0 ||
      selectedMemory.length > 0 ||
      query.trim().length > 0,
  };
}
