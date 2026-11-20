import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCrossSellProducts, getProductDetailBySlug } from "@/lib/catalog";
import { AppleWatchUltraPage } from "./apple-watch-ultra-page";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Apple Watch Ultra 4 — Di-SMART",
  description: "Apple Watch Ultra 4 в корпусе из титана Grade 5: до 50 часов работы, спутниковая связь, точный GPS и погружения до 40 метров.",
  alternates: { canonical: "/apple-watch-ultra-4" },
  openGraph: {
    title: "Apple Watch Ultra 4 — Di-SMART",
    description: "Часы, за которыми не нужно успевать.",
    images: [{ url: "/media/apple-watch-ultra-4/hero-poster.webp", width: 1470, height: 630 }],
  },
};

export default async function Page() {
  const product = await getProductDetailBySlug("apple-watch-ultra-4");
  if (!product) notFound();
  const crossSell = await getCrossSellProducts(product);
  return <AppleWatchUltraPage product={product} crossSell={crossSell} />;
}
