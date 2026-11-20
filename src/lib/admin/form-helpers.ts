/** Общие мелкие парсеры полей форм админки — переиспользуются в CRUD
 * брендов/категорий/товаров, чтобы не дублировать одну и ту же логику. */

export function parseIntField(value: FormDataEntryValue | null, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= -2_147_483_648 && n <= 2_147_483_647 ? Math.trunc(n) : fallback;
}

/** Максимум, согласованный с `@db.Decimal(10, 2)` в схеме (basePriceUsd,
 * priceUsd) — иначе слишком большое число дошло бы до Prisma и упало
 * необработанным исключением вместо дружелюбной ошибки валидации. */
const MAX_DECIMAL_10_2 = 99_999_999.99;

/** Возвращает `null`, если поле пустое/некорректное/отрицательное — вызывающий
 * код сам решает, обязательно ли поле.
 *
 * Важно: `Number(null)` и `Number("")` в JS равны `0`, а не `NaN` — раньше
 * это заставляло пустое поле цены молча проходить как `0` вместо отклонения
 * формы. Пустая строка/null проверяются явно, до вызова `Number()`. */
export function parsePositiveDecimalField(value: FormDataEntryValue | null): number | null {
  if (value === null || (typeof value === "string" && value.trim() === "")) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= MAX_DECIMAL_10_2 ? n : null;
}

/** Пустое поле снимает BYN-переопределение. `undefined` означает ошибку ввода. */
export function parseOptionalBynPrice(value: FormDataEntryValue | null): number | null | undefined {
  if (value === null || (typeof value === "string" && value.trim() === "")) return null;
  if (typeof value !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return undefined;
  const price = parsePositiveDecimalField(value);
  if (price === null || price <= 0) return undefined;
  return price;
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

/** Canonical в админке — только путь внутри сайта, без параметров и фрагмента. */
export function isValidCanonicalPath(path: string): boolean {
  return /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*\/?)?$/.test(path);
}

export function errorRedirectUrl(path: string, message: string): string {
  const url = new URL(path, "https://local.invalid");
  url.searchParams.set("error", message);
  return `${url.pathname}${url.search}${url.hash}`;
}
