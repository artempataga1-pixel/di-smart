import { Phone } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SERVICES } from "@/constants/content/services";
import { SITE } from "@/constants/content/site";

const CARD_BASE = "linear-gradient(160deg, var(--color-ink-soft), var(--color-ink))";

// Вместо стороннего видео — фирменные градиентные подложки карточек,
// в тонах сайта (accent-фиолетовый и success-зелёный).
const CARD_TINTS = [
  `radial-gradient(circle at 85% -10%, color-mix(in srgb, var(--color-success) 32%, transparent), transparent 60%), ${CARD_BASE}`,
  `radial-gradient(circle at 85% -10%, color-mix(in srgb, var(--color-accent) 42%, transparent), transparent 60%), ${CARD_BASE}`,
];

export function ServicesTeaser() {
  const [primary, ...rest] = SERVICES;

  return (
    <div id="services" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Сервис"
        title="Не только продажа"
        description="Помогаем на всех этапах — от выбора до постгарантийного обслуживания"
      />

      <div className="mt-8 flex flex-col gap-4">
        <RevealOnScroll>
          <div
            className="group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] p-7 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] md:min-h-[280px] md:p-10"
            style={{ background: CARD_BASE }}
          >
            <primary.icon
              className="pointer-events-none absolute -right-6 -top-6 size-40 text-[var(--color-on-ink)] opacity-[0.08] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 md:size-52"
              strokeWidth={1}
            />
            <h3 className="relative max-w-md font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-on-ink)] md:text-3xl">
              {primary.title}
            </h3>
            <div className="relative max-w-sm">
              <p className="text-sm text-[var(--color-on-ink-muted)] md:text-base">
                {primary.description}
              </p>
              <a
                href={SITE.phoneHref}
                className="soft-btn mt-4 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm md:px-5 md:py-2.5"
              >
                <Phone className="size-4" />
                Записаться
              </a>
            </div>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rest.map((service, i) => (
            <RevealOnScroll key={service.title} delay={0.08 + i * 0.06}>
              <div
                className="group relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] p-6 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] md:p-7"
                style={{ background: CARD_TINTS[i] }}
              >
                <div className="relative flex items-center justify-between gap-3">
                  <span className="inline-flex w-fit items-center rounded-full bg-[var(--color-on-ink)]/10 px-3 py-1 text-xs font-medium text-[var(--color-on-ink)]">
                    {service.title}
                  </span>
                  <service.icon
                    className="size-6 shrink-0 text-[var(--color-on-ink-muted)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                    strokeWidth={1.6}
                  />
                </div>
                <div className="relative">
                  <p className="text-sm text-[var(--color-on-ink-muted)]">{service.description}</p>
                  <a
                    href={SITE.phoneHref}
                    className="soft-btn mt-4 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm"
                  >
                    <Phone className="size-4" />
                    Записаться
                  </a>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </div>
  );
}
