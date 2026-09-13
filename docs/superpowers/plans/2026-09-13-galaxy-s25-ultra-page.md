# Флагманская страница Samsung Galaxy S25 Ultra Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Построить бесповедную кинематографичную страницу `/galaxy-s25-ultra` (уровень амбиций — как у параллельной `/iphone-18-pro`), не трогая ни одного файла из работы Codex, с рабочим CTA на реальную покупку `/product/galaxy-s25-ultra`.

**Architecture:** Новый маршрут `src/app/galaxy-s25-ultra/**` с собственными данными (`galaxy-content.ts`, `galaxy-media.ts`), одним переиспользуемым `MediaFrame`-примитивом (`src/components/ui/MediaFrame.tsx`) для фото/видео-плейсхолдеров, композицией секций через клиентский компонент `galaxy-hero.tsx` со sticky-навигацией/scroll-spy. `page.tsx` — server component, фетчит реальный товар через `getProductDetailBySlug("galaxy-s25-ultra")`, поэтому цена/наличие всегда актуальны, а CTA ведут на настоящую страницу покупки. Интеграция со стором (`nav.ts`, `sitemap.ts`, главная, `Header.tsx`) — последним отдельным шагом, только аддитивные правки.

**Tech Stack:** Next.js 16 (App Router, этот билд — с кастомными кэш-директивами, см. Global Constraints), TypeScript, Tailwind v4 (`@theme`-токены) + CSS Modules для секций страницы (как у `/iphone-18-pro`), GSAP через существующие `RevealOnScroll`/`useStaggerReveal`, Prisma (только чтение через `src/lib/catalog.ts`, без новых моделей).

**Spec:** [docs/superpowers/specs/2026-09-13-galaxy-s25-ultra-page-design.md](../specs/2026-09-13-galaxy-s25-ultra-page-design.md)

## Global Constraints

