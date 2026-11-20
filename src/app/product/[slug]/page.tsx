import { productPath, DEDICATED_PRODUCT_PATHS } from "@/lib/product-route";
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { IPhone17ModelSelector } from "@/components/product/IPhone17ModelSelector";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductSpecsTable } from "@/components/product/ProductSpecsTable";
import { CrossSellProducts } from "@/components/product/CrossSellProducts";
import { getCrossSellProducts, getProductDetailBySlug } from "@/lib/catalog";
import { SITE } from "@/constants/content/site";

export const revalidate = 300;

async function CrossSellSection({
  product,
}: {
  product: { slug: string; categorySlug: string; brandSlug: string };
}) {
  const crossSell = await getCrossSellProducts(product);
  return <CrossSellProducts groups={crossSell} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (DEDICATED_PRODUCT_PATHS[slug]) permanentRedirect(DEDICATED_PRODUCT_PATHS[slug]);
  const product = await getProductDetailBySlug(slug);
  if (!product) return { title: `Товар — ${SITE.name}` };

  const title = product.seoTitle || `${product.name}: цена и наличие в Минске — ${SITE.name}`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    `Купить ${product.name} в интернет-магазине ${SITE.name}: цена ${product.basePriceByn} BYN, доставка по Беларуси.`;
  const url = productPath(product.slug, product.canonicalPath);

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
  if (DEDICATED_PRODUCT_PATHS[slug]) permanentRedirect(DEDICATED_PRODUCT_PATHS[slug]);
  const product = await getProductDetailBySlug(slug);
  if (!product) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const canonicalUrl = new URL(productPath(product.slug, product.canonicalPath), siteUrl).toString();
  const imageUrl = product.mainImageUrl
    ? new URL(product.mainImageUrl, siteUrl).toString()
    : undefined;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description || undefined,
    image: imageUrl ? [imageUrl] : undefined,
    brand: { "@type": "Brand", name: product.brandName },
    offers: product.basePriceByn > 0 && product.variants.every(variant => variant.priceByn > 0) ? {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "BYN",
      price: product.basePriceByn,
      availability:
        product.availability === "IN_STOCK"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    } : undefined,
  };

  const jsonLd = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }}
    />
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      {jsonLd}
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: product.brandName, href: "/catalog" },
          { label: product.categoryName, href: `/catalog/${product.categorySlug}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6">
        <ProductPurchasePanel
          key={product.id}
          product={product}
          modelSelector={<IPhone17ModelSelector slug={product.slug} />}
        />
      </div>

      <div id="product-details" className="mt-10 scroll-mt-24">
        <ProductSpecsTable specs={product.specs} description={product.description} />
      </div>

      <div className="mt-12">
        <Suspense fallback={null}>
          <CrossSellSection product={product} />
        </Suspense>
      </div>
    </div>
  );
}
