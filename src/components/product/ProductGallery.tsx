import Image from "next/image";
import type { ProductDetail } from "@/lib/catalog";
import { Badge } from "@/components/ui/Badge";
import { CatalogVisual } from "@/components/ui/visuals/CatalogVisual";
import {
  getCatalogStudioAspect,
  hasExplicitCatalogImageOverride,
  isCatalogStudioImage,
} from "@/constants/content/catalog-media";
import { cn } from "@/lib/utils";

/** Адаптивная подача фото: у большинства товаров в базе только 1 фото
 * (сидируется как mainImage) — для них крупный full-bleed hero. Мультифото
 * (сейчас только у флагманов, залито вручную через админку) даёт
 * галерею-периферию: главное фото крупно + до 2 дополнительных ракурсов
 * рядом. Секундарные фото — любые прочие снимки товара, кроме текущего
 * выбранного (imageUrl меняется при выборе цвета в ProductPurchasePanel). */
export function ProductGallery({
  product,
  imageUrl,
}: {
  product: ProductDetail;
  imageUrl: string | null;
}) {
  const secondary = hasExplicitCatalogImageOverride(product.slug)
    ? []
    : product.images.filter((img) => img.url !== imageUrl).slice(0, 2);
  const studioAspect = getCatalogStudioAspect(imageUrl);
  const aspectClass = {
    square: "aspect-square",
    "landscape-4-3": "aspect-[4/3]",
    "landscape-3-2": "aspect-[3/2]",
    "landscape-16-9": "aspect-video",
  }[studioAspect];

  if (secondary.length === 0) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]",
          aspectClass
        )}
      >
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
          imageFit={isCatalogStudioImage(imageUrl) ? "studio" : "contain"}
          sizesAttr="(min-width: 1024px) 60vw, 100vw"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] sm:row-span-2 sm:aspect-auto">
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
          imageFit={isCatalogStudioImage(imageUrl) ? "studio" : "contain"}
          sizesAttr="(min-width: 1024px) 40vw, 100vw"
        />
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