- **Не трогать** ничего под `src/app/iphone-18-pro/**`, `src/components/home/IPhonePromo.tsx`, `docs/iphone-18-pro/**`, `public/media/iphone-18-pro/**`, `scripts/compose-iphone-hero.py` — параллельная незакоммиченная работа Codex.
- Правки в общих файлах (`nav.ts`, `sitemap.ts`, `src/app/page.tsx`, `Header.tsx`) — только аддитивные (новая строка/элемент массива), без рефакторинга структуры файла.
- **Перед любым data-fetching кодом** прочитать `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` и `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md` (этот билд Next — кастомный, с брейкинг-чейнджами в кэш-модели, см. корневой `AGENTS.md`). Если директивы `"use cache"` обязательны в этой версии для страниц с БД-чтением — применить их так же, как это сделано в `src/app/product/[slug]/page.tsx` (у него сейчас `export const dynamic = "force-dynamic"`, без `"use cache"` — значит на момент последней правки этого файла в динамическом режиме достаточно `force-dynamic"; использовать тот же паттерн, если доки не говорят обратного).
- **В проекте нет unit-test раннера** (Jest/Vitest) для React-компонентов — только Playwright e2e для критичных бизнес-сценариев (корзина/заказ, `e2e/`). Не заводим новый test-раннер под одну маркетинговую страницу (YAGNI). Шаги «тест» в этом плане — точные ручные проверки через `npm run dev` в браузере; они так же обязательны, как автоматические, и должны выполняться буквально.
- **Медиа-контент (фото/видео/3D)**: ни один инструмент в этой сессии не генерирует растровые изображения или 3D-модели. Пока пользователь не пришлёт реальные ассеты, все секции используют честный плейсхолдер (`MediaFrame` — градиентная панель в реальной палитре бренда + иконка, без фейковых путей к несуществующим файлам). Замена на реальные фото/видео/3D — вопрос подстановки `src` в `galaxy-media.ts` и `videoSrc` в `HeroFilm`, без правок разметки. Это описано в задаче 12 и явно вынесено как открытый пункт, не блокер.
- Реальные данные о товаре (цвета `Чёрный #1c1c1e / Титан #8a8a86 / Синий #3f5f7f`, характеристики, цена `basePriceUsd: 1299`, слаги аксессуаров) взяты из `prisma/seed.ts` — не выдумывать другие цифры.
- Каждая задача заканчивается отдельным коммитом. Коммит-сообщения — на русском, в стиле существующей истории (`git log --oneline`), с атрибуцией `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` в конце.

---

### Task 1: `MediaFrame` — общий плейсхолдер-примитив для фото/видео

**Files:**
- Create: `src/components/ui/MediaFrame.tsx`

**Interfaces:**
- Produces: `interface MediaAsset { id: string; alt: string; src?: string; tone?: "titanium" | "blue" | "black" }`, `function MediaFrame({ asset, className, fill, sizes }: { asset: MediaAsset; className?: string; fill?: boolean; sizes?: string })` — используется всеми последующими задачами.

- [ ] **Step 1: Создать компонент**

```tsx
// src/components/ui/MediaFrame.tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface MediaAsset {
  id: string;
  alt: string;
  /** Появляется, когда есть реальный файл — до этого рендерится плейсхолдер. */
  src?: string;
  tone?: "titanium" | "blue" | "black";
}

const TONE_GRADIENT: Record<NonNullable<MediaAsset["tone"]>, string> = {
  titanium: "linear-gradient(135deg, #4b4b4d 0%, #8a8a86 50%, #d7d9dc 100%)",
  blue: "linear-gradient(135deg, #0d1b2a 0%, #3f5f7f 55%, #6f92ad 100%)",
  black: "linear-gradient(135deg, #020201 0%, #1c1c1e 55%, #3a3a3c 100%)",
};

export function MediaFrame({
  asset,
  className,
  fill = true,
  sizes = "100vw",
}: {
  asset: MediaAsset;
  className?: string;
  fill?: boolean;
  sizes?: string;
}) {
  if (asset.src) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image src={asset.src} alt={asset.alt} fill={fill} sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={asset.alt}
      className={cn("relative flex items-center justify-center overflow-hidden text-white/70", className)}
      style={{ background: TONE_GRADIENT[asset.tone ?? "titanium"] }}
    >
      <svg width="15%" height="15%" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ minWidth: 40, minHeight: 40, maxWidth: 96, maxHeight: 96 }}>
        <rect x="6" y="2" width="12" height="20" rx="2.4" stroke="currentColor" strokeWidth="1.4" />
        <line x1="9" y1="19" x2="15" y2="19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Проверить типы**

Run: `npx tsc --noEmit`
Expected: без новых ошибок (существующие, если есть, не считаются — сравнить вывод до/после).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/MediaFrame.tsx
git commit -m "$(cat <<'EOF'
Добавлен MediaFrame — плейсхолдер-примитив для фото/видео на новых страницах

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Контент-данные страницы Galaxy S25 Ultra

**Files:**
- Create: `src/app/galaxy-s25-ultra/galaxy-media.ts`
- Create: `src/app/galaxy-s25-ultra/galaxy-content.ts`

**Interfaces:**
- Consumes: `MediaAsset` из `@/components/ui/MediaFrame` (Task 1).
- Produces: `media: Record<string, MediaAsset>`; типы и константы `Chapter`, `Highlight`, `Finish`, `NarrativeSectionData`, `AccessoryRef`, `LineupTier`, `FaqItem` и массивы `chapters`, `highlights`, `finishes`, `narrativeSections`, `accessories`, `lineupTiers`, `questions` — потребляются всеми задачами 3–10.

- [ ] **Step 1: Создать карту медиа-плейсхолдеров**

```ts
// src/app/galaxy-s25-ultra/galaxy-media.ts
import type { MediaAsset } from "@/components/ui/MediaFrame";

export const media: Record<string, MediaAsset> = {
  heroPoster: { id: "heroPoster", alt: "Samsung Galaxy S25 Ultra, титановый корпус", tone: "titanium" },
  designBlack: { id: "designBlack", alt: "Galaxy S25 Ultra, цвет Чёрный", tone: "black" },
  designTitanium: { id: "designTitanium", alt: "Galaxy S25 Ultra, цвет Титан", tone: "titanium" },
  designBlue: { id: "designBlue", alt: "Galaxy S25 Ultra, цвет Синий", tone: "blue" },
  sPenWriting: { id: "sPenWriting", alt: "S Pen — заметки и рисунки на Galaxy S25 Ultra", tone: "titanium" },
  cameraNight: { id: "cameraNight", alt: "Ночная съёмка на камеру 200 Мп", tone: "blue" },
  performanceGaming: { id: "performanceGaming", alt: "Игры на Snapdragon 8 Elite for Galaxy", tone: "black" },
  batteryLife: { id: "batteryLife", alt: "Автономность 5000 мАч", tone: "blue" },
  galaxyAiEdit: { id: "galaxyAiEdit", alt: "Galaxy AI — Generative Edit и Circle to Search", tone: "titanium" },
  promo: { id: "promo", alt: "", tone: "blue" },
};
```

- [ ] **Step 2: Создать контент страницы (реальные данные из `prisma/seed.ts`)**

```ts
// src/app/galaxy-s25-ultra/galaxy-content.ts
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
```

- [ ] **Step 3: Проверить типы**

Run: `npx tsc --noEmit`
Expected: без новых ошибок.

- [ ] **Step 4: Commit**

```bash
git add src/app/galaxy-s25-ultra/galaxy-media.ts src/app/galaxy-s25-ultra/galaxy-content.ts
git commit -m "$(cat <<'EOF'
Данные страницы Galaxy S25 Ultra: разделы, хайлайты, цвета, аксессуары, FAQ

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Маршрут-каркас — `page.tsx` + `galaxy-hero.tsx` (hero + sticky-нав)

**Files:**
- Create: `src/app/galaxy-s25-ultra/page.tsx`
- Create: `src/app/galaxy-s25-ultra/galaxy-hero.tsx`
- Create: `src/app/galaxy-s25-ultra/galaxy-hero.module.css`

**Interfaces:**
- Consumes: `getProductDetailBySlug`, `ProductDetail` из `@/lib/catalog`; `chapters` из Task 2; `PillCta` (`@/components/ui/PillCta`), `Price` (`@/components/ui/Price`).
- Produces: `export function GalaxyHero({ product }: { product: ProductDetail | null })` — потребляется задачами 4–10 (они дополняют тело этого компонента).

- [ ] **Step 1: Перед кодом — прочитать доки кастомного Next.js**

Открыть и прочитать:
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`
- `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`

Сверить с тем, как уже читает БД `src/app/product/[slug]/page.tsx` (`export const dynamic = "force-dynamic"`, без `"use cache"`). Если доки не предписывают иного для страниц с прямым Prisma-чтением — использовать тот же паттерн ниже.

- [ ] **Step 2: `page.tsx`**

```tsx
// src/app/galaxy-s25-ultra/page.tsx
import type { Metadata } from "next";
import { GalaxyHero } from "./galaxy-hero";
import { getProductDetailBySlug } from "@/lib/catalog";
import { SITE } from "@/constants/content/site";

export const dynamic = "force-dynamic";

const PRODUCT_SLUG = "galaxy-s25-ultra";

export const metadata: Metadata = {
  title: `Samsung Galaxy S25 Ultra — ${SITE.name}`,
  description:
    "Galaxy S25 Ultra: титановый корпус, встроенный S Pen, камера 200 Мп и Galaxy AI. Экран 6.9\" 120 Гц, защита IP68.",
  openGraph: {
    title: `Samsung Galaxy S25 Ultra — ${SITE.name}`,
    description: "Титановый корпус, S Pen, камера 200 Мп и Galaxy AI.",
    url: "/galaxy-s25-ultra",
  },
};

export default async function GalaxyS25UltraPage() {
  const product = await getProductDetailBySlug(PRODUCT_SLUG);
  return <GalaxyHero product={product} />;
}
```

- [ ] **Step 3: `galaxy-hero.module.css` (базовые стили hero + sticky-нав)**

```css
/* src/app/galaxy-s25-ultra/galaxy-hero.module.css */
.page {
  color: var(--color-text);
}

.stickyNav {
  position: sticky;
  top: 64px;
  z-index: 20;
  backdrop-filter: blur(22px);
  background: color-mix(in srgb, var(--color-bg) 78%, transparent);
  border-bottom: 1px solid var(--color-line);
}

.stickyNavInner {
  display: flex;
  gap: clamp(1rem, 2vw, 1.75rem);
  overflow-x: auto;
  padding: 0.9rem clamp(1rem, 4vw, 3rem);
  scrollbar-width: none;
}
.stickyNavInner::-webkit-scrollbar { display: none; }

.stickyNavLink {
  font-size: 0.85rem;
  white-space: nowrap;
  color: var(--color-muted);
  transition: color 0.2s ease;
}
.stickyNavLink[aria-current="location"] {
  color: var(--color-accent-ink);
  font-weight: 600;
}

.hero {
  position: relative;
  display: grid;
  min-height: 78vh;
}

.heroCopy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.9rem;
  padding: clamp(2rem, 6vw, 4rem);
  margin-top: auto;
}

.eyebrow {
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-accent-ink);
}

.heroTitle {
  font-family: var(--font-heading);
  font-size: clamp(2.4rem, 6vw, 4.5rem);
  font-weight: 700;
  line-height: 1.05;
}

.heroSubtitle {
  max-width: 40ch;
  color: var(--color-muted);
  font-size: clamp(1rem, 1.6vw, 1.15rem);
}

.heroActions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-top: 0.5rem;
}

.highlightRail {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 4vw, 3rem);
  scroll-snap-type: x mandatory;
}

.highlightCard {
  flex: 0 0 auto;
  scroll-snap-align: start;
  width: clamp(220px, 26vw, 280px);
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
}

.highlightTitle { font-weight: 600; margin-bottom: 0.35rem; }
.highlightDetail { font-size: 0.875rem; color: var(--color-muted); }

.section {
  padding: clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 3rem);
  scroll-margin-top: 84px;
}

.sectionTitle {
  font-family: var(--font-heading);
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 700;
  margin-bottom: 1rem;
}

.sectionBody {
  max-width: 60ch;
  color: var(--color-muted);
  font-size: clamp(1rem, 1.4vw, 1.1rem);
}

