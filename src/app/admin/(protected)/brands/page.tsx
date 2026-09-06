import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { createBrandAction, updateBrandAction } from "./actions";

export const metadata: Metadata = { title: "Бренды — Di-SMART Admin" };

const inputClass =
  "rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 outline-none focus:border-[var(--color-accent)]";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const brands = await prisma.brand.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { categories: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">Бренды</h1>

      <AdminErrorBanner message={error} />

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-4 text-sm font-medium text-[var(--color-muted)]">Новый бренд</h2>
        <form action={createBrandAction} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Название
            <input name="name" required className={`${inputClass} w-48`} placeholder="Apple" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Slug
            <input name="slug" required className={`${inputClass} w-40`} placeholder="apple" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Порядок
            <input
              name="sortOrder"
              type="number"
              defaultValue={brands.length}
              className={`${inputClass} w-24`}
            />
          </label>
          <button
            type="submit"
            className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)]"
          >
            Добавить
          </button>
        </form>
      </section>

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)]">
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Порядок</th>
              <th className="px-4 py-3 font-medium">Активен</th>
              <th className="px-4 py-3 font-medium">Категорий</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="border-b border-[var(--color-line)] last:border-0">
                <td colSpan={6} className="p-0">
                  <form
                    action={updateBrandAction}
                    className="flex flex-wrap items-center gap-3 px-4 py-3"
                  >
                    <input type="hidden" name="id" value={brand.id} />
                    <input name="name" defaultValue={brand.name} className={`${inputClass} w-48`} />
                    <input name="slug" defaultValue={brand.slug} className={`${inputClass} w-40`} />
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={brand.sortOrder}
                      className={`${inputClass} w-20`}
                    />
                    <label className="flex items-center gap-1.5 text-[var(--color-muted)]">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={brand.isActive}
                        className="size-4 accent-[var(--color-accent)]"
                      />
                      активен
                    </label>
                    <span className="text-[var(--color-muted)]">{brand._count.categories}</span>
                    <button
                      type="submit"
                      className="ml-auto rounded-[var(--radius-sm)] border border-[var(--color-line)] px-4 py-1.5 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
                    >
                      Сохранить
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[var(--color-muted)]">
                  Брендов пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
