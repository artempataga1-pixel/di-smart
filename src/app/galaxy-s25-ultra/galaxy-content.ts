import type { MediaAsset } from "@/components/ui/MediaFrame";
import { media } from "./galaxy-media";

export interface Chapter { id: string; label: string }
export interface Highlight { id: string; title: string; detail: string }
export interface Finish { id: string; dbColorName: string; label: string; hex: string; media: MediaAsset }
export interface NarrativeSectionData {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets?: string[];
  media: MediaAsset;
  mediaPosition: "left" | "right";
}
export interface AccessoryRef { slug: string; name: string; short: string }
export interface LineupTier { slug: string; name: string; short: string; current?: boolean }
export interface FaqItem { q: string; a: string }

export const chapters: Chapter[] = [
  { id: "hero", label: "Обзор" },
  { id: "design", label: "Дизайн" },
  { id: "s-pen", label: "S Pen" },
  { id: "camera", label: "Камера" },
  { id: "performance", label: "Производительность" },
  { id: "battery", label: "Батарея" },
  { id: "galaxy-ai", label: "Galaxy AI" },
  { id: "accessories", label: "Аксессуары" },
  { id: "lineup", label: "Линейка" },
  { id: "faq", label: "Вопросы" },
];

export const highlights: Highlight[] = [
  { id: "s-pen", title: "S Pen в комплекте", detail: "Встроен в корпус, заряжается там же" },
  { id: "camera", title: "200 Мп камера", detail: "AI Zoom до 100x, оптика 5x/3x" },
  { id: "titanium", title: "Титановый корпус", detail: "IP68, Corning Gorilla Armor 2" },
  { id: "battery", title: "5000 мАч", detail: "До 31 часа видео, зарядка 45 Вт" },
  { id: "ai", title: "Galaxy AI", detail: "Circle to Search, Generative Edit" },
  { id: "display", title: "6.9\" 120 Гц", detail: "Dynamic AMOLED 2X, 2600 нит" },
];

export const finishes: Finish[] = [
  { id: "black", dbColorName: "Чёрный", label: "Чёрный", hex: "#1c1c1e", media: media.designBlack },
  { id: "titanium", dbColorName: "Титан", label: "Титан", hex: "#8a8a86", media: media.designTitanium },
  { id: "blue", dbColorName: "Синий", label: "Синий", hex: "#3f5f7f", media: media.designBlue },
];

export const narrativeSections: NarrativeSectionData[] = [
  {
    id: "s-pen",
    eyebrow: "S Pen",
    title: "Встроенный инструмент для заметок и творчества",
    body: "S Pen хранится прямо в корпусе и не требует отдельной зарядки. Пишите заметки от руки, редактируйте PDF, рисуйте — Galaxy AI распознаёт рукописный текст и превращает его в форматированный документ.",
    bullets: [
      "Air actions — управление камерой и презентациями на расстоянии",
      "Распознавание рукописного текста в заметках",
      "Совместим и с другими устройствами линейки через S Pen Pro",
    ],
    media: media.sPenWriting,
    mediaPosition: "right",
  },
  {
    id: "camera",
    eyebrow: "Камера",
    title: "200 Мп и AI Zoom до 100x",
    body: "Основной сенсор 200 Мп в паре с двумя телеобъективами даёт оптический зум 5x и 3x, а AI Zoom расширяет диапазон до 100x. Ночная съёмка — отдельный режим с шумоподавлением на уровне сенсора.",
    bullets: [
      "200 + 50 + 50 + 10 Мп — четыре камеры основного блока",
      "Оптический зум 5x/3x, AI Zoom до 100x",
      "Galaxy AI: Generative Edit — перерисовка объектов в кадре",
    ],
    media: media.cameraNight,
    mediaPosition: "left",
  },
  {
    id: "performance",
    eyebrow: "Производительность",
    title: "Snapdragon 8 Elite for Galaxy",
    body: "Версия чипа, адаптированная специально для Galaxy: по данным производителя — на 40% быстрее NPU, на 37% быстрее CPU и на 30% быстрее GPU по сравнению с предыдущим поколением.",
    bullets: [
      "Snapdragon 8 Elite for Galaxy — чип под конкретное устройство",
      "+40% NPU, +37% CPU, +30% GPU (данные производителя)",
      "Титановый корпус эффективнее отводит тепло при долгой игре",
    ],
    media: media.performanceGaming,
    mediaPosition: "right",
  },
  {
    id: "battery",
    eyebrow: "Батарея",
    title: "5000 мАч на весь день",
    body: "До 31 часа видеовоспроизведения на одном заряде. Проводная зарядка 45 Вт возвращает существенный запас за минуты, беспроводная — до 15 Вт без кабеля.",
    bullets: ["5000 мАч, до 31 ч видео", "Проводная зарядка 45 Вт", "Беспроводная зарядка до 15 Вт"],
    media: media.batteryLife,
    mediaPosition: "left",
  },
];

export const accessories: AccessoryRef[] = [
  { slug: "s-pen-pro", name: "Samsung S Pen Pro", short: "Универсальный стилус для устройств Galaxy" },
  { slug: "galaxy-s25-case", name: "Чехол для Samsung Galaxy S25", short: "Защитный чехол с усиленными углами" },
  { slug: "samsung-45w-charger", name: "Samsung 45W Super Fast Charger", short: "Максимально быстрая зарядка для флагманов" },
  { slug: "samsung-25w-charger", name: "Samsung 25W Fast Charger", short: "Быстрая зарядка для устройств Samsung" },
];

export const lineupTiers: LineupTier[] = [
  { slug: "galaxy-s25", name: "Galaxy S25", short: "6.2\" экран, компактный флагман" },
  { slug: "galaxy-s25-plus", name: "Galaxy S25+", short: "6.7\" экран, больше автономности" },
  { slug: "galaxy-s25-ultra", name: "Galaxy S25 Ultra", short: "6.9\" экран, S Pen, камера 200 Мп", current: true },
];

export const questions: FaqItem[] = [
  { q: "S Pen нужно заряжать отдельно?", a: "Нет — S Pen хранится в корпусе Galaxy S25 Ultra и заряжается там же, отдельная зарядка не нужна." },
  { q: "Можно сдать старый телефон в счёт покупки?", a: "Да, через Trade-in — оценка старого устройства учитывается в стоимости нового." },
  { q: "Какая гарантия на Galaxy S25 Ultra?", a: "Условия гарантии и доставки — на странице «Доставка и гарантия»." },
  { q: "Чем отличаются варианты памяти по цене?", a: "Актуальные цены по объёму памяти (256 ГБ – 1 ТБ) — на странице товара, при выборе конфигурации перед покупкой." },
];
