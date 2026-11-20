const PRODUCT_MEDIA_ROOT = "/media/catalog/products";

/**
 * Студийные изображения каталога. Ключи совпадают со slug товара, поэтому
 * кадр остаётся доступен даже до загрузки фотографии через админку.
 * Для конфигураций одной линейки без отдельного исходника используется
 * ближайший кадр той же модели/семейства.
 */
const CATALOG_IMAGE_BY_PRODUCT: Record<string, string> = {
  "iphone-14": "iphone-14.png",
  "iphone-15": "iphone-15.png",
  "iphone-16": "iphone-16.png",
  "iphone-16e": "iphone-16e.png",
  "iphone-17": "iphone-17.png",
  "iphone-17e": "iphone-17e.webp",
  "iphone-17-pro": "iphone-17-pro.png",
  "iphone-17-pro-max": "iphone-17-pro-max.png",
  "iphone-18-pro": "/media/catalog/apple-official-2026/iphone-18-pro-burgundy.webp",
  "iphone-18-pro-max": "/media/catalog/apple-official-2026/iphone-18-pro-max-burgundy.webp",
  "iphone-air": "iphone-air.png",
  "iphone-duo": "iphone-duo.webp",

  "ipad-11": "ipad-11.png",
  "ipad-air-11": "ipad-air-11.png",
  "ipad-air-13": "ipad-air-13.png",
  "ipad-pro-11": "ipad-pro-11.png",
  "ipad-pro-13": "ipad-pro-13.webp",
  "ipad-mini": "ipad-mini.webp",

  "macbook-neo": "macbook-neo-silver-2026-v2.webp",
  "macbook-air-13-m4": "macbook-air-13-m4.webp",
  "macbook-air-13-m5": "macbook-air-13-m5.webp",
  "macbook-air-15-m4": "macbook-air-15-m4.png",
  "macbook-air-15-m5": "macbook-air-15-m5.webp",
  "macbook-pro-14-m5": "macbook-pro-14-m5.png",
  "macbook-pro-14-m5-pro": "macbook-pro-14-m5-pro.png",
  "macbook-pro-16-m5-max": "macbook-pro-16-m5-max.webp",
  "xiaomi-book-pro-14": "xiaomi-book-pro-14.webp",

  "watch-se-3": "watch-se-3.png",
  "watch-series-11": "watch-series-11.png",
  "watch-series-11-cellular": "watch-series-11-cellular.png",
  "watch-ultra-3": "watch-ultra-3-v2.png",
  "watch-hermes-series-11": "watch-hermes-series-11.png",
  "watch-series-12": "watch-series-12.webp",
  "watch-series-12-cellular": "watch-series-12-cellular.webp",
  "watch-hermes-series-12": "watch-hermes-series-12.webp",
  "apple-watch-ultra-4": "apple-watch-ultra-4.png",

  "airpods-5": "airpods-5.webp",
  "airpods-5-wireless": "airpods-5-wireless.webp",
  "airpods-4": "airpods-4.webp",
  "airpods-4-anc": "airpods-4.webp",
  "airpods-pro-2": "airpods-pro-2.webp",
  "airpods-pro-3": "airpods-pro-3.webp",
  "airpods-max": "airpods-max.png",
  "airpods-max-2": "airpods-max-2.webp",
  "earpods-usb-c": "earpods-usb-c.png",
  "apple-vision-pro-m5": "apple-vision-pro-m5.webp",
  "homepod-2": "homepod-2.webp",
  "apple-tv-4k-3-wifi-64": "apple-tv-4k-3-wifi-64.webp",
  "apple-tv-4k-3-ethernet-128": "apple-tv-4k-3-ethernet-128.webp",

  "galaxy-s25": "galaxy-s25.png",
  "galaxy-s25-plus": "galaxy-s25-plus.png",
  "galaxy-s25-ultra": "galaxy-s25-ultra.png",
  "galaxy-s26": "galaxy-s26.webp",
  "galaxy-s26-plus": "galaxy-s26-plus.webp",
  "galaxy-s26-fe": "galaxy-s26-fe.webp",
  "galaxy-z-flip7": "galaxy-z-flip7.png",
  "galaxy-z-flip8": "galaxy-z-flip8.webp",
  "galaxy-z-fold7": "galaxy-z-fold7.png",
  "galaxy-z-fold8": "galaxy-z-fold8.webp",
  "galaxy-a26-5g": "galaxy-a26-5g.webp",
  "galaxy-a56": "galaxy-a56.png",

  "galaxy-tab-a10": "galaxy-tab-a10.png",
  "galaxy-tab-a10-plus": "galaxy-tab-a10-plus.png",
  "galaxy-tab-a11-plus": "galaxy-tab-a11-plus.webp",
  "galaxy-tab-a11": "galaxy-tab-a11.webp",
  "galaxy-tab-s10-fe": "galaxy-tab-s10-fe.webp",
  "galaxy-tab-s10-fe-plus": "galaxy-tab-s10-fe-plus.webp",
  "galaxy-tab-s11": "galaxy-tab-s11.png",
  "galaxy-tab-s11-plus": "galaxy-tab-s11.png",
  "galaxy-tab-s11-ultra": "galaxy-tab-s11-ultra.png",

  "galaxy-buds-live": "galaxy-buds-fe.png",
  "galaxy-buds-fe": "galaxy-buds-fe.png",
  "galaxy-buds2-pro": "galaxy-buds3-pro.png",
  "galaxy-buds3": "galaxy-buds3.png",
  "galaxy-buds3-fe": "galaxy-buds3-fe.webp",
  "galaxy-buds3-pro": "galaxy-buds3-pro.png",
  "galaxy-buds4": "galaxy-buds4.webp",
  "galaxy-buds4-pro": "galaxy-buds4-pro.webp",

  "galaxy-book6": "galaxy-book6.webp",
  "galaxy-book6-pro": "galaxy-book6-pro.webp",
  "galaxy-book6-ultra": "galaxy-book6-ultra.webp",

  "xiaomi-17": "xiaomi-17.webp",
  "xiaomi-17-ultra": "xiaomi-17-ultra.webp",
  "xiaomi-17t": "xiaomi-17t.webp",
  "xiaomi-17t-pro": "xiaomi-17t-pro.webp",
  "redmi-note-15-5g": "redmi-note-15-5g.webp",
  "redmi-note-15-pro-5g": "redmi-note-15-pro-5g.webp",
  "redmi-note-15-pro-plus-5g": "redmi-note-15-pro-plus-5g.webp",

  "redmi-book-14-2026": "redmi-book-14-2026.webp",
  "redmi-book-16-2026": "redmi-book-16-2026.webp",
  "redmi-book-pro-14-2026": "redmi-book-pro-14-2026.webp",
  "redmi-book-pro-16-2026": "redmi-book-pro-16-2026.webp",

  "xiaomi-pad-8-pro": "xiaomi-pad-8-pro.webp",
  "xiaomi-pad-8": "xiaomi-pad-8.webp",
  "xiaomi-pad-mini": "xiaomi-pad-mini.webp",
  "redmi-pad-2-pro": "redmi-pad-2-pro.webp",

  "redmi-buds-8-lite": "redmi-buds-8-lite.webp",
  "redmi-buds-8": "redmi-buds-8.webp",
  "redmi-buds-8-pro": "redmi-buds-8-pro.webp",

  "apple-20w-adapter": "apple-20w-adapter-2026.png",
  "apple-35w-dual-adapter": "apple-35w-dual-adapter.webp",
  "apple-magsafe-charger": "apple-magsafe-charger.webp",
  "samsung-25w-charger": "samsung-25w-charger.webp",
  "samsung-45w-charger": "samsung-45w-charger.webp",

  "cable-usbc-usbc": "cable-usbc-usbc.webp",
  "cable-usbc-lightning": "cable-usbc-lightning.png",
  "cable-braided-usbc": "cable-braided-usbc.webp",
  "cable-usbc-jack": "cable-usbc-jack.webp",
  "samsung-cable-usbc-usbc": "samsung-cable-usbc-usbc.webp",

  "iphone-silicone-case": "iphone-silicone-case.png",
  "iphone-clear-case": "iphone-clear-case.png",
  "galaxy-s25-case": "galaxy-s25-case.png",
  "macbook-sleeve": "macbook-sleeve.png",
  "ipad-folio-case": "ipad-folio-case.webp",

  "apple-pencil-2": "apple-pencil-2.png",
  "apple-pencil-pro": "apple-pencil-pro.png",
  "apple-pencil-usb-c": "apple-pencil-usb-c.png",
  "s-pen-pro": "s-pen-pro.png",
};

