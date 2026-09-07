import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

/** Защищает все `/admin/**`, кроме `/admin/login` — без валидной подписанной
 * cookie-сессии редиректит на страницу логина. Server Actions админки постят
 * на тот же URL, с которого отрендерена форма (тот же `/admin/**` путь),
 * поэтому этот же proxy перехватывает и их — отдельная проверка сессии
 * внутри каждого Server Action не нужна. */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);
  if (!valid) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
