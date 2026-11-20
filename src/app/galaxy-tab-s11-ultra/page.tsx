import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCrossSellProducts, getProductDetailBySlug } from "@/lib/catalog";
import { GalaxyTabUltraPage } from "./galaxy-tab-ultra-page";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Samsung Galaxy Tab S11 Ultra — пространство для большого",
  description: "Galaxy Tab S11 Ultra с экраном 14,6 дюйма Dynamic AMOLED 2X, новым S Pen, Samsung DeX и аккумулятором 11 600 мА·ч.",
  alternates: { canonical: "/galaxy-tab-s11-ultra" },
  openGraph: {
    title: "Samsung Galaxy Tab S11 Ultra",
    description: "14,6 дюйма для идей, работы и развлечений.",
    images: ["/media/galaxy-tab-s11-ultra/hero-poster.jpg"],
  },
};

export default async function Page() {
  const product = await getProductDetailBySlug("galaxy-tab-s11-ultra");
  if (!product) notFound();
  const crossSell = await getCrossSellProducts(product);
  return <GalaxyTabUltraPage product={product} crossSell={crossSell} />;
}
