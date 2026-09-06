/** Общие мелкие парсеры полей форм админки — переиспользуются в CRUD
 * брендов/категорий/товаров, чтобы не дублировать одну и ту же логику. */

export function parseIntField(value: FormDataEntryValue | null, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
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

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function errorRedirectUrl(path: string, message: string): string {
  return `${path}?error=${encodeURIComponent(message)}`;
}
