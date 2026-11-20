import type { PrismaClient } from "../src/generated/prisma/client";
import manifest from "./samsung-color-images.json";

/** Only image links are changed; colours, SKU, prices and availability stay intact. */
export async function syncSamsungColorImages(db: PrismaClient, selectedSlugs?: string[]) {
  const slugs = Object.keys(manifest).filter(slug => !selectedSlugs || selectedSlugs.includes(slug));
  return db.$transaction(async tx => {
    const products = await tx.product.findMany({ where: { slug: { in: slugs } },
      include: { brand: true, colorValues: { include: { attributeValue: true } }, images: true } });
    if (products.length !== slugs.length) throw new Error("Samsung image manifest contains missing products");
    let linked = 0;
    for (const product of products) {
      if (product.brand?.slug !== "samsung" || !product.isActive) throw new Error(`Expected active Samsung: ${product.slug}`);
      const colors: Record<string, string> = manifest[product.slug as keyof typeof manifest];
      const expected = Object.keys(colors).sort();
      const actual = product.colorValues.map(c => c.attributeValue.value).sort();
      if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error(`Colour mismatch: ${product.slug}`);
      const alreadyMain = product.images.some(image => image.isMain);
      const originalIndex = Object.values(colors).findIndex(url => url === `/media/catalog/products/${product.slug}.webp`);
      const mainIndex = originalIndex < 0 ? 0 : originalIndex;
      for (const [index, [name, url]] of Object.entries(colors).entries()) {
        const color = product.colorValues.find(c => c.attributeValue.value === name)!;
        const existing = product.images.filter(image => image.colorValueId === color.id);
        if (existing.length > 1) throw new Error(`Ambiguous colour images: ${product.slug}/${name}`);
        const data = { url, alt: `${product.name}, цвет ${name}`, sortOrder: index };
        const unlinked = product.images.find(image => !image.colorValueId && image.url === url);
        if (existing[0] || unlinked) await tx.productImage.update({ where: { id: (existing[0] ?? unlinked)!.id }, data: { ...data, colorValueId: color.id } });
        else await tx.productImage.create({ data: { ...data, productId: product.id, colorValueId: color.id,
          isMain: !alreadyMain && index === mainIndex } });
        linked++;
      }
    }
    return { products: products.length, colorImages: linked };
  }, { timeout: 120_000, maxWait: 15_000 });
}
