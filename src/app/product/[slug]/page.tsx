import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductSpecsTable } from "@/components/product/ProductSpecsTable";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { getProductDetailBySlug, getRelatedProducts } from "@/lib/catalog";
import { SITE } from "@/constants/content/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);
  return { title: product ? `${product.name} — ${SITE.name}` : `Товар — ${SITE.name}` };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categorySlug, product.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: product.brandName, href: "/catalog" },
          { label: product.categoryName, href: `/catalog/${product.categorySlug}` },
          { label: product.name },
        ]}
      />

      <ProductPurchasePanel product={product} />

      <div className="mt-10">
        <ProductSpecsTable specs={product.specs} description={product.description} />
      </div>

      <RelatedProducts products={related} />
    </div>
  );
}
