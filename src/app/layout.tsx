import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ShopChrome } from "@/components/layout/ShopChrome";
import { SITE } from "@/constants/content/site";
import { getNavBrands } from "@/lib/catalog";
import "./globals.css";

/* Шапка/футер теперь читают бренды и категории из БД (задача 27 — без
 * хардкода категорий), а не только через fetch() — Next.js не отслеживает
 * прямые вызовы Prisma как «динамические» автоматически, поэтому без явного
 * force-dynamic в layout сборка (`next build` в CI, без поднятой БД)
 * попыталась бы статически отрендерить и упала бы. force-dynamic в layout
 * каскадно распространяется на все дочерние страницы (подтверждено по
 * исходникам Next.js через Context7) — ни один Prisma-запрос не выполняется
 * во время сборки, только при реальном запросе. */
export const dynamic = "force-dynamic";

const obrazec = localFont({
  src: "./fonts/Obrazec 2.0.otf",
  variable: "--font-obrazec-var",
  display: "swap",
});

const comfortaa = localFont({
  src: [
    { path: "./fonts/Comfortaa-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Comfortaa-Regular.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-comfortaa-var",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e8935c",
};

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navBrands = await getNavBrands();

  return (
    <html lang="ru" className={`${obrazec.variable} ${comfortaa.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[var(--color-bg)] text-[var(--color-text)]">
        <ShopChrome navBrands={navBrands}>{children}</ShopChrome>
      </body>
    </html>
  );
}
