import "server-only";
import { cache } from "react";
import { flagshipCampaigns } from "@/constants/content/flagships";
import { prisma } from "@/lib/prisma";

/**
 * Явный манифест медиа главной. Эти файлы поставляются вместе с приложением,
 * поэтому их не нужно открывать и декодировать через Sharp на каждый запрос.
 * Неизвестная новая категория получит штатный пустой asset-slot, а не 404.
 */
const CATEGORY_IMAGES: Readonly<Record<string, string>> = {
  airpods: "/media/storefront/categories/airpods.webp",
  cables: "/media/storefront/categories/cables.webp",
  cases: "/media/storefront/categories/cases.webp",
  chargers: "/media/storefront/categories/chargers.webp",
  ipad: "/media/storefront/categories/ipad.webp",
  iphone: "/media/storefront/categories/iphone.webp",
  laptops: "/media/storefront/categories/laptops.webp",
  macbook: "/media/storefront/categories/macbook.webp",
  "samsung-audio": "/media/storefront/categories/samsung-audio.webp",
  "samsung-smartphones": "/media/galaxy-s26-ultra/photos/hero-photo.webp",
  "samsung-tablets": "/media/storefront/categories/samsung-tablets.webp",
  stylus: "/media/storefront/categories/stylus.webp",
  watch: "/media/storefront/categories/watch.webp",
  "xiaomi-smartphones": "/media/storefront/categories/xiaomi-smartphones.webp",
};

const FLAGSHIP_SLUGS = flagshipCampaigns.map((campaign) => campaign.slug);

export const getStorefront = cache(async () => {
  const categories = await prisma.category.findMany({
    where: { isActive: true, brand: { isActive: true } },
    orderBy: [{ brand: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    select: {
      slug: true,
      name: true,
      products: {
        where: { isActive: true, slug: { in: FLAGSHIP_SLUGS } },
        orderBy: [{ isFlagship: "desc" }, { sortOrder: "asc" }],
        select: {
          id: true,
          slug: true,
          name: true,
          shortDescription: true,
          isFlagship: true,
          canonicalPath: true,
        },
      },
    },
  });
  return categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    image: CATEGORY_IMAGES[category.slug] ?? null,
    products: category.products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      subtitle: product.shortDescription,
      isFlagship: product.isFlagship,
      href: product.canonicalPath || `/product/${product.slug}`,
      image: null,
    })),
  }));
});

export function getHeroMedia() {
  return {
    video: "/media/storefront/hero.mp4",
    poster: "/media/storefront/poster.webp",
  };
}