.narrativeSection {
  display: grid;
  gap: clamp(1.5rem, 4vw, 3rem);
  grid-template-columns: 1fr;
}
@media (min-width: 900px) {
  .narrativeSection { grid-template-columns: 1fr 1fr; align-items: center; }
  .narrativeMediaLeft { direction: rtl; }
  .narrativeMediaLeft > * { direction: ltr; }
}

.narrativeCopy { display: flex; flex-direction: column; gap: 0.75rem; }
.narrativeBullets { display: flex; flex-direction: column; gap: 0.5rem; color: var(--color-muted); padding-left: 1.1rem; }
.narrativeBullets li { list-style: disc; }
.narrativeMedia { aspect-ratio: 4 / 3; border-radius: var(--radius-xl); }

.footnote {
  padding: 2rem clamp(1rem, 4vw, 3rem) 1rem;
  font-size: 0.8rem;
  color: var(--color-muted);
  max-width: 70ch;
}

.finalCta {
  display: flex;
  justify-content: center;
  padding: 2rem clamp(1rem, 4vw, 3rem) 4rem;
}

@media (prefers-reduced-motion: reduce) {
  .stickyNavInner { scroll-behavior: auto; }
}
```

- [ ] **Step 4: `galaxy-hero.tsx` (hero + sticky-нав + scroll-spy, заготовки под остальные секции)**

```tsx
// src/app/galaxy-s25-ultra/galaxy-hero.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { chapters } from "./galaxy-content";
import { media } from "./galaxy-media";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { PillCta } from "@/components/ui/PillCta";
import { Price } from "@/components/ui/Price";
import type { ProductDetail } from "@/lib/catalog";
import styles from "./galaxy-hero.module.css";

const PRODUCT_HREF = "/product/galaxy-s25-ultra";

export function GalaxyHero({ product }: { product: ProductDetail | null }) {
  const [activeChapter, setActiveChapter] = useState(chapters[0].id);
  const sectionRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveChapter(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    for (const el of sectionRefs.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function registerSection(id: string) {
    return (el: HTMLElement | null) => {
      if (el) sectionRefs.current.set(id, el);
      else sectionRefs.current.delete(id);
    };
  }

  const buyHref = product ? PRODUCT_HREF : "/catalog";

  return (
    <div className={styles.page}>
      <nav className={styles.stickyNav} aria-label="Разделы страницы">
        <div className={styles.stickyNavInner}>
          {chapters.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              aria-current={activeChapter === c.id ? "location" : undefined}
              className={styles.stickyNavLink}
            >
              {c.label}
            </a>
          ))}
        </div>
      </nav>

      <section id="hero" ref={registerSection("hero")} className={styles.hero}>
        <MediaFrame asset={media.heroPoster} className="absolute inset-0" />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Samsung Galaxy S25 Ultra</p>
          <h1 className={styles.heroTitle}>Титан. S Pen. 200 Мп.</h1>
          <p className={styles.heroSubtitle}>
            Флагман года: титановый корпус класса IP68, встроенный S Pen и камера
            200 Мп с AI Zoom до 100x.
          </p>
          <div className={styles.heroActions}>
            <PillCta href={buyHref}>{product ? "Купить" : "Смотреть каталог"}</PillCta>
            {product && <Price price={product.basePriceByn} size="lg" className="text-white" />}
          </div>
        </div>
      </section>

      <footer className={styles.footnote}>
        <p>
          Фотографии и видео на этой странице — иллюстративные материалы, часть
          дорабатывается; не являются официальными материалами Samsung.
          Актуальные характеристики и цена — на{" "}
          <Link href={buyHref}>странице товара</Link>.
        </p>
      </footer>

      <div className={styles.finalCta}>
        <PillCta href={buyHref}>{product ? "Купить Galaxy S25 Ultra" : "Смотреть каталог"}</PillCta>
      </div>
    </div>
  );
}
```

Задачи 4–10 будут вставлять новые секции между `</section>` (hero) и `<footer>`, каждая — своим шагом с точным местом вставки.

- [ ] **Step 5: Ручная проверка**

Run: `npm run dev`, открыть `http://localhost:3000/galaxy-s25-ultra`
Expected: страница рендерится без ошибок в консоли; виден hero-плейсхолдер (градиентная панель), заголовок, кнопка «Купить» (или «Смотреть каталог», если товар не сидирован), sticky-нав прилипает под шапкой при скролле. Если в БД есть `galaxy-s25-ultra` — рядом с кнопкой видна цена в BYN.

- [ ] **Step 6: Commit**

```bash
git add src/app/galaxy-s25-ultra/page.tsx src/app/galaxy-s25-ultra/galaxy-hero.tsx src/app/galaxy-s25-ultra/galaxy-hero.module.css
git commit -m "$(cat <<'EOF'
Маршрут /galaxy-s25-ultra: hero, sticky-навигация по разделам, реальная цена из БД

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `HeroFilm` — видео-плеер hero с плейсхолдером

**Files:**
- Create: `src/app/galaxy-s25-ultra/hero-film.tsx`
- Create: `src/app/galaxy-s25-ultra/hero-film.module.css`
- Modify: `src/app/galaxy-s25-ultra/galaxy-hero.tsx` — заменить `<MediaFrame asset={media.heroPoster} .../>` в hero-секции на `<HeroFilm poster={media.heroPoster} />`

**Interfaces:**
- Consumes: `MediaAsset`/`MediaFrame` (Task 1), `media.heroPoster` (Task 2).
- Produces: `export function HeroFilm({ poster, videoSrc }: { poster: MediaAsset; videoSrc?: string })`.

- [ ] **Step 1: `hero-film.module.css`**

```css
/* src/app/galaxy-s25-ultra/hero-film.module.css */
.frame {
  position: absolute;
  inset: 0;
}
.media { width: 100%; height: 100%; object-fit: cover; }
.control {
  position: absolute;
  right: clamp(1rem, 4vw, 3rem);
  bottom: clamp(1rem, 4vw, 3rem);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  backdrop-filter: blur(8px);
}
```

- [ ] **Step 2: `hero-film.tsx`**

```tsx
// src/app/galaxy-s25-ultra/hero-film.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { MediaFrame, type MediaAsset } from "@/components/ui/MediaFrame";
import styles from "./hero-film.module.css";

type PlayState = "paused" | "playing" | "ended" | "error";

/** videoSrc не задан, пока не пришлют готовый ролик — до этого рендерится
 * статичный постер-плейсхолдер того же визуального веса, чтобы подстановка
 * реального видео не требовала правок разметки (см. Global Constraints). */
