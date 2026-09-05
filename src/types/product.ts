export type CategorySlug =
  | "smartphones"
  | "laptops"
  | "tablets"
  | "accessories"
  | "dyson";

export type Brand = "Apple" | "Samsung" | "Dyson";

export type ProductBadge = "Новинка" | "Хит продаж" | "Под заказ" | "Скидка";

/** Нет реальных фото от заказчика — вместо непроверенных внешних ссылок
 * товар рисуется графически: иконка устройства на градиентной плашке. */
export type ProductIconKey =
  | "smartphone"
  | "laptop"
  | "tablet"
  | "watch"
  | "headphones"
  | "vacuum"
  | "hairdryer"
  | "case"
  | "charger";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  category: CategorySlug;
  brand: Brand;
  name: string;
  price: number;
  oldPrice?: number;
  icon: ProductIconKey;
  badge?: ProductBadge;
  inStock: boolean;
  memoryGb?: number;
  shortDescription: string;
  description: string;
  specs: ProductSpec[];
}
