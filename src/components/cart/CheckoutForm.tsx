"use client";

import { useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart-context";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { OrderSuccess } from "@/components/cart/OrderSuccess";
import { EmptyCartState } from "@/components/cart/EmptyCartState";

export function CheckoutForm() {
  const { resolvedItems, itemCount, subtotal, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name,
      phone,
      comment,
      items: resolvedItems.map((i) => ({
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      })),
      subtotal,
    };

    let id = `DISMART-${Date.now()}`;
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.orderId) id = data.orderId;
    } catch {
      // демо: даже при сетевой ошибке показываем успех — это тестовая заявка
    }

    setOrderId(id);
    clearCart();
    setSubmitting(false);
  }

  if (orderId) return <OrderSuccess orderId={orderId} />;

  if (resolvedItems.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col">
        <EmptyCartState />
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl font-semibold md:text-3xl">
          Оформление заказа
        </h1>
        <div className="divide-y divide-[var(--color-line)] rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] px-5">
          {resolvedItems.map((item) => (
            <CartItemRow key={item.product.id} item={item} />
          ))}
        </div>
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-1">
          <CartSummary itemCount={itemCount} subtotal={subtotal} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex h-fit flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
      >
        <h2 className="font-medium text-[var(--color-text)]">Контактные данные</h2>

        <label className="flex flex-col gap-1.5 text-sm">
          Имя
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 outline-none focus:border-[var(--color-accent)]"
            placeholder="Как к вам обращаться"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          Телефон
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 outline-none focus:border-[var(--color-accent)]"
            placeholder="+7 (___) ___-__-__"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          Комментарий
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 outline-none focus:border-[var(--color-accent)]"
            placeholder="Удобное время для звонка и другие пожелания"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-[var(--radius-sm)] bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)] disabled:opacity-60"
        >
          {submitting ? "Отправляем…" : "Отправить заявку"}
        </button>

        <p className="text-xs text-[var(--color-muted)]">
          Это тестовая версия сайта — заказ не передаётся в оплату, менеджер
          свяжется для подтверждения.
        </p>
      </form>
    </div>
  );
}
