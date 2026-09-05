import { formatPrice } from "@/lib/format";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
  if (min === max) return null;

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-[var(--color-text)]">Цена, до</p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-accent)]"
      />
      <div className="mt-1.5 flex justify-between text-xs text-[var(--color-muted)]">
        <span>{formatPrice(min)}</span>
        <span className="font-medium text-[var(--color-text)]">{formatPrice(value)}</span>
      </div>
    </div>
  );
}
