import { createHash } from "node:crypto";
import type { RawCartItem } from "./cart-validation";

export function isOrderKey(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/** Стабильный PK использует существующее UNIQUE-ограничение Order.id.
 * Повтор после обрыва ответа не создаёт дубль даже в другом процессе.
 * Изменённые контакты/состав — отдельная заявка. Секретный случайный ключ
 * не даёт вычислить ID, зная только телефон и состав заказа. */
export function orderIdForRequest(key: string, name: string, phone: string, comment: string | null, items: RawCartItem[]): string {
  return `req_${createHash("sha256").update(JSON.stringify([key, name, phone.replace(/\D/g, ""), comment,
    items.map(i => [i.productId, i.variantId, i.colorValueId, i.qty])])).digest("hex")}`;
}
