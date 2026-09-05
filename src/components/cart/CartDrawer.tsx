"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCartState } from "@/components/cart/EmptyCartState";

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, resolvedItems, itemCount, subtotal, clearCart } = useCart();
  const router = useRouter();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Закрыть корзину"
        onClick={closeDrawer}
        className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-[2px]"
      />

      <div className="relative flex h-full w-full max-w-md flex-col bg-[var(--color-surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">
            Корзина
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Закрыть"
            className="flex size-9 items-center justify-center rounded-full hover:bg-[var(--color-surface-soft)]"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {resolvedItems.length === 0 ? (
          <EmptyCartState onNavigate={closeDrawer} />
        ) : (
          <>
            <div className="flex-1 divide-y divide-[var(--color-line)] overflow-y-auto px-5">
              {resolvedItems.map((item) => (
                <CartItemRow key={item.product.id} item={item} />
              ))}
            </div>

            <div className="border-t border-[var(--color-line)] p-5">
              <CartSummary itemCount={itemCount} subtotal={subtotal} />
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    router.push("/cart");
                  }}
                  className="w-full rounded-[var(--radius-sm)] bg-[var(--color-accent)] py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-dark)]"
                >
                  Оформить заказ
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full py-2 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  Очистить корзину
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
