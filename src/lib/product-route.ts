/** Один источник маршрутов для товаров с отдельной редакционной страницей.
 * В каталоге, корзине, SEO и прямом /product/:slug — тот же адрес. */
export const DEDICATED_PRODUCT_PATHS: Readonly<Record<string, string>> = {
  "iphone-18-pro": "/iphone-18-pro",
  "iphone-18-pro-max": "/iphone-18-pro?model=pro-max",
  "galaxy-s25-ultra": "/galaxy-s25-ultra",
  "galaxy-s26-ultra": "/galaxy-s26-ultra",
  "ipad-pro-13": "/ipad-pro-m5",
  "macbook-pro-16-m5-max": "/macbook-pro-16-m5-max",
  "apple-watch-ultra-4": "/apple-watch-ultra-4",
  "airpods-pro-3": "/airpods-pro-3",
  "xiaomi-17-ultra": "/xiaomi-17-ultra",
  "xiaomi-book-pro-14": "/xiaomi-book-pro-14",
  "galaxy-tab-s11-ultra": "/galaxy-tab-s11-ultra",
};

export function productPath(slug: string, canonicalPath?: string | null): string {
  return DEDICATED_PRODUCT_PATHS[slug] ?? canonicalPath ?? `/product/${slug}`;
}
