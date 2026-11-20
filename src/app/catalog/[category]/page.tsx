import { productPath } from "@/lib/product-route";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CatalogView } from "@/components/catalog/CatalogView";
import { CategoryFlagshipHero } from "@/components/catalog/CategoryFlagshipHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  getCategoryBySlug,
  getCategoryFeaturedProduct,
  getCatalogProducts,
  parseCatalogSearchParams,
  type CatalogSearchParams,
} from "@/lib/catalog";
import { SITE } from "@/constants/content/site";
import { flagshipCampaigns } from "@/constants/content/flagships";

export const revalidate = 300;

const CATALOG_ONLY_CATEGORIES = new Set([
  "apple-devices",
  "samsung-audio",
  "chargers",
  "cables",
  "cases",
  "stylus",
]);

function formatProductCount(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;
  const noun = lastTwo >= 11 && lastTwo <= 14
    ? "товаров"
    : last === 1
      ? "товар"
      : last >= 2 && last <= 4
        ? "товара"
        : "товаров";
  return `${count} ${noun}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: `Каталог — ${SITE.name}` };

  const title = category.seoTitle || `${category.name} — ${SITE.name}`;
  const description =
    category.description ||
    `${category.name} в интернет-магазине ${SITE.name}: актуальные модели, цены в BYN и доставка по Беларуси.`;
  const url = `/catalog/${category.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<CatalogSearchParams>;
}) {
  const { category: slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const filters = parseCatalogSearchParams(sp, category.slug);
  const categoryDisplayName = category.slug === "watch" && filters.brandSlugs?.[0] === "apple" ? "iWatch" : category.name;
  const catalogOnly = CATALOG_ONLY_CATEGORIES.has(category.slug) || Boolean(filters.brandSlugs?.length);
  const flagship = catalogOnly
    ? undefined
    : flagshipCampaigns.find(item => item.category === category.slug);
  const hasRefinements = Boolean(
    filters.query ||
      filters.brandSlugs?.length ||
      filters.maxPriceByn !== undefined ||
      filters.sort !== "default" ||
      (filters.page ?? 1) > 1
  );
  const featuredPromise = catalogOnly
    ? Promise.resolve(null)
    : getCategoryFeaturedProduct(category.slug, flagship?.slug);

  // Баннер — дополнительная подача товара, а не замена его карточки в списке.
  const resultPromise = getCatalogProducts(filters);

  const [featured, result] = await Promise.all([featuredPromise, resultPromise]);
  const flagshipIsProduct = Boolean(flagship && featured?.slug === flagship.slug);
  const hero = flagship
    ? {
        name: flagship.name,
        subtitle: flagship.subtitle,
        image: flagship.image,
        href: flagship.href,
        priceByn: flagshipIsProduct ? featured?.priceByn : undefined,
        isEditorial: true,
      }
    : featured
      ? {
          name: featured.name,
          subtitle:
            category.description || `Начните знакомство с категорией «${category.name}» с этой модели.`,
          image: featured.mainImageUrl,
          href: productPath(featured.slug, featured.canonicalPath),
          priceByn: featured.priceByn,
          isEditorial: false,
        }
      : null;
  const editorialItem = flagship?.catalogImage && !flagshipIsProduct && !hasRefinements
    ? {
        name: flagship.name,
        subtitle: flagship.subtitle,
        image: flagship.catalogImage,
        href: flagship.href,
        brandName: category.brandName ?? "Di-SMART",
        categorySlug: category.slug,
      }
    : null;
  const totalProducts = result.total + (editorialItem ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/#categories" },
          ...(category.brandName ? [{ label: category.brandName, href: "/catalog" }] : []),
          { label: categoryDisplayName },
        ]}
      />

      <Link
        href="/catalog"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent-ink)]"
      >
        <ChevronLeft className="size-4" />
        Весь каталог
      </Link>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          {category.brandName && (
            <p className="text-sm text-[var(--color-muted)]">{category.brandName}</p>
          )}
          {hero ? (
            <h2 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-tight md:text-3xl">
              {category.slug === "watch" ? categoryDisplayName : category.h1 || category.name}
            </h2>
          ) : (
            <h1 className="mt-1 font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight md:text-4xl">
              {category.slug === "watch" ? categoryDisplayName : category.h1 || category.name}
            </h1>
          )}
        </div>
        <span className="hidden text-sm text-[var(--color-muted)] sm:block">
          {formatProductCount(totalProducts)}
        </span>
      </div>

      {hero && <CategoryFlagshipHero categoryName={category.name} {...hero} />}

      <div id="models" className={hero ? "mt-14 scroll-mt-24 md:mt-16" : "mt-8 scroll-mt-24"}>
        {hero && (
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Все модели
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Сравните конфигурации, цены и наличие.
              </p>
            </div>
          </div>
        )}
        <CatalogView result={result} editorialItem={editorialItem} />
      </div>
    </div>
  );
}