export const CATEGORY_ICON_BY_SLUG: Record<string, string> = {
  "apple-devices": "/media/storefront/categories/apple-devices.webp",
  iphone: "/media/storefront/categories/masters/iphone.webp",
  ipad: "/media/storefront/categories/masters/ipad.webp",
  macbook: "/media/storefront/categories/masters/macbook.webp",
  watch: "/media/storefront/categories/masters/watch.webp",
  airpods: "/media/storefront/categories/masters/airpods.webp",
  "samsung-smartphones": "/media/storefront/categories/samsung-family-2026.webp",
  "samsung-tablets": "/media/storefront/categories/masters/samsung-tablets.webp",
  "samsung-audio": "/media/storefront/categories/masters/samsung-audio.webp",
  "xiaomi-smartphones": "/media/storefront/categories/xiaomi-smartphones.webp",
  laptops: "/media/storefront/categories/masters/macbook.webp",
  chargers: "/media/storefront/categories/masters/chargers.webp",
  cables: "/media/storefront/categories/masters/cables.webp",
  cases: "/media/storefront/categories/masters/cases.webp",
  stylus: "/media/storefront/categories/masters/stylus.webp",
};

export function getCatalogProductImage(slug: string): string | null {
  const filename = CATALOG_IMAGE_BY_PRODUCT[slug];
  if (!filename) return null;
  // Оригинал адаптера передан продавцом в PNG; сохраняем его без перекодирования.
  const suppliedOriginal = slug === "apple-20w-adapter";
  const optimizedFilename = suppliedOriginal ? filename : filename.replace(/\.png$/i, ".webp");
  return optimizedFilename.startsWith("/") ? optimizedFilename : `${PRODUCT_MEDIA_ROOT}/${optimizedFilename}`;
}

