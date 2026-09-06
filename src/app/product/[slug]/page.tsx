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
  if (!product) return { title: `Товар — ${SITE.name}` };

  const title = product.seoTitle || `${product.name} — ${SITE.name}`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    `Купить ${product.name} в интернет-магазине ${SITE.name}: цена ${product.basePriceByn} BYN, доставка по Беларуси.`;
  const url = product.canonicalPath || `/product/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: product.mainImageUrl ? [product.mainImageUrl] : undefined,
    },
  };
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const canonicalUrl = `${siteUrl}${product.canonicalPath || `/product/${product.slug}`}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description || undefined,
    image: product.mainImageUrl ? [`${siteUrl}${product.mainImageUrl}`] : undefined,
    brand: { "@type": "Brand", name: product.brandName },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "BYN",
      price: product.basePriceByn,
      availability:
        product.availability === "IN_STOCK"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
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
