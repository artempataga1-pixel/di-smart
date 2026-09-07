/** Авторизация одного статичного админа (логин/пароль из env) и подписанная
 * httpOnly cookie-сессия — без NextAuth, она не нужна для одного пользователя.
 *
 * HMAC через Web Crypto (`crypto.subtle`), не Node `crypto` — этот модуль
 * используется и в `src/proxy.ts` (в Next.js 16 Proxy по умолчанию работает на
 * Node.js runtime, но `crypto.subtle` доступен и там, и в обычных Server
 * Actions/Route Handler'ах — единая реализация без разветвления по рантайму). */

export const SESSION_COOKIE_NAME = "di-smart-admin-session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 дней

interface SessionPayload {
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET не задан в .env");
  return secret;
}

function getSigningKey(): Promise<CryptoKey> {
  const keyData = new TextEncoder().encode(getSecret());
  return crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Подписывает и создаёт токен сессии вида `payload.signature` (оба base64url). */
export async function createSessionToken(): Promise<string> {
  const payload: SessionPayload = { exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 };
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  return `${payloadB64}.${signatureB64}`;
}

/** Проверяет подпись токена и срок годности. `crypto.subtle.verify` сам
 * делает сравнение подписи в постоянное время — не нужно писать это вручную. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payloadB64, signatureB64] = token.split(".");
  if (!payloadB64 || !signatureB64) return false;

  try {
    const key = await getSigningKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signatureB64),
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return false;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64))) as SessionPayload;
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

/** Сравнение в постоянное время — не выдаёт длину/содержимое ADMIN_PASSWORD
 * через тайминг ответа. Один админ, без БД — простое, но не наивное `===`. */
function timingSafeEqualString(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  const maxLen = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length === bBytes.length ? 0 : 1;
  for (let i = 0; i < maxLen; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

export function verifyCredentials(login: string, password: string): boolean {
  const expectedLogin = process.env.ADMIN_LOGIN;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedLogin || !expectedPassword) return false;
  return timingSafeEqualString(login, expectedLogin) && timingSafeEqualString(password, expectedPassword);
}