export function HeroFilm({ poster, videoSrc }: { poster: MediaAsset; videoSrc?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<PlayState>("paused");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!videoSrc || reduceMotion) return;
    const video = videoRef.current;
    if (!video) return;
    video.play().then(() => setState("playing")).catch(() => setState("paused"));
  }, [videoSrc, reduceMotion]);

  useEffect(() => {
    if (!videoSrc) return;
    function onVisibility() {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) video.pause();
      else if (state === "playing") video.play();
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [videoSrc, state]);

  if (!videoSrc || state === "error") {
    return (
      <div className={styles.frame}>
        <MediaFrame asset={poster} className={styles.media} fill />
      </div>
    );
  }

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (state === "playing") {
      video.pause();
      setState("paused");
    } else {
      if (state === "ended") video.currentTime = 0;
      video.play();
      setState("playing");
    }
  }

  return (
    <div className={styles.frame}>
      <video
        ref={videoRef}
        className={styles.media}
        src={videoSrc}
        poster={poster.src}
        muted
        playsInline
        onEnded={() => setState("ended")}
        onError={() => setState("error")}
      />
      <button
        type="button"
        onClick={toggle}
        className={styles.control}
        aria-label={state === "playing" ? "Пауза" : state === "ended" ? "Смотреть снова" : "Воспроизвести"}
      >
        {state === "playing" ? <Pause size={18} /> : state === "ended" ? <RotateCcw size={18} /> : <Play size={18} />}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Подключить в hero**

В `galaxy-hero.tsx` заменить строку с `<MediaFrame asset={media.heroPoster} className="absolute inset-0" />` внутри `<section id="hero" ...>` на:

```tsx
        <HeroFilm poster={media.heroPoster} />
```

И добавить импорт: `import { HeroFilm } from "./hero-film";`

- [ ] **Step 4: Ручная проверка**

Run: `npm run dev`, открыть `/galaxy-s25-ultra`.
Expected: hero по-прежнему показывает плейсхолдер (videoSrc не передан — ожидаемо, видео пришлёт пользователь позже), ошибок в консоли нет.

- [ ] **Step 5: Commit**

```bash
git add src/app/galaxy-s25-ultra/hero-film.tsx src/app/galaxy-s25-ultra/hero-film.module.css src/app/galaxy-s25-ultra/galaxy-hero.tsx
git commit -m "$(cat <<'EOF'
HeroFilm: видео-плеер hero с постером-плейсхолдером, готов под реальный ролик

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Highlight-рейл

**Files:**
- Modify: `src/app/galaxy-s25-ultra/galaxy-hero.tsx` — вставить рейл сразу после `</section>` hero-секции.

**Interfaces:**
- Consumes: `highlights` (Task 2), `useStaggerReveal` (`@/components/ui/useStaggerReveal`).

- [ ] **Step 1: Добавить рейл**

Импорт: `import { highlights } from "./galaxy-content";` и `import { useStaggerReveal } from "@/components/ui/useStaggerReveal";`.

В теле компонента, перед `return`:

```tsx
  const highlightsRef = useStaggerReveal<HTMLDivElement>({ count: highlights.length });
```

Сразу после закрывающего `</section>` hero-секции вставить:

```tsx
      <div ref={highlightsRef} className={styles.highlightRail} aria-label="Ключевые особенности">
        {highlights.map((h) => (
          <div key={h.id} data-stagger-item className={styles.highlightCard}>
            <p className={styles.highlightTitle}>{h.title}</p>
            <p className={styles.highlightDetail}>{h.detail}</p>
          </div>
        ))}
      </div>
```

- [ ] **Step 2: Ручная проверка**

Run: `npm run dev`, открыть `/galaxy-s25-ultra`, прокрутить до рейла.
Expected: 6 карточек в горизонтальном скролле, при появлении в вьюпорте — плавное появление (stagger); с `prefers-reduced-motion: reduce` в DevTools — карточки видны сразу, без анимации.

- [ ] **Step 3: Commit**

```bash
git add src/app/galaxy-s25-ultra/galaxy-hero.tsx
git commit -m "$(cat <<'EOF'
Highlight-рейл на странице Galaxy S25 Ultra

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Секция «Дизайн» + `PhoneViewer` (цвета из реальной БД)

**Files:**
- Create: `src/app/galaxy-s25-ultra/phone-viewer.tsx`
- Create: `src/app/galaxy-s25-ultra/phone-viewer.module.css`
- Modify: `src/app/galaxy-s25-ultra/galaxy-hero.tsx` — добавить секцию `#design` после highlight-рейла.

**Interfaces:**
- Consumes: `Finish`, `finishes` (Task 2), `MediaFrame` (Task 1).
- Produces: `export function PhoneViewer({ finishes }: { finishes: Finish[] })`.

- [ ] **Step 1: `phone-viewer.module.css`**

```css
/* src/app/galaxy-s25-ultra/phone-viewer.module.css */
.viewer { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; margin-top: 2rem; }
.stage { width: min(100%, 420px); aspect-ratio: 3 / 4; border-radius: var(--radius-xl); }
.swatches { display: flex; gap: 0.75rem; }
.swatch {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 2px solid var(--color-line);
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.swatch[aria-checked="true"] { border-color: var(--color-accent-ink); transform: scale(1.1); }
.activeLabel { font-size: 0.9rem; color: var(--color-muted); }
```

- [ ] **Step 2: `phone-viewer.tsx`**

```tsx
// src/app/galaxy-s25-ultra/phone-viewer.tsx
"use client";

import { useState } from "react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { Finish } from "./galaxy-content";
import styles from "./phone-viewer.module.css";

/** До подбора лицензионной 3D-модели/360°-кадров (см. Global Constraints
 * плана и открытый пункт в задаче 12) показываем плейсхолдер-фото по
 * выбранному цвету. Переключатель цвета — уже финальный UI; апгрейд на
 * настоящий 3D/360°-вьюер не потребует правок разметки, только замену
 * MediaFrame на реальную 3D-сцену. */
export function PhoneViewer({ finishes }: { finishes: Finish[] }) {
  const [activeId, setActiveId] = useState(finishes[0].id);
  const active = finishes.find((f) => f.id === activeId) ?? finishes[0];

  return (
    <div className={styles.viewer}>
      <MediaFrame asset={active.media} className={styles.stage} />
      <div className={styles.swatches} role="radiogroup" aria-label="Цвет корпуса">
        {finishes.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={f.id === activeId}
            onClick={() => setActiveId(f.id)}
            className={styles.swatch}
            style={{ backgroundColor: f.hex }}
            aria-label={f.label}
          />
        ))}
      </div>
      <p className={styles.activeLabel}>{active.label}</p>
    </div>
  );
}
```

- [ ] **Step 3: Подключить секцию «Дизайн»**

Импорты: `import { PhoneViewer } from "./phone-viewer";`, `import { finishes } from "./galaxy-content";`.

После highlight-рейла (и перед `<footer>`) вставить:

```tsx
      <section id="design" ref={registerSection("design")} className={styles.section}>
        <h2 className={styles.sectionTitle}>Титан снаружи, мощь внутри</h2>
        <p className={styles.sectionBody}>
          Корпус из титана и защита IP68 — Galaxy S25 Ultra выдерживает
          повседневные нагрузки, сохраняя премиальный вид.
        </p>
        <PhoneViewer finishes={finishes} />
        <div className="mt-6">
          <PillCta href={buyHref} size="sm">Купить</PillCta>
        </div>
      </section>
```

- [ ] **Step 4: Ручная проверка**

Run: `npm run dev`, открыть `/galaxy-s25-ultra`, перейти в раздел «Дизайн» (через sticky-нав).
Expected: 3 кружка-свотча (чёрный/серый-титан/синий), клик по каждому меняет плейсхолдер-панель и подпись под ней; активный свотч визуально выделен; пункт «Дизайн» в sticky-нав подсвечивается как активный при скролле в эту секцию.

- [ ] **Step 5: Commit**

```bash
git add src/app/galaxy-s25-ultra/phone-viewer.tsx src/app/galaxy-s25-ultra/phone-viewer.module.css src/app/galaxy-s25-ultra/galaxy-hero.tsx
git commit -m "$(cat <<'EOF'
Секция «Дизайн»: переключатель реальных цветов товара + PhoneViewer-плейсхолдер

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `NarrativeSection` + разделы S Pen / Камера / Производительность / Батарея

**Files:**
- Create: `src/app/galaxy-s25-ultra/narrative-section.tsx`
- Modify: `src/app/galaxy-s25-ultra/galaxy-hero.module.css` — добавить `.narrativeSection`, `.narrativeMediaLeft`, `.narrativeCopy`, `.narrativeBullets`, `.narrativeMedia` (уже добавлены в Task 3, Step 3 — если по какой-то причине их там нет, добавить сейчас).
- Modify: `src/app/galaxy-s25-ultra/galaxy-hero.tsx` — вставить 4 секции после `#design`.

**Interfaces:**
- Consumes: `NarrativeSectionData`, `narrativeSections` (Task 2), `MediaFrame` (Task 1).
- Produces: `export function NarrativeSection({ data, sectionRef }: { data: NarrativeSectionData; sectionRef: (el: HTMLElement | null) => void })`.

- [ ] **Step 1: `narrative-section.tsx`**

```tsx
// src/app/galaxy-s25-ultra/narrative-section.tsx
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { NarrativeSectionData } from "./galaxy-content";
import styles from "./galaxy-hero.module.css";

export function NarrativeSection({
  data,
  sectionRef,
}: {
  data: NarrativeSectionData;
  sectionRef: (el: HTMLElement | null) => void;
}) {
  return (
    <section
      id={data.id}
      ref={sectionRef}
      className={`${styles.section} ${styles.narrativeSection} ${data.mediaPosition === "left" ? styles.narrativeMediaLeft : ""}`}
    >
      <div className={styles.narrativeCopy}>
        <p className={styles.eyebrow}>{data.eyebrow}</p>
        <h2 className={styles.sectionTitle}>{data.title}</h2>
        <p className={styles.sectionBody}>{data.body}</p>
        {data.bullets && (
          <ul className={styles.narrativeBullets}>
            {data.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </div>
      <MediaFrame asset={data.media} className={styles.narrativeMedia} />
    </section>
  );
}
```

- [ ] **Step 2: Подключить секции**

Импорты: `import { NarrativeSection } from "./narrative-section";`, `import { narrativeSections } from "./galaxy-content";` (если `narrativeSections` ещё не импортирован рядом с остальными из Task 2).

После секции `#design` (и перед `<footer>`) вставить:

```tsx
      {narrativeSections.map((s) => (
        <NarrativeSection key={s.id} data={s} sectionRef={registerSection(s.id)} />
      ))}
```

- [ ] **Step 3: Ручная проверка**

Run: `npm run dev`, открыть `/galaxy-s25-ultra`, прокрутить через S Pen → Камера → Производительность → Батарея.
Expected: 4 секции, текст/фото чередуются по сторонам (S Pen — текст слева/фото справа, Камера — наоборот, и т.д. по `mediaPosition`), sticky-нав подсвечивает соответствующий пункт при скролле.

- [ ] **Step 4: Commit**

```bash
git add src/app/galaxy-s25-ultra/narrative-section.tsx src/app/galaxy-s25-ultra/galaxy-hero.tsx
git commit -m "$(cat <<'EOF'
Разделы S Pen, камера, производительность, батарея через общий NarrativeSection

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: `GalaxyAiExperience` — демо Galaxy AI (табы)

**Files:**
- Create: `src/app/galaxy-s25-ultra/galaxy-ai-experience.tsx`
- Create: `src/app/galaxy-s25-ultra/galaxy-ai-experience.module.css`
- Modify: `src/app/galaxy-s25-ultra/galaxy-hero.tsx` — секция `#galaxy-ai` после раздела «Батарея».

**Interfaces:**
- Consumes: `media.galaxyAiEdit` (Task 2), `MediaFrame` (Task 1).
- Produces: `export function GalaxyAiExperience()`.

- [ ] **Step 1: `galaxy-ai-experience.module.css`**

```css
/* src/app/galaxy-s25-ultra/galaxy-ai-experience.module.css */
.wrap { display: flex; flex-direction: column; gap: 1.5rem; }
.tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tab {
  padding: 0.6rem 1.1rem;
  border-radius: 999px;
  border: 1px solid var(--color-line);
  font-size: 0.875rem;
  color: var(--color-muted);
}
.tab[aria-selected="true"] {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}
.panel {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}
@media (min-width: 900px) {
  .panel { grid-template-columns: 1fr 1fr; align-items: center; }
}
.panelTitle { font-size: clamp(1.35rem, 2.5vw, 1.75rem); font-weight: 700; margin-bottom: 0.5rem; }
.panelBody { color: var(--color-muted); max-width: 48ch; }
.panelMedia { aspect-ratio: 4 / 3; border-radius: var(--radius-lg); }
```

- [ ] **Step 2: `galaxy-ai-experience.tsx`**

```tsx
// src/app/galaxy-s25-ultra/galaxy-ai-experience.tsx
"use client";

import { useRef, useState } from "react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { media } from "./galaxy-media";
import styles from "./galaxy-ai-experience.module.css";

const TABS = [
  {
    id: "circle-to-search",
    label: "Circle to Search",
    title: "Обведите — и получите ответ",
    body: "Обведите пальцем что угодно на экране — товар, текст, место на карте — Galaxy AI найдёт это в поиске, не выходя из приложения.",
  },
  {
    id: "generative-edit",
    label: "Generative Edit",
    title: "Перерисуйте кадр после съёмки",
    body: "Переместите или удалите объект на фото — Galaxy AI достроит фон так, будто его там никогда не было.",
  },
  {
    id: "note-assist",
    label: "Note Assist",
    title: "S Pen + Galaxy AI",
    body: "Рукописные заметки S Pen превращаются в форматированный текст, а Galaxy AI помогает с кратким содержанием и переводом.",
  },
] as const;

export function GalaxyAiExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = TABS[activeIndex];

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = e.key === "ArrowRight" ? (activeIndex + 1) % TABS.length : (activeIndex - 1 + TABS.length) % TABS.length;
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className={styles.wrap}>
      <p>Galaxy AI</p>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700 }}>
        Ассистент, который под рукой
      </h2>
      <div role="tablist" aria-label="Возможности Galaxy AI" onKeyDown={onKeyDown} className={styles.tabs}>
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={i === activeIndex}
            aria-controls={`panel-${tab.id}`}
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(i)}
            className={styles.tab}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`} className={styles.panel}>
        <div>
          <h3 className={styles.panelTitle}>{active.title}</h3>
          <p className={styles.panelBody}>{active.body}</p>
        </div>
        <MediaFrame asset={media.galaxyAiEdit} className={styles.panelMedia} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Подключить секцию**

