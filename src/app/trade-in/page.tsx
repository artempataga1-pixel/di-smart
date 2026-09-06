import type { Metadata } from "next";
import { RefreshCw } from "lucide-react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { PillCta } from "@/components/ui/PillCta";
import { SITE } from "@/constants/content/site";

export const metadata: Metadata = {
  title: `Trade-in — ${SITE.name}`,
  description:
    "Обменяйте старое устройство Apple или Samsung на новое со скидкой — оценка проводится индивидуально менеджером.",
};

export default function TradeInPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <RevealOnScroll>
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-[var(--color-accent-ink)]">
          Trade-in
        </p>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold md:text-4xl">
          Обменяйте старое устройство на новое
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-[var(--color-muted)]">
          {SITE.name} принимает в зачёт стоимости нового устройства ваш старый
          смартфон, планшет или ноутбук Apple либо Samsung. Оценка состояния
          техники и точная сумма зачёта определяются индивидуально менеджером
          — напишите или позвоните нам, расскажите о модели и состоянии
          устройства, и мы посчитаем условия обмена.
        </p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <div className="mt-10 flex flex-col gap-8 rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)] md:p-10">
          <div className="flex items-start gap-3">
            <RefreshCw className="mt-0.5 size-5 shrink-0 text-[var(--color-accent-ink)]" />
            <p className="text-[var(--color-muted)]">
              Как это работает: свяжитесь с менеджером удобным способом,
              опишите устройство (модель, объём памяти, состояние экрана и
              корпуса, комплектность) — в ответ вы получите ориентировочную
              сумму зачёта и дальнейшие шаги.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <PillCta
              href={SITE.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Написать в Telegram
            </PillCta>
            <PillCta href={SITE.phoneHref} variant="ghost">
              Позвонить: {SITE.phone}
            </PillCta>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
}
