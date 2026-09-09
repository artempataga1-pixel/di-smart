# Редизайн: чёрно-оранжевая айдентика, главная, карточка товара — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести витрину сайта на чёрно-оранжевую айдентику (референс «фон»), пересобрать главную страницу вокруг флагманского товара вместо каталожной сетки, и превратить карточку товара в immersive-шаблон с адаптивной подачей фото — для всех товаров сайта.

**Architecture:** Тёмная палитра подключается как scoped CSS-класс `.site-theme` поверх существующих CSS custom properties (`tokens.css`), а не переписыванием `@theme` — это единственный способ не задеть админку, которая читает те же токены. Градиентный фон (`FlagshipGradientBackground`, уже существует под флагманами) обобщается в один глобальный компонент, монтируемый один раз в `ShopChrome`. Главная страница и карточка товара — новые/адаптированные React-компоненты поверх существующего `lib/catalog.ts` (Prisma-запросы почти не меняются, кроме одной новой выборки).

**Tech Stack:** Next.js (App Router) + React 19 + Tailwind v4 (через CSS custom properties в `tokens.css`) + Prisma. Тестовый стек проекта — TypeScript (`tsc`), ESLint, Playwright e2e **только для критичных сквозных сценариев** (не для визуальных изменений — так и задумано, см. комментарий в `playwright.config.ts`).

## Global Constraints

- Админ-панель (`/admin/**`) — **ни одна правка в этом плане не должна изменить её внешний вид.** Она рендерится через `ShopChrome` (`pathname.startsWith("/admin")` → возвращает `children` без обёртки), поэтому тёмная палитра подключается только к обёртке витрины, а не к `:root`/`@theme`.
- Структура/вёрстка header, footer, каталога — не меняется, только цвета (через уже существующие CSS-переменные + несколько мест с захардкоженным hex, см. Task 4).
- В проекте нет unit/component-тестов (Jest/Vitest) — только `tsc`, ESLint и Playwright e2e для двух критичных сценариев (`e2e/order-flow.spec.ts`, `e2e/price-recalculation.spec.ts`). Каждая задача в этом плане проверяется через: `npx tsc --noEmit` → `npm run lint` → визуальная проверка в браузере (dev-сервер + Playwright MCP `browser_navigate`/`browser_take_screenshot`, или ручной просмотр). Задачи, трогающие `ProductInfo`/`ProductGallery`/`ProductPurchasePanel` (Phase 3), дополнительно проверяются прогоном `npm run test:e2e` — этот прогон требует поднятого Postgres с накаченной схемой/сидом (`docker compose up db` + `npm run prisma:migrate` + `npm run prisma:seed`); если БД недоступна в текущем окружении — прогон делает пользователь отдельно, не блокируя остальные задачи.
- Реальные флагманы в БД: `iphone-17-pro` (тёмная тема была) и `galaxy-s25-ultra` (светлая тема была) — оба получают единую тёмную айдентику (решение пользователя). Не путать с `iphone-17-pro-max` — это обычный (не флагманский) товар, на нём завязаны e2e-тесты `price-recalculation.spec.ts`/`order-flow.spec.ts`.
- Не выдумывать данные — все хардкоженные значения (hex-цвета, тексты) в этом плане взяты из референса «фон» (`#FFB000`/`#FFD985`/`#FF7700`/`#060605`/`#FFFFFF`) или скопированы из уже существующего в коде `FlagshipGradientBackground.tsx`.

---

## Phase 1 — базовая палитра сайта

### Task 1: Тёмная палитра как scoped-класс `.site-theme`

**Files:**
- Modify: `src/app/styles/tokens.css`

**Interfaces:**
- Produces: CSS-класс `.site-theme`, переопределяющий все токены палитры (`--color-bg`, `--color-surface`, `--color-surface-soft`, `--color-line`, `--color-text`, `--color-muted`, `--color-duotone-blue`, `--color-duotone-peach`, `--color-accent`, `--color-accent-ink`, `--color-accent-dark`, `--color-accent-soft`, `--color-accent-glow`, `--color-cream` (новый токен), `--color-ink`, `--color-ink-soft`, `--color-on-ink`, `--color-on-ink-muted`, `--color-success`, `--color-warning`, `--shadow-card`, `--shadow-card-hover`, `--shadow-accent-glow`). Используется в Task 2 (`ShopChrome`).

- [ ] **Step 1: Добавить блок `.site-theme` в конец `tokens.css`**

Существующий `@theme { ... }` блок (светлая палитра) **не трогаем** — он остаётся дефолтом для админки. Добавляем после него:

```css
/* .site-theme — тёмная айдентика витрины (референс "фон": градиент
   #060605 → #FF7700/#FFB000/#FFD985). Подключается только к обёртке
   витрины в ShopChrome — админка продолжает жить на светлой палитре
   из @theme выше, её этот блок не касается. */
.site-theme {
  --color-bg: #060605;
  --color-surface: #15130f;
  --color-surface-soft: #201c16;
  --color-line: rgba(255, 255, 255, 0.14);

  --color-text: #ffffff;
  --color-muted: rgba(255, 255, 255, 0.64);

  /* Легаси-имена (дуотон-фон /contacts, ContactsVideoBackground) —
     репойнтнуты на тёплые блики нового градиента вместо голубого. */
  --color-duotone-blue: #ffb000;
  --color-duotone-peach: #ffd985;

  --color-accent: #ff7700;
  --color-accent-ink: #ffb000;
  --color-accent-dark: #e86800;
  --color-accent-soft: rgba(255, 119, 0, 0.16);
  --color-accent-glow: rgba(255, 119, 0, 0.45);
  --color-cream: #ffd985;

  --color-ink: #020201;
  --color-ink-soft: rgba(255, 255, 255, 0.08);
  --color-on-ink: #ffffff;
  --color-on-ink-muted: rgba(255, 255, 255, 0.62);

  --color-success: #7bd99b;
  --color-warning: #f2b134;

  --shadow-card: 0 20px 50px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.35);
  --shadow-card-hover: 0 24px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 119, 0, 0.25);
  --shadow-accent-glow: 0 14px 32px rgba(255, 119, 0, 0.4);
}
```

