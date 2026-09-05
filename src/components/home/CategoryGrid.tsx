"use client";

import { CATEGORIES } from "@/constants/content/categories";
import { CATEGORY_IMAGES, CATEGORY_SQUARES } from "@/constants/content/categoryVisuals";
import { CategoryCard } from "@/components/home/CategoryCard";
import { useStaggerReveal } from "@/components/ui/useStaggerReveal";

export function CategoryGrid() {
  const ref = useStaggerReveal<HTMLDivElement>({ count: CATEGORIES.length, y: 20 });

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
      {CATEGORIES.map((cat) => (
        <CategoryCard
          key={cat.slug}
          category={cat}
          image={CATEGORY_IMAGES[cat.slug]}
          squares={CATEGORY_SQUARES[cat.slug]}
        />
      ))}
    </div>
  );
}
