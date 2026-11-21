"use client";

import { useRef, useState, type ReactNode } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import type { Availability, ProductDetail } from "@/lib/catalog";
import { Price } from "@/components/ui/Price";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { ProductContacts } from "@/components/product/ProductContacts";
import { MAX_ITEM_QTY } from "@/lib/cart-validation";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { formatPrice } from "@/lib/format";

interface ProductInfoProps {
  product: ProductDetail;
  modelSelector?: ReactNode;
  priceByn: number;
  priceKind: ProductDetail["priceKind"];
  availability: Availability;
  needsSelection: boolean;
  variantId: string | null;
  selected: Record<string, string>;
  onSelect: (attributeId: string, valueId: string) => void;
  isValueAvailable: (attributeId: string, valueId: string) => boolean;
  selectedColorId: string | undefined;
  onSelectColor: (colorId: string) => void;
}

export function ProductInfo({
  product,
  modelSelector,
  priceByn,
  priceKind,
  availability,
  needsSelection,
  variantId,
  selected,
  onSelect,
  isValueAvailable,
  selectedColorId,
  onSelectColor,
}: ProductInfoProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const inStock = availability === "IN_STOCK";
  const selectedColorName = product.colors.find((c) => c.id === selectedColorId)?.name;
  const isWatch = product.slug.startsWith("watch-");
  const colorLabel = isWatch ? "Корпус и ремешок" : "Цвет";
  const rootRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const selectedSummary = [
    ...product.attributes.map((attr) => attr.values.find((value) => value.id === selected[attr.id])?.value),
    selectedColorName,
  ].filter(Boolean).join(" · ");
  const chatMessage = [
    `Здравствуйте! Интересует ${product.name}`,
    selectedSummary ? `, ${selectedSummary}` : "",
    priceByn > 0 ? ` — ${formatPrice(priceByn)} на сайте` : "",
    ". Есть в наличии?",
  ].join("");
  const addToCart = () => addItem({ productId: product.id, variantId, colorValueId: selectedColorId ?? null, qty });
  const stickyAction = priceByn <= 0 ? "ask" : needsSelection ? "select" : inStock ? "buy" : "unavailable";

  return (
    <div ref={rootRef} className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-accent-ink)]">
          {product.categorySlug === "samsung-smartphones" ? "Смартфон" : product.brandName}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-text)] md:text-3xl">
          {product.name}
        </h1>
      </div>

      <div data-testid="product-price">
        <Price price={priceByn} size="lg" />
        {priceByn > 0 && priceKind === "MARKET_ESTIMATE" && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">Ориентировочная цена · уточните у менеджера</p>
        )}
      </div>

      <p className="text-sm">
        {needsSelection ? (
          <span className="text-[var(--color-muted)]">Выберите конфигурацию</span>
        ) : inStock ? (
          priceKind === "VERIFIED_SHOP" ? (
            <span className="text-[var(--color-success)]">В наличии</span>
          ) : (
            <span className="text-[var(--color-muted)]">Наличие уточним при оформлении</span>
          )
        ) : (
          <span className="text-[var(--color-warning)]">Нет в наличии</span>
        )}
      </p>

      {modelSelector}

      {product.colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-text)]">
            {colorLabel}{selectedColorName ? `: ${selectedColorName}` : ""}
          </p>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={colorLabel}>
            {product.colors.map((color, index) => (
              <button
                key={color.id}
                type="button"
                onClick={() => onSelectColor(color.id)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                  event.preventDefault();
                  const direction = event.key === "ArrowRight" ? 1 : -1;
                  const nextIndex = (index + direction + product.colors.length) % product.colors.length;
                  onSelectColor(product.colors[nextIndex].id);
                  document.getElementById(`product-color-${product.colors[nextIndex].id}`)?.focus();
                }}
                id={`product-color-${color.id}`}
                role="radio"
                aria-label={color.name}
                aria-checked={selectedColorId === color.id}
                tabIndex={selectedColorId === color.id ? 0 : -1}
                title={color.name}
                className={cn(
                  isWatch
                    ? "inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs leading-5 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] sm:text-sm"
                    : "size-9 rounded-full border-[3px] outline outline-1 outline-offset-2 transition-[border-color,box-shadow,transform] duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]",
                  selectedColorId === color.id
                    ? isWatch ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-white shadow-[0_0_0_2px_var(--color-accent)] outline-transparent"
                    : isWatch ? "border-[var(--color-line)] bg-white" : "border-white outline-[var(--color-line)]"
                )}
                style={isWatch ? undefined : { backgroundColor: color.hex ?? "#cccccc" }}
              >{isWatch && <><span className="size-4 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: color.hex ?? "#cccccc" }} /><span>{color.name}</span></>}</button>
            ))}
          </div>
        </div>
      )}

      {product.attributes.map((attr) => (
        <div key={attr.id}>
          <p className="mb-2 text-sm font-medium text-[var(--color-text)]">{attr.name}</p>
          <div className="flex flex-wrap gap-2">
            {attr.values.map((value) => {
              const isSelected = selected[attr.id] === value.id;
              const available = isValueAvailable(attr.id, value.id);
              return (
                <button
                  key={value.id}
                  type="button"
                  disabled={!available}
                  aria-pressed={isSelected}
                  onClick={() => onSelect(attr.id, value.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    isSelected
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]"
                      : "border-[var(--color-line)] text-[var(--color-text)] hover:border-[var(--color-accent)]",
                    !available && "cursor-not-allowed opacity-40 hover:border-[var(--color-line)]"
                  )}
                >
                  {value.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div ref={actionsRef} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
        <div className="flex items-center gap-1 rounded-full border border-[var(--color-line)]">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Уменьшить количество"
            className="flex size-10 items-center justify-center text-[var(--color-text)]"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-6 text-center tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(MAX_ITEM_QTY, q + 1))}
            aria-label="Увеличить количество"
            disabled={qty >= MAX_ITEM_QTY}
            className="flex size-10 items-center justify-center text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {priceByn <= 0 ? (
          <a href="/contacts" className="flex min-w-0 items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-3.5 text-sm font-medium text-white">
            Уточнить цену
          </a>
        ) : <button
          type="button"
          onClick={addToCart}
          disabled={!inStock || needsSelection}
          className="flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-accent)] px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag className="size-4" />
          {inStock ? "В корзину" : "Нет в наличии"}
        </button>}

        {priceByn > 0 && (
          <p className="col-span-2 text-[13px] leading-snug text-[var(--color-muted)]">
            Оплата на сайте не нужна: вы оставляете заявку, менеджер связывается с вами и согласует оплату и доставку.
          </p>
        )}

        <div className="col-span-2 mt-2 min-w-0">
          <ProductContacts message={chatMessage} />
        </div>

        {(product.description || product.specs.length > 0) && (
          <a
            href="#product-details"
            className="col-span-2 flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] px-5 py-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]"
          >
            Описание и характеристики
          </a>
        )}
      </div>

      <StickyBuyBar
        targetRef={actionsRef}
        title={product.name}
        summary={selectedSummary}
        priceByn={priceByn}
        action={stickyAction}
        onBuy={addToCart}
        onSelect={() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
      />
    </div>
  );
}
