import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CatalogView } from "@/components/catalog/CatalogView";
import { CATEGORIES, getCategoryBySlug } from "@/constants/content/categories";
import { getProductsByCategory } from "@/constants/products";
import type { CategorySlug } from "@/types/product";
import { SITE } from "@/constants/content/site";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  return { title: category ? `${category.title} — ${SITE.name}` : `Каталог — ${SITE.name}` };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { category: slug } = await params;
  const { q } = await searchParams;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const products = getProductsByCategory(category.slug as CategorySlug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <Link
        href="/catalog"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent-ink)]"
      >
        <ChevronLeft className="size-4" />
        Весь каталог
      </Link>
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold md:text-4xl">
        {category.title}
      </h1>
      <p className="mt-2 max-w-xl text-[var(--color-muted)]">{category.description}</p>

      <div className="mt-8">
        <CatalogView products={products} initialQuery={q} />
      </div>
    </div>
  );
}
