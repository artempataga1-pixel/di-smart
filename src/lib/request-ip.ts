import type { NextRequest } from "next/server";

/** Известное ограничение: docker-compose.yml сейчас публикует контейнер app
 * напрямую на хост-порт, без reverse-proxy — значит x-forwarded-for/x-real-ip
 * пока никто доверенно не проставляет, а "сырой" сокет-IP через Web-стандартный
 * Request недоступен в принципе. Пока это возвращает "unknown" почти всегда.
 *
 * TODO: при появлении nginx/Traefik перед приложением на VPS — настроить
 * проксирование доверенного X-Forwarded-For, иначе весь трафик рискует
 * попасть в один rate-limit бакет "unknown" (лимит станет глобальным на все
 * анонимные заявки разом), либо клиент сможет подделать заголовок и обойти
 * лимит вовсе. */
export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  return "unknown";
}
