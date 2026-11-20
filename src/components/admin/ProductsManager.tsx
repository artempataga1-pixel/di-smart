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
  priceByn: string | null;
  availability: "IN_STOCK" | "OUT_OF_STOCK";
  isFlagship: boolean;
  isActive: boolean;
}

export function ProductsManager({ products }: { products: ProductRow[] }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) =>
      (!q || `${p.name} ${p.brandName} ${p.categoryName}`.toLowerCase().includes(q)) &&
      (!brand || p.brandName === brand) &&
      (status === "all" ||
        (status === "active" && p.isActive) ||
        (status === "hidden" && !p.isActive) ||
        (status === "out" && p.availability === "OUT_OF_STOCK") ||
        (status === "flagship" && p.isFlagship))
    );
  }, [products, query, brand, status]);
  const brands = useMemo(() => [...new Set(products.map((p) => p.brandName))].sort(), [products]);
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allVisibleSelected = visible.length > 0 && visible.every((p) => selected.has(p.id));

  function toggleVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const product of visible) {
        if (allVisibleSelected) next.delete(product.id);
        else next.add(product.id);
      }
      return next;
    });
  }

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-body)] text-2xl font-semibold">Товары</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Всего в каталоге: {products.length}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selected.size > 0 && (
            <><button type="button" onClick={() => setSelected(new Set())} className="px-2 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent-ink)]">Снять выделение ({selected.size})</button><button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded-[var(--radius-sm)] border border-[var(--color-warning)] px-4 py-2 text-sm font-medium text-[var(--color-warning)] transition-colors hover:bg-[var(--color-warning)] hover:text-white"
            >
              Удалить ({selected.size})
            </button></>
          )}
          <Link
            href="/admin/products/new"
            className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)]"
          >
            Добавить товар
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_170px]">
        <input type="search" aria-label="Поиск товаров" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Название, бренд или категория…" className="w-full rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]" />
        <select aria-label="Фильтр по бренду" value={brand} onChange={(e) => { setBrand(e.target.value); setPage(1); }} className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm">
          <option value="">Все бренды</option>
          {brands.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <select aria-label="Фильтр по состоянию" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm">
          <option value="all">Все товары</option>
          <option value="active">Активные</option>
          <option value="hidden">Скрытые</option>
          <option value="out">Нет в наличии</option>
          <option value="flagship">Флагманы</option>
        </select>
      </div>

      <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
        <span>Найдено: {filtered.length}</span>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} disabled={visible.length === 0} className="size-4 accent-[var(--color-accent)]" />
          Выбрать на странице
        </label>
      </div>

      <div className="grid gap-3 lg:hidden">
        {visible.map((product) => (
          <article key={product.id} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggle(product.id)} aria-label={`Выбрать товар «${product.name}»`} className="mt-1 size-4 shrink-0 accent-[var(--color-accent)]" />
              <div className="min-w-0 flex-1">
                <Link href={`/admin/products/${product.id}`} className="font-semibold text-[var(--color-accent-ink)] hover:underline">{product.name}</Link>
                <p className="mt-1 text-xs text-[var(--color-muted)]">{product.brandName} · {product.categoryName}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="font-medium">{product.priceUsd} $ {product.priceByn ? `· ${product.priceByn} BYN` : "· по курсу"}</span>
                  <span className={product.availability === "IN_STOCK" ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"}>{product.availability === "IN_STOCK" ? "В наличии" : "Нет в наличии"}</span>
                  {!product.isActive && <span className="text-[var(--color-muted)]">Скрыт</span>}
                  {product.isFlagship && <span className="text-[var(--color-accent-ink)]">Флагман</span>}
                </div>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && <p className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-muted)]">{products.length === 0 ? "Товаров пока нет" : "Ничего не найдено"}</p>}
      </div>

      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)]">
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Цена USD / BYN</th>
              <th className="px-4 py-3 font-medium">Наличие</th>
              <th className="px-4 py-3 font-medium">Флагман</th>
              <th className="px-4 py-3 font-medium">Активен</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((product) => (
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
                <td className="whitespace-nowrap px-4 py-3">{product.priceUsd} $ / {product.priceByn ? `${product.priceByn} BYN` : "по курсу"}</td>
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

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--color-muted)]">Страница {currentPage} из {pageCount}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 disabled:opacity-40">Назад</button>
            <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 disabled:opacity-40">Дальше</button>
          </div>
        </div>
      )}

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
