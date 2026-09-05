import { formatPrice } from "@/lib/format";
import { pluralizeItems } from "@/lib/format";

export function CartSummary({ itemCount, subtotal }: { itemCount: number; subtotal: number }) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--color-line)] pt-4">
      <span className="text-sm text-[var(--color-muted)]">
        {itemCount} {pluralizeItems(itemCount)}
      </span>
      <span className="text-lg font-semibold tabular-nums">{formatPrice(subtotal)}</span>
    </div>
  );
}
