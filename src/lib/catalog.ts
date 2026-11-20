import { prioritizeCatalogCampaigns } from "./catalog-order";
import { CATALOG_GROUPS, ACCESSORY_CATEGORIES } from "@/constants/content/catalog-groups";
import { isStorefrontVariantAllowed } from "./storefront-variants";
import { databaseProvider } from "./database-provider";
import { productPath } from "@/lib/product-route";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentRate, resolveBynPrice } from "@/lib/pricing";
import {
  getCatalogProductImage,
  getCatalogCardImage,
  getPreferredCatalogProductImage,
} from "@/constants/content/catalog-media";
import type { Availability, PriceKind, Prisma } from "@/generated/prisma/client";

export type { Availability };

const CATALOG_CACHE_OPTIONS = {
  revalidate: 300,
  tags: ["storefront-catalog"],
};

export interface NavCategory {
  slug: string;
  name: string;
  href?: string;
}

export interface NavBrand {
  href?: string;
  slug: string;
  name: string;
  categories: NavCategory[];
}

/** Дерево бренд→категории для шапки/футера — заменяет захардкоженный
 * `CATEGORIES` (задача 27): новый бренд/категория появляется в навигации
 * без единой правки кода, сразу после создания в БД. */
const getNavBrandsCached = unstable_cache(async (): Promise<NavBrand[]> => {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { slug: true, name: true },
      },
      products: {
        where: { isActive: true, category: { isActive: true } },
        distinct: ["categoryId"],
        select: { category: { select: { slug: true, name: true } } },
      },
    },
  });
  const available = new Set(brands.flatMap(brand => [...brand.categories, ...brand.products.map(product => product.category)].map(category => category.slug)));
  return CATALOG_GROUPS.map(group => ({ ...group, categories: group.categories.filter(category => available.has(category.slug)) }));
}, ["catalog-navigation-v3"], CATALOG_CACHE_OPTIONS);

export async function getNavBrands(): Promise<NavBrand[]> {
  return getNavBrandsCached();
}

export interface CategorySummary {
  slug: string;
  name: string;
  description: string | null;
  seoTitle: string | null;
  h1: string | null;
  brandSlug: string | null;
  brandName: string | null;
}

const getAllCategoriesCached = unstable_cache(async (): Promise<CategorySummary[]> => {
  const categories = await prisma.category.findMany({
    where: { isActive: true, brand: { isActive: true } },
    orderBy: [{ brand: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      brand: { select: { slug: true, name: true } },
      products: {
        where: { isActive: true, brand: { isActive: true } },
        select: { brand: { select: { slug: true, name: true } } },
      },
    },
  });
  return categories.map((c) => {
    const productBrands = new Map(
      c.products.map((product) => [product.brand.slug, product.brand.name])
    );
    const singleBrand = productBrands.size === 1
      ? Array.from(productBrands, ([slug, name]) => ({ slug, name }))[0]
      : null;

    return {
      slug: c.slug,
      name: c.name,
      description: c.seoDescription,
      seoTitle: c.seoTitle,
      h1: c.h1,
      brandSlug: singleBrand?.slug ?? null,
      brandName: singleBrand?.name ?? null,
    };
  });
}, ["catalog-categories-v2"], CATALOG_CACHE_OPTIONS);

export async function getAllCategories(): Promise<CategorySummary[]> {
  return getAllCategoriesCached();
}

const getCategoryBySlugCached = unstable_cache(async (slug: string): Promise<CategorySummary | null> => {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      isActive: true,
      seoDescription: true,
      seoTitle: true,
      h1: true,
      brand: { select: { slug: true, name: true, isActive: true } },
      products: {
        where: { isActive: true, brand: { isActive: true } },
        select: { brand: { select: { slug: true, name: true } } },
      },
    },
  });
  if (!category || !category.isActive || !category.brand.isActive) return null;
  const categoryBrands = new Map(
    category.products.map((product) => [product.brand.slug, product.brand.name])
  );
  const singleBrand = categoryBrands.size === 1
    ? Array.from(categoryBrands, ([slug, name]) => ({ slug, name }))[0]
    : null;
  return {
    slug: category.slug,
    name: category.name,
    description: category.seoDescription,
    seoTitle: category.seoTitle,
    h1: category.h1,
    brandSlug: singleBrand?.slug ?? null,
    brandName: singleBrand?.name ?? null,
  };
}, ["catalog-category-v2"], CATALOG_CACHE_OPTIONS);

