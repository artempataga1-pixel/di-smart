import type { ProductSpec } from "@/types/product";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function ProductSpecsTable({ specs, description }: { specs: ProductSpec[]; description: string }) {
  return (
    <RevealOnScroll>
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:p-8">
        <h2 className="font-medium text-[var(--color-text)]">Описание</h2>
        <p className="mt-2 text-[var(--color-muted)]">{description}</p>

        <h2 className="mt-6 font-medium text-[var(--color-text)]">Характеристики</h2>
        <dl className="mt-3 divide-y divide-[var(--color-line)]">
          {specs.map((spec) => (
            <div key={spec.label} className="flex justify-between gap-4 py-2.5 text-sm">
              <dt className="text-[var(--color-muted)]">{spec.label}</dt>
              <dd className="text-right font-medium text-[var(--color-text)]">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </RevealOnScroll>
  );
}
