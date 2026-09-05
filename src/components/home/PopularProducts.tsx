import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product-card/ProductCard";
import { PhotoProductVisual } from "@/components/ui/visuals/PhotoProductVisual";
import { getProductBySlug } from "@/constants/products";
import { PopularProductsGrid } from "@/components/home/PopularProductsGrid";

export function PopularProducts() {
  const headphones = getProductBySlug("airpods-pro-3");
  const watch = getProductBySlug("apple-watch-series-11");

  return (
    <div>
      <SectionHeading
        eyebrow="Подборка"
        title="Популярные товары"
        description="То, что чаще всего выбирают наши покупатели"
        href="/catalog"
      />
      <div className="mt-8">
        <PopularProductsGrid>
          {headphones && (
            <ProductCard
              product={headphones}
              visual={
                <PhotoProductVisual
                  src="https://iphoriya.ru/wp-content/uploads/airpods-pro-3.webp"
                  alt={headphones.name}
                  category={headphones.category}
                />
              }
            />
          )}
          {watch && (
            <ProductCard
              product={watch}
              visual={
                <PhotoProductVisual
                  src="https://iphoriya.ru/wp-content/uploads/apple-watch-series-11-42mm-silver-1.webp"
                  alt={watch.name}
                  category={watch.category}
                />
              }
            />
          )}
        </PopularProductsGrid>
      </div>
    </div>
  );
}
