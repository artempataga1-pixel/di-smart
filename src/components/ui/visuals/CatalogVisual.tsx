import Image from "next/image";
import { Smartphone, Laptop, Tablet, Watch, Headphones, Cable, Package } from "lucide-react";
import { cn } from "@/lib/utils";

/* Реальных фото для большинства товаров пока нет (клиент подключит их через
 * админку, задача 56) — до тех пор карточка красиво откатывается на
 * градиентную плашку с иконкой. Ни цвет, ни иконка не хардкодятся по
 * конкретному бренду/категории (их набор растёт из БД без правки кода) —
 * цвет считается детерминированным хешем строки-сида, иконка подбирается
 * эвристикой по ключевым словам с безопасным дефолтом для незнакомых. */
const GRADIENTS = [
  "from-[#241c14] to-[#15100a]",
  "from-[#2a1f13] to-[#17110a]",
  "from-[#2e2015] to-[#1a130c]",
  "from-[#251a10] to-[#140e08]",
  "from-[#281d12] to-[#160f09]",
];

function pickGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

/* Иконка выбирается в два шага (эвристика -> ключ -> компонент через
 * объектный индекс) вместо того, чтобы функция сразу возвращала компонент —
 * так и `ICONS[icon]`-подобный паттерн, и линтер `react-hooks/static-components`
 * видят прямой индекс по объекту из стабильных top-level компонентов,
 * а не «компонент, вычисленный функцией» во время рендера. */
const ICON_BY_KEY = {
  smartphone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
  watch: Watch,
  headphones: Headphones,
  cable: Cable,
  default: Package,
} as const;

type IconKey = keyof typeof ICON_BY_KEY;

const KEYWORD_PATTERNS: [RegExp, IconKey][] = [
  [/iphone|смартфон|galaxy s|galaxy z|galaxy a/i, "smartphone"],
  [/macbook|ноутбук/i, "laptop"],
  [/ipad|планшет|tab/i, "tablet"],
  [/watch|часы/i, "watch"],
  [/airpods|buds|наушник/i, "headphones"],
  [/кабель|зарядн|адаптер|charger|cable/i, "cable"],
];

function pickIconKey(hint: string): IconKey {
  for (const [pattern, key] of KEYWORD_PATTERNS) {
    if (pattern.test(hint)) return key;
  }
  return "default";
}

const SIZE_ICON_CLASS = { sm: "size-8", md: "size-14", lg: "size-24" };

interface CatalogVisualProps {
  imageUrl?: string | null;
  alt: string;
  /** Строка для подбора иконки (обычно название категории или товара). */
  iconHint: string;
  /** Строка для стабильного выбора градиента (обычно slug категории). */
  gradientSeed: string;
  size?: "sm" | "md" | "lg";
  sizesAttr?: string;
  imageFit?: "cover" | "contain";
  className?: string;
}

export function CatalogVisual({
  imageUrl,
  alt,
  iconHint,
  gradientSeed,
  size = "md",
  sizesAttr = "400px",
  imageFit = "cover",
  className,
}: CatalogVisualProps) {
  if (imageUrl) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={sizesAttr}
          className={imageFit === "contain" ? "object-contain p-6" : "object-cover"}
        />
      </div>
    );
  }

  const Icon = ICON_BY_KEY[pickIconKey(iconHint)];
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br",
        pickGradient(gradientSeed),
        className
      )}
    >
      <div
        aria-hidden
        className="absolute -right-6 -top-6 size-28 rounded-full bg-[var(--color-accent-glow)] opacity-30 blur-2xl"
      />
      <Icon className={cn(SIZE_ICON_CLASS[size], "text-[var(--color-accent-ink)]")} strokeWidth={1.4} />
    </div>
  );
}
