import type { Metadata } from "next";
import Link from "next/link";
import { CatalogView } from "@/components/catalog/CatalogView";
import { CATEGORIES } from "@/constants/content/categories";
import { ALL_PRODUCTS } from "@/constants/products";
import { SITE } from "@/constants/content/site";

export const metadata: Metadata = { title: `Каталог — ${SITE.name}` };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold md:text-4xl">
        Каталог
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/catalog/${cat.slug}`}
            className="soft-btn rounded-full px-4 py-2 text-sm"
          >
            {cat.title}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <CatalogView products={ALL_PRODUCTS} initialQuery={q} />
      </div>
    </div>
  );
}
