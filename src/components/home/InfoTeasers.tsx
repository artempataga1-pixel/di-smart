import { RefreshCw, Truck } from "lucide-react";
import { PillCta } from "@/components/ui/PillCta";

export function InfoTeasers() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:p-8">
        <RefreshCw className="size-6 text-[var(--color-accent-ink)]" />
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-text)]">
            Trade-in
          </h3>
          <p className="mt-2 text-[var(--color-muted)]">
            Обменяйте старое устройство Apple или Samsung на новое — точную сумму зачёта
            оценивает менеджер индивидуально.
          </p>
        </div>
        <PillCta href="/trade-in" variant="ghost" size="sm" className="mt-auto w-fit">
          Узнать подробнее
        </PillCta>
      </div>

      <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:p-8">
        <Truck className="size-6 text-[var(--color-accent-ink)]" />
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-text)]">
            Доставка и гарантия
          </h3>
          <p className="mt-2 text-[var(--color-muted)]">
            Бесплатно по Минску, 20 BYN по остальной Беларуси. Официальная гарантия — 12 месяцев.
          </p>
        </div>
        <PillCta href="/delivery" variant="ghost" size="sm" className="mt-auto w-fit">
          Условия доставки
        </PillCta>
      </div>
    </div>
  );
}
