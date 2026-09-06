"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { cn } from "@/lib/utils";

const COLLAPSED_COUNT = 4;

export function ProductSpecsTable({
  specs,
  description,
}: {
  specs: { name: string; value: string }[];
  description: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = specs.length > COLLAPSED_COUNT;
  const visibleSpecs = expanded ? specs : specs.slice(0, COLLAPSED_COUNT);

  if (!description && specs.length === 0) return null;

  return (
    <RevealOnScroll>
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:p-8">
        {description && (
          <>
            <h2 className="font-medium text-[var(--color-text)]">Описание</h2>
            <p className="mt-2 text-[var(--color-muted)]">{description}</p>
          </>
        )}

        {specs.length > 0 && (
          <>
            <h2 className="mt-6 font-medium text-[var(--color-text)]">Характеристики</h2>
            <dl className="mt-3 divide-y divide-[var(--color-line)]">
              {visibleSpecs.map((spec) => (
                <div key={spec.name} className="flex justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-[var(--color-muted)]">{spec.name}</dt>
                  <dd className="text-right font-medium text-[var(--color-text)]">{spec.value}</dd>
                </div>
              ))}
            </dl>
            {hasMore && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-3 flex items-center gap-1 text-sm font-medium text-[var(--color-accent-ink)]"
              >
                {expanded ? "Свернуть" : `Показать все характеристики (${specs.length})`}
                <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
              </button>
            )}
          </>
        )}
      </div>
    </RevealOnScroll>
  );
}
