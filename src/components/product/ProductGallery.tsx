import Image from "@/components/ui/StoreImage";
import type { ProductDetail } from "@/lib/catalog";
import { Badge } from "@/components/ui/Badge";
import { CatalogVisual } from "@/components/ui/visuals/CatalogVisual";
import {
  hasExplicitCatalogImageOverride,
  isCatalogStudioImage,
} from "@/constants/content/catalog-media";
import { cn } from "@/lib/utils";
import { getStorefrontPhoto } from "@/lib/image-quality";
import { getProductGalleryAspect } from "@/lib/product-photo-framing";

/** Every colour shares one frame and an unchanged gallery layout.
 * Only genuinely additional angles appear as secondary photographs. */
export function ProductGallery({
  product,
  imageUrl,
}: {
  product: ProductDetail;
  imageUrl: string | null;
}) {
  const colorImageUrls = Array.from(
    new Set(
      product.colors
        .map((color) => color.imageUrl ?? product.mainImageUrl)
        .filter((url): url is string => Boolean(url))
    )
  );
  const primaryUrls = new Set([...colorImageUrls, product.mainImageUrl]);
  const secondary = hasExplicitCatalogImageOverride(product.slug)
    ? []
    : product.images
        .filter((img) => !img.colorValueId && !primaryUrls.has(img.url))
        .slice(0, 2);
  const hasColorGallery = colorImageUrls.length > 1;
  const aspectRatio = getProductGalleryAspect(colorImageUrls.length ? colorImageUrls : [imageUrl]);

  const primaryVisual = hasColorGallery ? (
    <div className="relative h-full w-full overflow-hidden bg-[#f7f8fa]">
      {colorImageUrls.map((url) => {
        const active = url === imageUrl;
        return (
          <Image
            key={url}
            src={url}
            alt={active ? `${product.name}, выбранный цвет` : ""}
            aria-hidden={!active}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            loading="eager"
            fetchPriority={active ? "high" : "low"}
            // Keep the best existing source if no lossless original survived.
            unoptimized={getStorefrontPhoto(url) === url}
            className={cn(
              "object-contain transition-none",
              active ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          />
        );
      })}
    </div>
  ) : (
    <CatalogVisual
      imageUrl={imageUrl}
      alt={product.name}
      iconHint={`${product.categoryName} ${product.name}`}
      gradientSeed={product.categorySlug}
      size="lg"
      imageFit={isCatalogStudioImage(imageUrl) ? "studio" : "contain"}
      sizesAttr="(min-width: 1024px) 60vw, 100vw"
    />
  );

  if (secondary.length === 0) {
    return (
      <div
        data-testid="product-gallery"
        style={{ aspectRatio }}
        className="relative self-start overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
      >
        {product.isFlagship && (
          <Badge tone="dark" className="absolute left-4 top-4 z-10">
            Флагман
          </Badge>
        )}
        {primaryVisual}
      </div>
    );
  }

  return (
    <div className="grid self-start gap-3 sm:grid-cols-[2fr_1fr]">
      <div data-testid="product-gallery" style={{ aspectRatio }} className="relative self-start overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
        {product.isFlagship && (
          <Badge tone="dark" className="absolute left-4 top-4 z-10">
            Флагман
          </Badge>
        )}
        {primaryVisual}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
        {secondary.map((img) => (
          <div
            key={img.url}
            className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
          >
            <Image
              src={img.url}
              alt={img.alt ?? product.name}
              fill
              sizes="(min-width: 1024px) 20vw, 50vw"
              className="object-contain p-4"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