export const getCategoryBySlug = cache(getCategoryBySlugCached);

export interface CatalogCardData {
  canonicalPath?: string | null;
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  brandName: string;
  priceByn: number;
  priceIsFrom: boolean;
  priceKind: PriceKind;
  isFlagship: boolean;
  availability: Availability;
  mainImageUrl: string | null;
  defaultVariantId: string | null;
}

type ProductWithPricing = Prisma.ProductGetPayload<{
  include: {
    category: true;
    brand: true;
    variants: { where: { isDefault: true }; include: { colorOffers: true } };
    colorValues: { include: { offers: true } };
    images: { where: { isMain: true }; take: 1 };
  };
}>;

function displayCardOffer(
  product: Pick<ProductWithPricing, "variants" | "colorValues" | "basePriceByn" | "basePriceUsd" | "availability">,
  rate: number
) {
  const defaultVariant = product.variants[0];
  const basePrice = defaultVariant
    ? resolveBynPrice(defaultVariant.priceByn, defaultVariant.priceUsd.toNumber(), rate)
    : resolveBynPrice(product.basePriceByn, product.basePriceUsd.toNumber(), rate);
  const baseAvailability = defaultVariant ? defaultVariant.availability : product.availability;
  if (product.colorValues.length === 0) {
    return { priceByn: basePrice, priceIsFrom: false, availability: baseAvailability,
      priceVerified: Boolean(defaultVariant ? defaultVariant.priceByn : product.basePriceByn) };
  }
  const offers = product.colorValues.map((color) => {
    const override = color.offers.find((offer) => offer.variantId === (defaultVariant?.id ?? null));
    return {
      priceByn: override?.priceByn?.toNumber() ?? basePrice,
      availability: override?.availability ?? baseAvailability,
      priceVerified: Boolean(override?.priceByn ?? (defaultVariant ? defaultVariant.priceByn : product.basePriceByn)),
    };
  });
  const available = offers.filter((offer) => offer.availability === "IN_STOCK");
  const shown = available.length ? available : offers;
  const minPrice = Math.min(...shown.map((offer) => offer.priceByn));
  return {
    priceByn: minPrice,
    priceIsFrom: new Set(shown.map((offer) => offer.priceByn)).size > 1,
    availability: available.length ? "IN_STOCK" as Availability : "OUT_OF_STOCK" as Availability,
    priceVerified: shown.find((offer) => offer.priceByn === minPrice)?.priceVerified ?? false,
  };
}

function toCard(product: ProductWithPricing, rate: number): CatalogCardData {
  const offer = displayCardOffer(product, rate);
  return {
    canonicalPath: productPath(product.slug, product.canonicalPath),
    id: product.id,
    slug: product.slug,
    name: product.name,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    brandName: product.brand.name,
    priceByn: offer.priceByn,
    priceIsFrom: offer.priceIsFrom,
    priceKind: offer.priceVerified ? "VERIFIED_SHOP" : product.priceKind,
    isFlagship: product.isFlagship,
    availability: offer.availability,
    mainImageUrl: getCatalogCardImage(product.slug, product.images[0]?.url),
    defaultVariantId: product.variants[0]?.id ?? null,
  };
}

export type CatalogSort = "default" | "price_asc" | "price_desc" | "new";

export interface CatalogQuery {
  categorySlug?: string;
  accessoryOnly?: boolean;
  brandSlugs?: string[];
  excludeProductSlugs?: string[];
  maxPriceByn?: number;
  query?: string;
  sort?: CatalogSort;
  page?: number;
}

export interface CatalogResult {
  items: CatalogCardData[];
  page: number;
  totalPages: number;
  total: number;
  priceBoundsByn: { min: number; max: number };
  availableBrands: { slug: string; name: string }[];
}

