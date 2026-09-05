import type { Product } from "@/types/product";

export const LAPTOPS: Product[] = [
  {
    id: "lp-macbook-air-13-256",
    slug: "macbook-air-13-m4-8-256",
    category: "laptops",
    brand: "Apple",
    name: "MacBook Air 13\" M4 8/256 ГБ",
    price: 68990,
    icon: "laptop",
    inStock: true,
    memoryGb: 256,
    shortDescription: "Лёгкий и быстрый ноутбук на чипе M4",
    description:
      "MacBook Air 13\" на чипе Apple M4 — тонкий, лёгкий и почти бесшумный ноутбук для учёбы, работы и творческих задач.",
    specs: [
      { label: "Экран", value: "13.6\" Liquid Retina" },
      { label: "Чип", value: "Apple M4" },
      { label: "Память", value: "8 ГБ / 256 ГБ SSD" },
      { label: "Автономность", value: "до 18 часов" },
    ],
  },
  {
    id: "lp-macbook-air-13-512",
    slug: "macbook-air-13-m4-16-512",
    category: "laptops",
    brand: "Apple",
    name: "MacBook Air 13\" M4 16/512 ГБ",
    price: 80990,
    icon: "laptop",
    badge: "Хит продаж",
    inStock: true,
    memoryGb: 512,
    shortDescription: "Больше памяти и оперативки для многозадачности",
    description:
      "Версия MacBook Air 13\" с увеличенной оперативной памятью и SSD — с запасом на годы вперёд.",
    specs: [
      { label: "Экран", value: "13.6\" Liquid Retina" },
      { label: "Чип", value: "Apple M4" },
      { label: "Память", value: "16 ГБ / 512 ГБ SSD" },
      { label: "Автономность", value: "до 18 часов" },
    ],
  },
  {
    id: "lp-macbook-air-15",
    slug: "macbook-air-15-m4",
    category: "laptops",
    brand: "Apple",
    name: "MacBook Air 15\" M4 16/512 ГБ",
    price: 101990,
    icon: "laptop",
    inStock: true,
    memoryGb: 512,
    shortDescription: "Большой экран для работы и мультимедиа",
    description:
      "MacBook Air 15\" даёт больше пространства на экране, оставаясь таким же тонким и лёгким, как 13-дюймовая модель.",
    specs: [
      { label: "Экран", value: "15.3\" Liquid Retina" },
      { label: "Чип", value: "Apple M4" },
      { label: "Память", value: "16 ГБ / 512 ГБ SSD" },
      { label: "Автономность", value: "до 18 часов" },
    ],
  },
  {
    id: "lp-macbook-pro-14",
    slug: "macbook-pro-14-m4",
    category: "laptops",
    brand: "Apple",
    name: "MacBook Pro 14\" M4 Pro 24/512 ГБ",
    price: 165990,
    icon: "laptop",
    badge: "Новинка",
    inStock: true,
    memoryGb: 512,
    // оценочно, рыночный ориентир 2026
    shortDescription: "Профессиональная производительность для монтажа и разработки",
    description:
      "MacBook Pro 14\" на чипе M4 Pro — для видеомонтажа, 3D-рендера и тяжёлой разработки. Дисплей Liquid Retina XDR с поддержкой HDR.",
    specs: [
      { label: "Экран", value: "14.2\" Liquid Retina XDR" },
      { label: "Чип", value: "Apple M4 Pro" },
      { label: "Память", value: "24 ГБ / 512 ГБ SSD" },
      { label: "Порты", value: "3× Thunderbolt 5, HDMI, SD" },
    ],
  },
];
