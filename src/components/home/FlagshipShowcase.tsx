"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FlagshipShowcaseProduct } from "@/lib/catalog";
import { Price } from "@/components/ui/Price";
import { PillCta } from "@/components/ui/PillCta";
import { cn } from "@/lib/utils";

/** Главный блок первого экрана — один флагман целиком: большое фото +
 * заголовок + цена + 3 сторителлинговые картинки под ним. Стрелки/точки
 * переключают ВЕСЬ блок между флагманами (не просто фото в углу) — так
 * ротация нескольких флагманов не превращается в мини-каталог. */
export function FlagshipShowcase({ products }: { products: FlagshipShowcaseProduct[] }) {
  const [index, setIndex] = useState(0);
  if (products.length === 0) return null;

  const current = products[index];
  const heroImage = current.images[0] ?? null;
  const storyImages = current.images.slice(1, 4);

  function prev() {
    setIndex((i) => (i - 1 + products.length) % products.length);
  }
  function next() {
    setIndex((i) => (i + 1) % products.length);
  }

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
        <div className="order-2 md:order-1">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-accent-ink)]">
            Флагман
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-semibold leading-[1.05] text-[var(--color-text)] md:text-6xl">
            {current.name}
          </h1>
          <div className="mt-5">
            <Price price={current.priceByn} size="lg" />
          </div>
          <div className="mt-8">
            <PillCta href={`/product/${current.slug}`}>Смотреть товар</PillCta>
          </div>
        </div>

        <div className="relative order-1 aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] md:order-2 md:aspect-[4/5]">
          {heroImage && (
            <Image
              src={heroImage.url}
              alt={current.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain p-8"
              priority
            />
          )}
        </div>
      </div>

      {storyImages.length > 0 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {storyImages.map((img) => (
            <div
              key={img.url}
              className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)]"
            >
              <Image
                src={img.url}
                alt={img.alt ?? current.name}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {products.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Предыдущий флагман"
            className="flex size-9 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-surface-soft)]"
          >
            <ChevronLeft className="size-4 text-[var(--color-text)]" />
          </button>

          <div className="flex items-center gap-2">
            {products.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Показать ${p.name}`}
                aria-current={i === index}
                className={cn(
                  "size-2.5 rounded-full transition-colors",
                  i === index ? "bg-[var(--color-accent)]" : "bg-[var(--color-line)]"
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Следующий флагман"
            className="flex size-9 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-surface-soft)]"
          >
            <ChevronRight className="size-4 text-[var(--color-text)]" />
          </button>
        </div>
      )}
    </div>
  );
}
