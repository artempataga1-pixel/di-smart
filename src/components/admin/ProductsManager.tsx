"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { deleteProductsAction } from "@/app/admin/(protected)/products/actions";

export interface ProductRow {
  id: string;
  name: string;
  brandName: string;
  categoryName: string;
  priceUsd: string;
  availability: "IN_STOCK" | "OUT_OF_STOCK";
  isFlagship: boolean;
  isActive: boolean;
}

export function ProductsManager({ products }: { products: ProductRow[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      `${p.name} ${p.brandName} ${p.categoryName}`.toLowerCase().includes(q)
    );
  }, [products, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirmDelete() {
    const ids = Array.from(selected);
    startTransition(async () => {
      await deleteProductsAction(ids);
      setSelected(new Set());
      setConfirmOpen(false);
    });
  }

  const confirmText =
    selected.size === 1
      ? "Действительно ли Вы желаете удалить выбранный товар?"
      : `Действительно ли Вы желаете удалить выбранные товары (${selected.size})?`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-body)] text-2xl font-semibold">Товары</h1>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded-[var(--radius-sm)] border border-[var(--color-warning)] px-5 py-2 text-sm font-medium text-[var(--color-warning)] transition-colors hover:bg-[var(--color-warning)] hover:text-white"
            >
              Удалить товар
            </button>
          )}
          <Link
            href="/admin/products/new"
            className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)]"
          >
            Добавить товар
          </Link>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по названию, бренду или категории…"
        className="w-full max-w-sm rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
      />

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)]">
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Цена USD</th>
              <th className="px-4 py-3 font-medium">Наличие</th>
              <th className="px-4 py-3 font-medium">Флагман</th>
              <th className="px-4 py-3 font-medium">Активен</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-[var(--color-line)] last:border-0">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggle(product.id)}
                    aria-label={`Выбрать товар «${product.name}»`}
                    className="size-4 accent-[var(--color-accent)]"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium hover:text-[var(--color-accent-ink)] hover:underline"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)]">
                  {product.brandName} / {product.categoryName}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{product.priceUsd} $</td>
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-[var(--color-muted)]">
                  {products.length === 0 ? "Товаров пока нет" : "Ничего не найдено"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6">
            <p className="mb-5 text-sm">{confirmText}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={isPending}
                className="rounded-[var(--radius-sm)] border border-[var(--color-line)] px-5 py-2 text-sm font-medium transition-colors hover:border-[var(--color-accent)] disabled:opacity-60"
              >
                Нет
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="rounded-[var(--radius-sm)] bg-[var(--color-warning)] px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? "Удаление…" : "Да"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
