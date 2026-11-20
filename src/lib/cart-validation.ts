export const MAX_CART_ITEMS = 50;
export const MAX_ITEM_QTY = 20;
export interface RawCartItem {
  productId: string;
  variantId: string | null;
  colorValueId: string | null;
  qty: number;
}
const isId = (value: unknown): value is string => typeof value === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(value);
export function isRawCartItem(value: unknown): value is RawCartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return isId(item.productId) && (item.variantId === null || isId(item.variantId)) &&
    (item.colorValueId === null || isId(item.colorValueId)) &&
    typeof item.qty === "number" && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= MAX_ITEM_QTY;
}

export function isCompleteOrder(raw: RawCartItem[], lines: { availability: string }[]): boolean {
  return raw.length > 0 && raw.length === lines.length && lines.every(line => line.availability !== "OUT_OF_STOCK");
}
