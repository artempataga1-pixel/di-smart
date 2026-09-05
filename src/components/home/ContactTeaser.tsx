import { Phone, Clock, Send } from "lucide-react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { PillCta } from "@/components/ui/PillCta";
import { SITE } from "@/constants/content/site";

export function ContactTeaser() {
  return (
    <RevealOnScroll>
      <div className="flex flex-col items-start justify-between gap-8 rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)] md:flex-row md:items-center md:p-12">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-text)] md:text-3xl">
            Свяжитесь с нами
          </h2>
          <div className="mt-4 flex flex-col gap-2 text-[var(--color-muted)]">
            <span className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              {SITE.hours}
            </span>
            <a
              href={SITE.phoneHref}
              className="flex items-center gap-2 hover:text-[var(--color-accent-ink)]"
            >
              <Phone className="size-4 shrink-0" />
              {SITE.phone}
            </a>
            <a
              href={SITE.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[var(--color-accent-ink)]"
            >
              <Send className="size-4 shrink-0" />
              {SITE.telegramLabel}
            </a>
          </div>
        </div>
        <PillCta href="/contacts" className="shrink-0">
          Все контакты
        </PillCta>
      </div>
    </RevealOnScroll>
  );
}
