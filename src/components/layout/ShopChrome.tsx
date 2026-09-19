"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { CartDrawer } from "@/components/cart/CartDrawer";
import type { NavBrand } from "@/lib/catalog";

/** Админка (`/admin/**`) — отдельный UI-каркас без общего Header/Footer
 * магазина и без корзины (задача 48). Единственный root layout в App Router
 * общий для всего сайта (html/body/шрифты), поэтому переключение "витрина
 * vs админка" сделано здесь через `usePathname`, а не дублированием root
 * layout — это избавляет от переноса всех страниц магазина в route group. */
export function ShopChrome({
  navBrands,
  analytics,
  children,
}: {
  navBrands: NavBrand[];
  /* Рендерится в RootLayout (Server Component) и прокидывается сюда, а не
   * импортируется напрямую в этот "use client"-файл: YandexMetrika читает
   * server-only env (`YANDEX_METRIKA_ID`, без NEXT_PUBLIC_-префикса) —
   * прямой импорт в клиентский компонент превратил бы его в client-бандл,
   * где этот env всегда undefined (та же ловушка RSC-границы, что и с
   * Decimal-полями, см. заметку к задаче 24). */
  analytics: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="site-theme relative flex min-h-full flex-1 flex-col">
      <CartProvider>
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <Header navBrands={navBrands} />
          <main className="flex-1">{children}</main>
          <Footer navBrands={navBrands} />
          <CartDrawer />
          <CookieBanner />
          {analytics}
        </div>
      </CartProvider>
    </div>
  );
}
