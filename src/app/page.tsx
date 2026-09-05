import { MoonHero } from "@/components/hero/MoonHero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { PopularProducts } from "@/components/home/PopularProducts";
import { ContactTeaser } from "@/components/home/ContactTeaser";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function HomePage() {
  return (
    <>
      <MoonHero />

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <RevealOnScroll>
          <SectionHeading title="Категории" description="Выберите то, что вам нужно" />
        </RevealOnScroll>
        <div className="mt-8">
          <CategoryGrid />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <PopularProducts />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 md:px-6">
        <ContactTeaser />
      </section>
    </>
  );
}
