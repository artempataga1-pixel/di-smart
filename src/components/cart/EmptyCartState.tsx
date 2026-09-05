import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function EmptyCartState({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[var(--color-surface-soft)]">
        <ShoppingBag className="size-6 text-[var(--color-muted)]" />
      </div>
      <div>
        <p className="font-medium text-[var(--color-text)]">Корзина пуста</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Добавьте товары из каталога
        </p>
      </div>
      <Link
        href="/catalog"
        onClick={onNavigate}
        className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-dark)]"
      >
        Перейти в каталог
      </Link>
    </div>
  );
}