- [ ] **Step 2: Проверить синтаксис**

Run: `npx tsc --noEmit` (CSS не влияет на TS, но команда должна остаться зелёной — регрессии быть не должно)
Run: `npm run lint`
Expected: оба без новых ошибок. Файл `.site-theme` пока нигде не применяется — визуального эффекта ещё нет, это ожидаемо.

- [ ] **Step 3: Commit**

```bash
git add src/app/styles/tokens.css
git commit -m "Добавлена тёмная палитра .site-theme для витрины (админка не тронута)"
```

---

### Task 2: Глобальный градиентный фон

**Files:**
- Create: `src/app/styles/gradient.css`
- Create: `src/components/ui/GradientBackdrop.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/layout/ShopChrome.tsx`
- Modify: `src/app/layout.tsx:37` (themeColor)

**Interfaces:**
- Produces: `GradientBackdrop` — компонент без пропов, рендерит 3 блюрных blob'а (`#FF7700`/`#FFB000`/`#FFD985`), `position: fixed`, за контентом.
- Consumes (Task 1): класс `.site-theme`.

- [ ] **Step 1: Создать `src/app/styles/gradient.css`**

```css
/* gradient — глобальный декоративный фон витрины (референс "фон").
   Один инстанс на весь сайт (GradientBackdrop, монтируется в ShopChrome),
   раньше дублировался per-page под каждым флагманом. */
.gradient-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(90px);
}
```

- [ ] **Step 2: Создать `src/components/ui/GradientBackdrop.tsx`**

```tsx
const BLOBS = [
  { color: "#FF7700", top: "-10%", left: "-10%", size: "42rem", opacity: 0.55 },
  { color: "#FFB000", top: "5%", left: "55%", size: "36rem", opacity: 0.4 },
  { color: "#FFD985", top: "45%", left: "10%", size: "30rem", opacity: 0.25 },
];

/** Один статичный градиентный фон на всю витрину (fixed, во весь вьюпорт,
 * за контентом). Раньше каждая флагманская страница монтировала свой
 * собственный набор блобов (FlagshipGradientBackground) — теперь это
 * единственный инстанс, подключённый в ShopChrome. */
export function GradientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {BLOBS.map((blob) => (
        <span
          key={blob.color}
          className="gradient-blob"
          style={{
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
            backgroundColor: blob.color,
            opacity: blob.opacity,
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Подключить `gradient.css` в `globals.css`**

В `src/app/globals.css` добавить импорт рядом с остальными (после `tokens.css`):

```css
@import "tailwindcss";
@import "./styles/tokens.css";
@import "./styles/gradient.css";
@import "./styles/layout.css";
@import "./styles/catalog.css";
@import "./styles/product.css";
@import "./styles/services-contacts.css";
@import "./styles/buttons.css";
@import "./styles/flagship.css";
```

(импорт `flagship.css` убирается в Task 3 вместе с самим файлом — здесь его пока не трогаем)

- [ ] **Step 4: Подключить `.site-theme` + `GradientBackdrop` в `ShopChrome.tsx`**

Заменить возврат для витрины (ветка `if (pathname?.startsWith("/admin"))` остаётся без изменений):

```tsx
import { GradientBackdrop } from "@/components/ui/GradientBackdrop";

// ...

  return (
    <div className="site-theme relative flex min-h-full flex-1 flex-col">
      <GradientBackdrop />
      <CartProvider>
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <Header navBrands={navBrands} />
          <main className="flex-1">{children}</main>
          <Footer navBrands={navBrands} />
          <CartDrawer />
          <CookieBanner />
          {analytics}
        </div>
      </CartProvider>
    </div>
  );
```

Стек z-index принципиален: `GradientBackdrop` — `position: fixed` без явного `z-index` (попадает в слой "positioned, z-index:auto", красится первым по DOM-порядку), а весь контент обёрнут в `relative z-10` — это гарантирует, что контент всегда поверх фона независимо от DOM-порядка внутри самого фона.

- [ ] **Step 5: Обновить `themeColor` в `layout.tsx`**

`src/app/layout.tsx:37`, было `themeColor: "#e8935c"` → `themeColor: "#ff7700"`.

- [ ] **Step 6: Проверить**

Run: `npx tsc --noEmit`
Run: `npm run lint`
Expected: без ошибок.

Run dev-сервер (`npm run dev`) и открыть `/` в браузере (Playwright MCP `browser_navigate` + `browser_take_screenshot`, либо вручную) — фон должен быть тёмным с оранжевым/золотым свечением по краям, `/admin/login` должен остаться на старой светлой палитре (это ключевая проверка изоляции админки).

- [ ] **Step 7: Commit**

```bash
git add src/app/styles/gradient.css src/components/ui/GradientBackdrop.tsx src/app/globals.css src/components/layout/ShopChrome.tsx src/app/layout.tsx
git commit -m "Глобальный градиентный фон витрины (референс «фон»), админка не затронута"
```

---

### Task 3: Убрать дублирующую per-page тему у флагманов

**Files:**
- Delete: `src/components/product/flagship/FlagshipGradientBackground.tsx`
- Delete: `src/app/styles/flagship.css`
- Modify: `src/components/product/flagship/FlagshipProductPage.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes (Task 1, Task 2): `.site-theme` (уже оборачивает весь `ShopChrome`, включая страницы товаров) + глобальный `GradientBackdrop`.

