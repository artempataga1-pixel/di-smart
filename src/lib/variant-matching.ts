import type { ProductDetailVariant } from "@/lib/catalog";

/** Подбор варианта по выбранным значениям — точное совпадение всего набора
 * (число опций варианта равно числу выбранных атрибутов, и каждое значение
 * совпадает), не пересечение хотя бы по одному значению. */
export function findExactVariant(
  variants: ProductDetailVariant[],
  selected: Record<string, string>
): ProductDetailVariant | null {
  const selectedIds = Object.values(selected);
  if (selectedIds.length === 0) return null;
  return (
    variants.find((v) => {
      if (v.optionValueIds.length !== selectedIds.length) return false;
      return selectedIds.every((id) => v.optionValueIds.includes(id));
    }) ?? null
  );
}

/** Значение атрибута считается доступным для выбора, если существует хотя бы
 * один вариант, содержащий его вместе со всеми УЖЕ выбранными значениями
 * других атрибутов — иначе оно каскадно дизейблится в UI. */
export function isValueAvailable(
  variants: ProductDetailVariant[],
  selected: Record<string, string>,
  attributeId: string,
  valueId: string
): boolean {
  const otherSelectedIds = Object.entries(selected)
    .filter(([attrId]) => attrId !== attributeId)
    .map(([, valueId]) => valueId);

  return variants.some(
    (v) =>
      v.optionValueIds.includes(valueId) &&
      otherSelectedIds.every((id) => v.optionValueIds.includes(id))
  );
}
