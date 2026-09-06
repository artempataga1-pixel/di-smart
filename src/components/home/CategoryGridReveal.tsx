"use client";

import type { CategorySummary } from "@/lib/catalog";
import { CategoryCard } from "@/components/home/CategoryCard";
import { useStaggerReveal } from "@/components/ui/useStaggerReveal";

export function CategoryGridReveal({ categories }: { categories: CategorySummary[] }) {
  const ref = useStaggerReveal<HTMLDivElement>({ count: categories.length, y: 20 });

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
      {categories.map((cat) => (
        <CategoryCard key={cat.slug} category={cat} />
      ))}
    </div>
  );
}
