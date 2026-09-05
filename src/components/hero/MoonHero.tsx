import { PillCta } from "@/components/ui/PillCta";

export function MoonHero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2 md:gap-6 md:px-6">
        <div className="order-2 md:order-1">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold leading-[1.05] text-[var(--color-text)] md:text-6xl">
            Техника,
            <br />
            выбранная с умом
          </h1>
          <p className="mt-5 max-w-md text-lg text-[var(--color-muted)]">
            Apple, Samsung и Dyson в одном магазине. Продажа, экспертная
            консультация, ремонт и гарантийное обслуживание в Ставрополе.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillCta href="/catalog">Смотреть каталог</PillCta>
          </div>
        </div>

        <div className="order-1 md:order-2">
          {/* TODO: карусель флагманов — уровень 4 плана */}
        </div>
      </div>
    </section>
  );
}
