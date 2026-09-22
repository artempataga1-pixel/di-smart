import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductDetailBySlug, getRelatedProducts } from "@/lib/catalog";
import { XiaomiBookProPage } from "./xiaomi-book-pro-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Xiaomi Book Pro 14 — лёгкость профессионального уровня",
  description: "Xiaomi Book Pro 14: корпус 1,08 кг, 14,6-дюймовый OLED-экран 3.1K 120 Гц и процессор до Intel Core Ultra X7.",
  openGraph: {
    title: "Xiaomi Book Pro 14",
    description: "Легче, чем кажется. Сильнее, чем ждёшь.",
    images: ["/media/xiaomi-book-pro-14/hero-poster.jpg"],
  },
};

export default async function Page() {
  const product = await getProductDetailBySlug("xiaomi-book-pro-14");
  if (!product) notFound();
  const related = await getRelatedProducts(product.categorySlug, product.id);
  return <XiaomiBookProPage product={product} related={related} />;
}