const PAGE_SIZE = 9;
/* Каталог сейчас — десятки товаров, не тысячи: сортировку/фильтр по цене
 * (которая считается из варианта, а не хранится плоской колонкой) дешевле
 * и проще сделать в памяти после одного запроса, чем городить SQL с
 * коррелированным подзапросом MIN(variant.price). Если каталог вырастет на
 * порядки — стоит завести денормализованное `Product.minPriceUsd`,
 * пересчитываемое при сохранении товара/варианта в админке (уровень 7),
 * и вернуть фильтр/сортировку по цене в `where`/`orderBy` Prisma. */
async function queryCatalogProducts(params: CatalogQuery): Promise<CatalogResult> {
  const categoryFilter: Prisma.CategoryWhereInput = {};
  if (params.accessoryOnly) categoryFilter.slug = { in: ACCESSORY_CATEGORIES };
  else if (!params.categorySlug && params.brandSlugs?.length) categoryFilter.slug = { notIn: ACCESSORY_CATEGORIES };
  if (params.categorySlug) categoryFilter.slug = params.categorySlug;
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    category: { isActive: true },
    brand: { isActive: true },
  };
  if (params.excludeProductSlugs && params.excludeProductSlugs.length > 0) {
    where.slug = { notIn: params.excludeProductSlugs };
  }
  if (Object.keys(categoryFilter).length > 0) where.category = { ...categoryFilter, isActive: true };
  if (params.brandSlugs && params.brandSlugs.length > 0) {
    where.brand = { slug: { in: params.brandSlugs }, isActive: true };
  }
  if (params.query && params.query.trim()) {
    const query = params.query.trim().replace(/^iphone\s+17\s+air$/i, "iPhone Air");
    where.name = { contains: query };
    // MySQL uses the utf8mb4_unicode_ci collation; it has no Prisma mode option.
    if (databaseProvider() === "postgresql") Object.assign(where.name, { mode: "insensitive" });
  }

  const [rate, products] = await Promise.all([
    getCurrentRate(),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        variants: { where: { isDefault: true }, include: { colorOffers: true } },
        colorValues: { include: { offers: true } },
        images: { where: { isMain: true }, take: 1 },
      },
      orderBy:
        params.sort === "new"
          ? { createdAt: "desc" }
          : [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  // Реальные товары остаются в каталоге и без снимка: ProductCard покажет
  // тематическую заглушку, пока администратор не добавит фото.
  let cards = products.map((p) => toCard(p, rate));

  const priceBoundsByn = cards.reduce(
    (bounds, c) => ({
      min: Math.min(bounds.min, c.priceByn),
      max: Math.max(bounds.max, c.priceByn),
    }),
    { min: Infinity, max: 0 }
  );
  if (!Number.isFinite(priceBoundsByn.min)) priceBoundsByn.min = 0;

  const availableBrandsMap = new Map<string, string>();
  for (const p of products) availableBrandsMap.set(p.brand.slug, p.brand.name);
  const availableBrands = Array.from(availableBrandsMap, ([slug, name]) => ({ slug, name }));

  if (params.maxPriceByn !== undefined) {
    cards = cards.filter((c) => c.priceByn <= params.maxPriceByn!);
  }

  if (params.sort === "price_asc") cards = [...cards].sort((a, b) => a.priceByn - b.priceByn);
  if (params.sort === "price_desc") cards = [...cards].sort((a, b) => b.priceByn - a.priceByn);

  if (!params.sort || params.sort === "default") cards = prioritizeCatalogCampaigns(cards);

  const total = cards.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, params.page ?? 1), totalPages);
  const items = cards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return { items, page, totalPages, total, priceBoundsByn, availableBrands };
}

const getCatalogProductsCached = unstable_cache(
  queryCatalogProducts,
  ["catalog-products-v7"],
  CATALOG_CACHE_OPTIONS
);

export async function getCatalogProducts(params: CatalogQuery): Promise<CatalogResult> {
  return getCatalogProductsCached(params);
}

/** Товар для отдельной витрины категории. Предпочитаем редакционный slug,
 * а если такой модели ещё нет в продаже — берём отмеченный флагманом или
 * первую модель по порядку каталога. */
