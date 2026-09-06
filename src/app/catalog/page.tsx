import type { Metadata } from "next";
import Link from "next/link";
import { CatalogView } from "@/components/catalog/CatalogView";
import {
  getAllCategories,
  getCatalogProducts,
  parseCatalogSearchParams,
  type CatalogSearchParams,
} from "@/lib/catalog";
import { SITE } from "@/constants/content/site";

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

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/catalog/${cat.slug}`}
            className="soft-btn rounded-full px-4 py-2 text-sm"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <CatalogView result={result} />
      </div>
    </div>
  );
}
