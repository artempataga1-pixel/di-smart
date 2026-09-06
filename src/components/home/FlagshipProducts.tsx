import { SectionHeading } from "@/components/ui/SectionHeading";
import { PopularProductsGrid } from "@/components/home/PopularProductsGrid";
import { ProductCard } from "@/components/product-card/ProductCard";
import { getFlagshipProducts } from "@/lib/catalog";

/** Отдельная премиальная подача приоритетных товаров — админ помечает товар
 * флагманским (`isFlagship`), без этого секция на главной просто не рендерится. */
export async function FlagshipProducts() {
  const products = await getFlagshipProducts(2);
  if (products.length === 0) return null;

  return (
    <div>
      <SectionHeading
        eyebrow="Флагманы"
        title="Флагманские товары"
        description="Топовые модели сезона — то, с чего стоит начать выбор"
      />
      <div className="mt-8">
        <PopularProductsGrid>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </PopularProductsGrid>
      </div>
    </div>
  );
}
