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
  "iphone-17-pro": "iphone-17-pro.png",
  "iphone-17-pro-max": "iphone-17-pro-max.png",
  "iphone-18-pro": "iphone-18-pro.png",
  "iphone-air": "iphone-air.png",

  "ipad-11": "ipad-11.png",
  "ipad-air-11": "ipad-air-11.png",
  "ipad-air-13": "ipad-air-13.png",
  "ipad-pro-11": "ipad-pro-11.png",
  "ipad-pro-13": "ipad-pro-13.png",

  "macbook-air-13-m4": "macbook-air-15-m4.png",
  "macbook-air-15-m4": "macbook-air-15-m4.png",
  "macbook-pro-14-m5": "macbook-pro-14-m5.png",
  "macbook-pro-14-m5-pro": "macbook-pro-14-m5-pro.png",
  "macbook-pro-16-m5": "macbook-pro-14-m5-pro.png",

  "watch-se-3": "watch-se-3.png",
  "watch-series-11": "watch-series-11.png",
  "watch-series-11-cellular": "watch-series-11-cellular.png",
  "watch-ultra-3": "watch-ultra-3-v2.png",
  "watch-hermes-series-11": "watch-hermes-series-11.png",

  "airpods-4": "airpods-4.png",
  "airpods-4-anc": "airpods-4.png",
  "airpods-pro-3": "airpods-pro-3.png",
  "airpods-max": "airpods-max.png",
  "earpods-usb-c": "earpods-usb-c.png",

  "galaxy-s25": "galaxy-s25.png",
  "galaxy-s25-plus": "galaxy-s25-plus.png",
  "galaxy-s25-ultra": "galaxy-s25-ultra.png",
  "galaxy-z-flip7": "galaxy-z-flip7.png",
  "galaxy-z-fold7": "galaxy-z-fold7.png",
  "galaxy-a56": "galaxy-a56.png",

  "galaxy-tab-a10": "galaxy-tab-a10.png",
  "galaxy-tab-a10-plus": "galaxy-tab-a10-plus.png",
  "galaxy-tab-s11": "galaxy-tab-s11.png",
  "galaxy-tab-s11-plus": "galaxy-tab-s11.png",
  "galaxy-tab-s11-ultra": "galaxy-tab-s11-ultra.png",

  "galaxy-buds-live": "galaxy-buds-fe.png",
  "galaxy-buds-fe": "galaxy-buds-fe.png",
  "galaxy-buds2-pro": "galaxy-buds3-pro.png",
  "galaxy-buds3": "galaxy-buds3.png",
  "galaxy-buds3-pro": "galaxy-buds3-pro.png",

  "apple-20w-adapter": "apple-35w-dual-adapter.png",
  "apple-35w-dual-adapter": "apple-35w-dual-adapter.png",
  "apple-magsafe-charger": "apple-magsafe-charger.png",
  "samsung-25w-charger": "samsung-25w-charger.png",
  "samsung-45w-charger": "samsung-45w-charger.png",

  "cable-usbc-usbc": "cable-usbc-usbc.png",
  "samsung-cable-usbc-usbc": "cable-usbc-usbc.png",
  "cable-braided-usbc": "cable-usbc-usbc.png",
  "cable-usbc-jack": "cable-usbc-usbc.png",
  "cable-usbc-lightning": "cable-usbc-lightning.png",

  "iphone-silicone-case": "iphone-silicone-case.png",
  "iphone-clear-case": "iphone-clear-case.png",
  "galaxy-s25-case": "galaxy-s25-case.png",
  "ipad-folio-case": "iphone-clear-case.png",
  "macbook-sleeve": "macbook-sleeve.png",

  "apple-pencil-2": "apple-pencil-2.png",
  "apple-pencil-pro": "apple-pencil-pro.png",
  "apple-pencil-usb-c": "apple-pencil-usb-c.png",
  "s-pen-pro": "s-pen-pro.png",
};

export const CATEGORY_ICON_BY_SLUG: Record<string, string> = {
  iphone: "/media/storefront/categories/masters/iphone.webp",
  ipad: "/media/storefront/categories/masters/ipad.webp",
  macbook: "/media/storefront/categories/masters/macbook.webp",
  watch: "/media/storefront/categories/masters/watch.webp",
  airpods: "/media/storefront/categories/masters/airpods.webp",
  "samsung-smartphones": "/media/storefront/categories/masters/samsung-smartphones.webp",
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
  const optimizedFilename = filename.replace(/\.png$/i, ".webp");
  return optimizedFilename.startsWith("/") ? optimizedFilename : `${PRODUCT_MEDIA_ROOT}/${optimizedFilename}`;
}

const EXPLICIT_IMAGE_OVERRIDES = new Set([
  "airpods-pro-3",
  "iphone-18-pro",
  "watch-ultra-3",
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

export function isCatalogStudioImage(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith(`${PRODUCT_MEDIA_ROOT}/`));
}

/** Широкий кадр iPhone заполняет квадрат карточки за счёт бокового фона;
 * сам смартфон при центральном кадрировании остаётся виден целиком. */
export function shouldCoverCatalogCardImage(url: string | null | undefined): boolean {
  return Boolean(url && /\/iphone-18-pro\.(?:png|webp)$/.test(url));
}

export function getCatalogStudioAspect(
  url: string | null | undefined
): "square" | "landscape-4-3" | "landscape-3-2" | "landscape-16-9" {
  if (!url) return "square";
  if (/\/iphone-18-pro\.(?:png|webp)$/.test(url)) return "landscape-16-9";
  if (/\/airpods-max\.(?:png|webp)$/.test(url)) return "landscape-3-2";
  if (/\/earpods-usb-c\.(?:png|webp)$/.test(url)) return "landscape-4-3";
  if (/\/macbook-sleeve\.(?:png|webp)$/.test(url)) {
    return "landscape-16-9";
  }
  return "square";
}
