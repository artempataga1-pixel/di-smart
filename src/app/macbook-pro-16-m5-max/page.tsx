import type { Metadata } from "next";
import { access } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { getProductDetailBySlug, getRelatedProducts } from "@/lib/catalog";
import { MacbookProPage } from "./macbook-pro-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MacBook Pro 16″ M5 Max — Di-SMART",
  description: "MacBook Pro 16″ с M5 Max, дисплеем Liquid Retina XDR, памятью до 128 ГБ и накопителем до 8 ТБ. Сравните Space Black и Silver.",
  alternates: { canonical: "/macbook-pro-16-m5-max" },
  openGraph: {
    title: "MacBook Pro 16″ M5 Max — Di-SMART",
    description: "Большие проекты помещаются целиком.",
    images: [{ url: "/media/macbook-pro-m5-max/hero-poster.webp", width: 1672, height: 941 }],
  },
};

export default async function Page() {
  let hasHeroVideo = false;
  try {
    await access(path.join(process.cwd(), "public/media/macbook-pro-m5-max/hero.mp4"));
    hasHeroVideo = true;
  } catch {
    // Poster stays in place until the final hero film is supplied.
  }

  const product = await getProductDetailBySlug("macbook-pro-16-m5-max");
  if (!product) notFound();
  const related = await getRelatedProducts(product.categorySlug, product.id);

  return <MacbookProPage product={product} related={related} hasHeroVideo={hasHeroVideo} />;
}
