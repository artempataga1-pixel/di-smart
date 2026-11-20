import { PrismaClient } from "../src/generated/prisma/client";
import { createDatabaseAdapter } from "../src/lib/database-adapter";
import { withCatalogSpecAdditions } from "./catalog-spec-additions";
import appleColorImages from "./apple-color-images.json";
import samsungColorImages from "./samsung-color-images.json";
import { syncClientSamsung } from "./sync-client-samsung";
import { syncSamsungColorImages } from "./sync-samsung-color-images";

const adapter = createDatabaseAdapter();
const prisma = new PrismaClient({ adapter });

/* Сиды для уровня 3 плана: Apple / Samsung / Аксессуары, реалистичные
 * категории и товары с вариантами (память/SIM как ProductVariant, цвет —
 * отдельно как ProductColorValue). Идемпотентно: товары апсертятся по slug,
 * дочерние записи (варианты/цвета/фото/характеристики) на каждый запуск
 * пересоздаются с нуля — так проще гарантировать консистентность, чем
 * апсертить каждую дочернюю запись по отдельности. */

const COLORS: Record<string, string> = {
  "Чёрный": "#1c1c1e",
  "Белый": "#f5f5f0",
  "Синий": "#3f5f7f",
  "Розовый": "#f4c2c2",
  "Зелёный": "#4c6444",
  "Титан": "#8a8a86",
  "Сиреневый": "#b9a7d1",
  "Графитовый": "#4b4b4d",
  "Серебристый": "#d7d9dc",
  "Бордовый": "#6f3542",
  "Ледниковый": "#b9c8d5",
  "Полночный": "#12141c",
  "Золотой": "#cbb489",
  "Серебристая тень": "#9a9b9d",
  "Кобальтовый фиолетовый": "#4c3f68",
  "Космический чёрный": "#3b3c40",
  "Натуральный титан": "#aaa49b",
  "Чёрный титан": "#272829",
  "Серый": "#9a9a9d",
  "Дымчато-голубой": "#b9c8d5",
  "Лавандовый": "#c7b9df",
  "Кремовый": "#eee7d8",
  "Фисташковый": "#b8c7a3",
  "Фиолетовый": "#75618f",
  "Жёлтый": "#f1d36b",
  "Звёздный": "#e7ded0",
  "Шалфейный": "#a8b2a1",
  "Космический оранжевый": "#d96d3c",
  "Тёмно-синий": "#253d5c",
  "Нежно-розовый": "#f3d9dc",
  "Небесно-голубой": "#c5d5e4",
  "Облачный белый": "#f0f0ec",
  "Светло-золотой": "#ded6bd",
  "Звёздный белый": "#e6e4df",
  "Ночное небо": "#272b35",
  "Опаловый белый": "#e8e9e5",
  "Розовое золото": "#dfb6ad",
  "Розовый Blush": "#eac4ce",
  "Индиго": "#5c6d91",
  "Цитрусовый": "#e2df88",
  "Тёмная бронза": "#695649",
  "Космический серый": "#5a5b60",
  "Серый космос": "#5a5b60",
  "Чёрный космос": "#2d2d30",
  "Светло-серый": "#c9c9c5",
  "Оливковый": "#9a9d81",
  "Кораллово-красный": "#c96759",
  "Мятный": "#b9d5c2",
  "Синяя тень": "#4b6076",
  "Ультрамариновый": "#5867a6",
  "Бирюзовый": "#70aaa5",
  "Глянцевый чёрный": "#151619",
  "Голубая ягода": "#394b80",
  "Розово-золотой": "#b98b78",
  "Сияющее золото": "#c7ae83",
  "Титановый чёрный": "#292a2d",
  "Титановый серый": "#85868a",
  "Титановый серебристо-голубой": "#a5b5c5",
  "Титановый бело-серебристый": "#d9d8d4",
  "Ледяной голубой": "#b8d6e2",
  "Альпийский розовый": "#e1c9cf",
  "Ледяной синий": "#c7dceb",
  "Авантюриновый зелёный": "#57695a",
  "Туманный фиолетовый": "#b6a7c8",
  "Цвет титана": "#b5a79b",
  "Мокко": "#8b6755",
  "Полночный / Midnight Sport Band": "#12141c",
  "Звёздный / Starlight Sport Band": "#e7ded0",
  "Космический серый / Black Sport Band": "#5a5b60",
  "Глянцевый чёрный / Black Sport Band": "#151619",
  "Розово-золотой / Light Blush Sport Band": "#b98b78",
  "Серебристый / Pur Fog Sport Band": "#d7d9dc",
  "Чёрный / Black Sport Band": "#1c1c1e",
  "Тёмная бронза / Olive Sport Band": "#695649",
  "Светло-золотой / Sand Sport Band": "#ded6bd",
  "Космический серый / Blue Sport Band": "#5a5b60",
};

const MEMORY_LABELS = ["128 ГБ", "256 ГБ", "512 ГБ", "1 ТБ", "2 ТБ", "4 ТБ", "8 ТБ"];
const SIM_LABELS = ["SIM", "eSIM", "SIM + eSIM"];
const SIZE_LABELS = ["40 мм", "41 мм", "42 мм", "44 мм", "45 мм", "46 мм", "49 мм"];
const LENGTH_LABELS = ["1 м", "2 м"];

interface Tier {
  label: string;
  deltaUsd: number;
}

interface ProductDef {
  slug: string;
  name: string;
  short: string;
  desc: string;
  basePriceUsd: number;
  specs: [string, string][];
  isFlagship?: boolean;
  mainImage?: string;
  colorImages?: Record<string, string>;
  colors?: string[];
  memoryTiers?: Tier[];
  /** Единая конфигурация ОЗУ/SSD, когда одного объёма накопителя недостаточно. */
  configurationTiers?: Tier[];
  simOptions?: string[];
  sizeTiers?: Tier[];
  lengthTiers?: Tier[];
  outOfStock?: boolean;
  /** Метки тиров (память/размер/длина), которые нужно пометить нет в наличии —
   * чтобы на витрине было видно каскадный disable недоступных комбинаций. */
  oosTierLabels?: string[];
}

interface CategoryDef {
  slug: string;
  name: string;
  seoTitle: string;
  seoDescription: string;
  products: ProductDef[];
}

interface BrandDef {
  slug: string;
  name: string;
  categories: CategoryDef[];
}

function mem(labels: string[], deltas: number[]): Tier[] {
  return labels.map((label, i) => ({ label, deltaUsd: deltas[i] }));
}

/** Позиции с неподтверждённой моделью или снятые с актуальной витрины.
 * Отсутствие фотографии не служит причиной скрывать реальный товар. */
const RETIRED_PRODUCT_SLUGS = [
  // Ассортимент устройств Apple по списку клиента от 29.09.2026.
  "iphone-16", "iphone-16e", "iphone-air", "iphone-duo",
  "ipad-mini", "ipad-pro-11", "ipad-pro-13",
  "macbook-air-13-m4", "macbook-air-15-m4", "macbook-pro-14-m5", "macbook-pro-14-m5-pro", "macbook-pro-16-m5-max",
  "watch-series-11-cellular", "watch-series-12-cellular", "watch-ultra-3", "apple-watch-ultra-4", "watch-hermes-series-11", "watch-hermes-series-12",
  "earpods-usb-c", "apple-vision-pro-m5", "homepod-2", "apple-tv-4k-3-wifi-64", "apple-tv-4k-3-ethernet-128",
  "galaxy-tab-a10",
  "galaxy-tab-a10-plus",
  "galaxy-tab-s11-plus",
  "galaxy-buds-live",
  "galaxy-buds-fe",
  "galaxy-buds2-pro",
  "macbook-pro-16-m5",
];

/** Разделы с подтверждёнными производителем моделями остаются видимыми,
 * даже если фотографии и цены клиента будут добавлены позже. */
const INACTIVE_CATEGORY_SLUGS = new Set<string>(["apple-devices"]);

/** Брендовые подборки из исходного массива пишутся в общие разделы.
 * Бренд самой карточки хранится в Product.brandId. */
const appleDevicesCategory = {
  slug: "apple-devices",
  name: "Другая техника Apple",
  seoTitle: "Другая техника Apple: Vision Pro, HomePod и Apple TV — Di-SMART Electronics",
  seoDescription: "Apple Vision Pro, HomePod и Apple TV 4K в одном разделе. Характеристики и ориентировочные цены в BYN.",
};
const CATEGORY_MERGES: Readonly<Record<string, { slug: string; name: string; seoTitle?: string; seoDescription?: string }>> = {
  "samsung-laptops": { slug: "laptops", name: "Ноутбуки" },
  "xiaomi-tablets": { slug: "samsung-tablets", name: "Планшеты" },
  "xiaomi-audio": { slug: "samsung-audio", name: "Наушники" },
  "vision-pro": appleDevicesCategory,
  homepod: appleDevicesCategory,
  "apple-tv": appleDevicesCategory,
};

