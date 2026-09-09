import { FlagshipShowcase } from "@/components/home/FlagshipShowcase";
import { GroupingGrid } from "@/components/home/GroupingGrid";
import { ContactTeaser } from "@/components/home/ContactTeaser";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { getFlagshipShowcaseProducts } from "@/lib/catalog";

export default async function HomePage() {
  const flagships = await getFlagshipShowcaseProducts(2);

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <FlagshipShowcase products={flagships} />
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
