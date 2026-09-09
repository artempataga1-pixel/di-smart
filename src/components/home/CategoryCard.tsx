import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CategorySummary } from "@/lib/catalog";
import { CatalogVisual } from "@/components/ui/visuals/CatalogVisual";

export function CategoryCard({ category }: { category: CategorySummary }) {
  return (
    <Link
      href={`/catalog/${category.slug}`}
      data-stagger-item
      className="group flex flex-col overflow-hidden rounded-[6px_var(--radius-xl)_6px_var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--color-accent-soft)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
        <CatalogVisual
          imageUrl={null}
          alt={category.name}
          iconHint={category.name}
          gradientSeed={category.slug}
          sizesAttr="(min-width: 768px) 20vw, 50vw"
        />
      </div>

      <div className="flex items-center justify-between gap-2 p-4">
        <span className="text-sm font-medium text-[var(--color-text)]">{category.name}</span>
        <ArrowUpRight className="size-4 shrink-0 text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-accent-ink)]" />
      </div>
    </Link>
  );
}
