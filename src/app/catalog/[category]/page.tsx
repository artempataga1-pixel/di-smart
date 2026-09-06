import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CatalogView } from "@/components/catalog/CatalogView";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  getCategoryBySlug,
  getCatalogProducts,
  parseCatalogSearchParams,
  type CatalogSearchParams,
} from "@/lib/catalog";
import { SITE } from "@/constants/content/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category ? `${category.name} — ${SITE.name}` : `Каталог — ${SITE.name}` };
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
  const result = await getCatalogProducts(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: category.brandName, href: "/catalog" },
          { label: category.name },
        ]}
      />

      <Link
        href="/catalog"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent-ink)]"
      >
        <ChevronLeft className="size-4" />
        Весь каталог
      </Link>
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold md:text-4xl">
        {category.name}
      </h1>
      {category.description && (
        <p className="mt-2 max-w-xl text-[var(--color-muted)]">{category.description}</p>
      )}

      <div className="mt-8">
        <CatalogView result={result} />
      </div>
    </div>
  );
}
