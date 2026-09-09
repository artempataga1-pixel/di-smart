import type { ProductDetail } from "@/lib/catalog";
import { FlagshipHero } from "@/components/product/flagship/FlagshipHero";
import { FlagshipFeatureGrid } from "@/components/product/flagship/FlagshipFeatureGrid";
import { FlagshipPurchaseSection } from "@/components/product/flagship/FlagshipPurchaseSection";

/** Персонализированный immersive-лендинг для флагманов (iPhone 17 Pro,
 * Samsung Galaxy S25 Ultra) — заменяет обычный шаблон страницы товара
 * целиком, без хлебных крошек/таблицы характеристик/похожих товаров.
 * Тёмная айдентика теперь общая для всей витрины (.site-theme в
 * ShopChrome) — здесь её больше не подключаем. */
export function FlagshipProductPage({ product }: { product: ProductDetail }) {
  return (
    <div className="relative">
      <FlagshipHero product={product} />
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <FlagshipFeatureGrid slug={product.slug} />
        <div className="mt-16">
          <FlagshipPurchaseSection product={product} />
        </div>
      </div>
    </div>
  );
}
