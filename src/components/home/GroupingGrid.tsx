import { RefreshCw, Truck } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getAllCategories } from "@/lib/catalog";
import { CategoryCard } from "@/components/home/CategoryCard";

/** Компактная замена трёх прежних секций главной (Категории + инфо-плашки +
 * грид популярных товаров) одной bento-сеткой: несколько категорий +
 * услуги + переход в каталог. Полный листинг товаров с главной убран
 * намеренно (решение пользователя) — каталог живёт на /catalog. */
export async function GroupingGrid() {
  const categories = await getAllCategories();
  const featured = categories.slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
      {featured.map((category) => (
        <CategoryCard key={category.slug} category={category} />
      ))}

      <div className="flex flex-col gap-3 rounded-[6px_var(--radius-xl)_6px_var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <RefreshCw className="size-5 text-[var(--color-accent-ink)]" />
        <p className="text-sm font-medium text-[var(--color-text)]">Trade-in</p>
        <p className="text-xs text-[var(--color-muted)]">
          Обмен старого устройства на новое — сумму зачёта оценивает менеджер.
        </p>
        <div className="mt-auto flex items-center gap-2 border-t border-[var(--color-line)] pt-3">
          <Truck className="size-4 shrink-0 text-[var(--color-accent-ink)]" />
          <p className="text-xs text-[var(--color-muted)]">
            Доставка по всей Беларуси, гарантия 12 месяцев.
          </p>
        </div>
      </div>

      <Link
        href="/catalog"
        className="group flex flex-col justify-between gap-3 rounded-[6px_var(--radius-xl)_6px_var(--radius-xl)] bg-[var(--color-accent)] p-5 text-white shadow-[var(--shadow-accent-glow)] transition-colors hover:bg-[var(--color-accent-dark)]"
      >
        <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        <div>
          <p className="text-lg font-semibold">Весь каталог</p>
          <p className="text-sm opacity-90">Apple, Samsung и аксессуары</p>
        </div>
      </Link>
    </div>
  );
}
