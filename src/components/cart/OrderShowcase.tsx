import { getFlagshipProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card/ProductCard";

/** Простая статичная витрина флагманских товаров над формой заказа — без
 * видеофона и бесконечных float-анимаций (см. план уровня 5, задача 42). */
export async function OrderShowcase() {
  const products = await getFlagshipProducts(3);
  if (products.length === 0) return null;

  return (
    <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
