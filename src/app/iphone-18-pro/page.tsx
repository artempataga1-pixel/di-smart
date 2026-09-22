import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductDetailBySlug, getRelatedProducts } from "@/lib/catalog";
import { IPhoneHero } from "./iphone-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "iPhone 18 Pro — Di-SMART",
  description: "iPhone 18 Pro и Pro Max: дизайн, камеры и возможности. Знакомство с Pro в Di-SMART.",
  openGraph: {
    title: "iPhone 18 Pro — Di-SMART",
    description: "Искусство быть Pro.",
    images: [{ url: "/media/iphone-18-pro/intro-end.jpg", width: 1280, height: 720 }],
  },
};

export default async function IPhone18ProPage() {
  const product = await getProductDetailBySlug("iphone-18-pro");
  if (!product) notFound();
  const related = await getRelatedProducts(product.categorySlug, product.id);
  return <IPhoneHero product={product} related={related} />;
}
