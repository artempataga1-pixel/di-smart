import { cn } from "@/lib/utils";
import type { ProductBadge } from "@/types/product";

const BADGE_STYLES: Record<ProductBadge, string> = {
  "Новинка": "bg-[var(--color-accent)] text-white",
  "Хит продаж": "bg-[var(--color-ink)] text-[var(--color-on-ink)]",
  "Под заказ": "bg-[var(--color-warning)] text-white",
  "Скидка": "bg-[var(--color-success)] text-white",
};

export function Badge({ type, className }: { type: ProductBadge; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-none",
        BADGE_STYLES[type],
        className
      )}
    >
      {type}
    </span>
  );
}
