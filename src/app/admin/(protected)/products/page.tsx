import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { ProductsManager } from "@/components/admin/ProductsManager";

export const metadata: Metadata = { title: "Товары — Di-SMART Admin" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const products = await prisma.product.findMany({
    orderBy: [{ brand: { sortOrder: "asc" } }, { category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: { category: true, brand: true },
  });

  const rows = products.map((product) => ({
    id: product.id,
    name: product.name,
    brandName: product.brand.name,
    categoryName: product.category.name,
    priceUsd: product.basePriceUsd.toString(),
    priceByn: product.basePriceByn?.toString() ?? null,
    availability: product.availability,
    isFlagship: product.isFlagship,
    isActive: product.isActive,
  }));

  return (
    <div className="flex flex-col gap-6">
      <AdminErrorBanner message={error} />
      <ProductsManager products={rows} />
    </div>
  );
}
