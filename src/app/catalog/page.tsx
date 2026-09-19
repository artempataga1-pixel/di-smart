import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CatalogView } from "@/components/catalog/CatalogView";
import {
  getAllCategories,
  getCatalogProducts,
  parseCatalogSearchParams,
  type CatalogSearchParams,
} from "@/lib/catalog";
import { SITE } from "@/constants/content/site";
import { CATEGORY_ICON_BY_SLUG } from "@/constants/content/catalog-media";

/* Курс валют и наличие товаров должны быть актуальны на каждый рендер
 * (не ISR/кеш) — страница всегда рендерится по запросу, это же избавляет
 * от необходимости достучаться до БД во время `next build` в CI. */
export const dynamic = "force-dynamic";

const catalogDescription = `Каталог техники Apple, Samsung и аксессуаров в интернет-магазине ${SITE.name}. Цены в BYN, доставка по Беларуси.`;

export const metadata: Metadata = {
  title: `Каталог — ${SITE.name}`,
  description: catalogDescription,
  alternates: { canonical: "/catalog" },
  openGraph: { title: `Каталог — ${SITE.name}`, description: catalogDescription, url: "/catalog" },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseCatalogSearchParams(sp);
  const [categories, result] = await Promise.all([
    getAllCategories(),
    getCatalogProducts(filters),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold md:text-4xl">
        Каталог
      </h1>

      <nav aria-label="Категории каталога" className="mt-7 flex flex-wrap gap-2.5">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/catalog/${cat.slug}`}
            className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-[#e8e8ed] bg-[#f5f5f7] py-1.5 pl-1.5 pr-4 text-sm font-medium transition-colors hover:border-[#c7c7cc] hover:bg-white"
          >
            <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-white">
              {CATEGORY_ICON_BY_SLUG[cat.slug] ? (
                <Image
                  src={CATEGORY_ICON_BY_SLUG[cat.slug]}
                  alt=""
                  fill
                  sizes="36px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                />
              ) : null}
            </span>
            {cat.name}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <CatalogView result={result} />
      </div>
    </div>
  );
}
