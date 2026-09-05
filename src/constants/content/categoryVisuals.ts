import type { CategorySlug } from "@/types/product";

/** Фоновые фото карточек категорий — предметная съёмка на белом фоне,
 * временно взята с iphoriya.ru (референс пользователя) как демо-заглушка,
 * реальные фото категорий подключаются в задаче уровня 4. */
export const CATEGORY_IMAGES: Record<CategorySlug, string> = {
  smartphones: "https://iphoriya.ru/wp-content/uploads/iphone-category-250x250.jpg",
  laptops: "https://iphoriya.ru/wp-content/uploads/mac-category-250x250.jpg",
  tablets: "https://iphoriya.ru/wp-content/uploads/ipad-category-250x250.jpg",
  accessories: "https://iphoriya.ru/wp-content/uploads/watch-category-250x250.jpg",
  dyson: "https://iphoriya.ru/wp-content/uploads/dyson-airwrap-hs08-vinca-blue-topaz-orange.webp",
};