- [ ] **Step 1: Упростить `FlagshipProductPage.tsx`**

Убрать логику выбора темы и собственный градиент — они больше не нужны, всё уже даёт `.site-theme` из `ShopChrome`:

```tsx
import type { ProductDetail } from "@/lib/catalog";
import { FlagshipHero } from "@/components/product/flagship/FlagshipHero";
import { FlagshipFeatureGrid } from "@/components/product/flagship/FlagshipFeatureGrid";
import { FlagshipPurchaseSection } from "@/components/product/flagship/FlagshipPurchaseSection";

/** Персонализированный immersive-лендинг для флагманов (iPhone 17 Pro,
 * Samsung Galaxy S25 Ultra) — заменяет обычный шаблон страницы товара
 * целиком, без хлебных крошек/таблицы характеристик/похожих товаров.
 * Тёмная айдентика теперь общая для всей витрины (.site-theme в
 * ShopChrome) — здесь её больше не подключаем. */
export function FlagshipProductPage({ product }: { product: ProductDetail }) {
  return (
    <div className="relative">
      <FlagshipHero product={product} />
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <FlagshipFeatureGrid slug={product.slug} />
        <div className="mt-16">
          <FlagshipPurchaseSection product={product} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Удалить файлы**

```bash
rm src/components/product/flagship/FlagshipGradientBackground.tsx
rm src/app/styles/flagship.css
```

- [ ] **Step 3: Убрать импорт `flagship.css` из `globals.css`**

`src/app/globals.css` — удалить строку `@import "./styles/flagship.css";`.

- [ ] **Step 4: Проверить**

Run: `npx tsc --noEmit` — не должно быть ошибок про отсутствующий `FlagshipGradientBackground` (импорт убран вместе с использованием).
Run: `npm run lint`

- [ ] **Step 5: Commit**

```bash
git add src/components/product/flagship/FlagshipProductPage.tsx src/app/globals.css
git rm src/components/product/flagship/FlagshipGradientBackground.tsx src/app/styles/flagship.css
git commit -m "Убрана дублирующая per-page тема флагманов — палитра и фон теперь общие для витрины"
```

---

### Task 4: Перекрасить захардкоженные куски UI (кнопки, плейсхолдеры, бордеры карточек)

**Files:**
- Modify: `src/app/styles/buttons.css`
- Modify: `src/components/ui/visuals/CatalogVisual.tsx:11-17`
- Modify: `src/components/home/CategoryCard.tsx:11`
- Modify: `src/components/product-card/ProductCard.tsx:18`

**Interfaces:** нет (чистые CSS/className правки, без изменения пропов/сигнатур).

- [ ] **Step 1: Перекрасить `buttons.css`**

Файл целиком захардкожен в светло-голубой hex (не через токены) — это поисковая пилюля в шапке (`.search-pill*`) и «утапливающаяся» кнопка (`.soft-btn`, используется на карточках услуг и в личном кабинете). Заменить содержимое:

```css
/* buttons — переиспользуемая «утапливающаяся» soft-кнопка (категории каталога,
   «Записаться» на карточке услуги, кнопки формы личного кабинета),
   и глянцевая pill-строка поиска (Header + каталог) */

/* Портировано из Uiverse.io (Smit-Prajapati), перекрашено в тёмно-янтарную
   палитру витрины (референс "фон") — объёмность даёт связка из двух
   псевдоэлементов (::before — блик сверху-слева, ::after — тень+свечение
   снизу-справа), а не один плоский box-shadow. Техника/пропорции — 1:1. */
