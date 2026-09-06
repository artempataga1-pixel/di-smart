/** Известное ограничение: docker-compose.yml сейчас публикует контейнер app
 * напрямую на хост-порт, без reverse-proxy — значит x-forwarded-for/x-real-ip
 * пока никто доверенно не проставляет, а "сырой" сокет-IP через Web-стандартный
 * Request недоступен в принципе. Пока это возвращает "unknown" почти всегда.
 *
 * TODO: при появлении nginx/Traefik перед приложением на VPS — настроить
 * проксирование доверенного X-Forwarded-For, иначе весь трафик рискует
 * попасть в один rate-limit бакет "unknown" (лимит станет глобальным на все
 * анонимные заявки разом), либо клиент сможет подделать заголовок и обойти
 * лимит вовсе.
 *
 * Принимает просто `Headers` (не `NextRequest`) — так функция работает и в
 * Route Handler'ах (`request.headers`), и в Server Actions (`headers()` из
 * `next/headers`, тип `ReadonlyHeaders`, но интерфейс `.get()` тот же). */
export function getClientIp(headers: Pick<Headers, "get">): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  return "unknown";
}
