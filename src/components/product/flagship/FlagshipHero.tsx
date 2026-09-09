import type { ProductDetail } from "@/lib/catalog";

export function FlagshipHero({ product }: { product: ProductDetail }) {
  if (!product.mainImageUrl) return null;

  return (
    <div className="relative w-full">
      {/* eslint-disable-next-line @next/next/no-img-element -- полноширинный баннер фиксированных пропорций, next/image здесь не даёт выигрыша */}
      <img src={product.mainImageUrl} alt={product.name} className="block h-auto w-full" />
    </div>
  );
}
