import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { createCategoryAction, updateCategoryAction } from "./actions";

export const metadata: Metadata = { title: "Категории — Di-SMART Admin" };

const inputClass =
  "rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 outline-none focus:border-[var(--color-accent)]";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ brand: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: { brand: true, _count: { select: { products: true } } },
    }),
    prisma.brand.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-[family-name:var(--font-body)] text-2xl font-semibold">Категории</h1>

      <AdminErrorBanner message={error} />

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-4 text-sm font-medium text-[var(--color-muted)]">Новая категория</h2>
        <form action={createCategoryAction} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Название
            <input name="name" required className={`${inputClass} w-44`} placeholder="iPhone" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Slug
            <input name="slug" required className={`${inputClass} w-36`} placeholder="iphone" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Бренд
            <select name="brandId" required className={`${inputClass} w-40`}>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Порядок
            <input name="sortOrder" type="number" defaultValue={0} className={`${inputClass} w-20`} />
          </label>
          <button
            type="submit"
            className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)]"
          >
            Добавить
          </button>
        </form>
      </section>

      <div className="flex flex-col gap-3">
        {categories.map((category) => (
          <form
            key={category.id}
            action={updateCategoryAction}
            className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4"
          >
            <input type="hidden" name="id" value={category.id} />
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Название
                <input name="name" defaultValue={category.name} className={`${inputClass} w-44`} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Slug
                <input name="slug" defaultValue={category.slug} className={`${inputClass} w-36`} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Бренд
                <select
                  name="brandId"
                  defaultValue={category.brandId}
                  className={`${inputClass} w-40`}
                >
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Порядок
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={category.sortOrder}
                  className={`${inputClass} w-20`}
                />
              </label>
              <label className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={category.isActive}
                  className="size-4 accent-[var(--color-accent)]"
                />
                активна
              </label>
              <span className="text-sm text-[var(--color-muted)]">
                {category._count.products} товаров
              </span>
              <button
                type="submit"
                className="ml-auto rounded-[var(--radius-sm)] border border-[var(--color-line)] px-4 py-1.5 text-sm transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
              >
                Сохранить
              </button>
            </div>

            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-[var(--color-muted)]">SEO-поля</summary>
              <div className="mt-3 flex flex-col gap-2">
                <label className="flex flex-col gap-1">
                  SEO title
                  <input
                    name="seoTitle"
                    defaultValue={category.seoTitle ?? ""}
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  SEO description
                  <textarea
                    name="seoDescription"
                    defaultValue={category.seoDescription ?? ""}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  H1
                  <input name="h1" defaultValue={category.h1 ?? ""} className={inputClass} />
                </label>
              </div>
            </details>
          </form>
        ))}
        {categories.length === 0 && (
          <p className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-[var(--color-muted)]">
            Категорий пока нет
          </p>
        )}
      </div>
    </div>
  );
}
