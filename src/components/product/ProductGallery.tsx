import type { ProductDetail } from "@/lib/catalog";
import { Badge } from "@/components/ui/Badge";
import { CatalogVisual } from "@/components/ui/visuals/CatalogVisual";

export function ProductGallery({
  product,
  imageUrl,
}: {
  product: ProductDetail;
  imageUrl: string | null;
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      {product.isFlagship && (
        <Badge tone="dark" className="absolute left-4 top-4 z-10">
          Флагман
        </Badge>
      )}
      <CatalogVisual
        imageUrl={imageUrl}
        alt={product.name}
        iconHint={`${product.categoryName} ${product.name}`}
        gradientSeed={product.categorySlug}
        size="lg"
        imageFit="contain"
        sizesAttr="(min-width: 1024px) 50vw, 100vw"
      />
    </div>
  );
}
