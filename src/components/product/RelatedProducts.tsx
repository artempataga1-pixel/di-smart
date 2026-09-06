import type { CatalogCardData } from "@/lib/catalog";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/catalog/ProductGrid";

export function RelatedProducts({ products }: { products: CatalogCardData[] }) {
  if (products.length === 0) return null;

  return (
    <div className="mt-16">
      <SectionHeading title="Похожие товары" />
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
