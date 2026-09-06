import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

/** Defense-in-depth: `middleware.ts` уже защищает все `/admin/**` (включая
 * POST от Server Actions, которые постятся на тот же URL страницы), но
 * полагаться только на это — хрупко: если какой-то из этих экшенов однажды
 * импортируют в компонент вне `/admin/**`, авторизация исчезнет без единого
 * предупреждения компилятора. Каждый мутирующий Server Action в админке
 * вызывает эту проверку явно, независимо от того, как он был вызван.
 *
 * В отдельном файле от `src/lib/auth.ts` (не `next/headers`/`next/navigation`)
 * — чтобы не тянуть Node-специфичные API в Edge-бандл `middleware.ts`. */
export async function requireAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);
  if (!valid) redirect("/admin/login");
}
