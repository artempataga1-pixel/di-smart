import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";

export const metadata: Metadata = { title: "Товары — Di-SMART Admin" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const products = await prisma.product.findMany({
    orderBy: [{ category: { brand: { sortOrder: "asc" } } }, { sortOrder: "asc" }],
    include: { category: { include: { brand: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">Товары</h1>
        <Link
          href="/admin/products/new"
          className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)]"
        >
          Добавить товар
        </Link>
      </div>

      <AdminErrorBanner message={error} />

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)]">
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Цена USD</th>
              <th className="px-4 py-3 font-medium">Наличие</th>
              <th className="px-4 py-3 font-medium">Флагман</th>
              <th className="px-4 py-3 font-medium">Активен</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-[var(--color-line)] last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium hover:text-[var(--color-accent-ink)] hover:underline"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)]">
                  {product.category.brand.name} / {product.category.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{product.basePriceUsd.toString()} $</td>
                <td className="px-4 py-3">
                  {product.availability === "IN_STOCK" ? (
                    <span className="text-[var(--color-success)]">в наличии</span>
                  ) : (
                    <span className="text-[var(--color-warning)]">нет в наличии</span>
                  )}
                </td>
                <td className="px-4 py-3">{product.isFlagship ? "да" : "—"}</td>
                <td className="px-4 py-3">
                  {product.isActive ? "да" : <span className="text-[var(--color-muted)]">скрыт</span>}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[var(--color-muted)]">
                  Товаров пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
