import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { CategoryContent } from "@/types/content";

interface CategoryCardProps {
  category: CategoryContent;
  imageUrl: string;
}

export function CategoryCard({ category, imageUrl }: CategoryCardProps) {
  return (
    <Link
      href={`/catalog/${category.slug}`}
      data-stagger-item
      className="group flex flex-col overflow-hidden rounded-[6px_var(--radius-xl)_6px_var(--radius-xl)] border border-[var(--color-ink)]/15 bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--color-accent-soft)]">
        <Image
          src={imageUrl}
          alt={category.title}
          fill
          sizes="(min-width: 768px) 20vw, 50vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
      </div>

      <div className="flex items-center justify-between gap-2 p-4">
        <span className="text-sm font-medium text-[var(--color-text)]">{category.title}</span>
        <ArrowUpRight className="size-4 shrink-0 text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-accent-ink)]" />
      </div>
    </Link>
  );
}