async function queryCategoryFeaturedProduct(
  categorySlug: string,
  preferredSlug?: string
): Promise<CatalogCardData | null> {
  const include = {
    category: true,
    brand: true,
    variants: { where: { isDefault: true }, include: { colorOffers: true } },
    colorValues: { include: { offers: true } },
    images: { where: { isMain: true }, take: 1 },
  } satisfies Prisma.ProductInclude;

  const [rate, preferred] = await Promise.all([
    getCurrentRate(),
    preferredSlug
      ? prisma.product.findFirst({
          where: { isActive: true, slug: preferredSlug, category: { slug: categorySlug, isActive: true }, brand: { isActive: true } },
          include,
        })
      : Promise.resolve(null),
  ]);

  if (preferred) return toCard(preferred as ProductWithPricing, rate);

  const fallback = await prisma.product.findFirst({
    where: { isActive: true, category: { slug: categorySlug, isActive: true }, brand: { isActive: true } },
    orderBy: [{ isFlagship: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    include,
  });

  return fallback ? toCard(fallback as ProductWithPricing, rate) : null;
}

const getCategoryFeaturedProductCached = unstable_cache(
  queryCategoryFeaturedProduct,
  ["catalog-featured-product-v5"],
  CATALOG_CACHE_OPTIONS
);

export async function getCategoryFeaturedProduct(
  categorySlug: string,
  preferredSlug?: string
): Promise<CatalogCardData | null> {
  return getCategoryFeaturedProductCached(categorySlug, preferredSlug);
}

export interface ProductDetailAttributeValue {
  id: string;
  value: string;
}

export interface ProductDetailAttribute {
  id: string;
  name: string;
  slug: string;
  values: ProductDetailAttributeValue[];
}

export interface ProductDetailVariant {
  id: string;
  priceByn: number;
  priceVerified: boolean;
  availability: Availability;
  isDefault: boolean;
  optionValueIds: string[];
}

export interface ProductDetailColor {
  id: string;
  name: string;
  hex: string | null;
  imageUrl: string | null;
}

export interface ProductDetailColorOffer {
  colorValueId: string;
  variantId: string | null;
  priceByn: number | null;
  availability: Availability | null;
}

export interface ProductDetailImage {
  url: string;
  alt: string | null;
  colorValueId: string | null;
}

export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  categorySlug: string;
  categoryName: string;
  brandSlug: string;
  brandName: string;
  isFlagship: boolean;
  basePriceByn: number;
  priceKind: PriceKind;
  availability: Availability;
  specs: { name: string; value: string }[];
  images: ProductDetailImage[];
  mainImageUrl: string | null;
  colors: ProductDetailColor[];
  colorOffers: ProductDetailColorOffer[];
  attributes: ProductDetailAttribute[];
  variants: ProductDetailVariant[];
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalPath: string | null;
}

const getProductDetailBySlugCached = unstable_cache(async (slug: string): Promise<ProductDetail | null> => {
  const [rate, product] = await Promise.all([
    getCurrentRate(),
    prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        specs: { orderBy: { sortOrder: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        colorValues: { include: { attributeValue: true, offers: true } },
        variants: {
          orderBy: { sortOrder: "asc" },
          include: { options: { include: { attributeValue: { include: { attribute: true } } } } },
        },
      },
    }),
  ]);
  if (!product || !product.isActive || !product.category.isActive || !product.brand.isActive) return null;

  product.variants = product.variants.filter(variant => isStorefrontVariantAllowed(product.slug, variant.options));
  const attributesById = new Map<string, ProductDetailAttribute>();
  for (const variant of product.variants) {
    for (const option of variant.options) {
      const attr = option.attributeValue.attribute;
      if (!attributesById.has(attr.id)) {
        attributesById.set(attr.id, { id: attr.id, name: attr.name, slug: attr.slug, values: [] });
      }
      const entry = attributesById.get(attr.id)!;
      if (!entry.values.some((v) => v.id === option.attributeValue.id)) {
        entry.values.push({ id: option.attributeValue.id, value: option.attributeValue.value });
      }
    }
  }
  const attributes = Array.from(attributesById.values());
  const preferredValueOrder = ["128 ГБ", "256 ГБ", "512 ГБ", "1 ТБ", "2 ТБ", "16 ГБ / 512 ГБ", "16 ГБ / 1 ТБ", "24 ГБ / 1 ТБ", "eSIM", "SIM + eSIM"];
  for (const attr of attributes) {
    attr.values.sort((a, b) => {
      const aIndex = preferredValueOrder.indexOf(a.value);
      const bIndex = preferredValueOrder.indexOf(b.value);
      if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
      return a.value.localeCompare(b.value, "ru");
    });
  }

  const variants: ProductDetailVariant[] = product.variants.map((v) => ({
    id: v.id,
    priceByn: resolveBynPrice(v.priceByn, v.priceUsd.toNumber(), rate),
    priceVerified: v.priceByn != null,
    availability: v.availability,
    isDefault: v.isDefault,
    optionValueIds: v.options.map((o) => o.attributeValueId),
  }));

  const images: ProductDetailImage[] = product.images.map((img) => ({
    // This legacy URL contained an AV3 camera crop, not the complete Pro Max.
    url: img.url === "/media/catalog/apple-official-2026/iphone-18-pro-max-black.webp"
      ? "/media/catalog/apple-official-2026/iphone-18-pro-max-black-full-v2.webp"
      : img.url,
    alt: img.alt,
    colorValueId: img.colorValueId,
  }));
  const hasColorPhotoSet = new Set(images.map((img) => img.colorValueId).filter(Boolean)).size > 1;
  const mainImage = product.images.find((i) => i.isMain) ?? product.images[0];
  const fallbackImageUrl = getCatalogProductImage(product.slug);
  const preferredMainImageUrl = getPreferredCatalogProductImage(product.slug, mainImage?.url);

  const colorValues = product.slug.startsWith("watch-")
    ? [...product.colorValues].sort((a, b) => a.attributeValue.sortOrder - b.attributeValue.sortOrder)
    : product.colorValues;
  const colors: ProductDetailColor[] = colorValues.map((cv) => ({
    id: cv.id,
    name: cv.attributeValue.value,
    hex: cv.attributeValue.value === "Серебристый" ? "#d9dde2" : cv.attributeValue.colorHex,
    imageUrl: (hasColorPhotoSet ? images.find((i) => i.colorValueId === cv.id)?.url : null)
      ?? getPreferredCatalogProductImage(product.slug, mainImage?.url)
      ?? fallbackImageUrl,
  }));
  const colorOffers: ProductDetailColorOffer[] = product.colorValues.flatMap((cv) =>
    cv.offers.map((offer) => ({
      colorValueId: cv.id,
      variantId: offer.variantId,
      priceByn: offer.priceByn?.toNumber() ?? null,
      availability: offer.availability,
    }))
  );

  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  const basePriceByn = defaultVariant
    ? defaultVariant.priceByn
    : resolveBynPrice(product.basePriceByn, product.basePriceUsd.toNumber(), rate);
  const availability = defaultVariant ? defaultVariant.availability : product.availability;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    brandSlug: product.brand.slug,
    brandName: product.brand.name,
    isFlagship: product.isFlagship,
    basePriceByn,
    priceKind: product.priceKind,
    availability,
    specs: product.specs.map((s) => ({ name: s.name, value: s.value })),
    images,
    mainImageUrl: preferredMainImageUrl ?? fallbackImageUrl,
    colors,
    colorOffers,
    attributes,
    variants,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    canonicalPath: productPath(product.slug, product.canonicalPath),
  };
}, ["catalog-product-detail-v7"], CATALOG_CACHE_OPTIONS);

