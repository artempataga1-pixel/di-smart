import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  oldPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-3xl md:text-4xl",
};

export function Price({ price, oldPrice, size = "md", className }: PriceProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold tabular-nums", sizeClasses[size])}>
        {formatPrice(price)}
      </span>
      {oldPrice && oldPrice > price && (
        <span className="text-sm text-[var(--color-muted)] line-through tabular-nums">
          {formatPrice(oldPrice)}
        </span>
      )}
    </span>
  );
}
