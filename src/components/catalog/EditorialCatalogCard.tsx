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
      className="group flex min-w-0 flex-col overflow-hidden rounded-[16px] border border-[#e8e8ed] bg-[var(--color-surface)] transition-[border-color,transform] duration-300 hover:border-[#c7c7cc] sm:rounded-[22px] sm:hover:-translate-y-1"
    >
      <Link href={item.href} className="relative block aspect-square overflow-hidden bg-[#f5f5f7]">
        <div className="h-full w-full">
          <CatalogVisual
            imageUrl={item.image}
            imageFit="studio"
            sizesAttr="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 45vw"
            alt={item.name}
            iconHint={item.name}
            gradientSeed={item.categorySlug}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
        <div>
          <p className="mb-1 text-[13px] text-[var(--color-muted)] sm:text-sm">{item.brandName}</p>
          <Link href={item.href} className="block min-h-10 sm:min-h-11">
            <h3 className="text-[14px] font-semibold leading-[1.25] tracking-[-0.015em] text-[var(--color-text)] transition-colors hover:text-[var(--color-accent-ink)] sm:text-[17px] sm:leading-snug">
              {item.name}
            </h3>
          </Link>
        </div>
        <p className="hidden text-sm leading-relaxed text-[var(--color-muted)] sm:block">{item.subtitle}</p>
        <Link
          href={item.href}
          className="btn-command mt-auto flex min-h-10 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-medium text-white sm:px-4 sm:py-2.5 sm:text-sm"
        >
          Подробнее
          <ArrowUpRight className="hidden size-4 sm:block" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