export const getProductDetailBySlug = cache(getProductDetailBySlugCached);

export interface CrossSellGroup {
  title: string;
  kind: "accessories" | "devices";
  note?: string;
  products: CatalogCardData[];
}

const getCrossSellCardsCached = unstable_cache(async (slugs: string[]) => {
  const [rate, products] = await Promise.all([
    getCurrentRate(),
    prisma.product.findMany({
      where: { isActive: true, slug: { in: slugs }, category: { isActive: true }, brand: { isActive: true } },
      include: {
        category: true,
        brand: true,
        variants: { where: { isDefault: true }, include: { colorOffers: true } },
        colorValues: { include: { offers: true } },
        images: { where: { isMain: true }, take: 1 },
      },
    }),
  ]);
  return products
    .map((product) => toCard(product, rate))
    .filter((product) => product.mainImageUrl && product.availability === "IN_STOCK");
}, ["catalog-cross-sell-v3"], CATALOG_CACHE_OPTIONS);

export async function getCrossSellProducts(product: Pick<ProductDetail, "slug" | "categorySlug" | "brandSlug">): Promise<CrossSellGroup[]> {
  const isPhone = ["iphone", "samsung-smartphones", "xiaomi-smartphones"].includes(product.categorySlug);
  const isTablet = ["ipad", "samsung-tablets", "xiaomi-tablets"].includes(product.categorySlug);
  const isLaptop = ["macbook", "laptops", "samsung-laptops"].includes(product.categorySlug);
  const isAudio = ["airpods", "samsung-audio", "xiaomi-audio"].includes(product.categorySlug);
  const isWatch = product.categorySlug === "watch";
  let deviceSlugs: string[] = [];
  let accessorySlugs: string[] = [];

  if (product.brandSlug === "apple") {
    deviceSlugs = isPhone
      ? ["apple-20w-adapter", "ipad-air-11", "watch-series-12"]
      : isTablet || isLaptop
        ? ["iphone-18-pro", isTablet ? "apple-20w-adapter" : "ipad-air-11", "watch-series-12"]
        : ["iphone-18-pro", "ipad-air-11", "apple-20w-adapter"];
    accessorySlugs = isPhone
      ? ["apple-20w-adapter", "airpods-pro-3", "apple-magsafe-charger", "apple-35w-dual-adapter"]
      : isTablet
        ? [product.slug.startsWith("ipad-pro") || product.slug.startsWith("ipad-air") ? "apple-pencil-pro" : "apple-pencil-usb-c", "airpods-pro-3", "apple-35w-dual-adapter"]
        : isLaptop
          ? product.slug === "macbook-neo"
            ? ["apple-35w-dual-adapter", "airpods-pro-3", "macbook-sleeve"]
            : ["airpods-pro-3", "macbook-sleeve", "cable-usbc-usbc"]
          : isAudio || isWatch
            ? ["apple-35w-dual-adapter", "cable-usbc-usbc"]
            : ["airpods-pro-3", "apple-35w-dual-adapter"];
  } else if (product.brandSlug === "samsung") {
    deviceSlugs = isPhone
      ? ["galaxy-tab-s11-ultra", "samsung-45w-charger", "galaxy-s26-ultra"]
      : isTablet
        ? ["galaxy-s26-ultra", "samsung-45w-charger", "galaxy-tab-s11-ultra"]
        : ["galaxy-s26-ultra", "galaxy-tab-s11-ultra", "samsung-45w-charger"];
    accessorySlugs = isAudio
      ? ["samsung-25w-charger", "samsung-cable-usbc-usbc"]
      : isLaptop
        ? ["galaxy-buds4-pro", "samsung-cable-usbc-usbc"]
        : ["galaxy-buds4-pro", "samsung-45w-charger", "samsung-25w-charger"];
  } else if (product.brandSlug === "xiaomi") {
    deviceSlugs = isPhone
      ? ["xiaomi-pad-8-pro", "xiaomi-book-pro-14", "xiaomi-17-ultra"]
      : isTablet
        ? ["xiaomi-17-ultra", "xiaomi-book-pro-14", "xiaomi-pad-8-pro"]
        : ["xiaomi-17-ultra", "xiaomi-pad-8-pro", "xiaomi-book-pro-14"];
    accessorySlugs = isAudio
      ? ["cable-usbc-usbc", "samsung-25w-charger"]
      : ["redmi-buds-8-pro", "cable-usbc-usbc", "redmi-buds-8"];
  }

  const slugs = [...new Set([...deviceSlugs, ...accessorySlugs])].filter((slug) => slug !== product.slug);
  if (slugs.length === 0) return [];
  const cards = new Map((await getCrossSellCardsCached(slugs)).map((card) => [card.slug, card]));
  const devices = deviceSlugs.flatMap((slug) => cards.get(slug) ?? []).slice(0, 2);
  const accessories = accessorySlugs.flatMap((slug) => cards.get(slug) ?? []).filter(card => !devices.some(device => device.id === card.id)).slice(0, 2);
  const selected = new Set([...devices, ...accessories].map((card) => card.id));
  const products = [...new Map([...devices, ...accessories].map(card => [card.id, card])).values()];
  for (const slug of slugs) {
    const card = cards.get(slug);
    if (products.length >= 4) break;
    if (card && !selected.has(card.id)) {
      products.push(card);
      selected.add(card.id);
    }
  }
  return products.length ? [{ title: "С этим покупают", kind: "devices", products }] : [];
}

