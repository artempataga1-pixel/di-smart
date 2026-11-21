"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatBelarusPhone, isBelarusPhoneComplete } from "@/lib/phone";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { OrderSuccess } from "@/components/cart/OrderSuccess";
import { SITE } from "@/constants/content/site";
import { EmptyCartState } from "@/components/cart/EmptyCartState";
import { LEGAL_DOCUMENT_VERSION } from "@/lib/legal";

/* Переживает перезагрузку страницы между ответом telegram_delivery_failed и
 * кликом "Повторить попытку" — без этого reload/уход со страницы теряет
 * pendingOrderId из React-состояния, и следующая обычная отправка создала бы
 * ВТОРОЙ Order на ту же самую попытку покупки (корзина ведь не очищается,
 * пока сервер не подтвердит полный успех). */
const PENDING_ORDER_STORAGE_KEY = "di-smart-pending-order-id";
const PENDING_ORDER_MESSAGE =
  "Заявка сохранена, но не получилось уведомить менеджера. Повторите отправку уведомления.";

export function CheckoutForm({ ordersEnabled }: { ordersEnabled: boolean }) {
  const { items, resolvedItems, isResolving, itemCount, subtotal, clearCart, resolveError, refreshCart } = useCart();
  const submittingRef = useRef(false);
  const requestKeyRef = useRef<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [telegramConfigured, setTelegramConfigured] = useState(true);
  /* Заказ уже сохранён на сервере, но уведомление менеджеру не доставлено —
   * следующий клик "Повторить" шлёт retryOrderId вместо повторного создания
   * заказа (иначе на один визит покупателя завелось бы несколько Order). */
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    /* setState — только внутри .then()-коллбэка микрозадачи, не синхронно в
     * теле эффекта (тот же обход react-hooks/set-state-in-effect, что и в
     * cart-context.tsx). SSR/первый клиентский рендер не видят sessionStorage
     * (так и должно быть — восстановление применяется отдельным проходом
     * после гидратации). */
    Promise.resolve().then(() => {
      try {
        const saved = window.sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY);
        if (saved) {
          setPendingOrderId(saved);
          setSubmitError(PENDING_ORDER_MESSAGE);
        }
      } catch {
        // sessionStorage недоступен (приватный режим и т.п.) — просто не восстанавливаем
      }
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current || (!pendingOrderId && (isResolving || resolveError))) return;

    if (!isBelarusPhoneComplete(phone)) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);
    setSubmitError(null);
    setSubmitting(true);
    submittingRef.current = true;
    if (!requestKeyRef.current) {
      try { requestKeyRef.current = sessionStorage.getItem("di-smart-order-key"); } catch {}
      requestKeyRef.current ||= crypto.randomUUID();
      try { sessionStorage.setItem("di-smart-order-key", requestKeyRef.current); } catch {}
    }

    const payload = pendingOrderId
      ? { retryOrderId: pendingOrderId, phone }
      : {
          idempotencyKey: requestKeyRef.current,
          expectedTotalByn: subtotal,
          name,
          phone,
          comment,
          honeypot,
          termsAccepted,
          privacyAcknowledged,
          legalVersion: LEGAL_DOCUMENT_VERSION,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            colorValueId: i.colorValueId,
            qty: i.quantity,
          })),
        };

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25_000),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 503 && data?.error === "orders_unavailable") {
        setSubmitError("Приём заявок пока не открыт. Пожалуйста, вернитесь позже.");
        setSubmitting(false);
        return;
      }

      if (!data) {
        setSubmitError("Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.");
        setSubmitting(false);
        return;
      }

      if (res.ok && data.ok) {
        setOrderId(data.orderId ?? `DISMART-${Date.now()}`);
        setTelegramConfigured(data.telegramConfigured !== false);
        try {
          window.sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
          window.sessionStorage.removeItem("di-smart-order-key");
        } catch {
          // sessionStorage недоступен — не критично, ключ просто не был записан
        }
        requestKeyRef.current = null;
        clearCart();
        setSubmitting(false);
        return;
      }

      if (data.error === "telegram_delivery_failed" && data.orderId) {
        setPendingOrderId(data.orderId);
        try {
          window.sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, data.orderId);
        } catch {
          // sessionStorage недоступен — retry в этой вкладке всё равно сработает
          // через React-состояние, просто не переживёт перезагрузку страницы
        }
        setSubmitError(PENDING_ORDER_MESSAGE);
      } else if (data.error === "rate_limited") {
        setSubmitError(`Слишком много попыток. Повторите через ${Number(res.headers.get("Retry-After")) || 60} сек.`);
      } else if (data.error === "invalid_name") {
        setSubmitError("Укажите имя: от 2 до 100 символов.");
      } else if (data.error === "invalid_comment") {
        setSubmitError("Комментарий должен быть не длиннее 500 символов.");
      } else if (data.error === "legal_acknowledgment_required") {
        setSubmitError("Ознакомьтесь с условиями заказа и политикой обработки данных, затем отметьте оба пункта.");
      } else if (data.error === "price_changed") {
        refreshCart();
        setSubmitError("Цена изменилась. Проверьте обновлённую сумму и подтвердите заказ ещё раз.");
      } else if (data.error === "cart_items_unavailable") {
        refreshCart();
        setSubmitError("Некоторые товары в корзине больше недоступны. Обновите корзину и попробуйте снова.");
      } else if (data.error === "invalid_phone") {
        setPhoneError(true);
        setSubmitError(null);
      } else {
        setSubmitError("Не удалось отправить заявку. Попробуйте ещё раз.");
      }
    } catch {
      setSubmitError("Нет соединения с сервером. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  if (orderId) return <OrderSuccess orderId={orderId} telegramConfigured={telegramConfigured} />;

  const isEmpty = items.length === 0;
  const isLoadingFirstResolve = !isEmpty && isResolving && resolvedItems.length === 0;

  if (isEmpty) {
    return (
      <div className="flex min-h-[50vh] flex-col">
        <EmptyCartState />
      </div>
    );
  }

  if (isLoadingFirstResolve) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-sm text-[var(--color-muted)]">
        Загружаем корзину…
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl font-semibold md:text-3xl">
          Оформление заказа
        </h1>
        {resolveError && <p role="alert" className="mb-4 text-sm text-[var(--color-warning)]">{resolveError} <button type="button" onClick={refreshCart} className="underline">Повторить</button></p>}
        <div className="divide-y divide-[var(--color-line)] rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] px-5">
          {resolvedItems.map((item) => (
            <CartItemRow
              key={`${item.productId}-${item.variantId}-${item.colorValueId}`}
              item={item}
            />
          ))}
        </div>
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-1">
          <CartSummary itemCount={itemCount} subtotal={subtotal} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative flex h-fit flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
      >
        <h2 className="font-medium text-[var(--color-text)]">Контактные данные</h2>
        {!ordersEnabled && (
          <p role="status" className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] p-3 text-sm text-[var(--color-muted)]">
            Приём заявок пока не открыт. Форму можно посмотреть, но отправка контактных данных отключена до публикации реквизитов продавца.
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm">
          Имя
          <input
            required={!pendingOrderId}
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 outline-none focus:border-[var(--color-accent)]"
            placeholder="Как к вам обращаться"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          Телефон
          <input
            required={!pendingOrderId}
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => {
              setPhone(formatBelarusPhone(e.target.value));
              setPhoneError(false);
            }}
            className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 outline-none focus:border-[var(--color-accent)]"
            placeholder="+375 (XX) XXX-XX-XX"
          />
          {phoneError && (
            <span className="text-xs text-[var(--color-warning)]">
              Введите номер полностью: +375 (XX) XXX-XX-XX
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          Комментарий
          <textarea
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 outline-none focus:border-[var(--color-accent)]"
            placeholder="Удобное время для звонка и другие пожелания"
          />
        </label>

        {/* Honeypot: реальные пользователи это поле не видят и не заполняют.
            Если оно пришло непустым — заявка бота (серверная проверка —
            задача 46, уровень 6; пока только собираем значение). */}
        <div className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="checkout-company">Не заполняйте это поле</label>
          <input
            id="checkout-company"
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {!pendingOrderId && <div className="space-y-3 border-t border-[var(--color-line)] pt-4 text-sm leading-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 size-4 shrink-0 accent-[var(--color-accent)]" />
            <span>Я ознакомился(-ась) с <Link href="/offer" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">условиями оформления заявки</Link> и принимаю их.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" required checked={privacyAcknowledged} onChange={(e) => setPrivacyAcknowledged(e.target.checked)} className="mt-1 size-4 shrink-0 accent-[var(--color-accent)]" />
            <span>Я ознакомился(-ась) с <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">политикой обработки персональных данных</Link>. Имя, телефон и комментарий нужны для рассмотрения моей заявки и связи со мной.</span>
          </label>
          <p className="text-xs text-[var(--color-muted)]">Эти отметки подтверждают ознакомление с документами. Разрешение на необязательную аналитику выбирается отдельно в настройках cookies и на отправку заявки не влияет.</p>
        </div>}

        {submitError && (
          <p className="text-xs text-[var(--color-warning)]" role="alert">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={!ordersEnabled || submitting || (!pendingOrderId && (isResolving || Boolean(resolveError) || resolvedItems.some(i => i.availability === "OUT_OF_STOCK")))}
          className="mt-2 rounded-[var(--radius-sm)] bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)] disabled:opacity-60"
        >
          {submitting ? "Отправляем…" : !ordersEnabled ? "Приём заявок пока закрыт" : pendingOrderId ? "Повторить попытку" : "Отправить заявку"}
        </button>

        {ordersEnabled && (
          <p className="text-sm text-[var(--color-text)]">
            После отправки менеджер позвонит вам, чтобы подтвердить наличие, цену и доставку. Звоним {SITE.managerHours}.
            Оплата на сайте не нужна.
          </p>
        )}

        <p className="text-xs text-[var(--color-muted)]">
          Это тестовая версия сайта. Указывайте только свои контактные данные:
          заявка сохраняется в базе и может передаваться менеджеру через бот.
          Оплата не производится.
        </p>
      </form>
    </div>
  );
}
