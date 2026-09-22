import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductDetailBySlug, getRelatedProducts } from "@/lib/catalog";
import { AirpodsProPage } from "./airpods-pro-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AirPods Pro 3 — Di-SMART",
  description: "AirPods Pro 3 с улучшенным шумоподавлением, датчиком пульса, пятью размерами амбушюр и защитой IP57.",
  alternates: { canonical: "/airpods-pro-3" },
  openGraph: {
    title: "AirPods Pro 3 — Di-SMART",
    description: "Уберите лишнее. Оставьте музыку.",
    images: [{ url: "/media/airpods-pro-3/hero-poster.webp", width: 1470, height: 630 }],
  },
};

export default async function Page() {
  const product = await getProductDetailBySlug("airpods-pro-3");
  if (!product) notFound();
  const related = await getRelatedProducts(product.categorySlug, product.id);
  return <AirpodsProPage product={product} related={related} />;
}
