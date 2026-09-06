import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { ProductBasicFields, EMPTY_PRODUCT_DEFAULTS } from "@/components/admin/ProductBasicFields";
import { createProductAction } from "../actions";

export const metadata: Metadata = { title: "Новый товар — Di-SMART Admin" };

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: [{ brand: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: { brand: true },
  });

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">Новый товар</h1>

      <AdminErrorBanner message={error} />

      <form
        action={createProductAction}
        className="flex flex-col gap-6 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
      >
        <ProductBasicFields
          categories={categories.map((c) => ({ id: c.id, name: c.name, brandName: c.brand.name }))}
          defaults={EMPTY_PRODUCT_DEFAULTS}
        />
        <button
          type="submit"
          className="w-fit rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)]"
        >
          Создать товар
        </button>
        <p className="text-xs text-[var(--color-muted)]">
          Характеристики, варианты, цвета и фото можно будет добавить после создания.
        </p>
      </form>
    </div>
  );
}
