import type { Metadata, Viewport } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import { ShopChrome } from "@/components/layout/ShopChrome";
import { YandexMetrika } from "@/components/analytics/YandexMetrika";
import { SITE } from "@/constants/content/site";
import { getNavBrands } from "@/lib/catalog";
import "./globals.css";

/* Навигационные данные уже кешируются в `getNavBrands`. Не делаем весь сайт
 * force-dynamic: иначе даже полностью готовые промостраницы требуют серверный
 * round-trip при каждом переходе. Обновление каталога остаётся свежим за счёт
 * тега инвалидации и фоновой ревалидации раз в пять минут. */
export const revalidate = 300;

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  weight: "700",
  variable: "--font-nunito-var",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin", "cyrillic"],
  weight: "300",
  variable: "--font-nunito-sans-var",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteHostname = new URL(siteUrl).hostname;
const indexingEnabled =
  process.env.SEO_INDEXING_ENABLED === "true" &&
  !["localhost", "127.0.0.1", "::1"].includes(siteHostname);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  /* Индексацию можно включить только явно и с настоящим доменом.
   * До запуска сохраняем прежнее решение закрыть сайт от поиска. */
  robots: { index: indexingEnabled, follow: indexingEnabled },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE.fullName,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: "/",
    /* Временный логотип-бейдж (см. заметку к задаче 12) — заменить на
     * выделенную OG-картинку 1200×630, когда появится чистый лого/фото. */
    images: ["/images/logo-badge-temp.png"],
  },
  /* Технически готово, реальные ID заказчик подставит в .env сам —
   * задача 62. Пустая строка в env превращается в undefined, чтобы не
   * рендерить пустые meta-теги верификации. */
  verification: {
    google: process.env.GSC_VERIFICATION || undefined,
    yandex: process.env.YANDEX_VERIFICATION || undefined,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Промостраницы остаются доступными во время локальной работы с медиа,
  // даже если каталоговая БД временно не запущена.
  const navBrands = await getNavBrands().catch((error: unknown) => {
    console.error("Navigation catalog is unavailable", error);
    return [];
  });

  return (
    <html lang="ru" className={`${nunito.variable} ${nunitoSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[var(--color-bg)] text-[var(--color-text)]">
        <ShopChrome navBrands={navBrands} analytics={<YandexMetrika id={process.env.YANDEX_METRIKA_ID} />}>
          {children}
        </ShopChrome>
      </body>
    </html>
  );
}
