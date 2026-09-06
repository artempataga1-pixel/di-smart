import { prisma } from "@/lib/prisma";
import { getCurrentRate, usdToByn } from "@/lib/pricing";
import type { Availability, Prisma } from "@/generated/prisma/client";

export type { Availability };

export interface NavCategory {
  slug: string;
  name: string;
}

export interface NavBrand {
  slug: string;
  name: string;
  categories: NavCategory[];
}

/** Дерево бренд→категории для шапки/футера — заменяет захардкоженный
 * `CATEGORIES` (задача 27): новый бренд/категория появляется в навигации
 * без единой правки кода, сразу после создания в БД. */
export async function getNavBrands(): Promise<NavBrand[]> {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { slug: true, name: true },
      },
    },
  });
  return brands
    .map((b) => ({ slug: b.slug, name: b.name, categories: b.categories }))
    .filter((b) => b.categories.length > 0);
}

export interface CategorySummary {
  slug: string;
  name: string;
  description: string | null;
  brandSlug: string;
  brandName: string;
}

export async function getAllCategories(): Promise<CategorySummary[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true, brand: { isActive: true } },
    orderBy: [{ brand: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: { brand: { select: { slug: true, name: true } } },
  });
  return categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.seoDescription,
    brandSlug: c.brand.slug,
    brandName: c.brand.name,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<CategorySummary | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { brand: { select: { slug: true, name: true } } },
  });
  if (!category || !category.isActive) return null;
  return {
    slug: category.slug,
    name: category.name,
    description: category.seoDescription,
    brandSlug: category.brand.slug,
    brandName: category.brand.name,
  };
}

export interface CatalogCardData {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  brandName: string;
  priceByn: number;
  isFlagship: boolean;
  availability: Availability;
  mainImageUrl: string | null;
  defaultVariantId: string | null;
}

type ProductWithPricing = Prisma.ProductGetPayload<{
  include: {
    category: { include: { brand: true } };
    variants: { where: { isDefault: true } };
    images: { where: { isMain: true }; take: 1 };
  };
}>;

function displayPriceUsd(product: ProductWithPricing): number {
  const defaultVariant = product.variants[0];
  return (defaultVariant ? defaultVariant.priceUsd : product.basePriceUsd).toNumber();
}

function displayAvailability(product: ProductWithPricing): Availability {
  const defaultVariant = product.variants[0];
  return defaultVariant ? defaultVariant.availability : product.availability;
}

function toCard(product: ProductWithPricing, rate: number): CatalogCardData {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    brandName: product.category.brand.name,
    priceByn: usdToByn(displayPriceUsd(product), rate),
    isFlagship: product.isFlagship,
    availability: displayAvailability(product),
    mainImageUrl: product.images[0]?.url ?? null,
    defaultVariantId: product.variants[0]?.id ?? null,
  };
}

export type CatalogSort = "default" | "price_asc" | "price_desc" | "new";

export interface CatalogQuery {
  categorySlug?: string;
  brandSlugs?: string[];
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
export async function getCatalogProducts(params: CatalogQuery): Promise<CatalogResult> {
  const rate = await getCurrentRate();

  const categoryFilter: Prisma.CategoryWhereInput = {};
  if (params.categorySlug) categoryFilter.slug = params.categorySlug;
  if (params.brandSlugs && params.brandSlugs.length > 0) {
    categoryFilter.brand = { slug: { in: params.brandSlugs } };
  }

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (Object.keys(categoryFilter).length > 0) where.category = categoryFilter;
  if (params.query && params.query.trim()) {
    where.name = { contains: params.query.trim(), mode: "insensitive" };
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: { include: { brand: true } },
      variants: { where: { isDefault: true } },
      images: { where: { isMain: true }, take: 1 },
    },
    orderBy:
      params.sort === "new"
        ? { createdAt: "desc" }
        : [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

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
  for (const p of products) availableBrandsMap.set(p.category.brand.slug, p.category.brand.name);
  const availableBrands = Array.from(availableBrandsMap, ([slug, name]) => ({ slug, name }));

  if (params.maxPriceByn !== undefined) {
    cards = cards.filter((c) => c.priceByn <= params.maxPriceByn!);
  }

  if (params.sort === "price_asc") cards = [...cards].sort((a, b) => a.priceByn - b.priceByn);
  if (params.sort === "price_desc") cards = [...cards].sort((a, b) => b.priceByn - a.priceByn);

  const total = cards.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, params.page ?? 1), totalPages);
  const items = cards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return { items, page, totalPages, total, priceBoundsByn, availableBrands };
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
  availability: Availability;
  specs: { name: string; value: string }[];
  images: ProductDetailImage[];
  mainImageUrl: string | null;
  colors: ProductDetailColor[];
  attributes: ProductDetailAttribute[];
  variants: ProductDetailVariant[];
}

