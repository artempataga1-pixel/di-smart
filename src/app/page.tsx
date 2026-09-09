import { FlagshipShowcase } from "@/components/home/FlagshipShowcase";
import { GroupingGrid } from "@/components/home/GroupingGrid";
import { ContactTeaser } from "@/components/home/ContactTeaser";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { PillCta } from "@/components/ui/PillCta";
import { getFlagshipShowcaseProducts } from "@/lib/catalog";

export default async function HomePage() {
  const flagships = await getFlagshipShowcaseProducts(2);

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          {flagships.length > 0 ? (
            <FlagshipShowcase products={flagships} />
          ) : (
            <div className="py-8 text-center md:py-16">
              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-[var(--color-text)] md:text-6xl">
                Di-SMART
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted)]">
                Техника и аксессуары для дома и работы — выбирайте в каталоге.
              </p>
              <div className="mt-8 flex justify-center">
                <PillCta href="/catalog">Смотреть каталог</PillCta>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <RevealOnScroll>
          <GroupingGrid />
        </RevealOnScroll>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 md:px-6">
        <ContactTeaser />
      </section>
    </>
  );
}
