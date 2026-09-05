import type { Product } from "@/types/product";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { Badge } from "@/components/ui/Badge";

export function ProductGallery({ product }: { product: Product }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      {product.badge && (
        <Badge type={product.badge} className="absolute left-4 top-4 z-10" />
      )}
      <ProductVisual icon={product.icon} category={product.category} size="lg" />
    </div>
  );
}
