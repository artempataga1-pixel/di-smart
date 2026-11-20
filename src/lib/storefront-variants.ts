/** Legacy SIM-only SKUs remain in storage for historical orders. */
export function isStorefrontVariantAllowed(productSlug: string, options: { attributeValue: { value: string; attribute: { slug: string } } }[]): boolean {
  return !productSlug.startsWith("iphone-") || options.every(option => option.attributeValue.attribute.slug !== "sim" || ["eSIM", "SIM + eSIM"].includes(option.attributeValue.value));
}
