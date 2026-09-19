"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const [lastSubmitted, setLastSubmitted] = useState(value);

  // The URL-backed value can change after a server navigation or reset. Keep the
  // thumb in sync without issuing another navigation from an effect.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(value);
    setLastSubmitted(value);
  }

  if (min === max) return null;

  function commit(nextValue: number) {
    setDraft(nextValue);
    if (nextValue === lastSubmitted) return;
    setLastSubmitted(nextValue);
    onChange(nextValue);
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-[var(--color-text)]">Цена, до</p>
      <input
        type="range"
        min={min}
        max={max}
        value={draft}
        onChange={(event) => setDraft(Number(event.currentTarget.value))}
        onPointerUp={(event) => commit(Number(event.currentTarget.value))}
        onPointerCancel={(event) => commit(Number(event.currentTarget.value))}
        onKeyUp={(event) => commit(Number(event.currentTarget.value))}
        onBlur={(event) => commit(Number(event.currentTarget.value))}
        className="w-full accent-[var(--color-accent)]"
      />
      <div className="mt-1.5 flex justify-between text-xs text-[var(--color-muted)]">
        <span>{formatPrice(min)}</span>
        <span className="font-medium text-[var(--color-text)]">{formatPrice(draft)}</span>
      </div>
    </div>
  );
}
