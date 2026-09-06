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
  children,
}: {
  navBrands: NavBrand[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Header navBrands={navBrands} />
      <main className="flex-1">{children}</main>
      <Footer navBrands={navBrands} />
      <CartDrawer />
      <CookieBanner />
    </CartProvider>
  );
}
