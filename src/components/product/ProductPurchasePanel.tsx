"use client";

import { useMemo, useState } from "react";
import type { ProductDetail } from "@/lib/catalog";
import { findExactVariant, isValueAvailable } from "@/lib/variant-matching";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";

/** Владеет состоянием выбора (атрибуты варианта + цвет) и синхронизирует
 * галерею с инфо-панелью — обе живут в одном клиентском компоненте, потому
 * что выбор цвета должен сразу менять фото в галерее слева. */
export function ProductPurchasePanel({ product }: { product: ProductDetail }) {
  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0] ?? null;

  const initialSelected = useMemo(() => {
    if (!defaultVariant) return {};
    const map: Record<string, string> = {};
    for (const attr of product.attributes) {
      const match = attr.values.find((v) => defaultVariant.optionValueIds.includes(v.id));
      if (match) map[attr.id] = match.id;
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selected, setSelected] = useState<Record<string, string>>(initialSelected);
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(product.colors[0]?.id);

  const matchedVariant = product.variants.length > 0 ? findExactVariant(product.variants, selected) : null;
  const priceByn = matchedVariant ? matchedVariant.priceByn : product.basePriceByn;
  const availability = matchedVariant ? matchedVariant.availability : product.availability;
  const needsSelection = product.attributes.length > 0 && !matchedVariant;

  function selectValue(attributeId: string, valueId: string) {
    setSelected((prev) => ({ ...prev, [attributeId]: valueId }));
  }

  function checkAvailable(attributeId: string, valueId: string) {
    if (product.variants.length === 0) return true;
    return isValueAvailable(product.variants, selected, attributeId, valueId);
  }

  const selectedColor = product.colors.find((c) => c.id === selectedColorId) ?? null;
  const galleryImageUrl = selectedColor?.imageUrl ?? product.mainImageUrl;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <ProductGallery product={product} imageUrl={galleryImageUrl} />
      <ProductInfo
        product={product}
        priceByn={priceByn}
        availability={availability}
        needsSelection={needsSelection}
        selected={selected}
        onSelect={selectValue}
        isValueAvailable={checkAvailable}
        selectedColorId={selectedColorId}
        onSelectColor={setSelectedColorId}
      />
    </div>
  );
}
