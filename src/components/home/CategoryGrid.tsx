"use client";

import { CATEGORIES } from "@/constants/content/categories";
import { CATEGORY_IMAGES } from "@/constants/content/categoryVisuals";
import { CategoryCard } from "@/components/home/CategoryCard";
import { useStaggerReveal } from "@/components/ui/useStaggerReveal";

export function CategoryGrid() {
  const ref = useStaggerReveal<HTMLDivElement>({ count: CATEGORIES.length, y: 20 });

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
      {CATEGORIES.map((cat) => (
        <CategoryCard key={cat.slug} category={cat} imageUrl={CATEGORY_IMAGES[cat.slug]} />
      ))}
    </div>
  );
}
