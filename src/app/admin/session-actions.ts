"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifyCredentials,
} from "@/lib/auth";

const LOGIN_RATE_LIMIT_PER_IP = { limit: 5, windowMs: 60 * 1000 };
/** Второй, более щедрый лимит на общий ключ, не зависящий от IP — пока перед
 * приложением нет доверенного reverse-proxy (см. TODO в src/lib/request-ip.ts),
 * per-IP лимит тривиально обходится подделкой X-Forwarded-For на каждый
 * запрос. Этот лимит такую подмену не замечает и не пропускает вообще. */
const LOGIN_RATE_LIMIT_GLOBAL = { limit: 20, windowMs: 60 * 1000 };

export interface LoginState {
  error: string | null;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const globalRateLimit = checkRateLimit("admin-login:global", LOGIN_RATE_LIMIT_GLOBAL);
  if (!globalRateLimit.allowed) {
    return { error: `Слишком много попыток входа. Попробуйте через ${globalRateLimit.retryAfterSeconds} сек.` };
  }

  const ip = getClientIp(await headers());
  const rateLimit = checkRateLimit(`admin-login:${ip}`, LOGIN_RATE_LIMIT_PER_IP);
  if (!rateLimit.allowed) {
    return { error: `Слишком много попыток входа. Попробуйте через ${rateLimit.retryAfterSeconds} сек.` };
  }

  const login = String(formData.get("login") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!verifyCredentials(login, password)) {
    return { error: "Неверный логин или пароль." };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
