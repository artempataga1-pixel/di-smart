import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CatalogVisual } from "@/components/ui/visuals/CatalogVisual";

export interface EditorialCatalogCardData {
  name: string;
  subtitle: string;
  image: string;
  href: string;
  brandName: string;
  categorySlug: string;
}

export function EditorialCatalogCard({ item }: { item: EditorialCatalogCardData }) {
  return (
    <article
      data-stagger-item
      className="group flex flex-col overflow-hidden rounded-[22px] border border-[#e8e8ed] bg-[var(--color-surface)] transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-[#c7c7cc]"
    >
      <Link href={item.href} className="relative block aspect-square overflow-hidden bg-[#f5f5f7]">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none">
          <CatalogVisual
            imageUrl={item.image}
            imageFit="studio"
            sizesAttr="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            alt={item.name}
            iconHint={item.name}
            gradientSeed={item.categorySlug}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="mb-1 text-sm text-[var(--color-muted)]">{item.brandName}</p>
          <Link href={item.href} className="block min-h-11">
            <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.015em] text-[var(--color-text)] transition-colors hover:text-[var(--color-accent-ink)]">
              {item.name}
            </h3>
          </Link>
        </div>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">{item.subtitle}</p>
        <Link
          href={item.href}
          className="btn-command mt-auto flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-white"
        >
          Подробнее
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