async function queryFlagshipProducts(limit = 2): Promise<CatalogCardData[]> {
  const [rate, products] = await Promise.all([
    getCurrentRate(),
    prisma.product.findMany({
      where: { isActive: true, isFlagship: true, category: { isActive: true }, brand: { isActive: true } },
      orderBy: { sortOrder: "asc" },
      take: limit,
      include: {
        category: true,
        brand: true,
        variants: { where: { isDefault: true }, include: { colorOffers: true } },
        colorValues: { include: { offers: true } },
        images: { where: { isMain: true }, take: 1 },
      },
    }),
  ]);
  return products.map((p) => toCard(p, rate));
}

const getFlagshipProductsCached = unstable_cache(
  queryFlagshipProducts,
  ["catalog-flagship-products-v5"],
  CATALOG_CACHE_OPTIONS
);

export async function getFlagshipProducts(limit = 2): Promise<CatalogCardData[]> {
  return getFlagshipProductsCached(limit);
}

export interface FlagshipShowcaseProduct {
  id: string;
  slug: string;
  name: string;
  priceByn: number;
  priceIsFrom: boolean;
  priceKind: PriceKind;
  availability: Availability;
  images: { url: string; alt: string | null }[];
}

/** Для immersive-подачи флагманов на главной (FlagshipShowcase) — в отличие
 * от getFlagshipProducts(), отдаёт ВСЕ фото товара (не только главное),
 * упорядоченные как в админке. Без этого 3-картиночный сторителлинг
 * невозможен. */
