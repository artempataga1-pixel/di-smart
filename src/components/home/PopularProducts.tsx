import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { getPopularProducts } from "@/lib/catalog";

export async function PopularProducts() {
  const products = await getPopularProducts(6);
  if (products.length === 0) return null;

  return (
    <div>
      <SectionHeading
        eyebrow="Подборка"
        title="Популярные товары"
        description="То, что чаще всего выбирают наши покупатели"
        href="/catalog"
      />
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
