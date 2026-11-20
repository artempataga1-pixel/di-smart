import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CrossSellGroup } from "@/lib/catalog";
import { productPath } from "@/lib/product-route";
import { CatalogVisual } from "@/components/ui/visuals/CatalogVisual";
import { formatPrice } from "@/lib/format";
import { isCatalogStudioImage } from "@/constants/content/catalog-media";

export function CrossSellProducts({ groups }: { groups: CrossSellGroup[] }) {
  const products = groups.flatMap((group) => group.products).slice(0, 4);
  if (products.length === 0) return null;

  return (
    <section className="min-w-0" aria-label="С этим покупают">
      <h2 className="text-xl font-semibold leading-tight text-[var(--color-text)] sm:text-2xl">С этим покупают</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">Подходящие устройства и аксессуары из каталога.</p>
      <div className="mt-5 grid min-w-0 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={productPath(product.slug, product.canonicalPath)}
            className="group min-w-0 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <div className="aspect-[4/3] overflow-hidden bg-[var(--color-surface-soft)]">
              <CatalogVisual
                imageUrl={product.mainImageUrl}
                alt={product.name}
                iconHint={`${product.categoryName} ${product.name}`}
                gradientSeed={product.categorySlug}
                imageFit={isCatalogStudioImage(product.mainImageUrl || "") ? "studio" : "contain"}
                sizesAttr="(max-width: 639px) 44vw, (max-width: 1023px) 42vw, 22vw"
              />
            </div>
            <div className="p-3 sm:p-4">
              <p className="text-xs text-[var(--color-muted)]">{product.categoryName}</p>
              <h3 className="mt-1 min-h-10 text-sm font-semibold leading-5 text-[var(--color-text)] sm:text-base sm:leading-6">{product.name}</h3>
              <div className="mt-3 flex items-center justify-between gap-2 text-sm font-medium tabular-nums text-[var(--color-text)]">
                <span>{product.priceIsFrom ? "от " : ""}{formatPrice(product.priceByn)}</span>
                <ArrowUpRight size={16} className="shrink-0 text-[var(--color-accent-ink)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
