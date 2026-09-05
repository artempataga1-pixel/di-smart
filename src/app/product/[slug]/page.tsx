import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductSpecsTable } from "@/components/product/ProductSpecsTable";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ALL_PRODUCTS, getProductBySlug, getRelatedProducts } from "@/constants/products";
import { getCategoryBySlug } from "@/constants/content/categories";

export function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return { title: product ? `${product.name} — ЛУНА` : "Товар — ЛУНА" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryBySlug(product.category);
  const related = getRelatedProducts(product);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <Link
        href={`/catalog/${product.category}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent-ink)]"
      >
        <ChevronLeft className="size-4" />
        {category?.title ?? "Каталог"}
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery product={product} />
        <ProductInfo product={product} />
      </div>

      <div className="mt-10">
        <ProductSpecsTable specs={product.specs} description={product.description} />
      </div>

      <RelatedProducts products={related} />
    </div>
  );
}