Импорт: `import { GalaxyAiExperience } from "./galaxy-ai-experience";`.

После разделов из Task 7 вставить:

```tsx
      <section id="galaxy-ai" ref={registerSection("galaxy-ai")} className={styles.section}>
        <GalaxyAiExperience />
      </section>
```

- [ ] **Step 4: Ручная проверка**

Run: `npm run dev`, открыть `/galaxy-s25-ultra`, раздел «Galaxy AI».
Expected: 3 таба, клик переключает заголовок/текст/плейсхолдер справа; стрелки ← → на клавиатуре при фокусе на табах переключают активный таб и двигают фокус.

- [ ] **Step 5: Commit**

```bash
git add src/app/galaxy-s25-ultra/galaxy-ai-experience.tsx src/app/galaxy-s25-ultra/galaxy-ai-experience.module.css src/app/galaxy-s25-ultra/galaxy-hero.tsx
git commit -m "$(cat <<'EOF'
Раздел Galaxy AI: табы Circle to Search / Generative Edit / Note Assist

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Аксессуары и сравнение линейки (реальные ссылки на товары)

**Files:**
- Create: `src/app/galaxy-s25-ultra/accessories-grid.tsx`
- Create: `src/app/galaxy-s25-ultra/lineup-picker.tsx`
- Modify: `src/app/galaxy-s25-ultra/galaxy-hero.module.css` — добавить классы ниже.
- Modify: `src/app/galaxy-s25-ultra/galaxy-hero.tsx` — секции `#accessories` и `#lineup`.

