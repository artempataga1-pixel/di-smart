import { CATALOG_GROUPS } from "@/constants/content/catalog-groups";
import type { Metadata } from "next";
import Image from "@/components/ui/StoreImage";
import Link from "next/link";
import { Package } from "lucide-react";
import { CatalogView } from "@/components/catalog/CatalogView";
import {
  getAllCategories,
  getCatalogProducts,
  parseCatalogSearchParams,
  type CatalogSearchParams,
} from "@/lib/catalog";
import { SITE } from "@/constants/content/site";
import { CATEGORY_ICON_BY_SLUG } from "@/constants/content/catalog-media";

export const revalidate = 300;

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

  const selectedGroup = CATALOG_GROUPS.find(group => group.slug === (filters.accessoryOnly ? "accessories" : filters.brandSlugs?.[0]));
  const groupCategories = selectedGroup?.categories.filter(category => categories.some(item => item.slug === category.slug)) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold md:text-4xl">
        Каталог
      </h1>

      <nav aria-label="Разделы каталога" className="catalog-group-switcher">
        {CATALOG_GROUPS.map(group => (
          <Link
            key={group.slug}
            href={group.href}
            aria-current={selectedGroup?.slug === group.slug ? "page" : undefined}
            className="catalog-group-switcher__link"
          >
            <span className="catalog-group-switcher__name">{group.name}</span>
            <span className="catalog-group-switcher__description">
              {group.slug === "apple" ? "iPhone, iPad, MacBook" : group.slug === "samsung" ? "Galaxy, планшеты, часы" : "Зарядки, кабели, чехлы"}
            </span>
          </Link>
        ))}
      </nav>
      <nav aria-label="Категории каталога" className="mt-7 flex flex-wrap gap-2.5">
        {groupCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            prefetch
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
              ) : (
                <Package aria-hidden="true" className="absolute inset-0 m-auto size-5 text-[#6e6e73]" />
              )}
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
