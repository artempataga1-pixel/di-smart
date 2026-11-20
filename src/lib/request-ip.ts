/** Доверять IP можно только если reverse proxy перезаписывает X-Real-IP,
 * а приложение недоступно в обход proxy. Иначе клиент подделает заголовок. */
export function getClientIp(headers: Pick<Headers, "get">): string {
  // Заголовки IP можно принимать только от контролируемого reverse proxy.
  // Само приложение не должно быть доступно в обход этого proxy.
  if (process.env.TRUST_PROXY_HEADERS !== "true") return "unknown";
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp && /^[\da-fA-F:.]+$/.test(xRealIp.trim())) return xRealIp.trim();
  return "unknown";
}