.search-pill {
  position: relative;
  background: linear-gradient(135deg, #3a2a18 0%, #221809 100%);
  border-radius: 1000px;
  padding: 6px;
  z-index: 0;
}

.search-pill__body {
  position: relative;
  width: 100%;
  border-radius: 50px;
  background: linear-gradient(135deg, #1c150d 0%, #15100a 100%);
  padding: 3px;
  display: flex;
  align-items: center;
}

.search-pill__body::after,
.search-pill__body::before {
  content: "";
  width: 100%;
  height: 100%;
  border-radius: inherit;
  position: absolute;
}

.search-pill__body::before {
  top: -1px;
  left: -1px;
  background: linear-gradient(0deg, #1c150d 0%, #2b2013 100%);
  z-index: -1;
}

.search-pill__body::after {
  bottom: -1px;
  right: -1px;
  background: linear-gradient(0deg, #ff8c1a 0%, #3a2a18 100%);
  box-shadow:
    rgba(255, 140, 0, 0.35) 2px 2px 4px 0px,
    rgba(255, 140, 0, 0.35) 3px 3px 12px 0px;
  z-index: -2;
}

.search-pill__input {
  padding: 6px 8px;
  width: 100%;
  background: linear-gradient(135deg, #1c150d 0%, #15100a 100%);
  border: none;
  color: var(--color-text);
  font-size: 14px;
  border-radius: 50px;
}

.search-pill__input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.search-pill__input:focus {
  outline: none;
  background: linear-gradient(135deg, #241c11 0%, #180f07 100%);
}

.search-pill__submit {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  width: 30px;
  aspect-ratio: 1;
  border-left: 2px solid var(--color-accent-ink);
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  border-radius: 50%;
  padding-left: 8px;
  margin-right: 6px;
  background: none;
  cursor: pointer;
}

.search-pill__submit:hover {
  border-left: 3px solid var(--color-accent-ink);
}

.search-pill__icon path {
  fill: var(--color-accent-ink);
}

.soft-btn {
  background-color: var(--color-surface-soft);
  color: var(--color-text);
  text-shadow: 0 1px 0 rgba(255, 180, 90, 0.15);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.06),
    0 1px 0 0 #2a2419,
    0 2px 0 0 #241f16,
    0 3px 0 0 #1e1a12,
    0 4px 0 0 #18140e,
    0 5px 0 0 #120f0a,
    0 6px 0 0 #0c0a07,
    0 6px 10px 0 rgba(0, 0, 0, 0.5);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    color 0.15s ease,
    background-color 0.15s ease;
}

.soft-btn:hover {
  color: var(--color-accent-ink);
  background-color: var(--color-surface);
}

.soft-btn:active {
  transform: translateY(3px);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.06),
    0 1px 0 0 #2a2419,
    0 2px 0 0 #241f16,
    0 2px 4px 0 rgba(0, 0, 0, 0.5);
}
```

(`.btn-command` в `product.css` трогать не нужно — он уже читает цвет из `var(--color-accent-dark)`/`var(--color-accent)`, поэтому автоматически станет оранжевым от Task 1)

- [ ] **Step 2: Перекрасить плейсхолдер-градиенты `CatalogVisual.tsx`**

`src/components/ui/visuals/CatalogVisual.tsx:11-17` — заменить светло-голубые `GRADIENTS` на тёмно-тёплые (используется, когда у товара/категории ещё нет фото):

```tsx
const GRADIENTS = [
  "from-[#241c14] to-[#15100a]",
  "from-[#2a1f13] to-[#17110a]",
  "from-[#2e2015] to-[#1a130c]",
  "from-[#251a10] to-[#140e08]",
  "from-[#281d12] to-[#160f09]",
];
```

- [ ] **Step 3: Исправить невидимые бордеры карточек**

`--color-ink` теперь почти чёрный (`#020201`) — использование его как полупрозрачного бордера на тёмной поверхности (`--color-surface: #15130f`) делает бордер невидимым. Раньше это был тёмно-синий бордер на белой карточке, теперь нужен светлый бордер (роль уже есть — `--color-line`).

`src/components/home/CategoryCard.tsx:11`, было:
```
border-[var(--color-ink)]/15
```
стало:
```
border-[var(--color-line)]
```

`src/components/product-card/ProductCard.tsx:18` — та же замена.

(`Badge` tone="dark" и `CartDrawer`'овский scrim на `--color-ink` не трогаем — это тёмный чип поверх фото и затемняющий оверлей модалки, оба назначения не зависят от темы сайта и продолжают работать корректно и на тёмном, и на светлом.)

- [ ] **Step 4: Проверить**

Run: `npx tsc --noEmit`
Run: `npm run lint`
Expected: без ошибок.

- [ ] **Step 5: Commit**

```bash
git add src/app/styles/buttons.css src/components/ui/visuals/CatalogVisual.tsx src/components/home/CategoryCard.tsx src/components/product-card/ProductCard.tsx
git commit -m "Перекрашены захардкоженные кнопки поиска, плейсхолдеры и бордеры карточек под тёмную палитру"
```

---

### Task 5: Визуальная проверка Phase 1

- [ ] **Step 1: Поднять dev-сервер и пройтись по ключевым страницам**

Run: `npm run dev`, затем через Playwright MCP (`browser_navigate` + `browser_take_screenshot`) или вручную открыть:
- `/` — фон тёмный, оранжево-золотое свечение по краям, шапка/поиск/кнопки читаемы
- `/catalog` — карточки товаров на тёмной поверхности с видимым (не пропавшим) бордером
- `/product/iphone-17-pro` и `/product/galaxy-s25-ultra` — оба флагмана в единой тёмной теме (Samsung больше не светлый)
- `/contacts` — градиент-плашка сверху не выбивается из общей палитры
- `/admin/login` — **должен остаться на старой светлой палитре**, это критическая проверка

Expected: везде на витрине связная тёмная айдентика, нигде не осталось светло-голубых элементов; админка визуально не изменилась.

- [ ] **Step 2: Зафиксировать результат**

Если найдены визуальные баги — исправить точечно (тот же Task 4, доп. правки) до commit. Если всё ок — можно двигаться в Phase 2 без дополнительного коммита (Task 4 уже закоммичен).

---

## Phase 2 — главная страница

### Task 6: Данные для immersive-подачи флагманов

**Files:**
- Modify: `src/lib/catalog.ts`

**Interfaces:**
- Produces: `interface FlagshipShowcaseProduct { id: string; slug: string; name: string; priceByn: number; availability: Availability; images: { url: string; alt: string | null }[] }` и `getFlagshipShowcaseProducts(limit = 2): Promise<FlagshipShowcaseProduct[]>`.
- Не трогает существующие `getFlagshipProducts`/`CatalogCardData` — они используются в `OrderShowcase.tsx` (корзина), их сигнатура не меняется.

- [ ] **Step 1: Добавить новую выборку в `catalog.ts`**

Добавить после `getFlagshipProducts` (после строки 394):

```ts
export interface FlagshipShowcaseProduct {
  id: string;
  slug: string;
  name: string;
  priceByn: number;
  availability: Availability;
  images: { url: string; alt: string | null }[];
}

/** Для immersive-подачи флагманов на главной (FlagshipShowcase) — в отличие
 * от getFlagshipProducts(), отдаёт ВСЕ фото товара (не только главное),
 * упорядоченные как в админке. Без этого 3-картиночный сторителлинг
 * невозможен. */
export async function getFlagshipShowcaseProducts(limit = 2): Promise<FlagshipShowcaseProduct[]> {
  const rate = await getCurrentRate();
  const products = await prisma.product.findMany({
    where: { isActive: true, isFlagship: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
    include: {
      variants: { where: { isDefault: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    priceByn: usdToByn(
      (p.variants[0] ? p.variants[0].priceUsd : p.basePriceUsd).toNumber(),
      rate
    ),
    availability: p.variants[0] ? p.variants[0].availability : p.availability,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
  }));
}
```

- [ ] **Step 2: Проверить**

Run: `npx tsc --noEmit`
Expected: без ошибок типов.

- [ ] **Step 3: Commit**

```bash
git add src/lib/catalog.ts
git commit -m "Добавлена выборка getFlagshipShowcaseProducts с полным списком фото для главной"
```

---

### Task 7: Компонент `FlagshipShowcase`

**Files:**
- Create: `src/components/home/FlagshipShowcase.tsx`

**Interfaces:**
- Consumes (Task 6): `FlagshipShowcaseProduct[]`.
- Consumes: `Price` (`@/components/ui/Price`), `PillCta` (`@/components/ui/PillCta`).
- Produces: `FlagshipShowcase({ products: FlagshipShowcaseProduct[] })` — client-компонент, рендерит `null` при пустом массиве.

- [ ] **Step 1: Написать компонент**

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FlagshipShowcaseProduct } from "@/lib/catalog";
import { Price } from "@/components/ui/Price";
import { PillCta } from "@/components/ui/PillCta";
import { cn } from "@/lib/utils";

/** Главный блок первого экрана — один флагман целиком: большое фото +
 * заголовок + цена + 3 сторителлинговые картинки под ним. Стрелки/точки
 * переключают ВЕСЬ блок между флагманами (не просто фото в углу) — так
 * ротация нескольких флагманов не превращается в мини-каталог. */
export function FlagshipShowcase({ products }: { products: FlagshipShowcaseProduct[] }) {
  const [index, setIndex] = useState(0);
  if (products.length === 0) return null;

  const current = products[index];
  const heroImage = current.images[0] ?? null;
  const storyImages = current.images.slice(1, 4);

  function prev() {
    setIndex((i) => (i - 1 + products.length) % products.length);
  }
  function next() {
    setIndex((i) => (i + 1) % products.length);
  }

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
        <div className="order-2 md:order-1">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-accent-ink)]">
            Флагман
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-semibold leading-[1.05] text-[var(--color-text)] md:text-6xl">
            {current.name}
          </h1>
          <div className="mt-5">
            <Price price={current.priceByn} size="lg" />
          </div>
          <div className="mt-8">
            <PillCta href={`/product/${current.slug}`}>Смотреть товар</PillCta>
          </div>
        </div>

        <div className="relative order-1 aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] md:order-2 md:aspect-[4/5]">
          {heroImage && (
            <Image
              src={heroImage.url}
              alt={current.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain p-8"
              priority
            />
          )}
        </div>
      </div>

      {storyImages.length > 0 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {storyImages.map((img) => (
            <div
              key={img.url}
              className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)]"
            >
              <Image
                src={img.url}
                alt={img.alt ?? current.name}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {products.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Предыдущий флагман"
            className="flex size-9 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-surface-soft)]"
          >
            <ChevronLeft className="size-4 text-[var(--color-text)]" />
          </button>

          <div className="flex items-center gap-2">
            {products.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Показать ${p.name}`}
                aria-current={i === index}
                className={cn(
                  "size-2.5 rounded-full transition-colors",
                  i === index ? "bg-[var(--color-accent)]" : "bg-[var(--color-line)]"
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Следующий флагман"
            className="flex size-9 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-surface-soft)]"
          >
            <ChevronRight className="size-4 text-[var(--color-text)]" />
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Проверить**

Run: `npx tsc --noEmit`
Run: `npm run lint`
Expected: без ошибок (компонент пока никем не используется — это нормально, подключается в Task 9).

- [ ] **Step 3: Commit**

```bash
git add src/components/home/FlagshipShowcase.tsx
git commit -m "Добавлен компонент FlagshipShowcase — immersive-подача флагмана на главной"
```

---

### Task 8: Компонент `GroupingGrid`

**Files:**
- Create: `src/components/home/GroupingGrid.tsx`

**Interfaces:**
- Consumes: `getAllCategories()` (`@/lib/catalog`), `CategoryCard` (`@/components/home/CategoryCard`), `PillCta`.
- Produces: `GroupingGrid()` — async server-компонент, без пропов.

- [ ] **Step 1: Написать компонент**

```tsx
import { RefreshCw, Truck } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getAllCategories } from "@/lib/catalog";
import { CategoryCard } from "@/components/home/CategoryCard";

/** Компактная замена трёх прежних секций главной (Категории + инфо-плашки +
 * грид популярных товаров) одной bento-сеткой: несколько категорий +
 * услуги + переход в каталог. Полный листинг товаров с главной убран
 * намеренно (решение пользователя) — каталог живёт на /catalog. */
export async function GroupingGrid() {
  const categories = await getAllCategories();
  const featured = categories.slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
      {featured.map((category) => (
        <CategoryCard key={category.slug} category={category} />
      ))}

      <div className="flex flex-col gap-3 rounded-[6px_var(--radius-xl)_6px_var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <RefreshCw className="size-5 text-[var(--color-accent-ink)]" />
        <p className="text-sm font-medium text-[var(--color-text)]">Trade-in</p>
        <p className="text-xs text-[var(--color-muted)]">
          Обмен старого устройства на новое — сумму зачёта оценивает менеджер.
        </p>
        <div className="mt-auto flex items-center gap-2 border-t border-[var(--color-line)] pt-3">
          <Truck className="size-4 shrink-0 text-[var(--color-accent-ink)]" />
          <p className="text-xs text-[var(--color-muted)]">
            Доставка по всей Беларуси, гарантия 12 месяцев.
          </p>
        </div>
      </div>

      <Link
        href="/catalog"
        className="group flex flex-col justify-between gap-3 rounded-[6px_var(--radius-xl)_6px_var(--radius-xl)] bg-[var(--color-accent)] p-5 text-white shadow-[var(--shadow-accent-glow)] transition-colors hover:bg-[var(--color-accent-dark)]"
      >
        <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        <div>
          <p className="text-lg font-semibold">Весь каталог</p>
          <p className="text-sm opacity-90">Apple, Samsung и аксессуары</p>
        </div>
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Проверить**

Run: `npx tsc --noEmit`
Run: `npm run lint`
Expected: без ошибок.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/GroupingGrid.tsx
git commit -m "Добавлен компонент GroupingGrid — компактная bento-группировка вместо трёх секций главной"
```

---

### Task 9: Пересобрать `src/app/page.tsx`, удалить неиспользуемые компоненты

**Files:**
- Modify: `src/app/page.tsx`
- Delete: `src/components/hero/MoonHero.tsx`
- Delete: `src/components/hero/HeroCarousel.tsx`
- Delete: `src/components/home/FlagshipProducts.tsx`
- Delete: `src/components/home/InfoTeasers.tsx`
- Delete: `src/components/home/PopularProducts.tsx`
- Delete: `src/components/home/PopularProductsGrid.tsx`
- Modify: `src/lib/catalog.ts` (удалить неиспользуемый `getPopularProducts`)

**Interfaces:**
- Consumes (Task 6, 7, 8): `getFlagshipShowcaseProducts`, `FlagshipShowcase`, `GroupingGrid`.

- [ ] **Step 1: Переписать `page.tsx`**

```tsx
import { FlagshipShowcase } from "@/components/home/FlagshipShowcase";
import { GroupingGrid } from "@/components/home/GroupingGrid";
import { ContactTeaser } from "@/components/home/ContactTeaser";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { getFlagshipShowcaseProducts } from "@/lib/catalog";

export default async function HomePage() {
  const flagships = await getFlagshipShowcaseProducts(2);

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <FlagshipShowcase products={flagships} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <RevealOnScroll>
          <GroupingGrid />
        </RevealOnScroll>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 md:px-6">
        <ContactTeaser />
      </section>
    </>
  );
}
```

- [ ] **Step 2: Удалить неиспользуемые файлы**

Все шесть файлов ниже используются только внутри друг друга и старого `page.tsx` (проверено — нет других импортов):

```bash
rm src/components/hero/MoonHero.tsx
rm src/components/hero/HeroCarousel.tsx
rm src/components/home/FlagshipProducts.tsx
rm src/components/home/InfoTeasers.tsx
rm src/components/home/PopularProducts.tsx
rm src/components/home/PopularProductsGrid.tsx
```

Если после удаления `src/components/hero/` окажется пустой директорией — удалить и её.

- [ ] **Step 3: Удалить неиспользуемый `getPopularProducts` из `catalog.ts`**

`src/lib/catalog.ts:396-409` — функция `getPopularProducts` использовалась только в удалённом `PopularProducts.tsx`. Удалить целиком (сигнатура `export async function getPopularProducts(limit = 6): Promise<CatalogCardData[]> { ... }` и её тело).

- [ ] **Step 4: Проверить**

Run: `npx tsc --noEmit`
Expected: без ошибок про несуществующие импорты.
Run: `npm run lint`
Expected: без ошибок, без предупреждений о неиспользуемых экспортах.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/lib/catalog.ts
git rm src/components/hero/MoonHero.tsx src/components/hero/HeroCarousel.tsx src/components/home/FlagshipProducts.tsx src/components/home/InfoTeasers.tsx src/components/home/PopularProducts.tsx src/components/home/PopularProductsGrid.tsx
git commit -m "Пересобрана главная страница: FlagshipShowcase + GroupingGrid вместо каталожной сетки"
```

---

### Task 10: Визуальная проверка Phase 2

- [ ] **Step 1: Проверить главную в браузере**

Run: `npm run dev`, открыть `/` (Playwright MCP или вручную).

Expected:
- Первый экран — один флагман: крупное фото, имя, цена, кнопка «Смотреть товар»
- Под ним — до 3 сторителлинговых фото (если у товара их меньше — блок не ломается, просто короче)
- Точки/стрелки переключают на второй флагман (Samsung) — весь блок обновляется
- Ниже — компактная сетка (4 категории + услуги + переход в каталог), НЕ похожая на листинг товаров
- Внизу — блок контактов

- [ ] **Step 2: Зафиксировать**

Если найдены визуальные проблемы (обрезка фото, разъезжающаяся сетка на мобильной ширине) — точечно поправить classNames в `FlagshipShowcase.tsx`/`GroupingGrid.tsx` до перехода к Phase 3.

---

## Phase 3 — универсальная карточка товара

### Task 11: Адаптивная галерея товара

**Files:**
- Modify: `src/components/product/ProductGallery.tsx`

**Interfaces:**
- Consumes: `ProductDetail` (`@/lib/catalog`), `Badge`.
- Produces: `ProductGallery({ product: ProductDetail; imageUrl: string | null })` — та же сигнатура, что и раньше (вызывающий код в `ProductPurchasePanel.tsx` не меняется).

- [ ] **Step 1: Переписать компонент**

```tsx
import Image from "next/image";
import type { ProductDetail } from "@/lib/catalog";
import { Badge } from "@/components/ui/Badge";
import { CatalogVisual } from "@/components/ui/visuals/CatalogVisual";

/** Адаптивная подача фото: у большинства товаров в базе только 1 фото
 * (сидируется как mainImage) — для них крупный full-bleed hero. Мультифото
 * (сейчас только у флагманов, залито вручную через админку) даёт
 * галерею-периферию: главное фото крупно + до 2 дополнительных ракурсов
 * рядом. Секундарные фото — любые прочие снимки товара, кроме текущего
 * выбранного (imageUrl меняется при выборе цвета в ProductPurchasePanel). */
export function ProductGallery({
  product,
  imageUrl,
}: {
  product: ProductDetail;
  imageUrl: string | null;
}) {
  const secondary = product.images.filter((img) => img.url !== imageUrl).slice(0, 2);

  if (secondary.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
        {product.isFlagship && (
          <Badge tone="dark" className="absolute left-4 top-4 z-10">
            Флагман
          </Badge>
        )}
        <CatalogVisual
          imageUrl={imageUrl}
          alt={product.name}
          iconHint={`${product.categoryName} ${product.name}`}
          gradientSeed={product.categorySlug}
          size="lg"
          imageFit="contain"
          sizesAttr="(min-width: 1024px) 60vw, 100vw"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] sm:row-span-2 sm:aspect-auto">
        {product.isFlagship && (
          <Badge tone="dark" className="absolute left-4 top-4 z-10">
            Флагман
          </Badge>
        )}
        <CatalogVisual
          imageUrl={imageUrl}
          alt={product.name}
          iconHint={`${product.categoryName} ${product.name}`}
          gradientSeed={product.categorySlug}
          size="lg"
          imageFit="contain"
          sizesAttr="(min-width: 1024px) 40vw, 100vw"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
        {secondary.map((img) => (
          <div
            key={img.url}
            className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
          >
            <Image
              src={img.url}
              alt={img.alt ?? product.name}
              fill
              sizes="(min-width: 1024px) 20vw, 50vw"
              className="object-contain p-4"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Проверить**

Run: `npx tsc --noEmit`
Run: `npm run lint`
Expected: без ошибок.

- [ ] **Step 3: Commit**

```bash
git add src/components/product/ProductGallery.tsx
git commit -m "Адаптивная галерея товара: full-bleed hero при 1 фото, периферия при 2-3+"
```

---

### Task 12: Кнопка «Показать больше» в `ProductInfo`

**Files:**
- Modify: `src/components/product/ProductInfo.tsx`

**Interfaces:**
- Не меняет пропы компонента и существующие `data-testid`/роли (`data-testid="product-price"`, кнопка «В корзину», кнопки атрибутов) — e2e-тесты (`e2e/order-flow.spec.ts`, `e2e/price-recalculation.spec.ts`) продолжают работать без изменений.
- Produces: якорь `#product-details` как цель ссылки (сам якорь создаётся в Task 14, в `page.tsx`).

- [ ] **Step 1: Добавить кнопку рядом с «В корзину»**

В `src/components/product/ProductInfo.tsx`, блок с кнопкой добавления в корзину (строки 126-158) — обернуть в дополнительную обёртку и добавить вторую кнопку-якорь:

```tsx
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 rounded-full border border-[var(--color-line)]">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Уменьшить количество"
            className="flex size-10 items-center justify-center text-[var(--color-text)]"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-6 text-center tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Увеличить количество"
            className="flex size-10 items-center justify-center text-[var(--color-text)]"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            addItem({ productId: product.id, variantId, colorValueId: selectedColorId ?? null, qty })
          }
          disabled={!inStock || needsSelection}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag className="size-4" />
          {inStock ? "В корзину" : "Нет в наличии"}
        </button>

        <a
          href="#product-details"
          className="flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] px-5 py-3.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]"
        >
          Показать больше
        </a>
      </div>
```

Это заменяет существующий блок `<div className="flex items-center gap-3">...</div>` — меняется только обёртка (`flex-col sm:flex-row` вместо `flex items-center gap-3`, чтобы на мобильном три элемента не сжимались в один ряд) и добавляется последний `<a>`. Логика количества/добавления в корзину не меняется ни на строчку.

- [ ] **Step 2: Проверить**

Run: `npx tsc --noEmit`
Run: `npm run lint`
Expected: без ошибок.

- [ ] **Step 3: Commit**

```bash
git add src/components/product/ProductInfo.tsx
git commit -m "Добавлена кнопка «Показать больше» рядом с «В корзину» — якорь на характеристики"
```

---

### Task 13: Более «фотоцентричные» пропорции `ProductPurchasePanel`

**Files:**
- Modify: `src/components/product/ProductPurchasePanel.tsx:47`

**Interfaces:** без изменений (внутренняя логика выбора варианта/цвета не трогается).

- [ ] **Step 1: Изменить пропорции колонок**

`src/components/product/ProductPurchasePanel.tsx:47`, было:
```tsx
    <div className="grid gap-10 lg:grid-cols-2">
```
стало:
```tsx
    <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
```

Фото получают больше веса на широких экранах — соответствует запросу «в первую очередь картинки». На мобильном/планшете ничего не меняется (grid остаётся одноколоночным до `lg`).

- [ ] **Step 2: Проверить**

Run: `npx tsc --noEmit`
Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/components/product/ProductPurchasePanel.tsx
git commit -m "Галерея товара занимает больше места на широких экранах"
```

---

### Task 14: Унифицировать страницу товара, убрать отдельный флагманский шаблон

**Files:**
- Modify: `src/app/product/[slug]/page.tsx`
- Delete: `src/components/product/flagship/FlagshipHero.tsx`
- Delete: `src/components/product/flagship/FlagshipFeatureGrid.tsx`
- Delete: `src/components/product/flagship/FlagshipPurchaseSection.tsx`
- Delete: `src/components/product/flagship/FlagshipProductPage.tsx`

**Interfaces:**
- Consumes: `ProductPurchasePanel`, `ProductSpecsTable`, `RelatedProducts`, `Breadcrumbs` — все без изменения сигнатур.

- [ ] **Step 1: Проверить, что у обоих флагманов есть `specs` в БД**

Флагманы уже были заполнены характеристиками через админку (см. историю проекта — задача с флагманскими страницами). `ProductSpecsTable` рендерит `product.specs` — тот же источник данных, что раньше дублировался в захардкоженном `FlagshipFeatureGrid` (с рассинхроном по факту — `FlagshipFeatureGrid` было привязано к двум конкретным slug'ам и не масштабировалось на остальные товары). Удаление `FlagshipFeatureGrid` не теряет данные, только убирает захардкоженную копию.

- [ ] **Step 2: Убрать ветку `isFlagship` из `page.tsx`**

`src/app/product/[slug]/page.tsx` — убрать импорт `FlagshipProductPage` и блок:
```tsx
  if (product.isFlagship) {
    return (
      <>
        {jsonLd}
        <FlagshipProductPage product={product} />
      </>
    );
  }
```

Обернуть блок характеристик якорем `#product-details` (цель кнопки «Показать больше» из Task 12):

```tsx
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);
  if (!product) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const canonicalUrl = `${siteUrl}${product.canonicalPath || `/product/${product.slug}`}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description || undefined,
    image: product.mainImageUrl ? [`${siteUrl}${product.mainImageUrl}`] : undefined,
    brand: { "@type": "Brand", name: product.brandName },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "BYN",
      price: product.basePriceByn,
      availability:
        product.availability === "IN_STOCK"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  const jsonLd = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
    />
  );

  const related = await getRelatedProducts(product.categorySlug, product.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      {jsonLd}
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: product.brandName, href: "/catalog" },
          { label: product.categoryName, href: `/catalog/${product.categorySlug}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6">
        <ProductPurchasePanel product={product} />
      </div>

      <div id="product-details" className="mt-16 scroll-mt-24">
        <ProductSpecsTable specs={product.specs} description={product.description} />
      </div>

      <RelatedProducts products={related} />
    </div>
  );
}
```

(`scroll-mt-24` — чтобы фиксированная шапка не перекрывала якорь после скролла по кнопке «Показать больше»; импорт `getRelatedProducts`, `Breadcrumbs`, `ProductPurchasePanel`, `ProductSpecsTable`, `RelatedProducts`, `getProductDetailBySlug` — уже есть в файле, `notFound` тоже, только убирается импорт `FlagshipProductPage`.)

- [ ] **Step 3: Удалить директорию `flagship/`**

```bash
rm -r src/components/product/flagship
```

- [ ] **Step 4: Проверить**

Run: `npx tsc --noEmit`
Expected: без ошибок про отсутствующие импорты `FlagshipProductPage`.
Run: `npm run lint`

- [ ] **Step 5: Commit**

```bash
git add src/app/product/[slug]/page.tsx
git rm -r src/components/product/flagship
git commit -m "Унифицирована страница товара — флагманы используют общий шаблон вместо отдельного"
```

---

### Task 15: Визуальная проверка + e2e-регрессия Phase 3

- [ ] **Step 1: Визуальная проверка в браузере**

Run: `npm run dev`, открыть (Playwright MCP или вручную):
- `/product/iphone-17-pro-max` (обычный товар, 1 фото) — крупный full-bleed hero, кнопки «В корзину» и «Показать больше» рядом, клик по «Показать больше» плавно скроллит к характеристикам
- `/product/iphone-17-pro` (флагман, несколько фото) — галерея-периферия (главное фото + доп. ракурсы), тот же паттерн кнопок
- `/product/galaxy-s25-ultra` — то же самое, единая тёмная тема (не светлая, как было раньше)
- Внизу любой карточки — блок «Похожие товары» с кнопками на другие товары

Expected: везде общий immersive-шаблон, никаких визуальных остатков старого раздельного дизайна.

- [ ] **Step 2: Прогнать e2e-регрессию**

Требует поднятого Postgres с накаченной схемой и сидом:
```bash
docker compose up -d db
npm run prisma:migrate
npm run prisma:seed
npm run test:e2e
```

Expected: `e2e/order-flow.spec.ts` и `e2e/price-recalculation.spec.ts` — оба зелёные. Это критично: они проверяют реальный сценарий выбора варианта → добавление в корзину → оформление заказа на `iphone-17-pro-max`, который теперь идёт через новый универсальный шаблон.

Если окружение не может поднять БД — прогон делает пользователь отдельно перед тем, как считать Phase 3 завершённой; не пропускать эту проверку молча.

- [ ] **Step 3: Финальная сверка со спекой**

Перечитать `docs/superpowers/specs/2026-09-09-black-orange-redesign-design.md` и убедиться, что все три этапа реализованы как описано. Если найдены расхождения — зафиксировать их в отдельном коммите с точечным фиксом.

---

## Порядок выполнения

Строго последовательно: Phase 1 → визуальный чекпоинт → Phase 2 → визуальный чекпоинт → Phase 3 → визуальный чекпоинт + e2e. Каждая фаза даёт рабочий, задеплоить-способный срез сайта — можно остановиться после любой фазы, ничего не будет сломано.