**Interfaces:**
- Consumes: `AccessoryRef`, `LineupTier`, `accessories`, `lineupTiers` (Task 2).
- Produces: `export function AccessoriesGrid({ accessories }: { accessories: AccessoryRef[] })`, `export function LineupPicker({ tiers }: { tiers: LineupTier[] })`.

- [ ] **Step 1: Добавить CSS в `galaxy-hero.module.css`**

```css
.accessoryGrid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); margin-top: 1.5rem; }
.accessoryCard { display: flex; flex-direction: column; gap: 0.4rem; padding: 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--color-line); background: var(--color-surface); }
.accessoryName { font-weight: 600; }
.accessoryShort { font-size: 0.85rem; color: var(--color-muted); }
.accessoryLink { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--color-accent-ink); margin-top: 0.5rem; }

.lineup { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top: 1.5rem; }
.lineupCard { padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--color-line); background: var(--color-surface); }
.lineupCardCurrent { border-color: var(--color-accent); background: var(--color-accent-soft); }
.lineupName { font-weight: 700; font-size: 1.1rem; }
.lineupShort { font-size: 0.85rem; color: var(--color-muted); margin: 0.4rem 0 0.9rem; }
.lineupCurrentBadge { display: inline-flex; padding: 0.3rem 0.75rem; border-radius: 999px; background: var(--color-accent); color: #fff; font-size: 0.75rem; font-weight: 600; }
.lineupLink { font-size: 0.85rem; color: var(--color-accent-ink); }
```

- [ ] **Step 2: `accessories-grid.tsx`**

```tsx
// src/app/galaxy-s25-ultra/accessories-grid.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AccessoryRef } from "./galaxy-content";
import styles from "./galaxy-hero.module.css";

export function AccessoriesGrid({ accessories }: { accessories: AccessoryRef[] }) {
  return (
    <div className={styles.accessoryGrid}>
      {accessories.map((a) => (
        <Link key={a.slug} href={`/product/${a.slug}`} className={styles.accessoryCard}>
          <p className={styles.accessoryName}>{a.name}</p>
          <p className={styles.accessoryShort}>{a.short}</p>
          <span className={styles.accessoryLink}>
            Смотреть товар <ArrowRight size={14} aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `lineup-picker.tsx`**

```tsx
// src/app/galaxy-s25-ultra/lineup-picker.tsx
import Link from "next/link";
import type { LineupTier } from "./galaxy-content";
import styles from "./galaxy-hero.module.css";