export async function getProductDetailBySlug(slug: string): Promise<ProductDetail | null> {
  const rate = await getCurrentRate();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { include: { brand: true } },
      specs: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      colorValues: { include: { attributeValue: true } },
      variants: {
        orderBy: { sortOrder: "asc" },
        include: { options: { include: { attributeValue: { include: { attribute: true } } } } },
      },
    },
  });
  if (!product || !product.isActive) return null;

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
  for (const attr of attributes) {
    attr.values.sort((a, b) => a.value.localeCompare(b.value, "ru"));
  }

  const variants: ProductDetailVariant[] = product.variants.map((v) => ({
    id: v.id,
    priceByn: usdToByn(v.priceUsd.toNumber(), rate),
    availability: v.availability,
    isDefault: v.isDefault,
    optionValueIds: v.options.map((o) => o.attributeValueId),
  }));

  const images: ProductDetailImage[] = product.images.map((img) => ({
    url: img.url,
    alt: img.alt,
    colorValueId: img.colorValueId,
  }));
  const mainImage = product.images.find((i) => i.isMain) ?? product.images[0];

  const colors: ProductDetailColor[] = product.colorValues.map((cv) => ({
    id: cv.id,
    name: cv.attributeValue.value,
    hex: cv.attributeValue.colorHex,
    imageUrl: images.find((i) => i.colorValueId === cv.id)?.url ?? mainImage?.url ?? null,
  }));

  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  const basePriceByn = defaultVariant
    ? defaultVariant.priceByn
    : usdToByn(product.basePriceUsd.toNumber(), rate);
  const availability = defaultVariant ? defaultVariant.availability : product.availability;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    brandSlug: product.category.brand.slug,
    brandName: product.category.brand.name,
    isFlagship: product.isFlagship,
    basePriceByn,
    availability,
    specs: product.specs.map((s) => ({ name: s.name, value: s.value })),
    images,
    mainImageUrl: mainImage?.url ?? null,
    colors,
    attributes,
    variants,
  };
}

export async function getRelatedProducts(
  categorySlug: string,
  excludeProductId: string,
  limit = 4
): Promise<CatalogCardData[]> {
  const rate = await getCurrentRate();
  const products = await prisma.product.findMany({
    where: { isActive: true, category: { slug: categorySlug }, id: { not: excludeProductId } },
    orderBy: { sortOrder: "asc" },
    take: limit,
    include: {
      category: { include: { brand: true } },
      variants: { where: { isDefault: true } },
      images: { where: { isMain: true }, take: 1 },
    },
  });
  return products.map((p) => toCard(p, rate));
}

export async function getFlagshipProducts(limit = 2): Promise<CatalogCardData[]> {
  const rate = await getCurrentRate();
  const products = await prisma.product.findMany({
    where: { isActive: true, isFlagship: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
    include: {
      category: { include: { brand: true } },
      variants: { where: { isDefault: true } },
      images: { where: { isMain: true }, take: 1 },
    },
  });
  return products.map((p) => toCard(p, rate));
}

export async function getPopularProducts(limit = 6): Promise<CatalogCardData[]> {
  const rate = await getCurrentRate();
  const products = await prisma.product.findMany({
    where: { isActive: true, isFlagship: false },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      category: { include: { brand: true } },
      variants: { where: { isDefault: true } },
      images: { where: { isMain: true }, take: 1 },
    },
  });
  return products.map((p) => toCard(p, rate));
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
    brandSlugs: brandParam ? brandParam.split(",").filter(Boolean) : undefined,
    maxPriceByn: maxPriceParam ? Number(maxPriceParam) || undefined : undefined,
    query: firstValue(sp.q),
    sort: SORT_VALUES.includes(sortParam as CatalogSort) ? (sortParam as CatalogSort) : "default",
    page: pageParam ? Number(pageParam) || 1 : 1,
  };
}
