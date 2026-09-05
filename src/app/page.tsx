import { MoonHero } from "@/components/hero/MoonHero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { PromoBanner } from "@/components/home/PromoBanner";
import { PopularProducts } from "@/components/home/PopularProducts";
import { ServicesTeaser } from "@/components/home/ServicesTeaser";
import { TrustBadges } from "@/components/home/TrustBadges";
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

      <section className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <div className="flex flex-col gap-5">
          <PromoBanner
            eyebrow="Apple"
            title="Для тех, кто выбирает лучшее"
            href="/catalog/smartphones"
            icon="smartphone"
            category="smartphones"
            image="/images/iphone.webp"
          />
          <PromoBanner
            eyebrow="Dyson"
            title="Технологии, которые чувствуются"
            href="/catalog/dyson"
            icon="hairdryer"
            category="dyson"
            video="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
            reverse
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <PopularProducts />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <ServicesTeaser />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <TrustBadges />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 md:px-6">
        <ContactTeaser />
      </section>
    </>
  );
}
