import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Fan,
  Wind,
  ShieldHalf,
  Plug,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductIconKey, CategorySlug } from "@/types/product";

const ICONS: Record<ProductIconKey, LucideIcon> = {
  smartphone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
  watch: Watch,
  headphones: Headphones,
  vacuum: Fan,
  hairdryer: Wind,
  case: ShieldHalf,
  charger: Plug,
};

/* Мягкие категориальные тона поверх общей лавандовой гаммы — товар из
   каталога сразу читается по цвету плашки, не только по иконке. */
export const CATEGORY_GRADIENT: Record<CategorySlug, string> = {
  smartphones: "from-[#efe7fa] to-[#e0d3f2]",
  laptops: "from-[#eae4f7] to-[#d9cceb]",
  tablets: "from-[#f0e9f9] to-[#e3d6f0]",
  accessories: "from-[#f3ecf9] to-[#e6d9ef]",
  dyson: "from-[#ece2f6] to-[#dbc8ec]",
};

interface ProductVisualProps {
  icon: ProductIconKey;
  category: CategorySlug;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_ICON_CLASS = {
  sm: "size-8",
  md: "size-14",
  lg: "size-24",
};

export function ProductVisual({ icon, category, size = "md", className }: ProductVisualProps) {
  const Icon = ICONS[icon];
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br",
        CATEGORY_GRADIENT[category],
        className
      )}
    >
      <div
        aria-hidden
        className="absolute -right-6 -top-6 size-28 rounded-full bg-[var(--color-accent-glow)] opacity-30 blur-2xl"
      />
      <Icon
        className={cn(SIZE_ICON_CLASS[size], "text-[var(--color-accent-ink)]")}
        strokeWidth={1.4}
      />
    </div>
  );
}