async function queryFlagshipShowcaseProducts(limit = 2): Promise<FlagshipShowcaseProduct[]> {
  const [rate, products] = await Promise.all([
    getCurrentRate(),
    prisma.product.findMany({
      where: { isActive: true, isFlagship: true, category: { isActive: true }, brand: { isActive: true } },
      orderBy: { sortOrder: "asc" },
      take: limit,
      include: {
        variants: { where: { isDefault: true }, include: { colorOffers: true } },
        colorValues: { include: { offers: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
  ]);
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    ...displayCardOffer(p, rate),
    priceKind: p.priceKind,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
  }));
}

const getFlagshipShowcaseProductsCached = unstable_cache(
  queryFlagshipShowcaseProducts,
  ["catalog-flagship-showcase-v2"],
  CATALOG_CACHE_OPTIONS
);

export async function getFlagshipShowcaseProducts(limit = 2): Promise<FlagshipShowcaseProduct[]> {
  return getFlagshipShowcaseProductsCached(limit);
}

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

const SORT_VALUES: CatalogSort[] = ["default", "price_asc", "price_desc", "new"];

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Общий парсер `searchParams` для `/catalog` и `/catalog/[category]` —
 * держит формат query-параметров в одном месте. */
export function parseCatalogSearchParams(
  sp: CatalogSearchParams,
  categorySlug?: string
): CatalogQuery {
  const brandParam = firstValue(sp.brand);
  const maxPriceParam = firstValue(sp.maxPrice);
  const sortParam = firstValue(sp.sort);
  const pageParam = firstValue(sp.page);

  return {
    categorySlug,
    accessoryOnly: firstValue(sp.group) === "accessories",
    brandSlugs: brandParam ? brandParam.split(",").filter(Boolean) : undefined,
    maxPriceByn: maxPriceParam ? Number(maxPriceParam) || undefined : undefined,
    query: firstValue(sp.q),
    sort: SORT_VALUES.includes(sortParam as CatalogSort) ? (sortParam as CatalogSort) : "default",
    page: pageParam ? Number(pageParam) || 1 : 1,
  };
}