const BRANDS: BrandDef[] = [
  {
    slug: "apple",
    name: "Apple",
    categories: [
      {
        slug: "iphone",
        name: "iPhone",
        seoTitle: "iPhone — купить в Минске | Di-SMART Electronics",
        seoDescription: "iPhone 17, iPhone Air и другие модели Apple с гарантией. Доставка по Беларуси.",
        products: [
          {
            slug: "iphone-17",
            name: "iPhone 17",
            short: "Чип A19, яркий Super Retina XDR, улучшенная камера",
            desc: "iPhone 17 сочетает мощный чип A19, яркий дисплей Super Retina XDR и улучшенную систему камер — оптимальный выбор для повседневных задач.",
            basePriceUsd: 899,
            specs: [
              ["Экран", "6.3\" Super Retina XDR"],
              ["Чип", "Apple A19"],
              ["Камера", "48 + 48 Мп (основная и сверхширокоугольная)"],
              ["Аккумулятор", "до 30 ч воспроизведения видео"],
            ],
            colors: ["Чёрный", "Белый", "Дымчато-голубой", "Шалфейный", "Лавандовый"],
            memoryTiers: mem(["256 ГБ", "512 ГБ"], [0, 200]),
            simOptions: SIM_LABELS,
          },
          {
            slug: "iphone-17-pro",
            name: "iPhone 17 Pro",
            short: "Алюминиевый корпус, чип A19 Pro, профессиональная камера",
            desc: "iPhone 17 Pro — алюминиевый корпус, чип A19 Pro и три камеры Fusion по 48 Мп с оптическим зумом 4×.",
            basePriceUsd: 999,
            isFlagship: true,
            specs: [
              ["Экран", "6.3\" OLED Super Retina XDR, ProMotion 120 Гц, 3000 нит на солнце"],
              ["Чип", "Apple A19 Pro, вейпор-охлаждение"],
              ["Камера", "48 + 48 + 48 Мп, оптический зум 4×, зум оптического качества 8×"],
              ["Корпус", "Алюминий + Ceramic Shield 2"],
              ["Аккумулятор", "До 31 ч воспроизведения видео; быстрая зарядка с адаптером от 40 Вт"],
              ["Цвета", "Silver, Cosmic Orange, Deep Blue"],
              ["Память", "256 ГБ – 1 ТБ"],
            ],
            colors: ["Серебристый", "Космический оранжевый", "Тёмно-синий"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 100, 300]),
            simOptions: SIM_LABELS,
          },
          {
            slug: "iphone-17-pro-max",
            name: "iPhone 17 Pro Max",
            short: "Флагман года: самый большой экран и лучшая камера Apple",
            desc: "iPhone 17 Pro Max — вершина линейки: самый большой Super Retina XDR ProMotion дисплей, чип A19 Pro и профессиональная тройная камера.",
            basePriceUsd: 1199,
            specs: [
              ["Экран", "6.9\" Super Retina XDR ProMotion"],
              ["Чип", "Apple A19 Pro"],
              ["Камера", "48 + 48 + 48 Мп, оптический зум 4×, зум оптического качества 8×"],
              ["Корпус", "Алюминий, Ceramic Shield 2 спереди"],
              ["Аккумулятор", "до 37 ч воспроизведения видео"],
            ],
            colors: ["Серебристый", "Космический оранжевый", "Тёмно-синий"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 100, 300]),
            simOptions: SIM_LABELS,
          },
          {
            slug: "iphone-18-pro",
            name: "iPhone 18 Pro",
            short: "Чип A20 Pro, система камер Pro и четыре цвета корпуса",
            desc: "iPhone 18 Pro с дисплеем Super Retina XDR, чипом A20 Pro и тройной системой камер 48 Мп.",
            basePriceUsd: 1199,
            isFlagship: true,
            mainImage: "/media/flagship-colors/iphone-18-pro/burgundy.webp",
            colorImages: {
              "Бордовый": "/media/flagship-colors/iphone-18-pro/burgundy.webp",
              "Ледниковый": "/media/flagship-colors/iphone-18-pro/glacier.webp",
              "Серебристый": "/media/flagship-colors/iphone-18-pro/silver.webp",
              "Чёрный": "/media/flagship-colors/iphone-18-pro/black.webp",
            },
            specs: [
              ["Экран", "6.3\" Super Retina XDR, ProMotion 120 Гц"],
              ["Чип", "Apple A20 Pro"],
              ["Камера", "Три камеры 48 Мп, зум оптического качества до 8×"],
              ["Корпус", "Алюминиевый цельный корпус, Ceramic Shield 2 спереди"],
              ["Разъём", "USB-C"],
            ],
            colors: ["Бордовый", "Ледниковый", "Серебристый", "Чёрный"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 200, 600]),
            simOptions: SIM_LABELS,
          },
          {
            slug: "iphone-18-pro-max",
            name: "iPhone 18 Pro Max",
            short: "iPhone 18 Pro с самым большим экраном и батареей",
            desc: "iPhone 18 Pro Max — тот же чип A20 Pro и система камер Pro, но с дисплеем 6.9\" и рекордной для линейки автономностью.",
            basePriceUsd: 1299,
            isFlagship: true,
            mainImage: "/media/apple-color-variants/iphone-18-pro-max/burgundy.webp",
            specs: [
              ["Экран", "6.9\" Super Retina XDR, ProMotion 120 Гц"],
              ["Чип", "Apple A20 Pro"],
              ["Камера", "Три камеры 48 Мп, зум оптического качества до 8×"],
              ["Корпус", "Алюминиевый цельный корпус, Ceramic Shield 2 спереди"],
              ["Разъём", "USB-C"],
            ],
            colors: ["Бордовый", "Ледниковый", "Серебристый", "Чёрный"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 200, 600]),
            simOptions: SIM_LABELS,
          },
          {
            slug: "iphone-air",
            name: "iPhone Air",
            short: "Самый тонкий iPhone с чипом A19 Pro",
            desc: "iPhone Air — тонкий титановый смартфон с чипом A19 Pro и дисплеем 6.5 дюйма.",
            basePriceUsd: 1099,
            specs: [
              ["Экран", "6.5\" Super Retina XDR"],
              ["Чип", "Apple A19 Pro"],
              ["Толщина", "5.6 мм"],
            ],
            colors: ["Космический чёрный", "Облачный белый", "Светло-золотой", "Небесно-голубой"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 200, 400]),
            simOptions: ["eSIM"],
          },
          {
            slug: "iphone-17e",
            name: "iPhone 17e",
            short: "Актуальный доступный iPhone с Apple Intelligence",
            desc: "iPhone 17e — младшая модель актуальной линейки с OLED-дисплеем, современным чипом Apple и поддержкой Apple Intelligence.",
            basePriceUsd: 699,
            specs: [
              ["Экран", "6.1\" Super Retina XDR"],
              ["Чип", "Apple A19"],
              ["Камера", "48 Мп Fusion"],
              ["Связь", "5G, eSIM"],
            ],
            colors: ["Чёрный", "Белый", "Нежно-розовый"],
            memoryTiers: mem(["256 ГБ"], [0]),
            simOptions: SIM_LABELS,
          },
          {
            slug: "iphone-duo",
            name: "iPhone Duo",
            short: "Первый складной iPhone с двумя дисплеями",
            desc: "iPhone Duo — анонсированная складная модель с внутренним дисплеем 7.6 дюйма и внешним экраном 5.4 дюйма. Apple откроет предзаказ 16 октября 2026 года; наличие у Di-SMART не подтверждено.",
            basePriceUsd: 1999,
            outOfStock: true,
            specs: [
              ["Основной экран", "7.6\" складной Super Retina XDR"],
              ["Внешний экран", "5.4\" Super Retina XDR"],
              ["Камера", "Двойная камера Fusion"],
              ["Статус", "Анонсирован; предзаказ Apple с 16 октября 2026 года"],
            ],
            colors: ["Звёздный белый", "Ночное небо"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ", "2 ТБ"], [0, 200, 400, 800]),
            simOptions: ["eSIM"],
            oosTierLabels: ["256 ГБ", "512 ГБ", "1 ТБ", "2 ТБ"],
          },
          {
            slug: "iphone-16e",
            name: "iPhone 16e",
            short: "Доступный iPhone с чипом A18",
            desc: "iPhone 16e — доступная точка входа в экосистему Apple с чипом A18 и Apple Intelligence.",
            basePriceUsd: 599,
            specs: [
              ["Экран", "6.1\" Super Retina XDR"],
              ["Чип", "Apple A18"],
              ["Камера", "48 Мп"],
            ],
            colors: ["Чёрный", "Белый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 2), [0, 100]),
            simOptions: SIM_LABELS,
          },
          {
            slug: "iphone-16",
            name: "iPhone 16",
            short: "Проверенный флагман прошлого поколения",
            desc: "iPhone 16 — надёжный выбор прошлого поколения с чипом A18 и системой из двух камер.",
            basePriceUsd: 799,
            specs: [
              ["Экран", "6.1\" Super Retina XDR"],
              ["Чип", "Apple A18"],
              ["Камера", "48 + 12 Мп"],
            ],
            colors: ["Чёрный", "Белый", "Розовый", "Бирюзовый", "Ультрамариновый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 3), [0, 100, 300]),
            simOptions: SIM_LABELS,
          },
        ],
      },
      {
        slug: "ipad",
        name: "iPad",
        seoTitle: "iPad — купить в Минске | Di-SMART Electronics",
        seoDescription: "iPad, iPad Air и iPad Pro с гарантией и доставкой по Беларуси.",
        products: [
          {
            slug: "ipad-11",
            name: "iPad (A16, 11-е поколение)",
            short: "Доступный iPad для учёбы и повседневных задач",
            desc: "iPad 11-го поколения — быстрый чип A16 и большой дисплей Liquid Retina для учёбы, работы и развлечений.",
            basePriceUsd: 349,
            specs: [
              ["Экран", "11\" Liquid Retina, 2360 × 1640, 500 нит"],
              ["Чип", "Apple A16"],
              ["Основная камера", "12 Мп"],
              ["Стилус", "Apple Pencil (USB-C), Apple Pencil 1-го поколения с адаптером"],
            ],
            colors: ["Серебристый", "Синий", "Розовый", "Жёлтый"],
            memoryTiers: mem(["128 ГБ", "256 ГБ"], [0, 100]),
          },
          {
            slug: "ipad-air-11",
            name: "iPad Air 11\" M4",
            short: "Баланс мощности и портативности",
            desc: "iPad Air 11\" с чипом M4 и 12 ГБ объединённой памяти — мощный планшет для творческих задач в компактном корпусе.",
            basePriceUsd: 599,
            specs: [
              ["Экран", "11\" Liquid Retina, 2360 × 1640, 500 нит"],
              ["Чип", "Apple M4, 8-ядерный CPU и 9-ядерный GPU"],
              ["Объединённая память", "12 ГБ"],
              ["Стилус", "Apple Pencil Pro и Apple Pencil (USB-C)"],
            ],
            colors: ["Синий", "Фиолетовый", "Звёздный", "Серый космос"],
            memoryTiers: mem(["128 ГБ", "256 ГБ"], [0, 100]),
          },
          {
            slug: "ipad-air-13",
            name: "iPad Air 13\" M4",
            short: "Большой экран для многозадачности",
            desc: "iPad Air 13\" — увеличенный дисплей Liquid Retina, чип M4 и 12 ГБ объединённой памяти для комфортной многозадачности.",
            basePriceUsd: 799,
            specs: [
              ["Экран", "13\" Liquid Retina, 2732 × 2048, 600 нит"],
              ["Чип", "Apple M4, 8-ядерный CPU и 9-ядерный GPU"],
              ["Объединённая память", "12 ГБ"],
              ["Стилус", "Apple Pencil Pro и Apple Pencil (USB-C)"],
            ],
            colors: ["Синий", "Фиолетовый", "Звёздный", "Серый космос"],
            memoryTiers: mem(["128 ГБ", "256 ГБ"], [0, 100]),
          },
          {
            slug: "ipad-pro-11",
            name: "iPad Pro 11\" M5",
            short: "Дисплей Ultra Retina XDR, чип M5",
            desc: "iPad Pro 11\" с дисплеем Ultra Retina XDR и чипом M5 — профессиональный инструмент в компактном корпусе.",
            basePriceUsd: 999,
            specs: [
              ["Экран", "11\" Ultra Retina XDR, Tandem OLED, ProMotion 10–120 Гц"],
              ["Чип", "Apple M5"],
              ["Стилус", "Apple Pencil Pro и Apple Pencil (USB-C)"],
              ["Разъём", "Thunderbolt / USB 4"],
            ],
            colors: ["Серебристый", "Чёрный космос"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ", "2 ТБ"], [0, 200, 600, 1000]),
          },
          {
            slug: "ipad-pro-13",
            name: "iPad Pro 13\" M5",
            short: "Самый большой и мощный iPad",
            desc: "iPad Pro 13\" — вершина линейки планшетов Apple: дисплей Ultra Retina XDR и чип M5.",
            basePriceUsd: 1299,
            specs: [
              ["Экран", "13\" Ultra Retina XDR, Tandem OLED, ProMotion 10–120 Гц"],
              ["Чип", "Apple M5"],
              ["Стилус", "Apple Pencil Pro и Apple Pencil (USB-C)"],
              ["Разъём", "Thunderbolt / USB 4"],
            ],
            colors: ["Серебристый", "Чёрный космос"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ", "2 ТБ"], [0, 200, 600, 1000]),
          },
          {
            slug: "ipad-mini",
            name: "iPad mini",
            short: "Компактный iPad с поддержкой Apple Pencil Pro",
            desc: "iPad mini — самый компактный планшет Apple: удобно читать, делать заметки, путешествовать и работать одной рукой.",
            basePriceUsd: 499,
            specs: [
              ["Экран", "8.3\" Liquid Retina, 2266 × 1488, 500 нит"],
              ["Чип", "Apple A17 Pro"],
              ["Стилус", "Apple Pencil Pro и Apple Pencil USB-C"],
              ["Вес", "293 г (Wi-Fi)"],
            ],
            colors: ["Синий", "Фиолетовый", "Звёздный", "Серый космос"],
            memoryTiers: mem(["128 ГБ", "256 ГБ", "512 ГБ"], [0, 100, 300]),
          },
        ],
      },
      {
        slug: "macbook",
        name: "MacBook",
        seoTitle: "MacBook — купить в Минске | Di-SMART Electronics",
        seoDescription: "MacBook Air и MacBook Pro для работы, учёбы и творческих задач.",
        products: [
          {
            slug: "macbook-neo",
            name: "MacBook Neo 13\"",
            short: "Компактный MacBook с A18 Pro и экраном Liquid Retina",
            desc: "MacBook Neo — лёгкий ноутбук Apple для учёбы и повседневных задач. Один товар объединяет четыре фирменных цвета и два объёма SSD; объём объединённой памяти в обеих конфигурациях — 8 ГБ.",
            basePriceUsd: 599,
            mainImage: "/media/catalog/products/macbook-neo-blush-2026-v2.webp",
            colorImages: {
              "Розовый Blush": "/media/catalog/products/macbook-neo-blush-2026-v2.webp",
              "Индиго": "/media/catalog/products/macbook-neo-indigo-2026-v2.webp",
              "Цитрусовый": "/media/catalog/products/macbook-neo-citrus-2026-v2.webp",
              "Серебристый": "/media/catalog/products/macbook-neo-silver-2026-v2.webp",
            },
            specs: [
              ["Экран", "13,0\" Liquid Retina, 2408 × 1506, 500 нит"],
              ["Чип", "Apple A18 Pro: 6-ядерный CPU, 5-ядерный GPU"],
              ["Оперативная память", "8 ГБ объединённой памяти"],
              ["Накопитель", "SSD 256 или 512 ГБ"],
              ["Автономность", "До 16 часов потокового видео"],
              ["Подключения", "USB 3 (USB-C), USB 2 (USB-C), 3,5 мм"],
              ["Вес", "1,23 кг"],
            ],
            colors: ["Розовый Blush", "Индиго", "Цитрусовый", "Серебристый"],
            memoryTiers: mem(["256 ГБ", "512 ГБ"], [0, 100]),
          },
          {
            slug: "macbook-air-13-m5",
            name: "MacBook Air 13\" M5",
            short: "Актуальный MacBook Air на чипе M5",
            desc: "MacBook Air 13\" M5 — тонкий бесшумный ноутбук с автономностью до 18 часов и производительностью для учёбы и повседневной работы.",
            basePriceUsd: 1099,
            specs: [
              ["Экран", "13,6\" Liquid Retina, 2560 × 1664, 500 нит"],
              ["Чип", "Apple M5"],
              ["Объединённая память", "16 или 24 ГБ"],
              ["Накопитель", "SSD 512 ГБ или 1 ТБ"],
              ["Автономность", "До 18 часов"],
            ],
            colors: ["Небесно-голубой", "Серебристый", "Звёздный", "Полночный"],
            configurationTiers: mem(["16 ГБ / 512 ГБ", "16 ГБ / 1 ТБ", "24 ГБ / 1 ТБ"], [0, 200, 400]),
          },
          {
            slug: "macbook-air-15-m5",
            name: "MacBook Air 15\" M5",
            short: "Большой дисплей и тонкий корпус на чипе M5",
            desc: "MacBook Air 15\" M5 с экраном Liquid Retina 15,3 дюйма, 16 или 24 ГБ объединённой памяти и SSD на 512 ГБ или 1 ТБ. Тонкий бесшумный корпус подходит для работы и учёбы.",
            basePriceUsd: 1299,
            specs: [
              ["Экран", "15,3\" Liquid Retina, 2880 × 1864, 500 нит"],
              ["Чип", "Apple M5: 10-ядерный CPU, 10-ядерный GPU"],
              ["Оперативная память", "16 или 24 ГБ объединённой памяти"],
              ["Накопитель", "SSD 512 ГБ или 1 ТБ"],
              ["Автономность", "До 18 часов потокового видео"],
              ["Подключения", "MagSafe 3, два Thunderbolt 4, 3,5 мм"],
              ["Вес", "1,51 кг"],
            ],
            colors: ["Небесно-голубой", "Серебристый", "Звёздный", "Полночный"],
            configurationTiers: mem(["16 ГБ / 512 ГБ", "16 ГБ / 1 ТБ", "24 ГБ / 1 ТБ"], [0, 200, 400]),
          },
          {
            slug: "macbook-air-13-m4",
            name: "MacBook Air 13\" M4",
            short: "Лёгкий и быстрый ноутбук на чипе M4",
            desc: "MacBook Air 13\" на чипе M4 — тонкий корпус, тихая работа без вентилятора и целый день автономности.",
            basePriceUsd: 1099,
            specs: [
              ["Экран", "13,6\" Liquid Retina, 2560 × 1664, 500 нит"],
              ["Чип", "Apple M4"],
              ["Объединённая память", "16 ГБ"],
              ["Автономность", "До 18 часов"],
            ],
            colors: ["Небесно-голубой", "Серебристый", "Звёздный", "Полночный"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 200, 500]),
          },
          {
            slug: "macbook-air-15-m4",
            name: "MacBook Air 15\" M4",
            short: "Больше экрана без потери портативности",
            desc: "MacBook Air 15\" M4 — просторный дисплей для многозадачности при той же лёгкости корпуса.",
            basePriceUsd: 1299,
            specs: [
              ["Экран", "15.3\" Liquid Retina, 2880 × 1864, 500 нит"],
              ["Чип", "Apple M4"],
              ["Память", "От 16 ГБ объединённой памяти"],
              ["Автономность", "До 18 часов потокового видео"],
            ],
            colors: ["Небесно-голубой", "Серебристый", "Звёздный", "Полночный"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ", "2 ТБ"], [0, 200, 500, 900]),
          },
          {
            slug: "macbook-pro-14-m5",
            name: "MacBook Pro 14\" M5",
            short: "Профессиональная производительность на чипе M5",
            desc: "MacBook Pro 14\" M5 — дисплей Liquid Retina XDR и производительность для профессиональных задач.",
            basePriceUsd: 1599,
            specs: [
              ["Экран", "14.2\" Liquid Retina XDR, 3024 × 1964, ProMotion до 120 Гц"],
              ["Чип", "Apple M5"],
              ["Память", "16, 24 или 32 ГБ объединённой памяти"],
              ["Автономность", "До 24 часов потокового видео"],
            ],
            colors: ["Серебристый", "Чёрный космос"],
            memoryTiers: mem(["512 ГБ", "1 ТБ", "2 ТБ", "4 ТБ"], [0, 300, 700, 1500]),
          },
          {
            slug: "macbook-pro-14-m5-pro",
            name: "MacBook Pro 14\" M5 Pro",
            short: "Больше ядер для тяжёлых нагрузок",
            desc: "MacBook Pro 14\" на чипе M5 Pro — для видеомонтажа, 3D и других требовательных задач.",
            basePriceUsd: 1999,
            specs: [
              ["Экран", "14.2\" Liquid Retina XDR, 3024 × 1964, ProMotion до 120 Гц"],
              ["Чип", "Apple M5 Pro"],
              ["Память", "От 24 ГБ объединённой памяти"],
              ["Автономность", "До 22 часов потокового видео"],
            ],
            colors: ["Серебристый", "Чёрный космос"],
            memoryTiers: mem(["1 ТБ", "2 ТБ", "4 ТБ"], [0, 300, 700]),
          },
          {
            slug: "macbook-pro-16-m5",
            name: "MacBook Pro 16\" M5",
            short: "Максимальный экран и автономность в линейке Pro",
            desc: "MacBook Pro 16\" M5 — самый большой дисплей линейки и рекордная автономность работы.",
            basePriceUsd: 2499,
            specs: [
              ["Экран", "16.2\" Liquid Retina XDR"],
              ["Чип", "Apple M5"],
              ["Аккумулятор", "до 24 ч"],
            ],
            colors: ["Серебристый", "Графитовый"],
            memoryTiers: mem(["512 ГБ", "1 ТБ", "2 ТБ"], [0, 300, 700]),
          },
          {
            slug: "macbook-pro-16-m5-max",
            name: "MacBook Pro 16\" M5 Max",
            short: "Максимальная производительность Apple Silicon",
            desc: "MacBook Pro 16\" на чипе M5 Max — 18-ядерный CPU, 40-ядерный GPU и до 128 ГБ памяти для самых тяжёлых задач.",
            basePriceUsd: 3999,
            isFlagship: true,
            mainImage: "/media/macbook-pro-m5-max/hero-poster.webp",
            specs: [
              ["Экран", "16.2\" Liquid Retina XDR, 1600 нит HDR, ProMotion 120 Гц"],
              ["Чип", "Apple M5 Max, 18-ядерный CPU, 40-ядерный GPU"],
              ["Память", "До 128 ГБ единой памяти, пропускная способность 614 ГБ/с"],
              ["Аккумулятор", "До 22 ч видео"],
            ],
            colors: ["Космический чёрный", "Серебристый"],
            memoryTiers: mem(["2 ТБ", "4 ТБ", "8 ТБ"], [500, 1500, 3500]),
          },
        ],
      },
      {
        slug: "watch",
        name: "Apple Watch",
        seoTitle: "Apple Watch — купить в Минске | Di-SMART Electronics",
        seoDescription: "Apple Watch SE, Series и Ultra — умные часы Apple с гарантией.",
        products: [
          {
            slug: "watch-series-12",
            name: "Apple Watch Series 12",
            short: "Актуальные Apple Watch с расширенным контролем здоровья",
            desc: "Apple Watch Series 12 в алюминиевом корпусе — основной модельный ряд 2026 года с Always-On дисплеем, чипом S11 и автономностью до 24 часов.",
            basePriceUsd: 399,
            specs: [
              ["Экран", "Always-On Retina LTPO"],
              ["Чип", "Apple S11"],
              ["Автономность", "До 24 часов"],
              ["Здоровье", "ЭКГ, датчик температуры и мониторинг сна; доступность отдельных функций зависит от региона"],
            ],
            colors: ["Чёрный / Black Sport Band", "Тёмная бронза / Olive Sport Band", "Светло-золотой / Sand Sport Band", "Космический серый / Black Sport Band", "Космический серый / Blue Sport Band"],
            sizeTiers: mem(["42 мм", "46 мм"], [0, 30]),
          },
          {
            slug: "watch-series-12-cellular",
            name: "Apple Watch Series 12 (Cellular)",
            short: "Series 12 с мобильной связью 5G",
            desc: "Apple Watch Series 12 Cellular позволяют принимать звонки и сообщения без iPhone рядом и поддерживают мобильную сеть 5G.",
            basePriceUsd: 499,
            specs: [
              ["Экран", "Always-On Retina LTPO"],
              ["Связь", "GPS + Cellular, 5G"],
              ["Чип", "Apple S11"],
            ],
            colors: ["Тёмная бронза", "Чёрный", "Светло-золотой", "Космический серый"],
            sizeTiers: mem(["42 мм", "46 мм"], [0, 30]),
          },
          {
            slug: "watch-se-3",
            name: "Apple Watch SE 3",
            short: "Доступные умные часы с ключевыми функциями здоровья",
            desc: "Apple Watch SE 3 — доступный вход в экосистему Apple Watch с отслеживанием сна, тренировок и уведомлениями.",
            basePriceUsd: 249,
            specs: [
              ["Экран", "Retina LTPO"],
              ["Датчики", "Пульс, сон, активность"],
            ],
            colors: ["Полночный / Midnight Sport Band", "Звёздный / Starlight Sport Band"],
            sizeTiers: mem(["40 мм", "44 мм"], [0, 30]),
          },
          {
            slug: "watch-series-11",
            name: "Apple Watch Series 11",
            short: "Флагманская линейка Apple Watch",
            desc: "Apple Watch Series 11 — датчик температуры, пульсоксиметр и рекордная автономность.",
            basePriceUsd: 399,
            specs: [
              ["Экран", "Always-On Retina LTPO"],
              ["Датчики", "Пульс, кислород, температура"],
            ],
            colors: ["Космический серый / Black Sport Band", "Глянцевый чёрный / Black Sport Band", "Розово-золотой / Light Blush Sport Band", "Серебристый / Pur Fog Sport Band"],
            sizeTiers: mem(["42 мм", "46 мм"], [0, 30]),
          },
          {
            slug: "watch-series-11-cellular",
            name: "Apple Watch Series 11 (Cellular)",
            short: "Series 11 с поддержкой мобильной сети",
            desc: "Apple Watch Series 11 с модулем Cellular — звонки и уведомления даже без телефона рядом.",
            basePriceUsd: 499,
            specs: [
              ["Экран", "Always-On Retina LTPO"],
              ["Связь", "Wi-Fi + Cellular"],
            ],
            colors: ["Глянцевый чёрный", "Розово-золотой", "Серебристый", "Космический серый"],
            sizeTiers: mem(["42 мм", "46 мм"], [0, 30]),
          },
          {
            slug: "watch-ultra-3",
            name: "Apple Watch Ultra 3",
            short: "Самые прочные и автономные часы Apple",
            desc: "Apple Watch Ultra 3 — титановый корпус, спутниковая связь и до 42 часов работы в обычном режиме (до 72 часов в режиме энергосбережения).",
            basePriceUsd: 799,
            specs: [
              ["Корпус", "Титан"],
              ["Автономность", "До 42 ч; до 72 ч в режиме энергосбережения"],
              ["Связь", "Спутниковая связь"],
            ],
            colors: ["Титан"],
            sizeTiers: mem(["49 мм"], [0]),
          },
          {
            slug: "apple-watch-ultra-4",
            name: "Apple Watch Ultra 4",
            short: "Титановый корпус 49 мм и автономность до 50 часов",
            desc: "Apple Watch Ultra 4 — титановый корпус 49 мм, автономность до 50 часов и водостойкость WR100; погружение с аквалангом допускается до 40 м. Наличие у продавца уточняйте.",
            basePriceUsd: 799,
            isFlagship: true,
            outOfStock: true,
            specs: [
              ["Корпус", "Титан Grade 5, 49 мм"],
              ["Автономность", "До 50 ч в обычном режиме"],
              ["Водостойкость", "WR100, погружение с аквалангом до 40 м"],
              ["Статус", "Модель выпущена; наличие у продавца уточняйте"],
            ],
            colors: ["Натуральный титан", "Чёрный титан"],
            sizeTiers: mem(["49 мм"], [0]),
          },
          {
            slug: "watch-hermes-series-11",
            name: "Apple Watch Hermès Series 11",
            short: "Series 11 в особом дизайне Hermès",
            desc: "Apple Watch Hermès Series 11 — эксклюзивные ремешки и циферблаты в коллаборации с Hermès.",
            basePriceUsd: 1499,
            specs: [
              ["Экран", "Always-On Retina LTPO"],
              ["Комплектация", "Ремешок Hermès"],
            ],
            colors: ["Чёрный"],
            sizeTiers: mem(["42 мм", "46 мм"], [0, 30]),
          },
          {
            slug: "watch-hermes-series-12",
            name: "Apple Watch Hermès Series 12",
            short: "Series 12 с эксклюзивными ремешками и циферблатами Hermès",
            desc: "Apple Watch Hermès Series 12 объединяют актуальные функции Apple Watch с фирменными ремешками и оформлением Hermès.",
            basePriceUsd: 1249,
            specs: [
              ["Экран", "Always-On Retina LTPO"],
              ["Чип", "Apple S11"],
              ["Комплектация", "Ремешок и циферблаты Hermès"],
            ],
            colors: ["Серебристый", "Сияющее золото"],
            sizeTiers: mem(["42 мм", "46 мм"], [0, 50]),
          },
        ],
      },
      {
        slug: "airpods",
        name: "AirPods",
        seoTitle: "AirPods — купить в Минске | Di-SMART Electronics",
        seoDescription: "AirPods, AirPods Pro и AirPods Max — беспроводные наушники Apple.",
        products: [
          {
            slug: "airpods-5",
            name: "AirPods 5",
            short: "Актуальные открытые AirPods с обновлённым звуком",
            desc: "AirPods 5 — открытые наушники с обновлённым звуком и зарядным кейсом USB-C. Версия с активным шумоподавлением и беспроводной зарядкой представлена отдельно.",
            basePriceUsd: 129,
            specs: [
              ["Тип", "Вкладыши"],
              ["Шумоподавление", "Без активного шумоподавления"],
              ["Звук", "Персонализированное пространственное аудио"],
              ["Разъём", "USB-C"],
            ],
            colors: ["Белый"],
          },
          {
            slug: "airpods-5-wireless",
            name: "AirPods 5 с беспроводной зарядкой",
            short: "AirPods 5 с кейсом беспроводной зарядки",
            desc: "AirPods 5 с активным шумоподавлением и кейсом, который заряжается по USB-C, от зарядки Apple Watch или устройства Qi.",
            basePriceUsd: 149,
            specs: [
              ["Тип", "Вкладыши"],
              ["Шумоподавление", "Активное (ANC)"],
              ["Кейс", "USB-C, зарядка Apple Watch и Qi"],
              ["Звук", "Персонализированное пространственное аудио"],
            ],
            colors: ["Белый"],
          },
          {
            slug: "airpods-4",
            name: "AirPods 4",
            short: "Обновлённый дизайн и улучшенный звук",
            desc: "AirPods 4 — открытый дизайн, улучшенное качество звука и адаптивный эквалайзер.",
            basePriceUsd: 129,
            specs: [
              ["Автономность", "До 5 ч без кейса / до 30 ч с кейсом"],
              ["Защита", "IP54"],
              ["Чип", "Apple H2"],
              ["Кейс", "Зарядка USB-C"],
            ],
          },
          {
            slug: "airpods-4-anc",
            name: "AirPods 4 (ANC)",
            short: "AirPods 4 с активным шумоподавлением",
            desc: "AirPods 4 с активным шумоподавлением и прозрачным режимом.",
            basePriceUsd: 179,
            specs: [
              ["Шумоподавление", "Активное (ANC)"],
              ["Автономность", "До 4 ч без кейса / до 20 ч с кейсом при включённом ANC"],
              ["Чип", "Apple H2"],
              ["Кейс", "USB-C, Qi и зарядка Apple Watch"],
            ],
          },
          {
            slug: "airpods-pro-2",
            name: "AirPods Pro 2 (USB-C)",
            short: "Внутриканальные AirPods с активным шумоподавлением",
            desc: "AirPods Pro 2 с зарядным кейсом USB-C, активным шумоподавлением и режимом прозрачности.",
            basePriceUsd: 219,
            mainImage: "/media/catalog/products/airpods-pro-2.webp",
            specs: [
              ["Тип", "Внутриканальные наушники"],
              ["Чип", "Apple H2"],
              ["Шумоподавление", "Активное (ANC)"],
              ["Кейс", "USB-C, беспроводная зарядка Qi"],
            ],
          },
          {
            slug: "airpods-pro-3",
            name: "AirPods Pro 3",
            short: "Топовые TWS-наушники Apple",
            desc: "AirPods Pro 3 — лучшее шумоподавление в линейке, персонализированный звук и датчик здоровья.",
            basePriceUsd: 249,
            specs: [
              ["Шумоподавление", "Активное (ANC), улучшенное"],
              ["Датчики", "Пульс"],
              ["Защита", "IP57"],
            ],
          },
          {
            slug: "airpods-max",
            name: "AirPods Max (2024)",
            short: "Полноразмерные наушники с премиальным звуком",
            desc: "AirPods Max — полноразмерные наушники с пространственным звуком и активным шумоподавлением.",
            basePriceUsd: 549,
            specs: [
              ["Тип", "Полноразмерные, накладные"],
              ["Автономность", "до 20 ч"],
            ],
            colors: ["Серебристый", "Полночный", "Синий", "Розовый", "Зелёный"],
          },
          {
            slug: "airpods-max-2",
            name: "AirPods Max (2026)",
            short: "Полноразмерные наушники Apple с чипом H2",
            desc: "Полноразмерные AirPods Max 2026 с активным шумоподавлением, адаптивным аудио, пространственным звуком и зарядкой USB-C.",
            basePriceUsd: 549,
            specs: [
              ["Тип", "Полноразмерные наушники"],
              ["Чип", "Apple H2"],
              ["Шумоподавление", "Активное (ANC)"],
              ["Разъём", "USB-C"],
              ["Автономность", "До 20 часов"],
            ],
            colors: ["Полночный", "Звёздный", "Синий", "Фиолетовый", "Космический оранжевый"],
          },
          {
            slug: "earpods-usb-c",
            name: "EarPods USB-C",
            short: "Проводные наушники с разъёмом USB-C",
            desc: "EarPods с разъёмом USB-C — простое проводное решение без необходимости заряда.",
            basePriceUsd: 19,
            specs: [["Тип", "Проводные, вставные"]],
          },
        ],
      },
      {
        slug: "vision-pro",
        name: "Vision Pro",
        seoTitle: "Apple Vision Pro — Di-SMART Electronics",
        seoDescription: "Пространственный компьютер Apple Vision Pro. Наличие и цену уточняйте у менеджера.",
        products: [
          {
            slug: "apple-vision-pro-m5",
            name: "Apple Vision Pro (M5)",
            short: "Пространственный компьютер с чипами M5 и R1",
            desc: "Apple Vision Pro (M5) — пространственный компьютер с двумя дисплеями micro-OLED, отслеживанием глаз и рук и ремешком Dual Knit Band.",
            // Ориентир — стартовая цена Apple в США; цена Di-SMART не подтверждена.
            basePriceUsd: 3499,
            outOfStock: true,
            specs: [
              ["Дисплеи", "Два micro-OLED, суммарно 23 млн пикселей"],
              ["Чипы", "Apple M5 и R1"],
              ["Управление", "Глаза, руки и голос"],
              ["Комплект", "Dual Knit Band и внешний аккумулятор"],
            ],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 200, 400]),
            oosTierLabels: ["256 ГБ", "512 ГБ", "1 ТБ"],
          },
        ],
      },
      {
        slug: "homepod",
        name: "HomePod",
        seoTitle: "Apple HomePod — Di-SMART Electronics",
        seoDescription: "Умные колонки Apple HomePod. Наличие и цену уточняйте у менеджера.",
        products: [
          {
            slug: "homepod-2",
            name: "Apple HomePod (2-го поколения)",
            short: "Объёмный звук и центр умного дома",
            desc: "HomePod второго поколения — умная колонка с пространственным аудио, датчиками температуры и влажности и поддержкой умного дома Matter и Thread.",
            // Ориентир — стартовая цена Apple в США; цена/наличие Di-SMART не подтверждены.
            basePriceUsd: 299,
            outOfStock: true,
            specs: [
              ["Звук", "4-дюймовый НЧ-динамик и пять твитеров"],
              ["Связь", "Wi-Fi 802.11n, Bluetooth 5.0, Thread"],
              ["Датчики", "Температура и влажность"],
              ["Высота", "168 мм"],
            ],
            colors: ["Полночный", "Белый"],
          },
        ],
      },
      {
        slug: "apple-tv",
        name: "Apple TV",
        seoTitle: "Apple TV 4K — Di-SMART Electronics",
        seoDescription: "Медиаплееры Apple TV 4K. Наличие и цену уточняйте у менеджера.",
        products: [
          {
            slug: "apple-tv-4k-3-wifi-64",
            name: "Apple TV 4K (3-го поколения), Wi-Fi, 64 ГБ",
            short: "Apple TV 4K с чипом A15 Bionic",
            desc: "Компактный медиаплеер Apple TV 4K третьего поколения с чипом A15 Bionic и подключением по Wi-Fi 6.",
            // Ориентир — цена Apple в США; цена/наличие Di-SMART не подтверждены.
            basePriceUsd: 129,
            outOfStock: true,
            specs: [
              ["Память", "64 ГБ"],
              ["Чип", "Apple A15 Bionic"],
              ["Связь", "Wi-Fi 6, Bluetooth 5.0"],
              ["Видео", "4K HDR, Dolby Vision и HDR10+"],
            ],
          },
          {
            slug: "apple-tv-4k-3-ethernet-128",
            name: "Apple TV 4K (3-го поколения), Wi-Fi + Ethernet, 128 ГБ",
            short: "Apple TV 4K с Ethernet и Thread",
            desc: "Версия Apple TV 4K третьего поколения с 128 ГБ памяти, Gigabit Ethernet и поддержкой сети Thread для умного дома.",
            // Ориентир — цена Apple в США; цена/наличие Di-SMART не подтверждены.
            basePriceUsd: 149,
            outOfStock: true,
            specs: [
              ["Память", "128 ГБ"],
              ["Чип", "Apple A15 Bionic"],
              ["Связь", "Wi-Fi 6, Gigabit Ethernet, Thread"],
              ["Видео", "4K HDR, Dolby Vision и HDR10+"],
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "samsung",
    name: "Samsung",
    categories: [
      {
        slug: "samsung-smartphones",
        name: "Samsung",
        seoTitle: "Смартфоны Samsung — купить в Минске | Di-SMART Electronics",
        seoDescription: "Samsung Galaxy S, Z Flip, Z Fold и A-серия с гарантией и доставкой.",
        products: [
          {
            slug: "galaxy-s26",
            name: "Samsung Galaxy S26",
            short: "Компактный флагман Samsung с Galaxy AI",
            desc: "Galaxy S26 — базовый флагман 2026 года с дисплеем Dynamic AMOLED 2X, камерой 50 Мп и аккумулятором 4300 мАч.",
            basePriceUsd: 849,
            specs: [
              ["Экран", "6.3\" Dynamic AMOLED 2X, 120 Гц, до 2600 нит"],
              ["Камера", "50 Мп"],
              ["Аккумулятор", "4300 мАч, до 30 ч видео"],
              ["Память", "12 ГБ ОЗУ"],
            ],
            colors: ["Кобальтовый фиолетовый", "Синий", "Чёрный", "Белый"],
            memoryTiers: mem(["256 ГБ", "512 ГБ"], [0, 120]),
          },
          {
            slug: "galaxy-s26-plus",
            name: "Samsung Galaxy S26+",
            short: "Большой экран и увеличенная батарея в линейке S26",
            desc: "Galaxy S26+ сочетает дисплей 6.7 дюйма, камеру 50 Мп и аккумулятор 4900 мАч с функциями Galaxy AI.",
            basePriceUsd: 1049,
            specs: [
              ["Экран", "6.7\" Dynamic AMOLED 2X, 120 Гц, до 2600 нит"],
              ["Камера", "50 Мп"],
              ["Аккумулятор", "4900 мАч, до 31 ч видео"],
              ["Память", "12 ГБ ОЗУ"],
            ],
            colors: ["Кобальтовый фиолетовый", "Синий", "Чёрный", "Белый"],
            memoryTiers: mem(["256 ГБ", "512 ГБ"], [0, 120]),
          },
          {
            slug: "galaxy-s26-fe",
            name: "Samsung Galaxy S26 FE",
            short: "Ключевые возможности серии S26 по более доступной цене",
            desc: "Galaxy S26 FE — модель Fan Edition с AMOLED-дисплеем 120 Гц, Galaxy AI и сбалансированной системой камер.",
            basePriceUsd: 649,
            specs: [
              ["Экран", "Dynamic AMOLED 2X, 120 Гц"],
              ["Камера", "Тройная камера с оптической стабилизацией"],
              ["Защита", "IP68"],
            ],
            colors: ["Фисташковый", "Графитовый", "Голубая ягода"],
            memoryTiers: mem(["128 ГБ", "256 ГБ", "512 ГБ"], [0, 80, 180]),
          },
          {
            slug: "galaxy-s25",
            name: "Samsung Galaxy S25",
            short: "Флагманская линейка Samsung нового поколения",
            desc: "Galaxy S25 — мощный процессор, продвинутая камера и функции Galaxy AI.",
            basePriceUsd: 799,
            specs: [
              ["Экран", "6.2\" Dynamic AMOLED 2X, 120 Гц"],
              ["Процессор", "Snapdragon 8 Elite for Galaxy"],
              ["Основная камера", "50 Мп"],
              ["Аккумулятор", "4000 мАч"],
            ],
            colors: ["Чёрный", "Синий", "Серебристый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 3), [0, 100, 300]),
          },
          {
            slug: "galaxy-s25-plus",
            name: "Samsung Galaxy S25+",
            short: "Больше экрана и автономности",
            desc: "Galaxy S25+ — увеличенный дисплей и батарея для тех, кому мало базовой версии.",
            basePriceUsd: 999,
            specs: [
              ["Экран", "6.7\" Dynamic AMOLED 2X, QHD+, 120 Гц"],
              ["Процессор", "Snapdragon 8 Elite for Galaxy"],
              ["Основная камера", "50 Мп"],
              ["Аккумулятор", "4900 мАч"],
            ],
            colors: ["Чёрный", "Синий"],
            memoryTiers: mem(["256 ГБ", "512 ГБ"], [0, 200]),
          },
          {
            slug: "galaxy-s25-ultra",
            name: "Samsung Galaxy S25 Ultra",
            short: "Флагман года с S Pen и камерой 200 Мп",
            desc: "Galaxy S25 Ultra — вершина линейки Samsung: титановый корпус, встроенный S Pen и камера 200 Мп.",
            basePriceUsd: 1299,
            isFlagship: true,
            specs: [
              ["Экран", "6.9\" Dynamic AMOLED 2X, адаптивные 120 Гц, 2600 нит, Corning Gorilla Armor 2"],
              ["Процессор", "Snapdragon 8 Elite for Galaxy (+40% NPU, +37% CPU, +30% GPU — данные производителя)"],
              ["Камера", "200 + 50 + 50 + 10 Мп, оптический зум 5x/3x, AI Zoom до 100x, S Pen встроен"],
              ["Корпус", "Титан, IP68"],
              ["Аккумулятор", "5000 мАч, до 31 ч видео, зарядка 45 Вт / 15 Вт беспроводная"],
              ["Цвета", "Titanium Silverblue, Titanium Black, Titanium Gray, Titanium Whitesilver"],
              ["Память", "256 ГБ – 1 ТБ"],
            ],
            colors: ["Титановый чёрный", "Титановый серый", "Титановый серебристо-голубой", "Титановый бело-серебристый"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 200, 400]),
          },
          {
            slug: "galaxy-s26-ultra",
            name: "Samsung Galaxy S26 Ultra",
            short: "Galaxy AI, S Pen и камера 200 Мп в корпусе Armor Aluminium",
            desc: "Galaxy S26 Ultra — Samsung отказалась от титана в пользу Armor Aluminium, сохранив камеру 200 Мп, встроенный S Pen и новые функции Galaxy AI.",
            basePriceUsd: 1399,
            isFlagship: true,
            mainImage: "/media/galaxy-s26-ultra/photos/hero-photo.webp",
            colorImages: {
              "Чёрный": "/media/flagship-colors/galaxy-s26-ultra/black.webp",
              "Серебристая тень": "/media/flagship-colors/galaxy-s26-ultra/silver-shadow.webp",
              "Кобальтовый фиолетовый": "/media/flagship-colors/galaxy-s26-ultra/cobalt-violet.webp",
            },
            specs: [
              ["Экран", "6.9\" Dynamic AMOLED 2X, 120 Гц"],
              ["Процессор", "Snapdragon 8 Elite Gen 5 for Galaxy"],
              ["Камера", "200 Мп основная камера, S Pen встроен"],
              ["Корпус", "Armor Aluminium 2.0"],
            ],
            colors: ["Чёрный", "Серебристая тень", "Кобальтовый фиолетовый"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [100, 300, 500]),
          },
          {
            slug: "galaxy-z-flip7",
            name: "Samsung Galaxy Z Flip7",
            short: "Компактный флип-смартфон",
            desc: "Galaxy Z Flip7 — складной смартфон с большим внешним экраном и компактным форм-фактором.",
            basePriceUsd: 1099,
            specs: [
              ["Экран", "6.9\" Dynamic AMOLED 2X, 120 Гц; внешний 4.1\""],
              ["Процессор", "Exynos 2500"],
              ["Основная камера", "50 Мп"],
              ["Аккумулятор", "4300 мАч"],
            ],
            colors: ["Синяя тень", "Чёрный", "Кораллово-красный", "Мятный"],
            memoryTiers: mem(["256 ГБ", "512 ГБ"], [0, 100]),
          },
          {
            slug: "galaxy-z-flip8",
            name: "Samsung Galaxy Z Flip8",
            short: "Актуальный компактный складной Galaxy",
            desc: "Galaxy Z Flip8 — карманный складной смартфон 2026 года с внешним FlexWindow и функциями Galaxy AI.",
            basePriceUsd: 1099,
            specs: [
              ["Форм-фактор", "Складной смартфон-раскладушка"],
              ["Экран", "Dynamic AMOLED 2X + внешний FlexWindow"],
              ["Защита", "Усиленная рамка и шарнир"],
            ],
            colors: ["Розовый", "Графитовый", "Кремовый", "Мятный"],
            memoryTiers: mem(["256 ГБ", "512 ГБ"], [0, 120]),
          },
          {
            slug: "galaxy-z-fold7",
            name: "Samsung Galaxy Z Fold7",
            short: "Складной смартфон-планшет",
            desc: "Galaxy Z Fold7 — большой внутренний экран превращает смартфон в компактный планшет.",
            basePriceUsd: 1899,
            specs: [
              ["Экран", "8\" складной + 6.5\" внешний"],
              ["Процессор", "Snapdragon 8 Elite for Galaxy"],
              ["Аккумулятор", "4400 мАч"],
              ["Вес", "215 г"],
            ],
            colors: ["Синяя тень", "Серебристая тень", "Чёрный", "Мятный"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 200, 400]),
          },
          {
            slug: "galaxy-z-fold8",
            name: "Samsung Galaxy Z Fold8",
            short: "Складной флагман для многозадачности",
            desc: "Galaxy Z Fold8 — складной смартфон весом 201 г с внешним экраном 5.5 дюйма, внутренним дисплеем 7.6 дюйма и Snapdragon 8 Elite Gen 5 for Galaxy.",
            basePriceUsd: 1899,
            specs: [
              ["Экран", "7.6\" внутренний и 5.5\" внешний"],
              ["Процессор", "Snapdragon 8 Elite Gen 5 for Galaxy"],
              ["Камера", "Двойная система 50 Мп"],
              ["Вес", "201 г"],
            ],
            colors: ["Лавандовый", "Графитовый", "Кремовый", "Фисташковый"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 200, 450]),
          },
          {
            slug: "galaxy-a56",
            name: "Samsung Galaxy A56",
            short: "Оптимальный баланс цены и возможностей",
            desc: "Galaxy A56 5G — смартфон с 6,7-дюймовым Super AMOLED-экраном, чипом Exynos 1580, основной камерой 50 Мп и аккумулятором 5000 мА·ч.",
            basePriceUsd: 449,
            specs: [
              ["Экран", "6,7\" FHD+ Super AMOLED, 120 Гц"],
              ["Процессор", "Exynos 1580"],
              ["Основная камера", "50 Мп с оптической стабилизацией"],
              ["Аккумулятор", "5000 мА·ч"],
              ["Защита", "IP67"],
            ],
            colors: ["Графитовый", "Светло-серый", "Оливковый", "Розовый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 2), [0, 60]),
          },
          {
            slug: "galaxy-a26-5g",
            name: "Samsung Galaxy A26 5G",
            short: "Доступный Galaxy с 5G и AMOLED-дисплеем",
            desc: "Galaxy A26 5G — практичный смартфон A-серии с большим Super AMOLED-дисплеем, оптической стабилизацией и защитой IP67.",
            basePriceUsd: 299,
            specs: [
              ["Экран", "6.7\" Super AMOLED, 120 Гц"],
              ["Камера", "50 Мп с OIS"],
              ["Связь", "5G"],
              ["Защита", "IP67"],
            ],
            colors: ["Чёрный", "Белый", "Зелёный"],
            memoryTiers: mem(["128 ГБ", "256 ГБ"], [0, 70]),
          },
        ],
      },
      {
        slug: "samsung-tablets",
        name: "Планшеты",
        seoTitle: "Планшеты Samsung Galaxy Tab — купить в Минске | Di-SMART Electronics",
        seoDescription: "Samsung Galaxy Tab S и A серии — планшеты для работы и развлечений.",
        products: [
          {
            slug: "galaxy-tab-a11",
            name: "Samsung Galaxy Tab A11",
            short: "Компактный доступный планшет Samsung",
            desc: "Galaxy Tab A11 — базовый планшет для чтения, видео, учёбы и повседневных приложений.",
            basePriceUsd: 199,
            specs: [
              ["Экран", "8,7\" LCD, 1340 × 800"],
              ["Память", "4/64 ГБ или 8/128 ГБ; microSD до 2 ТБ"],
              ["Аккумулятор", "5100 мАч"],
            ],
            colors: ["Серый", "Серебристый"],
            memoryTiers: mem(["64 ГБ", "128 ГБ"], [0, 50]),
          },
          {
            slug: "galaxy-tab-a11-plus",
            name: "Samsung Galaxy Tab A11+",
            short: "Большой экран и доступная цена",
            desc: "Galaxy Tab A11+ — универсальный планшет с большим экраном, четырьмя динамиками и версиями Wi-Fi и 5G.",
            basePriceUsd: 249,
            specs: [
              ["Экран", "11\" LCD"],
              ["Оперативная память", "6 или 8 ГБ"],
              ["Память", "Расширение microSD"],
            ],
            colors: ["Серый", "Серебристый"],
            memoryTiers: mem(["128 ГБ", "256 ГБ"], [0, 80]),
          },
          {
            slug: "galaxy-tab-s10-fe",
            name: "Samsung Galaxy Tab S10 FE",
            short: "Планшет Fan Edition с S Pen",
            desc: "Galaxy Tab S10 FE — сбалансированный планшет для учёбы и творчества с S Pen в комплекте.",
            basePriceUsd: 499,
            specs: [
              ["Экран", "10.9\" LCD, 90 Гц"],
              ["Стилус", "S Pen в комплекте"],
              ["Защита", "IP68"],
            ],
            colors: ["Серый", "Серебристый", "Синий"],
            memoryTiers: mem(["128 ГБ", "256 ГБ"], [0, 100]),
          },
          {
            slug: "galaxy-tab-s10-fe-plus",
            name: "Samsung Galaxy Tab S10 FE+",
            short: "Увеличенный Fan Edition для работы и учёбы",
            desc: "Galaxy Tab S10 FE+ предлагает большой экран 13.1 дюйма, S Pen и многозадачный режим DeX.",
            basePriceUsd: 649,
            specs: [
              ["Экран", "13.1\" LCD, 90 Гц"],
              ["Стилус", "S Pen в комплекте"],
              ["Режим", "Samsung DeX"],
            ],
            colors: ["Серый", "Серебристый", "Синий"],
            memoryTiers: mem(["128 ГБ", "256 ГБ"], [0, 120]),
          },
          {
            slug: "galaxy-tab-a10",
            name: "Samsung Galaxy Tab A10",
            short: "Доступный планшет для повседневных задач",
            desc: "Galaxy Tab A10 — недорогой планшет для видео, чтения и лёгких игр.",
            basePriceUsd: 249,
            outOfStock: true,
            specs: [["Экран", "10.1\" LCD"]],
            colors: ["Серебристый", "Графитовый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 2), [0, 40]),
            oosTierLabels: MEMORY_LABELS.slice(0, 2),
          },
          {
            slug: "galaxy-tab-a10-plus",
            name: "Samsung Galaxy Tab A10+",
            short: "Больше экрана в доступном сегменте",
            desc: "Galaxy Tab A10+ — увеличенный дисплей и улучшенные динамики для мультимедиа.",
            basePriceUsd: 329,
            specs: [["Экран", "11\" LCD"]],
            colors: ["Серебристый", "Графитовый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 2), [0, 40]),
          },
          {
            slug: "galaxy-tab-s11",
            name: "Samsung Galaxy Tab S11",
            short: "Флагманский планшет с AMOLED-экраном",
            desc: "Galaxy Tab S11 — планшет с 11-дюймовым Dynamic AMOLED 2X, чипом Dimensity 9400+ и S Pen в комплекте для работы и творчества.",
            basePriceUsd: 599,
            specs: [
              ["Экран", "11,0\" Dynamic AMOLED 2X, 2560 × 1600"],
              ["Процессор", "MediaTek Dimensity 9400+"],
              ["Оперативная память", "12 ГБ"],
              ["Аккумулятор", "8400 мА·ч, зарядка до 45 Вт"],
              ["Стилус", "S Pen в комплекте"],
              ["Защита", "IP68"],
            ],
            colors: ["Серебристый", "Графитовый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 3), [0, 100, 250]),
          },
          {
            slug: "galaxy-tab-s11-plus",
            name: "Samsung Galaxy Tab S11+",
            short: "Больше экрана и производительности",
            desc: "Galaxy Tab S11+ — увеличенный AMOLED-дисплей для многозадачности и творческих задач.",
            basePriceUsd: 799,
            specs: [["Экран", "12.4\" Dynamic AMOLED 2X"]],
            colors: ["Серебристый", "Графитовый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 3), [0, 100, 250]),
          },
          {
            slug: "galaxy-tab-s11-ultra",
            name: "Samsung Galaxy Tab S11 Ultra",
            short: "Самый большой и мощный планшет Samsung",
            desc: "Galaxy Tab S11 Ultra — большой планшет с 14,6-дюймовым Dynamic AMOLED 2X, чипом Dimensity 9400+ и S Pen в комплекте.",
            basePriceUsd: 999,
            specs: [
              ["Экран", "14,6\" Dynamic AMOLED 2X, 2960 × 1848"],
              ["Процессор", "MediaTek Dimensity 9400+"],
              ["Оперативная память", "12 ГБ; 16 ГБ в конфигурации 1 ТБ"],
              ["Аккумулятор", "11 600 мА·ч, зарядка до 45 Вт"],
              ["Стилус", "S Pen в комплекте"],
              ["Защита", "IP68"],
            ],
            colors: ["Серебристый", "Графитовый"],
            memoryTiers: mem(MEMORY_LABELS.slice(1, 4), [0, 150, 350]),
          },
        ],
      },
      {
        slug: "samsung-audio",
        name: "Наушники",
        seoTitle: "Наушники Samsung Galaxy Buds — купить в Минске | Di-SMART Electronics",
        seoDescription: "Galaxy Buds — беспроводные наушники Samsung с шумоподавлением.",
        products: [
          {
            slug: "galaxy-buds4",
            name: "Samsung Galaxy Buds4",
            short: "Актуальные Galaxy Buds с Hi-Res Audio",
            desc: "Galaxy Buds4 — беспроводные наушники 2026 года с 24-битным звуком 96 кГц, адаптивным шумоподавлением и улучшенными звонками.",
            basePriceUsd: 149,
            specs: [
              ["Звук", "24 бит / 96 кГц"],
              ["Шумоподавление", "Адаптивное ANC"],
              ["Управление", "Жесты на наушниках"],
            ],
            colors: ["Белый", "Чёрный"],
          },
          {
            slug: "galaxy-buds4-pro",
            name: "Samsung Galaxy Buds4 Pro",
            short: "Флагманские наушники Samsung 2026 года",
            desc: "Galaxy Buds4 Pro — старшая модель с улучшенной посадкой, адаптивным ANC, Hi-Res Audio и наиболее чистой передачей голоса в линейке.",
            basePriceUsd: 249,
            specs: [
              ["Звук", "Hi-Res Audio, 24 бит / 96 кГц"],
              ["Шумоподавление", "Адаптивное ANC"],
              ["Микрофоны", "3 микрофона; обнаружение голоса и сирен"],
            ],
            colors: ["Белый", "Чёрный", "Розовое золото"],
          },
          {
            slug: "galaxy-buds3-fe",
            name: "Samsung Galaxy Buds3 FE",
            short: "Доступные Galaxy Buds с ANC и Galaxy AI",
            desc: "Galaxy Buds3 FE — модель Fan Edition с активным шумоподавлением, защитой IP54 и поддержкой функций Galaxy AI.",
            basePriceUsd: 99,
            specs: [
              ["Шумоподавление", "Активное ANC"],
              ["Защита", "IP54"],
              ["Динамик", "11 мм"],
            ],
            colors: ["Чёрный", "Белый"],
          },
          {
            slug: "galaxy-buds-live",
            name: "Samsung Galaxy Buds Live",
            short: "Наушники с уникальным дизайном «боб»",
            desc: "Galaxy Buds Live — узнаваемый дизайн и комфортная посадка для долгого ношения.",
            basePriceUsd: 89,
            specs: [["Автономность", "до 21 ч с кейсом"]],
            colors: ["Чёрный", "Полночный"],
          },
          {
            slug: "galaxy-buds-fe",
            name: "Samsung Galaxy Buds FE",
            short: "Доступные наушники с шумоподавлением",
            desc: "Galaxy Buds FE — активное шумоподавление по доступной цене.",
            basePriceUsd: 99,
            specs: [["Шумоподавление", "Активное (ANC)"]],
            colors: ["Чёрный", "Белый"],
          },
          {
            slug: "galaxy-buds2-pro",
            name: "Samsung Galaxy Buds2 Pro",
            short: "Проверенная модель с Hi-Fi звуком",
            desc: "Galaxy Buds2 Pro — 24-битный Hi-Fi звук и адаптивное шумоподавление.",
            basePriceUsd: 139,
            specs: [["Звук", "24-bit Hi-Fi"]],
            colors: ["Графитовый", "Белый"],
          },
          {
            slug: "galaxy-buds3",
            name: "Samsung Galaxy Buds3",
            short: "Обновлённый дизайн с ножкой",
            desc: "Galaxy Buds3 — новый дизайн с ножкой для управления и улучшенное шумоподавление.",
            basePriceUsd: 129,
            specs: [["Шумоподавление", "Активное (ANC)"]],
            colors: ["Белый", "Серебристый"],
          },
          {
            slug: "galaxy-buds3-pro",
            name: "Samsung Galaxy Buds3 Pro",
            short: "Топовая модель линейки Galaxy Buds",
            desc: "Galaxy Buds3 Pro — лучшее шумоподавление и звук в линейке, поддержка Hi-Fi 24bit.",
            basePriceUsd: 199,
            specs: [["Шумоподавление", "Активное (ANC), улучшенное"]],
            colors: ["Белый", "Серебристый"],
          },
        ],
      },
      {
        slug: "samsung-laptops",
        name: "Galaxy Book",
        seoTitle: "Ноутбуки Samsung Galaxy Book — Di-SMART",
        seoDescription: "Актуальные ноутбуки Samsung Galaxy Book6 для работы, творчества и экосистемы Galaxy.",
        products: [
          {
            slug: "galaxy-book6",
            name: "Samsung Galaxy Book6",
            short: "Тонкий ноутбук Galaxy для повседневной работы",
            desc: "Galaxy Book6 — универсальный AI PC на Intel Core Ultra с лёгким алюминиевым корпусом и автономностью до 24 часов.",
            basePriceUsd: 1099,
            specs: [
              ["Экран", "14\" 60 Гц или 16\" сенсорный 120 Гц; зависит от конфигурации"],
              ["Процессор", "Intel Core Ultra 5 / 7"],
              ["Оперативная память", "16 ГБ"],
              ["Аккумулятор", "До 24 часов видео"],
            ],
            colors: ["Серый"],
            memoryTiers: mem(["512 ГБ", "1 ТБ"], [0, 250]),
          },
          {
            slug: "galaxy-book6-pro",
            name: "Samsung Galaxy Book6 Pro",
            short: "AMOLED-дисплей и профессиональная мобильность",
            desc: "Galaxy Book6 Pro — тонкий ноутбук с сенсорным Dynamic AMOLED 2X, Wi-Fi 7 и автономностью до 30 часов.",
            basePriceUsd: 1599,
            specs: [
              ["Экран", "14\" или 16\" 3K Dynamic AMOLED 2X, 120 Гц"],
              ["Процессор", "Intel Core Ultra Series 3"],
              ["Связь", "Wi-Fi 7"],
              ["Аккумулятор", "До 30 часов"],
            ],
            colors: ["Серый"],
            memoryTiers: mem(["512 ГБ", "1 ТБ"], [0, 300]),
          },
          {
            slug: "galaxy-book6-ultra",
            name: "Samsung Galaxy Book6 Ultra",
            short: "Самый мощный Galaxy Book с графикой RTX 50",
            desc: "Galaxy Book6 Ultra — 16-дюймовый ноутбук для монтажа, графики и тяжёлых AI-задач с Dynamic AMOLED 2X и дискретной NVIDIA GeForce RTX.",
            basePriceUsd: 2499,
            specs: [
              ["Экран", "16\" 3K Dynamic AMOLED 2X, 120 Гц"],
              ["Процессор", "Intel Core Ultra Series 3"],
              ["Графика", "NVIDIA GeForce RTX 5060 или 5070"],
              ["Память", "До 64 ГБ ОЗУ и 2 ТБ SSD"],
            ],
            colors: ["Серый"],
            memoryTiers: mem(["1 ТБ", "2 ТБ"], [0, 700]),
          },
        ],
      },
    ],
  },
  {
    slug: "xiaomi",
    name: "Xiaomi",
    categories: [
      {
        slug: "xiaomi-smartphones",
        name: "Xiaomi",
        seoTitle: "Смартфоны Xiaomi — Di-SMART",
        seoDescription: "Смартфоны Xiaomi в Di-SMART.",
        products: [
          {
            slug: "xiaomi-17",
            name: "Xiaomi 17",
            short: "Компактный флагман Xiaomi с Leica",
            desc: "Xiaomi 17 — актуальный флагман с процессором Snapdragon 8 Elite Gen 5, камерой Leica и Xiaomi HyperOS 3.",
            basePriceUsd: 899,
            specs: [
              ["Экран", "AMOLED 120 Гц с ультратонкими рамками"],
              ["Процессор", "Snapdragon 8 Elite Gen 5"],
              ["Камера", "Тройная камера Leica"],
              ["Система", "Xiaomi HyperOS 3"],
            ],
            colors: ["Чёрный", "Альпийский розовый", "Ледяной синий", "Авантюриновый зелёный"],
            memoryTiers: mem(["256 ГБ", "512 ГБ"], [0, 120]),
          },
          {
            slug: "xiaomi-17-ultra",
            name: "Xiaomi 17 Ultra",
            short: "Основная камера Leica 1 дюйм и телефото 200 Мп",
            desc: "Xiaomi 17 Ultra — флагман с 1-дюймовой основной камерой Leica 50 Мп и отдельным телефото 200 Мп с переменным оптическим зумом 75–100 мм.",
            basePriceUsd: 1449,
            isFlagship: true,
            mainImage: "/media/xiaomi-17-ultra/hero-poster.webp",
            specs: [
              ["Экран", "6.9\" AMOLED, 1–120 Гц, до 3500 нит"],
              ["Процессор", "Snapdragon 8 Elite Gen 5"],
              ["Камера", "Leica 50 Мп, 1-дюймовый сенсор; телефото 200 Мп, оптический зум 75–100 мм"],
              ["Зарядка", "90 Вт по кабелю, 50 Вт беспроводная"],
            ],
            colors: ["Чёрный", "Белый", "Зелёный"],
            memoryTiers: mem(["512 ГБ", "1 ТБ"], [0, 200]),
          },
          {
            slug: "xiaomi-17t",
            name: "Xiaomi 17T",
            short: "Камера Leica и большая батарея в доступном флагмане",
            desc: "Xiaomi 17T — смартфон с AMOLED-дисплеем 120 Гц, камерой Leica и аккумулятором 6500 мАч с зарядкой 67 Вт.",
            basePriceUsd: 649,
            specs: [
              ["Экран", "6.59\" AMOLED, 120 Гц"],
              ["Процессор", "MediaTek Dimensity 8500-Ultra"],
              ["Камера", "Leica: 50 Мп основная, 50 Мп телефото, 12 Мп сверхширокоугольная"],
              ["Аккумулятор", "6500 мАч, зарядка 67 Вт"],
              ["Защита", "IP68"],
            ],
            colors: ["Чёрный", "Опаловый белый", "Синий", "Фиолетовый"],
            memoryTiers: mem(["256 ГБ", "512 ГБ"], [0, 120]),
          },
          {
            slug: "xiaomi-17t-pro",
            name: "Xiaomi 17T Pro",
            short: "Leica 5×, Dimensity 9500 и аккумулятор 7000 мАч",
            desc: "Xiaomi 17T Pro — старшая модель T-серии с перископической камерой Leica 5×, экраном 144 Гц и зарядкой 100 Вт.",
            basePriceUsd: 849,
            specs: [
              ["Экран", "6.83\" AMOLED 1.5K, 144 Гц, до 3500 нит"],
              ["Процессор", "MediaTek Dimensity 9500"],
              ["Камера", "Leica 50 Мп, перископ 5×, AI Zoom до 120×"],
              ["Аккумулятор", "7000 мАч, 100 Вт и 50 Вт беспроводная зарядка"],
            ],
            colors: ["Чёрный", "Фиолетовый", "Синий"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 120, 280]),
          },
          {
            slug: "redmi-note-15-5g",
            name: "REDMI Note 15 5G",
            short: "Доступный смартфон с 5G и AMOLED-дисплеем",
            desc: "REDMI Note 15 5G — массовая модель с ярким AMOLED-дисплеем, ёмким аккумулятором и поддержкой сетей 5G.",
            basePriceUsd: 299,
            specs: [
              ["Экран", "AMOLED, 120 Гц"],
              ["Связь", "5G"],
              ["Разъём", "USB-C"],
            ],
            colors: ["Чёрный", "Ледяной голубой", "Туманный фиолетовый"],
            memoryTiers: mem(["128 ГБ", "256 ГБ", "512 ГБ"], [0, 60, 120]),
          },
          {
            slug: "redmi-note-15-pro-5g",
            name: "REDMI Note 15 Pro 5G",
            short: "Улучшенная камера и защита в среднем классе",
            desc: "REDMI Note 15 Pro 5G — смартфон среднего класса с AMOLED-дисплеем 120 Гц, камерой высокого разрешения и быстрой зарядкой.",
            basePriceUsd: 399,
            specs: [
              ["Экран", "AMOLED, 120 Гц"],
              ["Камера", "Основная камера с OIS"],
              ["Связь", "5G"],
            ],
            colors: ["Чёрный", "Фиолетовый", "Синий"],
            memoryTiers: mem(["256 ГБ", "512 ГБ"], [0, 100]),
          },
          {
            slug: "redmi-note-15-pro-plus-5g",
            name: "REDMI Note 15 Pro+ 5G",
            short: "Старшая модель REDMI Note с быстрой зарядкой",
            desc: "REDMI Note 15 Pro+ 5G — верхняя модель серии с производительным процессором, продвинутой камерой и самой быстрой зарядкой в линейке.",
            basePriceUsd: 499,
            specs: [
              ["Экран", "AMOLED, 120 Гц"],
              ["Камера", "Основная камера высокого разрешения с OIS"],
              ["Связь", "5G, Wi-Fi 6"],
            ],
            colors: ["Чёрный", "Ледяной голубой", "Мокко"],
            memoryTiers: mem(["256 ГБ", "512 ГБ"], [0, 120]),
          },
        ],
      },
      {
        slug: "laptops",
        name: "Ноутбуки",
        seoTitle: "Ноутбуки Xiaomi Book и RedmiBook — Di-SMART",
        seoDescription: "Ноутбуки для работы, учёбы и творчества.",
        products: [
          {
            slug: "xiaomi-book-pro-14",
            name: "Xiaomi Book Pro 14",
            short: "3.1K OLED 120 Гц на чипе Intel Core Ultra",
            desc: "Xiaomi Book Pro 14 — экран 3.1K OLED 120 Гц, чип Intel Core Ultra X7 358H и до 32 ГБ памяти для работы и монтажа.",
            basePriceUsd: 1499,
            isFlagship: true,
            mainImage: "/media/xiaomi-book-pro-14/hero-poster.jpg",
            specs: [
              ["Экран", "14.6\" 3.1K OLED, 120 Гц"],
              ["Процессор", "Intel Core Ultra X7 358H"],
              ["Память", "До 32 ГБ ОЗУ"],
              ["Аккумулятор", "72 Вт·ч"],
            ],
            colors: ["Серый", "Белый", "Дымчато-голубой", "Розовый"],
            memoryTiers: mem(["512 ГБ", "1 ТБ"], [0, 250]),
          },
          {
            slug: "redmi-book-pro-14-2026",
            name: "REDMI Book Pro 14 2026",
            short: "Компактный производительный ноутбук REDMI",
            desc: "REDMI Book Pro 14 2026 — металлический ноутбук с дисплеем высокого разрешения и актуальным процессором Intel Core Ultra.",
            basePriceUsd: 999,
            specs: [
              ["Экран", "14\" дисплей высокого разрешения, 120 Гц"],
              ["Процессор", "Intel Core Ultra Series 3"],
              ["Корпус", "Металл"],
            ],
            colors: ["Серый", "Серебристый"],
            memoryTiers: mem(["512 ГБ", "1 ТБ"], [0, 200]),
          },
          {
            slug: "redmi-book-pro-16-2026",
            name: "REDMI Book Pro 16 2026",
            short: "Большой экран для работы и творчества",
            desc: "REDMI Book Pro 16 2026 — старшая модель REDMI Book с большим экраном, мощным охлаждением и актуальной платформой Intel.",
            basePriceUsd: 1099,
            specs: [
              ["Экран", "16\" дисплей высокого разрешения, 120 Гц"],
              ["Процессор", "Intel Core Ultra Series 3"],
              ["Корпус", "Металл"],
            ],
            colors: ["Серый", "Серебристый"],
            memoryTiers: mem(["512 ГБ", "1 ТБ", "2 ТБ"], [0, 200, 500]),
          },
          {
            slug: "redmi-book-14-2026",
            name: "REDMI Book 14 2026",
            short: "Практичный ноутбук для учёбы и офиса",
            desc: "REDMI Book 14 2026 — доступный компактный ноутбук для документов, браузера, учёбы и повседневной работы.",
            basePriceUsd: 749,
            specs: [
              ["Экран", "14\" IPS"],
              ["Система", "Windows 11"],
              ["Корпус", "Металл"],
            ],
            colors: ["Серый", "Серебристый"],
            memoryTiers: mem(["512 ГБ", "1 ТБ"], [0, 180]),
          },
          {
            slug: "redmi-book-16-2026",
            name: "REDMI Book 16 2026",
            short: "Большой рабочий ноутбук по разумной цене",
            desc: "REDMI Book 16 2026 — универсальный ноутбук с большим экраном для многозадачности, учёбы и работы.",
            basePriceUsd: 849,
            specs: [
              ["Экран", "16\" IPS"],
              ["Система", "Windows 11"],
              ["Корпус", "Металл"],
            ],
            colors: ["Серый", "Серебристый"],
            memoryTiers: mem(["512 ГБ", "1 ТБ"], [0, 180]),
          },
        ],
      },
      {
        slug: "xiaomi-tablets",
        name: "Планшеты Xiaomi",
        seoTitle: "Планшеты Xiaomi Pad и REDMI Pad — Di-SMART",
        seoDescription: "Актуальные планшеты Xiaomi Pad и REDMI Pad для работы, учёбы и развлечений.",
        products: [
          {
            slug: "xiaomi-pad-8",
            name: "Xiaomi Pad 8",
            short: "Флагманский планшет Xiaomi для работы и развлечений",
            desc: "Xiaomi Pad 8 — актуальный планшет Xiaomi с производительным процессором, дисплеем высокой частоты и HyperOS.",
            basePriceUsd: 499,
            specs: [
              ["Экран", "11,2\" LCD, 3200 × 2136, до 144 Гц"],
              ["Процессор", "Snapdragon 8s Gen 4"],
              ["Аккумулятор", "9200 мАч, зарядка 45 Вт"],
              ["Система", "Xiaomi HyperOS 3"],
              ["Аксессуары", "Клавиатура и стилус поддерживаются"],
            ],
            colors: ["Серый", "Синий", "Зелёный"],
            memoryTiers: mem(["128 ГБ", "256 ГБ", "512 ГБ"], [0, 100, 220]),
          },
          {
            slug: "xiaomi-pad-8-pro",
            name: "Xiaomi Pad 8 Pro",
            short: "Старший Xiaomi Pad для профессиональных задач",
            desc: "Xiaomi Pad 8 Pro — производительный планшет с большим быстрым дисплеем и расширенными возможностями многозадачности.",
            basePriceUsd: 699,
            specs: [
              ["Экран", "11,2\" LCD, 3200 × 2136, до 144 Гц"],
              ["Процессор", "Snapdragon 8 Elite"],
              ["Аккумулятор", "9200 мАч, зарядка 67 Вт"],
              ["Система", "Xiaomi HyperOS 3"],
            ],
            colors: ["Серый", "Синий", "Зелёный"],
            memoryTiers: mem(["128 ГБ", "256 ГБ", "512 ГБ"], [0, 150, 350]),
          },
          {
            slug: "xiaomi-pad-mini",
            name: "Xiaomi Pad Mini",
            short: "Компактный производительный планшет",
            desc: "Xiaomi Pad Mini — компактный планшет с экраном 8.8 дюйма, чипом Dimensity 9400+ и аккумулятором 7500 мАч.",
            basePriceUsd: 449,
            specs: [
              ["Экран", "8.8\" 3K, до 165 Гц"],
              ["Процессор", "MediaTek Dimensity 9400+"],
              ["Аккумулятор", "7500 мАч, зарядка 67 Вт"],
              ["Система", "Xiaomi HyperOS"],
            ],
            colors: ["Серый", "Фиолетовый"],
            memoryTiers: mem(["256 ГБ", "512 ГБ"], [0, 100]),
          },
          {
            slug: "redmi-pad-2-pro",
            name: "REDMI Pad 2 Pro",
            short: "Большой доступный планшет REDMI",
            desc: "REDMI Pad 2 Pro — планшет с большим экраном и ёмкой батареей для фильмов, учёбы и семейного использования.",
            basePriceUsd: 349,
            specs: [
              ["Экран", "Большой LCD-дисплей, 120 Гц"],
              ["Система", "Xiaomi HyperOS"],
              ["Память", "Поддержка microSD"],
            ],
            colors: ["Графитовый", "Серебристый", "Лавандовый"],
            memoryTiers: mem(["128 ГБ", "256 ГБ"], [0, 70]),
          },
        ],
      },
      {
        slug: "xiaomi-audio",
        name: "Наушники Xiaomi",
        seoTitle: "Наушники Xiaomi и REDMI Buds — Di-SMART",
        seoDescription: "Беспроводные наушники REDMI Buds с активным шумоподавлением.",
        products: [
          {
            slug: "redmi-buds-8-lite",
            name: "REDMI Buds 8 Lite",
            short: "Доступные TWS-наушники с шумоподавлением",
            desc: "REDMI Buds 8 Lite — базовая модель с ANC до 42 дБ и удобным управлением через приложение Xiaomi Earbuds.",
            basePriceUsd: 29,
            specs: [
              ["Шумоподавление", "До 42 дБ"],
              ["Микрофоны", "2 микрофона"],
            ],
            colors: ["Чёрный", "Белый", "Синий"],
          },
          {
            slug: "redmi-buds-8",
            name: "REDMI Buds 8",
            short: "Сбалансированные наушники с ANC до 50 дБ",
            desc: "REDMI Buds 8 — универсальные TWS-наушники с активным шумоподавлением до 50 дБ и системой из трёх микрофонов.",
            basePriceUsd: 49,
            specs: [
              ["Шумоподавление", "До 50 дБ"],
              ["Микрофоны", "3 микрофона"],
              ["Автономность", "До 11 ч без кейса / до 44 ч с кейсом при выключенном ANC"],
              ["Защита", "IP54 (наушники)"],
            ],
            colors: ["Чёрный", "Белый", "Зелёный"],
          },
          {
            slug: "redmi-buds-8-pro",
            name: "REDMI Buds 8 Pro",
            short: "Тройной драйвер, Dolby Audio и ANC до 55 дБ",
            desc: "REDMI Buds 8 Pro — старшая модель с коаксиальной системой из трёх драйверов, Dolby Audio и шумоподавлением до 55 дБ.",
            basePriceUsd: 69,
            specs: [
              ["Звук", "Коаксиальная трёхдрайверная система, Dolby Audio"],
              ["Шумоподавление", "До 55 дБ"],
              ["Микрофоны", "3 микрофона"],
            ],
            colors: ["Чёрный", "Белый", "Синий"],
          },
        ],
      },
    ],
  },
  {
    slug: "accessories",
    name: "Аксессуары",
    categories: [
      {
        slug: "chargers",
        name: "Зарядные устройства",
        seoTitle: "Зарядные устройства — купить в Минске | Di-SMART Electronics",
        seoDescription: "Блоки питания и беспроводные зарядки Apple и Samsung.",
        products: [
          {
            slug: "apple-20w-adapter",
            name: "Apple 20W USB-C Power Adapter",
            short: "Компактный блок питания для быстрой зарядки",
            desc: "Оригинальный блок питания Apple 20 Вт для быстрой зарядки iPhone и других устройств с USB-C.",
            basePriceUsd: 19,
            specs: [["Мощность", "20 Вт"], ["Разъём", "USB-C"]],
          },
          {
            slug: "apple-35w-dual-adapter",
            name: "Apple 35W Dual USB-C Power Adapter",
            short: "Заряжайте два устройства одновременно",
            desc: "Компактный блок питания Apple на 35 Вт с двумя портами USB-C для одновременной зарядки.",
            basePriceUsd: 59,
            specs: [["Мощность", "35 Вт"], ["Порты", "2 × USB-C"]],
          },
          {
            slug: "apple-magsafe-charger",
            name: "Apple MagSafe Charger",
            short: "Магнитная беспроводная зарядка для iPhone",
            desc: "MagSafe Charger — беспроводная зарядка с точным магнитным позиционированием для iPhone.",
            basePriceUsd: 45,
            specs: [["Тип", "Беспроводная, MagSafe"], ["Мощность", "до 15 Вт"]],
          },
          {
            slug: "samsung-25w-charger",
            name: "Samsung 25W Fast Charger",
            short: "Быстрая зарядка для устройств Samsung",
            desc: "Блок питания Samsung 25 Вт с поддержкой быстрой зарядки Super Fast Charging.",
            basePriceUsd: 24,
            specs: [["Мощность", "25 Вт"], ["Разъём", "USB-C"]],
          },
          {
            slug: "samsung-45w-charger",
            name: "Samsung 45W Super Fast Charger",
            short: "Максимально быстрая зарядка для флагманов Samsung",
            desc: "Блок питания Samsung 45 Вт для максимально быстрой зарядки флагманских Galaxy.",
            basePriceUsd: 39,
            specs: [["Мощность", "45 Вт"], ["Разъём", "USB-C"]],
          },
        ],
      },
      {
        slug: "cables",
        name: "Кабели",
        seoTitle: "Кабели — купить в Минске | Di-SMART Electronics",
        seoDescription: "Кабели USB-C, Lightning и аудио для устройств Apple и Samsung.",
        products: [
          {
            slug: "cable-usbc-usbc",
            name: "Кабель USB-C — USB-C",
            short: "Кабель для зарядки и передачи данных",
            desc: "Плетёный кабель USB-C — USB-C для зарядки и передачи данных между устройствами.",
            basePriceUsd: 19,
            specs: [["Разъёмы", "USB-C — USB-C"]],
            lengthTiers: mem(LENGTH_LABELS, [0, 10]),
          },
          {
            slug: "cable-usbc-lightning",
            name: "Кабель USB-C — Lightning",
            short: "Для зарядки устройств с разъёмом Lightning",
            desc: "Кабель USB-C — Lightning для зарядки и синхронизации устройств Apple с разъёмом Lightning.",
            basePriceUsd: 19,
            specs: [["Разъёмы", "USB-C — Lightning"]],
            lengthTiers: mem(LENGTH_LABELS, [0, 10]),
          },
          {
            slug: "samsung-cable-usbc-usbc",
            name: "Samsung Кабель USB-C — USB-C",
            short: "Оригинальный кабель Samsung",
            desc: "Оригинальный кабель Samsung USB-C — USB-C для зарядки и передачи данных.",
            basePriceUsd: 15,
            specs: [["Разъёмы", "USB-C — USB-C"]],
          },
          {
            slug: "cable-braided-usbc",
            name: "Кабель USB-C — USB-C, плетёный",
            short: "Усиленный плетёный кабель повышенной прочности",
            desc: "Плетёный кабель USB-C с усиленной оплёткой — повышенная прочность на изгиб.",
            basePriceUsd: 14,
            specs: [["Разъёмы", "USB-C — USB-C"], ["Оплётка", "Нейлон"]],
          },
          {
            slug: "cable-usbc-jack",
            name: "Кабель USB-C — 3.5 мм Jack",
            short: "Подключение проводных наушников к устройствам без разъёма 3.5 мм",
            desc: "Переходной кабель USB-C — 3.5 мм для подключения проводных наушников к устройствам без аудиоразъёма.",
            basePriceUsd: 9,
            specs: [["Разъёмы", "USB-C — 3.5 мм"]],
          },
        ],
      },
      {
        slug: "cases",
        name: "Чехлы",
        seoTitle: "Чехлы — купить в Минске | Di-SMART Electronics",
        seoDescription: "Чехлы для iPhone, Galaxy, iPad и MacBook.",
        products: [
          {
            slug: "iphone-silicone-case",
            name: "Силиконовый чехол для iPhone",
            short: "Оригинальный силиконовый чехол с микрофиброй внутри",
            desc: "Силиконовый чехол с мягкой микрофиброй внутри — надёжная защита без потери тактильных ощущений.",
            basePriceUsd: 39,
            specs: [["Материал", "Силикон"]],
            colors: ["Чёрный", "Синий", "Розовый", "Зелёный"],
          },
          {
            slug: "iphone-clear-case",
            name: "Прозрачный чехол для iPhone",
            short: "Показывает оригинальный цвет устройства",
            desc: "Прозрачный чехол сохраняет оригинальный внешний вид устройства, обеспечивая базовую защиту.",
            basePriceUsd: 29,
            specs: [["Материал", "Поликарбонат"]],
          },
          {
            slug: "galaxy-s25-case",
            name: "Чехол для Samsung Galaxy S25",
            short: "Защитный чехол с усиленными углами",
            desc: "Чехол для Galaxy S25 с усиленными углами для дополнительной защиты от падений.",
            basePriceUsd: 25,
            specs: [["Материал", "TPU"]],
            colors: ["Чёрный", "Серебристый"],
          },
          {
            slug: "ipad-folio-case",
            name: "Чехол-книжка для iPad",
            short: "Защита экрана и подставка для просмотра",
            desc: "Чехол-книжка со смарт-обложкой — защищает экран и складывается в подставку для просмотра.",
            basePriceUsd: 59,
            specs: [["Тип", "Книжка со смарт-обложкой"]],
            colors: ["Чёрный", "Синий"],
          },
          {
            slug: "macbook-sleeve",
            name: "Чехол-рукав для MacBook",
            short: "Мягкая защита при переноске",
            desc: "Чехол-рукав из войлока и экокожи для переноски MacBook в сумке или рюкзаке.",
            basePriceUsd: 45,
            specs: [["Материал", "Войлок, экокожа"]],
            colors: ["Графитовый", "Синий"],
          },
        ],
      },
      {
        slug: "stylus",
        name: "Стилусы",
        seoTitle: "Стилусы — купить в Минске | Di-SMART Electronics",
        seoDescription: "Apple Pencil и S Pen для планшетов Apple и Samsung.",
        products: [
          {
            slug: "apple-pencil-2",
            name: "Apple Pencil (2-го поколения)",
            short: "Для iPad Pro и iPad Air",
            desc: "Apple Pencil 2-го поколения — магнитное крепление и беспроводная зарядка на боковой грани iPad.",
            basePriceUsd: 129,
            specs: [["Зарядка", "Беспроводная, магнитная"]],
          },
          {
            slug: "apple-pencil-pro",
            name: "Apple Pencil Pro",
            short: "С поддержкой жестов сжатия и haptic-отклика",
            desc: "Apple Pencil Pro — жест сжатия для вызова панели инструментов и тактильный отклик.",
            basePriceUsd: 129,
            specs: [["Функции", "Сжатие, haptic-отклик"]],
          },
          {
            slug: "apple-pencil-usb-c",
            name: "Apple Pencil (USB-C)",
            short: "Доступная модель с зарядкой через USB-C",
            desc: "Apple Pencil с разъёмом USB-C — доступная модель для базовых задач рисования и заметок.",
            basePriceUsd: 79,
            specs: [["Зарядка", "USB-C"]],
          },
          {
            slug: "s-pen-pro",
            name: "Samsung S Pen Pro",
            short: "Универсальный стилус для устройств Galaxy",
            desc: "S Pen Pro — универсальный стилус, совместимый с несколькими устройствами линейки Galaxy.",
            basePriceUsd: 99,
            specs: [["Совместимость", "Galaxy Tab, Galaxy S Ultra"]],
          },
        ],
      },
    ],
  },
];

function normalizeProductIdentity(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/\s+/g, " ")
    .trim();
}

function assertUniqueProductDefinitions(): void {
  const seenSlugs = new Map<string, string>();
  const seenNames = new Map<string, string>();

  for (const brand of BRANDS) {
    for (const category of brand.categories) {
      for (const product of category.products) {
        const location = `${brand.name} / ${category.name}`;
        const previousSlug = seenSlugs.get(product.slug);
        if (previousSlug) {
          throw new Error(`Duplicate product slug "${product.slug}": ${previousSlug} and ${location}`);
        }
        seenSlugs.set(product.slug, location);

        const identity = normalizeProductIdentity(product.name);
        const previousName = seenNames.get(identity);
        if (previousName) {
          throw new Error(`Duplicate product name "${product.name}": ${previousName} and ${location}`);
        }
        seenNames.set(identity, location);
      }
    }
  }
}

async function resetProductChildren(productId: string) {
  await prisma.productVariantOption.deleteMany({ where: { variant: { productId } } });
  await prisma.productVariant.deleteMany({ where: { productId } });
  await prisma.productVariantAttribute.deleteMany({ where: { productId } });
  await prisma.productImage.deleteMany({ where: { productId } });
  await prisma.productColorValue.deleteMany({ where: { productId } });
  await prisma.productSpec.deleteMany({ where: { productId } });
}

async function markAttributeUsed(productId: string, attributeId: string) {
  await prisma.productVariantAttribute.upsert({
    where: { productId_attributeId: { productId, attributeId } },
    update: {},
    create: { productId, attributeId },
  });
}

async function main() {
  assertUniqueProductDefinitions();
  if (process.env.SEED_DRY_RUN === "1") {
    const definitions = BRANDS.flatMap((brand) => brand.categories.flatMap((category) => category.products));
    const existingRows = await prisma.product.findMany({
      where: { slug: { in: definitions.map((product) => product.slug) } },
      select: {
        slug: true,
        colorValues: { select: { attributeValue: { select: { value: true } } } },
        variants: { select: { options: { select: { attributeValue: {
          select: { value: true, attribute: { select: { slug: true } } },
        } } } } },
      },
    });
    const existing = new Map(existingRows.map((product) => [product.slug, product]));
    const missing = definitions.map((product) => product.slug).filter((slug) => !existing.has(slug));
    const optionDifferences: { slug: string; field: string; expected: string[]; actual: string[] }[] = [];
    const sortedUnique = (items: string[]) => [...new Set(items)].sort();
    for (const def of definitions) {
      const row = existing.get(def.slug);
      if (!row) continue;
      const dimensions = [
        ["color", def.colors ?? [], row.colorValues.map((value) => value.attributeValue.value)],
        ["memory", def.memoryTiers?.map((tier) => tier.label) ?? [], row.variants.flatMap((variant) =>
          variant.options.filter((option) => option.attributeValue.attribute.slug === "memory")
            .map((option) => option.attributeValue.value))],
      ] as const;
      for (const [field, expectedValues, actualValues] of dimensions) {
        const expected = sortedUnique([...expectedValues]);
        const actual = sortedUnique(actualValues);
        if (expected.join("|") !== actual.join("|")) optionDifferences.push({ slug: def.slug, field, expected, actual });
      }
    }
    console.log(JSON.stringify({ totalDefinitions: definitions.length, existing: existing.size, missing, optionDifferences }, null, 2));
    return;
  }
  console.log("Сидирование: бренды и категории...");
  const onlyCreateMissingProducts = process.env.SEED_ONLY_NEW === "1";
  const targetSlugs = process.env.SEED_TARGET_SLUGS
    ? new Set(process.env.SEED_TARGET_SLUGS.split(",").map((slug) => slug.trim()).filter(Boolean))
    : null;
  if (targetSlugs && onlyCreateMissingProducts) throw new Error("SEED_TARGET_SLUGS and SEED_ONLY_NEW cannot be combined");
  if (targetSlugs) {
    const definitions = new Set(BRANDS.flatMap((brand) => brand.categories.flatMap((category) =>
      category.products.map((product) => product.slug))));
    for (const slug of targetSlugs) if (!definitions.has(slug)) throw new Error(`Unknown target slug: ${slug}`);
    const rows = await prisma.product.findMany({
      where: { slug: { in: [...targetSlugs] } },
      select: { slug: true, _count: { select: { orderItems: true, images: true } },
        colorValues: { select: { _count: { select: { offers: true } } } } },
    });
    for (const row of rows) {
      const offerCount = row.colorValues.reduce((sum, color) => sum + color._count.offers, 0);
      if (row._count.orderItems || row._count.images || offerCount) {
        throw new Error(`Refusing to reset ${row.slug}: orders=${row._count.orderItems}, images=${row._count.images}, colorOffers=${offerCount}`);
      }
    }
  }

  const attrMemory = await prisma.variantAttribute.upsert({
    where: { slug: "memory" },
    update: {},
    create: { slug: "memory", name: "Память", sortOrder: 1, isColor: false },
  });
  const attrSim = await prisma.variantAttribute.upsert({
    where: { slug: "sim" },
    update: {},
    create: { slug: "sim", name: "SIM", sortOrder: 2, isColor: false },
  });
  const attrSize = await prisma.variantAttribute.upsert({
    where: { slug: "size" },
    update: {},
    create: { slug: "size", name: "Размер", sortOrder: 3, isColor: false },
  });
  const attrLength = await prisma.variantAttribute.upsert({
    where: { slug: "length" },
    update: {},
    create: { slug: "length", name: "Длина", sortOrder: 4, isColor: false },
  });
  const attrColor = await prisma.variantAttribute.upsert({
    where: { slug: "color" },
    update: {},
    create: { slug: "color", name: "Цвет", sortOrder: 5, isColor: true },
  });
  const attrConfiguration = await prisma.variantAttribute.upsert({
    where: { slug: "configuration" },
    update: { name: "ОЗУ / SSD" },
    create: { slug: "configuration", name: "ОЗУ / SSD", sortOrder: 1, isColor: false },
  });

  async function upsertValue(attributeId: string, value: string, sortOrder: number, colorHex?: string) {
    return prisma.variantAttributeValue.upsert({
      where: { attributeId_value: { attributeId, value } },
      update: { sortOrder, colorHex },
      create: { attributeId, value, sortOrder, colorHex },
    });
  }

  const memoryValueIds = new Map<string, string>();
  for (const [i, label] of MEMORY_LABELS.entries()) {
    memoryValueIds.set(label, (await upsertValue(attrMemory.id, label, i)).id);
  }
  memoryValueIds.set("64 ГБ", (await upsertValue(attrMemory.id, "64 ГБ", -1)).id);
  const simValueIds = new Map<string, string>();
  for (const [i, label] of SIM_LABELS.entries()) {
    simValueIds.set(label, (await upsertValue(attrSim.id, label, i)).id);
  }
  const sizeValueIds = new Map<string, string>();
  for (const [i, label] of SIZE_LABELS.entries()) {
    sizeValueIds.set(label, (await upsertValue(attrSize.id, label, i)).id);
  }
  const lengthValueIds = new Map<string, string>();
  for (const [i, label] of LENGTH_LABELS.entries()) {
    lengthValueIds.set(label, (await upsertValue(attrLength.id, label, i)).id);
  }
  const colorValueIds = new Map<string, string>();
  {
    let i = 0;
    for (const [name, hex] of Object.entries(COLORS)) {
      colorValueIds.set(name, (await upsertValue(attrColor.id, name, i, hex)).id);
      i += 1;
    }
  }
  const configurationValueIds = new Map<string, string>();
  for (const [index, label] of ["16 ГБ / 512 ГБ", "16 ГБ / 1 ТБ", "24 ГБ / 1 ТБ"].entries()) {
    configurationValueIds.set(label, (await upsertValue(attrConfiguration.id, label, index)).id);
  }

  const existingRateCount = await prisma.exchangeRate.count();
  if (existingRateCount === 0) {
    await prisma.exchangeRate.create({
      data: { usdToByn: 3.1, setBy: "seed" },
    });
    console.log("Начальный курс создан: 1 USD = 3.10 BYN");
  }

  let brandSortOrder = 0;
  for (const brandDef of BRANDS) {
    if (targetSlugs && !brandDef.categories.some((category) =>
      category.products.some((product) => targetSlugs.has(product.slug)))) continue;
    const brand = await prisma.brand.upsert({
      where: { slug: brandDef.slug },
      update: onlyCreateMissingProducts || targetSlugs ? {} : { name: brandDef.name, sortOrder: brandSortOrder },
      create: { slug: brandDef.slug, name: brandDef.name, sortOrder: brandSortOrder },
    });
    brandSortOrder += 1;

    let categorySortOrder = 0;
    for (const categoryDef of brandDef.categories) {
      if (targetSlugs && !categoryDef.products.some((product) => targetSlugs.has(product.slug))) continue;
      const mergedCategory = CATEGORY_MERGES[categoryDef.slug];
      const categorySlug = mergedCategory?.slug ?? categoryDef.slug;
      const categoryName = mergedCategory?.name ?? categoryDef.name;
      const existingMergedCategory = mergedCategory
        ? await prisma.category.findUnique({ where: { slug: categorySlug } })
        : null;
      const category = await prisma.category.upsert({
        where: { slug: categorySlug },
        update: onlyCreateMissingProducts || targetSlugs ? {} : {
          isActive: !INACTIVE_CATEGORY_SLUGS.has(categorySlug),
          name: existingMergedCategory?.name ?? categoryName,
          brandId: existingMergedCategory?.brandId ?? brand.id,
          sortOrder: existingMergedCategory?.sortOrder ?? categorySortOrder,
          seoTitle: existingMergedCategory?.seoTitle ?? mergedCategory?.seoTitle ?? categoryDef.seoTitle,
          seoDescription: existingMergedCategory?.seoDescription ?? mergedCategory?.seoDescription ?? categoryDef.seoDescription,
          h1: existingMergedCategory?.h1 ?? categoryName,
        },
        create: {
          isActive: !INACTIVE_CATEGORY_SLUGS.has(categorySlug),
          slug: categorySlug,
          name: categoryName,
          brandId: brand.id,
          sortOrder: categorySortOrder,
          seoTitle: mergedCategory?.seoTitle ?? categoryDef.seoTitle,
          seoDescription: mergedCategory?.seoDescription ?? categoryDef.seoDescription,
          h1: categoryName,
        },
      });
      categorySortOrder += 1;

      let productSortOrder = 0;
      for (const def of categoryDef.products) {
        if (targetSlugs && !targetSlugs.has(def.slug)) continue;
        const existingProduct = onlyCreateMissingProducts
          ? await prisma.product.findUnique({ where: { slug: def.slug }, select: { id: true } })
          : null;
        // Рабочий каталог может содержать проверенные BYN-цены, остатки,
        // изображения и правки менеджера. Режим добавления новых товаров
        // обязан оставлять существующую карточку полностью нетронутой.
        if (onlyCreateMissingProducts && existingProduct) {
          productSortOrder += 1;
          continue;
        }
        const product = await prisma.product.upsert({
          where: { slug: def.slug },
          update: {
            categoryId: category.id,
            brandId: brand.id,
            name: def.name,
            shortDescription: def.short,
            description: def.desc,
            basePriceUsd: def.basePriceUsd,
            isFlagship: def.isFlagship ?? false,
            isActive: true,
            availability: def.outOfStock ? "OUT_OF_STOCK" : "IN_STOCK",
            sortOrder: productSortOrder,
          },
          create: {
            slug: def.slug,
            categoryId: category.id,
            brandId: brand.id,
            name: def.name,
            shortDescription: def.short,
            description: def.desc,
            basePriceUsd: def.basePriceUsd,
            isFlagship: def.isFlagship ?? false,
            isActive: true,
            availability: def.outOfStock ? "OUT_OF_STOCK" : "IN_STOCK",
            sortOrder: productSortOrder,
          },
        });
        productSortOrder += 1;

        await resetProductChildren(product.id);

        const productSpecs = withCatalogSpecAdditions(def.slug, def.specs);
        if (productSpecs.length > 0) {
          await prisma.productSpec.createMany({
            data: productSpecs.map(([name, value], i) => ({
              productId: product.id,
              name,
              value,
              sortOrder: i,
            })),
          });
        }

        const colorValueRowIds = new Map<string, string>();
        for (const colorName of def.colors ?? []) {
          const attributeValueId = colorValueIds.get(colorName);
          if (!attributeValueId) continue;
          const cv = await prisma.productColorValue.create({
            data: { productId: product.id, attributeValueId },
          });
          colorValueRowIds.set(colorName, cv.id);
        }

        const samsungImages: Record<string, string> | undefined = samsungColorImages[def.slug as keyof typeof samsungColorImages];
        const colorImages: Record<string, string> | undefined = samsungImages
          ?? appleColorImages[def.slug as keyof typeof appleColorImages] ?? def.colorImages;
        if (def.mainImage) {
          const mainColorName = samsungImages
            ? Object.entries(samsungImages).find(([, url]) => url === def.mainImage)?.[0]
            : def.colors?.[0];
          const firstColorValueId = mainColorName
            ? colorValueRowIds.get(mainColorName)
            : undefined;
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: def.mainImage,
              alt: def.name,
              isMain: true,
              sortOrder: 0,
              colorValueId: firstColorValueId,
            },
          });
        }

        let colorImageSortOrder = def.mainImage ? 1 : 0;
        for (const colorName of def.colors ?? []) {
          const imageUrl = colorImages?.[colorName];
          const colorValueId = colorValueRowIds.get(colorName);
          if (!imageUrl || !colorValueId || imageUrl === def.mainImage) continue;
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: imageUrl,
              alt: `${def.name}, цвет ${colorName}`,
              isMain: !def.mainImage && colorImageSortOrder === 0,
              sortOrder: colorImageSortOrder,
              colorValueId,
            },
          });
          colorImageSortOrder += 1;
        }

        // Варианты: точное совпадение набора атрибутов, комбинации создаются
        // явно (память × SIM только для iPhone), не декартовым произведением "на лету".
        if (def.configurationTiers) {
          await markAttributeUsed(product.id, attrConfiguration.id);
          for (const [sortOrder, tier] of def.configurationTiers.entries()) {
            const variant = await prisma.productVariant.create({
              data: {
                productId: product.id,
                priceUsd: def.basePriceUsd + tier.deltaUsd,
                availability: def.outOfStock ? "OUT_OF_STOCK" : "IN_STOCK",
                isDefault: sortOrder === 0,
                sortOrder,
              },
            });
            await prisma.productVariantOption.create({
              data: { variantId: variant.id, attributeValueId: configurationValueIds.get(tier.label)! },
            });
          }
        } else if (def.memoryTiers && def.simOptions) {
          await markAttributeUsed(product.id, attrMemory.id);
          await markAttributeUsed(product.id, attrSim.id);
          let sortOrder = 0;
          for (const memTier of def.memoryTiers) {
            for (const simLabel of def.simOptions) {
              const memValueId = memoryValueIds.get(memTier.label)!;
              const simValueId = simValueIds.get(simLabel)!;
              const variant = await prisma.productVariant.create({
                data: {
                  productId: product.id,
                  priceUsd: def.basePriceUsd + memTier.deltaUsd,
                  availability: def.outOfStock || def.oosTierLabels?.includes(memTier.label) ? "OUT_OF_STOCK" : "IN_STOCK",
                  isDefault: sortOrder === 0,
                  sortOrder,
                },
              });
              await prisma.productVariantOption.createMany({
                data: [
                  { variantId: variant.id, attributeValueId: memValueId },
                  { variantId: variant.id, attributeValueId: simValueId },
                ],
              });
              sortOrder += 1;
            }
          }
        } else if (def.memoryTiers) {
          await markAttributeUsed(product.id, attrMemory.id);
          let sortOrder = 0;
          for (const tier of def.memoryTiers) {
            const memValueId = memoryValueIds.get(tier.label)!;
            const variant = await prisma.productVariant.create({
              data: {
                productId: product.id,
                priceUsd: def.basePriceUsd + tier.deltaUsd,
                availability: def.outOfStock || def.oosTierLabels?.includes(tier.label) ? "OUT_OF_STOCK" : "IN_STOCK",
                isDefault: sortOrder === 0,
                sortOrder,
              },
            });
            await prisma.productVariantOption.create({
              data: { variantId: variant.id, attributeValueId: memValueId },
            });
            sortOrder += 1;
          }
        } else if (def.sizeTiers) {
          await markAttributeUsed(product.id, attrSize.id);
          let sortOrder = 0;
          for (const tier of def.sizeTiers) {
            const sizeValueId = sizeValueIds.get(tier.label)!;
            const variant = await prisma.productVariant.create({
              data: {
                productId: product.id,
                priceUsd: def.basePriceUsd + tier.deltaUsd,
                availability: def.outOfStock || def.oosTierLabels?.includes(tier.label) ? "OUT_OF_STOCK" : "IN_STOCK",
                isDefault: sortOrder === 0,
                sortOrder,
              },
            });
            await prisma.productVariantOption.create({
              data: { variantId: variant.id, attributeValueId: sizeValueId },
            });
            sortOrder += 1;
          }
        } else if (def.lengthTiers) {
          await markAttributeUsed(product.id, attrLength.id);
          let sortOrder = 0;
          for (const tier of def.lengthTiers) {
            const lengthValueId = lengthValueIds.get(tier.label)!;
            const variant = await prisma.productVariant.create({
              data: {
                productId: product.id,
                priceUsd: def.basePriceUsd + tier.deltaUsd,
                availability: def.outOfStock || def.oosTierLabels?.includes(tier.label) ? "OUT_OF_STOCK" : "IN_STOCK",
                isDefault: sortOrder === 0,
                sortOrder,
              },
            });
            await prisma.productVariantOption.create({
              data: { variantId: variant.id, attributeValueId: lengthValueId },
            });
            sortOrder += 1;
          }
        }
      }
    }
  }

  if (!onlyCreateMissingProducts && !targetSlugs) {
    await prisma.product.updateMany({
      where: { slug: { in: RETIRED_PRODUCT_SLUGS } },
      data: { isActive: false },
    });

    for (const [sourceSlug, target] of Object.entries(CATEGORY_MERGES)) {
      const [source, targetCategory] = await Promise.all([
        prisma.category.findUnique({ where: { slug: sourceSlug }, select: { id: true } }),
        prisma.category.findUnique({ where: { slug: target.slug }, select: { id: true } }),
      ]);
      if (!source || !targetCategory) continue;
      await prisma.product.updateMany({
        where: { categoryId: source.id },
        data: { categoryId: targetCategory.id },
      });
      await prisma.category.delete({ where: { id: source.id } });
    }
  }

  if (!onlyCreateMissingProducts && !targetSlugs) {
    await syncClientSamsung(prisma);
    await syncSamsungColorImages(prisma);
  }
  console.log("Сидирование завершено.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