export function LineupPicker({ tiers }: { tiers: LineupTier[] }) {
  return (
    <div className={styles.lineup}>
      {tiers.map((t) => (
        <div key={t.slug} className={`${styles.lineupCard} ${t.current ? styles.lineupCardCurrent : ""}`}>
          <p className={styles.lineupName}>{t.name}</p>
          <p className={styles.lineupShort}>{t.short}</p>
          {t.current ? (
            <span className={styles.lineupCurrentBadge}>Вы здесь</span>
          ) : (
            <Link href={`/product/${t.slug}`} className={styles.lineupLink}>
              Смотреть товар
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Подключить секции**

Импорты: `import { AccessoriesGrid } from "./accessories-grid";`, `import { LineupPicker } from "./lineup-picker";`, `import { accessories, lineupTiers } from "./galaxy-content";`.

После раздела `#galaxy-ai` вставить:

```tsx
      <section id="accessories" ref={registerSection("accessories")} className={styles.section}>
        <h2 className={styles.sectionTitle}>Аксессуары</h2>
        <AccessoriesGrid accessories={accessories} />
      </section>

      <section id="lineup" ref={registerSection("lineup")} className={styles.section}>
        <h2 className={styles.sectionTitle}>Вся линейка Galaxy S25</h2>
        <LineupPicker tiers={lineupTiers} />
      </section>
```

- [ ] **Step 5: Ручная проверка**

Run: `npm run dev`, открыть `/galaxy-s25-ultra`, разделы «Аксессуары» и «Линейка».
Expected: 4 карточки аксессуаров, клик по каждой ведёт на реальную `/product/<slug>` с корректным товаром (не 404). В «Линейке» — 3 карточки, у Galaxy S25 Ultra бейдж «Вы здесь» вместо ссылки, у остальных двух — рабочие ссылки на их товарные страницы.

- [ ] **Step 6: Commit**

```bash
git add src/app/galaxy-s25-ultra/accessories-grid.tsx src/app/galaxy-s25-ultra/lineup-picker.tsx src/app/galaxy-s25-ultra/galaxy-hero.module.css src/app/galaxy-s25-ultra/galaxy-hero.tsx
git commit -m "$(cat <<'EOF'
Аксессуары и сравнение линейки Galaxy S25 со ссылками на реальные товары

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: FAQ-аккордеон

**Files:**
- Create: `src/app/galaxy-s25-ultra/faq-accordion.tsx`
- Modify: `src/app/galaxy-s25-ultra/galaxy-hero.module.css` — добавить классы ниже.
- Modify: `src/app/galaxy-s25-ultra/galaxy-hero.tsx` — секция `#faq`.

**Interfaces:**
- Consumes: `FaqItem`, `questions` (Task 2).
- Produces: `export function FaqAccordion({ questions }: { questions: FaqItem[] })`.

- [ ] **Step 1: Добавить CSS**

```css
.faq { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem; max-width: 70ch; }
.faqItem { padding: 1.1rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--color-line); background: var(--color-surface); }
.faqQuestion { cursor: pointer; font-weight: 600; }
.faqAnswer { margin-top: 0.6rem; color: var(--color-muted); font-size: 0.9rem; }
```

- [ ] **Step 2: `faq-accordion.tsx`**

```tsx
// src/app/galaxy-s25-ultra/faq-accordion.tsx
import type { FaqItem } from "./galaxy-content";
import styles from "./galaxy-hero.module.css";

export function FaqAccordion({ questions }: { questions: FaqItem[] }) {
  return (
    <div className={styles.faq}>
      {questions.map((q) => (
        <details key={q.q} className={styles.faqItem}>
          <summary className={styles.faqQuestion}>{q.q}</summary>
          <p className={styles.faqAnswer}>{q.a}</p>
        </details>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Подключить секцию**

Импорты: `import { FaqAccordion } from "./faq-accordion";`, `import { questions } from "./galaxy-content";`.

После раздела `#lineup` вставить:

```tsx
      <section id="faq" ref={registerSection("faq")} className={styles.section}>
        <h2 className={styles.sectionTitle}>Вопросы и ответы</h2>
        <FaqAccordion questions={questions} />
      </section>
```

- [ ] **Step 4: Ручная проверка**

Run: `npm run dev`, открыть `/galaxy-s25-ultra`, раздел «Вопросы и ответы».
Expected: 4 вопроса, клик по каждому раскрывает/скрывает ответ (нативный `<details>`), sticky-нав доходит до последнего пункта «Вопросы».

- [ ] **Step 5: Commit**

```bash
git add src/app/galaxy-s25-ultra/faq-accordion.tsx src/app/galaxy-s25-ultra/galaxy-hero.module.css src/app/galaxy-s25-ultra/galaxy-hero.tsx
git commit -m "$(cat <<'EOF'
FAQ-аккордеон на странице Galaxy S25 Ultra

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Интеграция со стором (nav, sitemap, главная, проверка Header)

**Files:**
- Create: `src/components/home/GalaxyPromo.tsx`
- Modify: `src/constants/content/nav.ts`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/page.tsx`
- Modify (условно): `src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: `MediaFrame` (Task 1), `media.promo` (Task 2).

- [ ] **Step 1: `GalaxyPromo.tsx`**

```tsx
// src/components/home/GalaxyPromo.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { media } from "@/app/galaxy-s25-ultra/galaxy-media";

export function GalaxyPromo() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6" aria-labelledby="galaxy-promo-title">
      <Link
        href="/galaxy-s25-ultra"
        className="group grid overflow-hidden rounded-[var(--radius-xl)] bg-[#0d1b2a] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-ink)] md:grid-cols-[.8fr_1.2fr]"
      >
        <div className="flex flex-col items-start justify-center p-8 md:py-12 lg:p-12">
          <h2 id="galaxy-promo-title" className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight lg:text-4xl">
            Samsung Galaxy S25 Ultra
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-[#a9c1d6]">
            Титан, встроенный S Pen и камера 200 Мп — познакомьтесь ближе.
          </p>
          <span className="mt-7 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors group-hover:bg-[#a9c1d6]">
            Познакомиться ближе <ArrowRight size={17} aria-hidden="true" />
          </span>
        </div>
        <div className="relative aspect-video self-center">
          <MediaFrame asset={media.promo} className="h-full w-full" />
        </div>
      </Link>
    </section>
  );
}
```

- [ ] **Step 2: `nav.ts` — добавить пункт**

В `src/constants/content/nav.ts` добавить `{ label: "Galaxy S25 Ultra", href: "/galaxy-s25-ultra" }` в оба массива, рядом с пунктом iPhone (если он там уже есть на момент выполнения — порядок не важен, главное не удалять существующие строки):

```ts
export const MAIN_NAV: NavItem[] = [
  { label: "Каталог", href: "/catalog" },
  { label: "iPhone 18 Pro", href: "/iphone-18-pro" },
  { label: "Galaxy S25 Ultra", href: "/galaxy-s25-ultra" },
  { label: "Trade-in", href: "/trade-in" },
  { label: "Доставка и гарантия", href: "/delivery" },
  { label: "Контакты", href: "/contacts" },
];

export const FOOTER_INFO_NAV: NavItem[] = [
  { label: "iPhone 18 Pro", href: "/iphone-18-pro" },
  { label: "Galaxy S25 Ultra", href: "/galaxy-s25-ultra" },
  { label: "Каталог", href: "/catalog" },
  { label: "Trade-in", href: "/trade-in" },
  { label: "Доставка и гарантия", href: "/delivery" },
  { label: "Контакты", href: "/contacts" },
  { label: "Политика конфиденциальности", href: "/privacy" },
  { label: "Публичная оферта", href: "/offer" },
];
```

Если к моменту выполнения этой задачи в файле уже что-то поменялось (Codex мог добавить свои строки) — вставить строку `Galaxy S25 Ultra` в актуальную версию массива вручную, не откатывая чужие изменения.

- [ ] **Step 3: `sitemap.ts` — добавить статическую запись**

В `src/app/sitemap.ts`, в массив `STATIC_ROUTES`, сразу после записи `/iphone-18-pro` (или в конце секции статических маркетинговых страниц, если структура файла к этому моменту другая):

```ts
  { path: "/galaxy-s25-ultra", changeFrequency: "monthly", priority: 0.8 },
```

- [ ] **Step 4: `page.tsx` (главная) — вставить промо**

В `src/app/page.tsx` добавить импорт `import { GalaxyPromo } from "@/components/home/GalaxyPromo";` и вставить `<GalaxyPromo />` сразу после `<IPhonePromo />` (если она уже там):

```tsx
      <IPhonePromo />
      <GalaxyPromo />
```

Если `<IPhonePromo />` к этому моменту отсутствует (например, Codex её ещё не закоммитил в этот файл) — вставить `<GalaxyPromo />` в том же месте, где сейчас стоит `<IPhonePromo />` по plan Task 3 из спеки iPhone (сразу после hero-секции, перед `<section>` с `GroupingGrid`).

- [ ] **Step 5: Проверить переполнение навигации в `Header.tsx`**

Run: `npm run dev`, открыть сайт, `resize_window`/DevTools на ширины ~1024px, ~1280px, ~1440px.
Expected: пункты `MAIN_NAV` (теперь 6 штук) помещаются в строку без переноса и без наезда на поле поиска/иконки справа.

Если пункты переполняют строку (обрезаются/переносятся) — применить точечную правку по аналогии с уже существующей (поле поиска в `Header.tsx` сейчас скрыто ниже `xl`, см. `className="hidden w-48 xl:flex xl:w-64"` у `SearchField`). Самый вероятный минимальный фикс — уменьшить `gap-7` у `<nav className="hidden items-center gap-7 md:flex">` до `gap-5`:

```tsx
          <nav className="hidden items-center gap-5 md:flex">
```

Применять этот шаг **только если реально видно переполнение** в браузере — не менять `Header.tsx`, если всё помещается.

- [ ] **Step 6: Ручная проверка навигации целиком**

Run: `npm run dev`.
Expected: пункт «Galaxy S25 Ultra» кликабелен в хедере и футере, ведёт на `/galaxy-s25-ultra`; на главной странице виден промо-блок `GalaxyPromo` после `IPhonePromo` (или на его месте), клик по нему тоже ведёт на `/galaxy-s25-ultra`; `curl -s http://localhost:3000/sitemap.xml | grep galaxy-s25-ultra` находит новую запись.

- [ ] **Step 7: Commit**

```bash
git add src/components/home/GalaxyPromo.tsx src/constants/content/nav.ts src/app/sitemap.ts src/app/page.tsx
git add src/components/layout/Header.tsx 2>/dev/null || true
git commit -m "$(cat <<'EOF'
Интеграция /galaxy-s25-ultra со стором: навигация, sitemap, промо на главной

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: `docs/galaxy-s25-ultra/README.md` + финальная проверка всей страницы

**Files:**
- Create: `docs/galaxy-s25-ultra/README.md`

- [ ] **Step 1: Написать README (арт-дирекшн, статус ассетов, чек-лист)**

```markdown
# /galaxy-s25-ultra — заметки по реализации

## Статус медиа (важно!)

Ни одно изображение/видео/3D-модель на этой странице сейчас не настоящее.
`MediaFrame` (`src/components/ui/MediaFrame.tsx`) рендерит градиентный
плейсхолдер в реальной палитре бренда (титан/синий/чёрный), пока в
`src/app/galaxy-s25-ultra/galaxy-media.ts` не появится `src` у конкретного
ассета — тогда компонент сам переключится на настоящее фото, без правок
разметки.

Что нужно подставить:
- **Hero-видео** — пользователь пришлёт готовый файл (см. `HeroFilm`,
  `videoSrc` проп). Положить в `public/media/galaxy-s25-ultra/intro.mp4`,
  постер первого кадра — `intro-start.jpg`.
- **Фотографии по секциям** (design ×3 цвета, S Pen, камера, производительность,
  батарея, Galaxy AI, промо для главной) — 9 файлов, art-direction: холодная
  палитра (титан/серебро, глубокий синий, чёрный), урбанистика/ночной город —
  в противовес тёплой природной палитре `/iphone-18-pro`. Без наложенного
  текста, фотореалистично, без «CGI-глянца» (как у `natural/*.webp` в
  `docs/iphone-18-pro/`).
- **3D-модель / 360°-фотоспин** — у Apple был готовый USDZ-файл, у Samsung
  такого нет под рукой. `PhoneViewer` (`phone-viewer.tsx`) сейчас работает в
  режиме «цвет → фото»: переключатель цвета уже финальный UI. Следующий шаг
  (отдельная задача, не в этом плане) — подобрать лицензионную 3D-модель
  (Sketchfab/CGTrader, проверить лицензию на коммерческое использование) или
  собрать серию 360°-кадров; при их появлении — расширить `PhoneViewer`
  дополнительным режимом, не переписывая текущий.

## Цвета (синхронизированы с БД, `prisma/seed.ts`)

| Цвет | hex |
|---|---|
| Чёрный | `#1c1c1e` |
| Титан | `#8a8a86` |
| Синий | `#3f5f7f` |

## Интеграция со стором

- `ShopChrome` (шапка/футер/корзина/тёмная тема) подключается автоматически
  через root layout — в этом маршруте ничего специально не подключалось.
- Пункт навигации, запись в sitemap, промо-блок на главной — задача 11 этого
  плана.
- CTA «Купить» ведут на `/product/galaxy-s25-ultra` — реальную страницу с
  ценой/вариантами памяти/корзиной (в отличие от `/iphone-18-pro`, где такого
  товара в БД нет и CTA ведут на `/contacts`).

## Независимость от параллельной работы

Ничего из `src/app/iphone-18-pro/**` не импортируется и не переиспользуется —
осознанное решение, чтобы не конфликтовать с незакоммиченной работой Codex
над iPhone 18 Pro (см. `docs/superpowers/specs/2026-09-13-galaxy-s25-ultra-page-design.md`).
Возможный будущий рефактор — вынести общие примитивы (плеер hero-видео,
sticky-навигация, вьюер телефона) в `src/components/flagship/` — отдельная
задача после того, как обе страницы закоммичены.
```

- [ ] **Step 2: Полная ручная проверка**

Run: `npm run lint`
Expected: без новых ошибок в затронутых файлах.

Run: `npx tsc --noEmit`
Expected: без новых ошибок.

Run: `npm run dev`, пройти всю страницу `/galaxy-s25-ultra` сверху вниз:
- Все 10 пунктов sticky-нав кликабельны и скроллят к своей секции.
- В DevTools включить «Emulate CSS prefers-reduced-motion: reduce» — highlight-рейл и hero не анимируются рывками, контент виден сразу.
- Resize на мобильную ширину (375px) — все секции читаемы, без горизонтального переполнения страницы.
- Проверить `.site-theme` — цвета тёмные (чёрный фон, оранжевый акцент в CTA-кнопках) — тема подключается автоматически, без доп. кода.
- Клик «Купить» из hero и из финального CTA-блока — оба ведут на `/product/galaxy-s25-ultra` с корректной ценой/наличием.
- Клик по аксессуару и по товару из «Линейки» — оба ведут на существующие `/product/[slug]`, не на 404.

Run (опционально, если БД поднята локально): `npm run build`
Expected: сборка проходит без ошибок, связанных с `/galaxy-s25-ultra`.

- [ ] **Step 3: Commit**

```bash
git add docs/galaxy-s25-ultra/README.md
git commit -m "$(cat <<'EOF'
Документация страницы Galaxy S25 Ultra: статус медиа, чек-лист интеграции

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**Покрытие спеки:** hero-видео (Task 4), highlight-рейл (5), дизайн+цвета+вьюер (6), S Pen/камера/производительность/батарея (7), Galaxy AI (8), аксессуары+линейка (9), FAQ+футноут (3, 10), CTA на реальную покупку (3, 6, 11), интеграция nav/sitemap/главная/Header (11), докс с открытым пунктом по 3D (12). Все пункты спеки закрыты.

**Плейсхолдеры:** проверено — каждый шаг содержит реальный код или точную ручную проверку; единственный намеренно незавершённый элемент (медиа/3D) явно помечен как открытый пункт в Global Constraints и в задаче 12, а не как немой TODO в коде.

**Консистентность типов:** `MediaAsset` (Task 1) используется одинаково в `MediaFrame`, `HeroFilm`, `PhoneViewer`, `NarrativeSection`, `GalaxyAiExperience`, `GalaxyPromo`. `Finish`/`NarrativeSectionData`/`AccessoryRef`/`LineupTier`/`FaqItem` (Task 2) — каждый использован ровно в одном компоненте-потребителе с тем же именем поля. `registerSection`/`sectionRef: (el: HTMLElement | null) => void` — одна и та же сигнатура в `galaxy-hero.tsx` (Task 3) и `narrative-section.tsx` (Task 7).

---

Plan complete and saved to `docs/superpowers/plans/2026-09-13-galaxy-s25-ultra-page.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
