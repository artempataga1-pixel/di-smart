"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import type { Availability, ProductDetail } from "@/lib/catalog";
import { Price } from "@/components/ui/Price";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: ProductDetail;
  priceByn: number;
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
  priceByn,
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

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-accent-ink)]">
          {product.brandName}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-text)] md:text-3xl">
          {product.name}
        </h1>
      </div>

      <div data-testid="product-price">
        <Price price={priceByn} size="lg" />
      </div>

      {product.shortDescription && (
        <p className="text-[var(--color-muted)]">{product.shortDescription}</p>
      )}

      <p className="text-sm">
        {needsSelection ? (
          <span className="text-[var(--color-muted)]">Выберите конфигурацию</span>
        ) : inStock ? (
          <span className="text-[var(--color-success)]">В наличии</span>
        ) : (
          <span className="text-[var(--color-warning)]">Нет в наличии</span>
        )}
      </p>

      {product.colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-text)]">
            Цвет{selectedColorName ? `: ${selectedColorName}` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => onSelectColor(color.id)}
                aria-label={color.name}
                aria-pressed={selectedColorId === color.id}
                title={color.name}
                className={cn(
                  "size-8 rounded-full border-2 transition-shadow",
                  selectedColorId === color.id
                    ? "border-[var(--color-accent)] shadow-[var(--shadow-accent-glow)]"
                    : "border-[var(--color-line)]"
                )}
                style={{ backgroundColor: color.hex ?? "#cccccc" }}
              />
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

      <div className="flex items-center gap-3">
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
            onClick={() => setQty((q) => q + 1)}
            aria-label="Увеличить количество"
            className="flex size-10 items-center justify-center text-[var(--color-text)]"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            addItem({ productId: product.id, variantId, colorValueId: selectedColorId ?? null, qty })
          }
          disabled={!inStock || needsSelection}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag className="size-4" />
          {inStock ? "В корзину" : "Нет в наличии"}
        </button>
      </div>
    </div>
  );
}
