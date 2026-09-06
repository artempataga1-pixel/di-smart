import type { CategorySlug, Product } from "@/types/legacy-product";
import { SMARTPHONES } from "./smartphones";
import { LAPTOPS } from "./laptops";
import { TABLETS } from "./tablets";
import { ACCESSORIES } from "./accessories";
import { DYSON } from "./dyson";

export const ALL_PRODUCTS: Product[] = [
  ...SMARTPHONES,
  ...LAPTOPS,
  ...TABLETS,
  ...ACCESSORIES,
  ...DYSON,
];

export function getProductById(id: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return ALL_PRODUCTS.filter((p) => p.category === category);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return ALL_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, limit);
}

export function getPopularProducts(limit = 9): Product[] {
  const popular = ALL_PRODUCTS.filter((p) => p.badge === "Хит продаж");
  if (popular.length >= limit) return popular.slice(0, limit);
  const rest = ALL_PRODUCTS.filter((p) => p.badge !== "Хит продаж").slice(
    0,
    limit - popular.length
  );
  return [...popular, ...rest];
}
