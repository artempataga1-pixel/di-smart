import type { CategoryContent } from "@/types/content";

export const CATEGORIES: CategoryContent[] = [
  {
    slug: "smartphones",
    title: "Смартфоны",
    singular: "смартфон",
    description: "iPhone и Samsung Galaxy — от бюджетных моделей до флагманов",
    icon: "smartphone",
  },
  {
    slug: "laptops",
    title: "Ноутбуки",
    singular: "ноутбук",
    description: "MacBook Air и Pro для работы, учёбы и творческих задач",
    icon: "laptop",
  },
  {
    slug: "tablets",
    title: "Планшеты",
    singular: "планшет",
    description: "iPad и Galaxy Tab для работы и развлечений",
    icon: "tablet",
  },
  {
    slug: "accessories",
    title: "Аксессуары",
    singular: "аксессуар",
    description: "Часы, наушники и аксессуары для ваших устройств",
    icon: "headphones",
  },
  {
    slug: "dyson",
    title: "Dyson",
    singular: "товар Dyson",
    description: "Фены, стайлеры и пылесосы Dyson — оригинал, с гарантией",
    icon: "hairdryer",
  },
];

export function getCategoryBySlug(slug: string): CategoryContent | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
