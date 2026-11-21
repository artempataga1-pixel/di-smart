"use client";

import { useEffect, useState, type RefObject } from "react";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface StickyBuyBarProps {
  /** Блок с основной кнопкой покупки: пока он на экране, панель не нужна. */
  targetRef: RefObject<HTMLElement | null>;
  title: string;
  summary?: string;
  priceByn: number;
  action: "buy" | "select" | "ask" | "unavailable";
  onBuy: () => void;
  onSelect: () => void;
}

/** Нижняя панель «цена · Купить» для телефона. Появляется, когда основная
 * кнопка покупки ушла за пределы экрана — на первом экране флагмана и
 * при чтении длинных рекламных блоков ниже карточки. */
export function StickyBuyBar({ targetRef, title, summary, priceByn, action, onBuy, onSelect }: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  const buttonClass =
    "flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white transition-colors active:bg-[var(--color-accent-dark)] disabled:opacity-50";

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md transition-transform duration-300 md:hidden ${visible ? "translate-y-0" : "pointer-events-none translate-y-full"}`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      aria-hidden={!visible}
      data-testid="sticky-buy-bar"
    >
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-[var(--color-muted)]">{summary ? `${title} · ${summary}` : title}</p>
          <p className="text-lg font-semibold tabular-nums text-[var(--color-text)]">
            {priceByn > 0 ? formatPrice(priceByn) : "Цена по запросу"}
          </p>
        </div>
        {action === "ask" ? (
          <a href="/contacts" className={buttonClass} tabIndex={visible ? 0 : -1}>Уточнить цену</a>
        ) : action === "select" ? (
          <button type="button" onClick={onSelect} className={buttonClass} tabIndex={visible ? 0 : -1}>Выбрать</button>
        ) : (
          <button type="button" onClick={onBuy} disabled={action === "unavailable"} className={buttonClass} tabIndex={visible ? 0 : -1}>
            <ShoppingBag className="size-4" aria-hidden="true" />
            {action === "unavailable" ? "Нет в наличии" : "Купить"}
          </button>
        )}
      </div>
    </div>
  );
}
