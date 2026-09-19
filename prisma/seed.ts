import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
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
};

const MEMORY_LABELS = ["128 ГБ", "256 ГБ", "512 ГБ", "1 ТБ", "2 ТБ", "4 ТБ", "8 ТБ"];
const SIM_LABELS = ["SIM", "eSIM", "SIM + eSIM"];
const SIZE_LABELS = ["41 мм", "45 мм", "49 мм"];
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
  colors?: string[];
  memoryTiers?: Tier[];
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
            basePriceUsd: 799,
            specs: [
              ["Экран", "6.3\" Super Retina XDR"],
              ["Чип", "Apple A19"],
              ["Камера", "48 + 12 Мп"],
              ["Аккумулятор", "до 27 ч видео"],
            ],
            colors: ["Чёрный", "Белый", "Синий", "Розовый", "Зелёный"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 3), [0, 100, 300]),
            simOptions: SIM_LABELS,
          },
          {
            slug: "iphone-17-pro",
            name: "iPhone 17 Pro",
            short: "Титановый корпус, чип A19 Pro, профессиональная камера",
            desc: "iPhone 17 Pro — титановый корпус, чип A19 Pro и продвинутая система камер с 5-кратным зумом.",
            basePriceUsd: 999,
            isFlagship: true,
            specs: [
              ["Экран", "6.3\" OLED Super Retina XDR, ProMotion 120 Гц, 3000 нит на солнце"],
              ["Чип", "Apple A19 Pro, вейпор-охлаждение"],
              ["Камера", "48 + 48 + 12 Мп, оптический зум 4x/8x, цифровой до 40x"],
              ["Корпус", "Алюминий + Ceramic Shield 2"],
              ["Аккумулятор", "До 33 ч видео, быстрая зарядка 40 Вт / MagSafe"],
              ["Цвета", "Silver, Cosmic Orange, Deep Blue"],
              ["Память", "256 ГБ – 2 ТБ"],
            ],
            colors: ["Титан", "Чёрный", "Синий"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 4), [0, 100, 300, 500]),
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
              ["Камера", "48 + 48 + 12 Мп, 5x зум"],
              ["Корпус", "Титан"],
              ["Аккумулятор", "до 33 ч видео"],
            ],
            colors: ["Титан", "Чёрный", "Синий", "Полночный"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 4), [0, 100, 300, 500]),
            simOptions: SIM_LABELS,
            oosTierLabels: ["1 ТБ"],
          },
          {
            slug: "iphone-18-pro",
            name: "iPhone 18 Pro",
            short: "Чип A20 Pro, система камер Pro и четыре цвета корпуса",
            desc: "iPhone 18 Pro с дисплеем Super Retina XDR, чипом A20 Pro и тройной системой камер 48 Мп.",
            basePriceUsd: 1299,
            isFlagship: true,
            mainImage: "/media/iphone-18-pro/images/natural/design-burgundy.webp",
            specs: [
              ["Экран", "6.3\" Super Retina XDR, ProMotion 120 Гц"],
              ["Чип", "Apple A20 Pro"],
              ["Камера", "Три камеры 48 Мп, зум оптического качества до 8×"],
              ["Корпус", "Металл и Ceramic Shield"],
              ["Разъём", "USB-C"],
            ],
            colors: ["Бордовый", "Ледниковый", "Серебристый", "Чёрный"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 4), [0, 100, 300, 500]),
            simOptions: SIM_LABELS,
          },
          {
            slug: "iphone-18-pro-max",
            name: "iPhone 18 Pro Max",
            short: "iPhone 18 Pro с самым большим экраном и батареей",
            desc: "iPhone 18 Pro Max — тот же чип A20 Pro и система камер Pro, но с дисплеем 6.9\" и рекордной для линейки автономностью.",
            basePriceUsd: 1499,
            isFlagship: true,
            mainImage: "/media/iphone-18-pro/images/natural/design-burgundy.webp",
            specs: [
              ["Экран", "6.9\" Super Retina XDR, ProMotion 120 Гц"],
              ["Чип", "Apple A20 Pro"],
              ["Камера", "Три камеры 48 Мп, зум оптического качества до 8×"],
              ["Корпус", "Металл и Ceramic Shield"],
              ["Разъём", "USB-C"],
            ],
            colors: ["Бордовый", "Ледниковый", "Серебристый", "Чёрный"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 5), [0, 100, 300, 500, 900]),
            simOptions: SIM_LABELS,
          },
          {
            slug: "iphone-air",
            name: "iPhone Air",
            short: "Самый тонкий iPhone с чипом A19",
            desc: "iPhone Air — рекордно тонкий корпус без компромиссов по производительности благодаря чипу A19.",
            basePriceUsd: 899,
            specs: [
              ["Экран", "6.5\" Super Retina XDR"],
              ["Чип", "Apple A19"],
              ["Толщина", "5.6 мм"],
            ],
            colors: ["Серебристый", "Полночный", "Золотой"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 3), [0, 100, 300]),
            simOptions: SIM_LABELS,
          },
          {
            slug: "iphone-16e",
            name: "iPhone 16e",
            short: "Доступный iPhone с чипом A18",
            desc: "iPhone 16e — доступная точка входа в экосистему Apple с чипом A18 и Apple Intelligence.",
            basePriceUsd: 599,
            outOfStock: true,
            specs: [
              ["Экран", "6.1\" Super Retina XDR"],
              ["Чип", "Apple A18"],
              ["Камера", "48 Мп"],
            ],
            colors: ["Чёрный", "Белый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 2), [0, 100]),
            simOptions: SIM_LABELS,
            // Наличие товара с вариантами определяется по варианту, а не по
            // Product.availability (он — fallback только для товаров без
            // вариантов) — чтобы товар был реально "нет в наличии" на витрине
            // при любом выборе, помечаем недоступными все его тиры памяти.
            oosTierLabels: MEMORY_LABELS.slice(0, 2),
          },
          {
            slug: "iphone-16",
            name: "iPhone 16",
            short: "Проверенный флагман прошлого поколения",
            desc: "iPhone 16 — надёжный выбор прошлого поколения с чипом A18 и системой из двух камер.",
            basePriceUsd: 699,
            specs: [
              ["Экран", "6.1\" Super Retina XDR"],
              ["Чип", "Apple A18"],
              ["Камера", "48 + 12 Мп"],
            ],
            colors: ["Чёрный", "Розовый", "Зелёный"],
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
            name: "iPad (11-е поколение)",
            short: "Доступный iPad для учёбы и повседневных задач",
            desc: "iPad 11-го поколения — быстрый чип A16 и большой дисплей Liquid Retina для учёбы, работы и развлечений.",
            basePriceUsd: 349,
            specs: [
              ["Экран", "10.9\" Liquid Retina"],
              ["Чип", "Apple A16"],
            ],
            colors: ["Синий", "Розовый", "Серебристый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 2), [0, 70]),
          },
          {
            slug: "ipad-air-11",
            name: "iPad Air 11\"",
            short: "Баланс мощности и портативности",
            desc: "iPad Air 11\" с чипом M3 — мощный планшет для творческих задач в компактном корпусе.",
            basePriceUsd: 599,
            specs: [
              ["Экран", "11\" Liquid Retina"],
              ["Чип", "Apple M3"],
            ],
            colors: ["Синий", "Полночный", "Серебристый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 3), [0, 100, 300]),
          },
          {
            slug: "ipad-air-13",
            name: "iPad Air 13\"",
            short: "Большой экран для многозадачности",
            desc: "iPad Air 13\" — увеличенный дисплей Liquid Redina и чип M3 для комфортной многозадачности.",
            basePriceUsd: 799,
            specs: [
              ["Экран", "13\" Liquid Retina"],
              ["Чип", "Apple M3"],
            ],
            colors: ["Синий", "Полночный"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 3), [0, 100, 300]),
          },
          {
            slug: "ipad-pro-11",
            name: "iPad Pro 11\"",
            short: "Дисплей Ultra Retina XDR, чип M5",
            desc: "iPad Pro 11\" с дисплеем Ultra Retina XDR и чипом M5 — профессиональный инструмент в компактном корпусе.",
            basePriceUsd: 999,
            specs: [
              ["Экран", "11\" Ultra Retina XDR"],
              ["Чип", "Apple M5"],
            ],
            colors: ["Серебристый", "Графитовый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 4), [0, 200, 400, 800]),
          },
          {
            slug: "ipad-pro-13",
            name: "iPad Pro 13\"",
            short: "Самый большой и мощный iPad",
            desc: "iPad Pro 13\" — вершина линейки планшетов Apple: дисплей Ultra Retina XDR и чип M5.",
            basePriceUsd: 1299,
            specs: [
              ["Экран", "13\" Ultra Retina XDR"],
              ["Чип", "Apple M5"],
            ],
            colors: ["Серебристый", "Графитовый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 4), [0, 200, 400, 800]),
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
            slug: "macbook-air-13-m4",
            name: "MacBook Air 13\" M4",
            short: "Лёгкий и быстрый ноутбук на чипе M4",
            desc: "MacBook Air 13\" на чипе M4 — тонкий корпус, тихая работа без вентилятора и целый день автономности.",
            basePriceUsd: 1099,
            specs: [
              ["Экран", "13.6\" Liquid Retina"],
              ["Чип", "Apple M4"],
              ["Аккумулятор", "до 18 ч"],
            ],
            colors: ["Серебристый", "Полночный", "Титан"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 200, 500]),
          },
          {
            slug: "macbook-air-15-m4",
            name: "MacBook Air 15\" M4",
            short: "Больше экрана без потери портативности",
            desc: "MacBook Air 15\" M4 — просторный дисплей для многозадачности при той же лёгкости корпуса.",
            basePriceUsd: 1299,
            specs: [
              ["Экран", "15.3\" Liquid Retina"],
              ["Чип", "Apple M4"],
            ],
            colors: ["Серебристый", "Полночный"],
            memoryTiers: mem(["256 ГБ", "512 ГБ", "1 ТБ"], [0, 200, 500]),
          },
          {
            slug: "macbook-pro-14-m5",
            name: "MacBook Pro 14\" M5",
            short: "Профессиональная производительность на чипе M5",
            desc: "MacBook Pro 14\" M5 — дисплей Liquid Retina XDR и производительность для профессиональных задач.",
            basePriceUsd: 1599,
            specs: [
              ["Экран", "14.2\" Liquid Retina XDR"],
              ["Чип", "Apple M5"],
            ],
            colors: ["Серебристый", "Графитовый"],
            memoryTiers: mem(["512 ГБ", "1 ТБ", "2 ТБ"], [0, 300, 700]),
          },
          {
            slug: "macbook-pro-14-m5-pro",
            name: "MacBook Pro 14\" M5 Pro",
            short: "Больше ядер для тяжёлых нагрузок",
            desc: "MacBook Pro 14\" на чипе M5 Pro — для видеомонтажа, 3D и других требовательных задач.",
            basePriceUsd: 1999,
            specs: [
              ["Экран", "14.2\" Liquid Retina XDR"],
              ["Чип", "Apple M5 Pro"],
            ],
            colors: ["Серебристый", "Графитовый"],
            memoryTiers: mem(["512 ГБ", "1 ТБ", "2 ТБ"], [0, 300, 700]),
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
            memoryTiers: mem(["1 ТБ", "2 ТБ", "4 ТБ", "8 ТБ"], [0, 500, 1500, 3500]),
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
            slug: "watch-se-3",
            name: "Apple Watch SE 3",
            short: "Доступные умные часы с ключевыми функциями здоровья",
            desc: "Apple Watch SE 3 — доступный вход в экосистему Apple Watch с отслеживанием сна, тренировок и уведомлениями.",
            basePriceUsd: 249,
            specs: [
              ["Экран", "Retina LTPO"],
              ["Датчики", "Пульс, сон, активность"],
            ],
            colors: ["Полночный", "Звёздный"],
            sizeTiers: mem(SIZE_LABELS.slice(0, 2), [0, 30]),
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
            colors: ["Полночный", "Серебристый", "Розовый"],
            sizeTiers: mem(SIZE_LABELS.slice(0, 2), [0, 30]),
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
            colors: ["Полночный", "Серебристый"],
            sizeTiers: mem(SIZE_LABELS.slice(0, 2), [0, 30]),
          },
          {
            slug: "watch-ultra-3",
            name: "Apple Watch Ultra 3",
            short: "Самые прочные и автономные часы Apple",
            desc: "Apple Watch Ultra 3 — титановый корпус, спутниковая связь и автономность до 3 суток.",
            basePriceUsd: 799,
            specs: [
              ["Корпус", "Титан"],
              ["Автономность", "до 72 ч"],
              ["Связь", "Спутниковая связь"],
            ],
            colors: ["Титан"],
            sizeTiers: mem(["49 мм"], [0]),
          },
          {
            slug: "apple-watch-ultra-4",
            name: "Apple Watch Ultra 4",
            short: "Титановый корпус 49 мм и автономность до 50 часов",
            desc: "Apple Watch Ultra 4 — титан Grade 5, автономность до 50 часов и водонепроницаемость 40 метров для тех, кто идёт дальше.",
            basePriceUsd: 849,
            isFlagship: true,
            specs: [
              ["Корпус", "Титан Grade 5, 49 мм"],
              ["Автономность", "До 50 ч в обычном режиме"],
              ["Водонепроницаемость", "40 метров"],
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
            sizeTiers: mem(SIZE_LABELS.slice(0, 2), [0, 30]),
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
            slug: "airpods-4",
            name: "AirPods 4",
            short: "Обновлённый дизайн и улучшенный звук",
            desc: "AirPods 4 — открытый дизайн, улучшенное качество звука и адаптивный эквалайзер.",
            basePriceUsd: 129,
            specs: [
              ["Автономность", "до 30 ч с кейсом"],
              ["Защита", "IP54"],
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
              ["Автономность", "до 20 ч с кейсом"],
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
            name: "AirPods Max",
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
            slug: "earpods-usb-c",
            name: "EarPods USB-C",
            short: "Проводные наушники с разъёмом USB-C",
            desc: "EarPods с разъёмом USB-C — простое проводное решение без необходимости заряда.",
            basePriceUsd: 19,
            specs: [["Тип", "Проводные, вставные"]],
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
            slug: "galaxy-s25",
            name: "Samsung Galaxy S25",
            short: "Флагманская линейка Samsung нового поколения",
            desc: "Galaxy S25 — мощный процессор, продвинутая камера и функции Galaxy AI.",
            basePriceUsd: 799,
            specs: [
              ["Экран", "6.2\" Dynamic AMOLED 2X"],
              ["Процессор", "Snapdragon 8 Gen 4"],
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
              ["Экран", "6.7\" Dynamic AMOLED 2X"],
              ["Процессор", "Snapdragon 8 Gen 4"],
            ],
            colors: ["Чёрный", "Синий"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 3), [0, 100, 300]),
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
            colors: ["Чёрный", "Титан", "Синий"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 4), [0, 100, 300, 500]),
          },
          {
            slug: "galaxy-s26-ultra",
            name: "Samsung Galaxy S26 Ultra",
            short: "Galaxy AI, S Pen и камера 200 Мп в корпусе Armor Aluminium",
            desc: "Galaxy S26 Ultra — Samsung отказалась от титана в пользу Armor Aluminium, сохранив камеру 200 Мп, встроенный S Pen и новые функции Galaxy AI.",
            basePriceUsd: 1399,
            isFlagship: true,
            mainImage: "/media/galaxy-s26-ultra/photos/hero-photo.webp",
            specs: [
              ["Экран", "6.9\" Dynamic AMOLED 2X, 120 Гц"],
              ["Процессор", "Snapdragon 8 Elite Gen 5 for Galaxy"],
              ["Камера", "200 Мп основная камера, S Pen встроен"],
              ["Корпус", "Armor Aluminium 2.0"],
            ],
            colors: ["Чёрный", "Серебристая тень", "Кобальтовый фиолетовый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 4), [0, 100, 300, 500]),
          },
          {
            slug: "galaxy-z-flip7",
            name: "Samsung Galaxy Z Flip7",
            short: "Компактный флип-смартфон",
            desc: "Galaxy Z Flip7 — складной смартфон с большим внешним экраном и компактным форм-фактором.",
            basePriceUsd: 1099,
            specs: [
              ["Экран", "6.9\" складной + 4.1\" внешний"],
              ["Процессор", "Exynos 2500"],
            ],
            colors: ["Розовый", "Чёрный", "Зелёный"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 2), [0, 100]),
          },
          {
            slug: "galaxy-z-fold7",
            name: "Samsung Galaxy Z Fold7",
            short: "Складной смартфон-планшет",
            desc: "Galaxy Z Fold7 — большой внутренний экран превращает смартфон в компактный планшет.",
            basePriceUsd: 1899,
            specs: [
              ["Экран", "8\" складной + 6.5\" внешний"],
              ["Процессор", "Snapdragon 8 Gen 4"],
            ],
            colors: ["Чёрный", "Серебристый"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 3), [0, 200, 400]),
          },
          {
            slug: "galaxy-a56",
            name: "Samsung Galaxy A56",
            short: "Оптимальный баланс цены и возможностей",
            desc: "Galaxy A56 — надёжный смартфон среднего класса с хорошей камерой и автономностью.",
            basePriceUsd: 449,
            specs: [
              ["Экран", "6.5\" Super AMOLED"],
              ["Процессор", "Exynos 1580"],
            ],
            colors: ["Чёрный", "Розовый", "Зелёный"],
            memoryTiers: mem(MEMORY_LABELS.slice(0, 2), [0, 60]),
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
            desc: "Galaxy Tab S11 — яркий AMOLED-дисплей и S Pen в комплекте для работы и творчества.",
            basePriceUsd: 599,
            specs: [["Экран", "11\" Dynamic AMOLED 2X"]],
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
            desc: "Galaxy Tab S11 Ultra — рекордный дисплей 14.6\" и производительность топового уровня.",
            basePriceUsd: 999,
            specs: [["Экран", "14.6\" Dynamic AMOLED 2X"]],
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
            slug: "xiaomi-17-ultra",
            name: "Xiaomi 17 Ultra",
            short: "Камера Leica 200 Мп с переменной диафрагмой",
            desc: "Xiaomi 17 Ultra — камера Leica Summilux 200 Мп с 1-дюймовым сенсором и переменной оптикой, экран до 3500 нит и зарядка 90 Вт.",
            basePriceUsd: 1299,
            isFlagship: true,
            mainImage: "/media/xiaomi-17-ultra/hero-poster.webp",
            specs: [
              ["Экран", "6.9\" AMOLED, 1–120 Гц, до 3500 нит"],
              ["Процессор", "Snapdragon 8 Elite Gen 5"],
              ["Камера", "Leica 200 Мп, сенсор 1 дюйм, переменная диафрагма 75–120 мм"],
              ["Зарядка", "90 Вт по кабелю, 50 Вт беспроводная"],
            ],
            colors: ["Чёрный", "Белый", "Зелёный"],
            memoryTiers: mem(MEMORY_LABELS.slice(1, 4), [0, 150, 350]),
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
              ["Аккумулятор", "72 Вт·ч, зарядка 50 Вт"],
            ],
            colors: ["Серый", "Белый", "Дымчато-голубой", "Розовый"],
            memoryTiers: mem(["512 ГБ", "1 ТБ"], [0, 250]),
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
  console.log("Сидирование: бренды и категории...");

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

  const existingRateCount = await prisma.exchangeRate.count();
  if (existingRateCount === 0) {
    await prisma.exchangeRate.create({
      data: { usdToByn: 3.1, setBy: "seed" },
    });
    console.log("Начальный курс создан: 1 USD = 3.10 BYN");
  }

  let brandSortOrder = 0;
  for (const brandDef of BRANDS) {
    const brand = await prisma.brand.upsert({
      where: { slug: brandDef.slug },
      update: { name: brandDef.name, sortOrder: brandSortOrder },
      create: { slug: brandDef.slug, name: brandDef.name, sortOrder: brandSortOrder },
    });
    brandSortOrder += 1;

    let categorySortOrder = 0;
    for (const categoryDef of brandDef.categories) {
      const category = await prisma.category.upsert({
        where: { slug: categoryDef.slug },
        update: {
          name: categoryDef.name,
          brandId: brand.id,
          sortOrder: categorySortOrder,
          seoTitle: categoryDef.seoTitle,
          seoDescription: categoryDef.seoDescription,
          h1: categoryDef.name,
        },
        create: {
          slug: categoryDef.slug,
          name: categoryDef.name,
          brandId: brand.id,
          sortOrder: categorySortOrder,
          seoTitle: categoryDef.seoTitle,
          seoDescription: categoryDef.seoDescription,
          h1: categoryDef.name,
        },
      });
      categorySortOrder += 1;

      let productSortOrder = 0;
      for (const def of categoryDef.products) {
        const product = await prisma.product.upsert({
          where: { slug: def.slug },
          update: {
            categoryId: category.id,
            name: def.name,
            shortDescription: def.short,
            description: def.desc,
            basePriceUsd: def.basePriceUsd,
            isFlagship: def.isFlagship ?? false,
            availability: def.outOfStock ? "OUT_OF_STOCK" : "IN_STOCK",
            sortOrder: productSortOrder,
          },
          create: {
            slug: def.slug,
            categoryId: category.id,
            name: def.name,
            shortDescription: def.short,
            description: def.desc,
            basePriceUsd: def.basePriceUsd,
            isFlagship: def.isFlagship ?? false,
            availability: def.outOfStock ? "OUT_OF_STOCK" : "IN_STOCK",
            sortOrder: productSortOrder,
          },
        });
        productSortOrder += 1;

        await resetProductChildren(product.id);

        if (def.specs.length > 0) {
          await prisma.productSpec.createMany({
            data: def.specs.map(([name, value], i) => ({
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

        if (def.mainImage) {
          const firstColorValueId = def.colors?.[0]
            ? colorValueRowIds.get(def.colors[0])
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

        // Варианты: точное совпадение набора атрибутов, комбинации создаются
        // явно (память × SIM только для iPhone), не декартовым произведением "на лету".
        if (def.memoryTiers && def.simOptions) {
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
                  availability: def.oosTierLabels?.includes(memTier.label) ? "OUT_OF_STOCK" : "IN_STOCK",
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
                availability: def.oosTierLabels?.includes(tier.label) ? "OUT_OF_STOCK" : "IN_STOCK",
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
