import type { Product } from "@/types/legacy-product";

export const TABLETS: Product[] = [
  {
    id: "tb-ipad-11-128",
    slug: "ipad-11-128gb",
    category: "tablets",
    brand: "Apple",
    name: "iPad 11\" 128 ГБ",
    price: 45990,
    icon: "tablet",
    badge: "Хит продаж",
    inStock: true,
    memoryGb: 128,
    shortDescription: "Универсальный планшет для учёбы и развлечений",
    description:
      "iPad — лёгкий и производительный планшет для повседневных задач: от заметок и учёбы до просмотра фильмов.",
    specs: [
      { label: "Экран", value: "10.9\" Liquid Retina" },
      { label: "Память", value: "128 ГБ" },
      { label: "Чип", value: "Apple A16" },
      { label: "Совместимость", value: "Apple Pencil (USB-C)" },
    ],
  },
  {
    id: "tb-ipad-air-m3",
    slug: "ipad-air-m3",
    category: "tablets",
    brand: "Apple",
    name: "iPad Air 11\" M3 128 ГБ",
    price: 65990,
    icon: "tablet",
    inStock: true,
    memoryGb: 128,
    shortDescription: "iPad Air на чипе M3 для более требовательных задач",
    description:
      "iPad Air с чипом M3 сочетает лёгкий корпус и производительность, достаточную для монтажа и работы с графикой.",
    specs: [
      { label: "Экран", value: "11\" Liquid Retina" },
      { label: "Память", value: "128 ГБ" },
      { label: "Чип", value: "Apple M3" },
      { label: "Совместимость", value: "Apple Pencil Pro" },
    ],
  },
  {
    id: "tb-ipad-pro-11-m5",
    slug: "ipad-pro-11-m5",
    category: "tablets",
    brand: "Apple",
    name: "iPad Pro 11\" M5 256 ГБ",
    price: 110990,
    icon: "tablet",
    badge: "Новинка",
    inStock: true,
    memoryGb: 256,
    // оценочно, рыночный ориентир 2026
    shortDescription: "Топовый планшет с дисплеем Ultra Retina XDR",
    description:
      "iPad Pro на чипе M5 — максимальная производительность в планшете, дисплей Ultra Retina XDR для профессиональной работы с цветом.",
    specs: [
      { label: "Экран", value: "11\" Ultra Retina XDR" },
      { label: "Память", value: "256 ГБ" },
      { label: "Чип", value: "Apple M5" },
      { label: "Совместимость", value: "Apple Pencil Pro" },
    ],
  },
  {
    id: "tb-galaxy-tab-s11",
    slug: "samsung-galaxy-tab-s11-128gb",
    category: "tablets",
    brand: "Samsung",
    name: "Samsung Galaxy Tab S11 128 ГБ",
    price: 74990,
    icon: "tablet",
    inStock: true,
    memoryGb: 128,
    // оценочно, рыночный ориентир 2026
    shortDescription: "Планшет с AMOLED-экраном и S Pen в комплекте",
    description:
      "Galaxy Tab S11 — производительный Android-планшет с ярким AMOLED-дисплеем и стилусом S Pen в комплекте.",
    specs: [
      { label: "Экран", value: "11\" Dynamic AMOLED 2X" },
      { label: "Память", value: "128 ГБ" },
      { label: "Стилус", value: "S Pen в комплекте" },
      { label: "ОС", value: "Android, One UI" },
    ],
  },
  {
    id: "tb-galaxy-tab-s11-ultra",
    slug: "samsung-galaxy-tab-s11-ultra",
    category: "tablets",
    brand: "Samsung",
    name: "Samsung Galaxy Tab S11 Ultra 256 ГБ",
    price: 104990,
    icon: "tablet",
    badge: "Хит продаж",
    inStock: true,
    memoryGb: 256,
    // оценочно, рыночный ориентир 2026
    shortDescription: "Самый большой экран в линейке Galaxy Tab",
    description:
      "Galaxy Tab S11 Ultra — топовая версия с огромным дисплеем, для работы с несколькими приложениями одновременно.",
    specs: [
      { label: "Экран", value: "14.6\" Dynamic AMOLED 2X" },
      { label: "Память", value: "256 ГБ" },
      { label: "Стилус", value: "S Pen в комплекте" },
      { label: "ОС", value: "Android, One UI" },
    ],
  },
];
