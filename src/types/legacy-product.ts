/** Типы демо-каталога на статичных TS-данных (`src/constants/products/*.ts`).
 *
 * С задачи 27 (уровень 4 плана) публичный каталог/страница товара/главная
 * переведены на Prisma — новые страницы используют типы из `@prisma/client`
 * и view-модели в `src/lib/catalog.ts`, а не эти.
 *
 * Этот файл и статичные данные оставлены **только** ради `src/lib/cart-context.tsx`
 * и компонентов корзины (`CartItemRow` и т.д.) — их перевод на реальные товары/варианты
 * из БД это отдельная задача уровня 5 (37-39, «Корзина — вариант в составе позиции»).
 * Трогать эти типы раньше нельзя — сломает корзину до того, как она сама готова
 * резолвить товары по-новому. Не путать с новым каталогом. */
export type CategorySlug =
  | "smartphones"
  | "laptops"
  | "tablets"
  | "accessories"
  | "dyson";

export type Brand = "Apple" | "Samsung" | "Dyson";

export type ProductBadge = "Новинка" | "Хит продаж" | "Под заказ" | "Скидка";

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
