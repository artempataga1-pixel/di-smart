import type { CategorySlug } from "@/types/product";
import type { MagnetSquare } from "@/components/home/CategoryCard";

/** Фоновые фото карточек категорий — предметная съёмка на белом фоне,
 * временно взята с iphoriya.ru (референс пользователя) как демо-заглушка,
 * позже заменится на свои сгенерированные фото. */
export const CATEGORY_IMAGES: Record<CategorySlug, string> = {
  smartphones: "https://iphoriya.ru/wp-content/uploads/iphone-category-250x250.jpg",
  laptops: "https://iphoriya.ru/wp-content/uploads/mac-category-250x250.jpg",
  tablets: "https://iphoriya.ru/wp-content/uploads/ipad-category-250x250.jpg",
  accessories: "https://iphoriya.ru/wp-content/uploads/watch-category-250x250.jpg",
  dyson: "https://iphoriya.ru/wp-content/uploads/dyson-airwrap-hs08-vinca-blue-topaz-orange.webp",
};

/** Позиции магнитных квадратиков на карточке — подобраны так, чтобы не перекрывать
 * инфо-плашку (низ-лево) и плюс-кнопку (верх-право). */
export const CATEGORY_SQUARES: Record<CategorySlug, MagnetSquare[]> = {
  smartphones: [
    { x: 6, y: 20, size: 14 },
    { x: 11, y: 32, size: 9 },
    { x: 4, y: 44, size: 6 },
    { x: 82, y: 68, size: 13 },
    { x: 87, y: 80, size: 8 },
    { x: 79, y: 58, size: 6 },
  ],
  laptops: [
    { x: 80, y: 22, size: 14 },
    { x: 86, y: 34, size: 9 },
    { x: 76, y: 42, size: 6 },
    { x: 83, y: 54, size: 5 },
    { x: 89, y: 62, size: 8 },
  ],
  tablets: [
    { x: 5, y: 26, size: 14 },
    { x: 11, y: 38, size: 9 },
    { x: 3, y: 46, size: 6 },
    { x: 79, y: 76, size: 13 },
    { x: 85, y: 86, size: 8 },
  ],
  accessories: [
    { x: 81, y: 24, size: 13 },
    { x: 87, y: 36, size: 9 },
    { x: 77, y: 42, size: 6 },
    { x: 83, y: 52, size: 5 },
    { x: 89, y: 60, size: 8 },
  ],
  dyson: [
    { x: 6, y: 30, size: 15 },
    { x: 11, y: 42, size: 9 },
    { x: 4, y: 52, size: 6 },
    { x: 80, y: 68, size: 13 },
    { x: 85, y: 80, size: 8 },
    { x: 78, y: 58, size: 6 },
  ],
};
