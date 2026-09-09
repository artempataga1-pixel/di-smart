import type { ProductDetail } from "@/lib/catalog";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";

export function FlagshipPurchaseSection({ product }: { product: ProductDetail }) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-text)] md:text-3xl">
        Выберите свою конфигурацию
      </h2>
      <div className="mt-8">
        <ProductPurchasePanel product={product} />
      </div>
    </div>
  );
}