const EXPLICIT_IMAGE_OVERRIDES = new Set([
  "airpods-pro-3",
  "iphone-18-pro",
  "iphone-18-pro-max",
  "macbook-pro-16-m5-max",
  "macbook-neo",
  "apple-20w-adapter",
  "watch-ultra-3",
  "xiaomi-17-ultra",
  "xiaomi-book-pro-14",
]);

export function hasExplicitCatalogImageOverride(slug: string): boolean {
  return EXPLICIT_IMAGE_OVERRIDES.has(slug);
}

/** Новые изображения, явно переданные для конкретных моделей, заменяют
 * прежние сидированные кадры. Для остальных товаров фото из админки по-
 * прежнему имеет приоритет над встроенным каталоговым изображением. */
export function getPreferredCatalogProductImage(
  slug: string,
  storedImageUrl: string | null | undefined
): string | null {
  const catalogImage = getCatalogProductImage(slug);
  const optimizedStoredImage = storedImageUrl?.startsWith(`${PRODUCT_MEDIA_ROOT}/`)
    ? storedImageUrl.replace(/\.png$/i, ".webp")
    : storedImageUrl;
  if (hasExplicitCatalogImageOverride(slug)) return catalogImage ?? optimizedStoredImage ?? null;
  return optimizedStoredImage ?? catalogImage;
}

/** A selected colour must win over the default catalog composition in a cart. */
export function getCartProductImage(
  slug: string,
  colorImageUrl: string | null | undefined,
  mainImageUrl: string | null | undefined
): string | null {
  return colorImageUrl ?? getPreferredCatalogProductImage(slug, mainImageUrl);
}

/** Square studio compositions apply to listing cards only. */
const CARD_STUDIO_IMAGES: Record<string, string> = {
  "iphone-18-pro": `${PRODUCT_MEDIA_ROOT}/iphone-18-pro-card-studio-2026-v2.webp`,
  "iphone-18-pro-max": `${PRODUCT_MEDIA_ROOT}/iphone-18-pro-max-card-studio-2026-v2.webp`,
  "galaxy-s26-ultra": `${PRODUCT_MEDIA_ROOT}/galaxy-s26-ultra-card-studio-2026-v2.webp`,
};

export function getCatalogCardImage(
  slug: string,
  storedImageUrl: string | null | undefined
): string | null {
  return CARD_STUDIO_IMAGES[slug] ?? getPreferredCatalogProductImage(slug, storedImageUrl);
}

export function isCatalogStudioImage(url: string | null | undefined): boolean {
  return Boolean(
    url?.startsWith(`${PRODUCT_MEDIA_ROOT}/`) ||
    url?.startsWith("/media/catalog/samsung-watch-studio/") ||
    url?.startsWith("/media/catalog/apple-watch-silicone-2026/") ||
    url?.startsWith("/media/catalog/apple-official-2026/") ||
    url?.startsWith("/media/flagship-colors/")
  );
}

export function getCatalogStudioAspect(
  url: string | null | undefined
): "square" | "landscape-4-3" | "landscape-3-2" | "landscape-16-9" {
  if (!url) return "square";
  if (url.startsWith("/media/flagship-colors/")) return "landscape-3-2";
  if (/\/iphone-18-pro\.(?:png|webp)$/.test(url)) return "landscape-16-9";
  if (/\/airpods-max\.(?:png|webp)$/.test(url)) return "landscape-3-2";
  if (/\/earpods-usb-c\.(?:png|webp)$/.test(url)) return "landscape-4-3";
  if (/\/macbook-sleeve\.(?:png|webp)$/.test(url)) {
    return "landscape-16-9";
  }
  return "square";
}
