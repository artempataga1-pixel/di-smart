/** Форматирует ввод под маску `+375 (XX) XXX-XX-XX` по мере набора номера.
 * Пересчитывает результат из "сырых" цифр целиком на каждый ввод — без
 * привязки к позиции курсора, чего достаточно для простого поля телефона
 * без сторонних form-библиотек (их в проекте нет). */
export function formatBelarusPhone(raw: string): string {
  const digitsAll = raw.replace(/\D/g, "");
  if (digitsAll.length === 0) return "";

  const national = digitsAll.replace(/^375/, "").slice(0, 9);

  let result = "+375";
  if (national.length > 0) result += ` (${national.slice(0, 2)}`;
  if (national.length >= 2) result += ")";
  if (national.length > 2) result += ` ${national.slice(2, 5)}`;
  if (national.length > 5) result += `-${national.slice(5, 7)}`;
  if (national.length > 7) result += `-${national.slice(7, 9)}`;
  return result;
}

/** Номер считается полным, когда после кода страны набраны все 9 цифр
 * национального номера (2 — код оператора, 7 — сам номер). */
export function isBelarusPhoneComplete(value: string): boolean {
  const digitsAll = value.replace(/\D/g, "");
  const national = digitsAll.replace(/^375/, "");
  return national.length === 9;
}
