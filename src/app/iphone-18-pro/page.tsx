import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCrossSellProducts, getProductDetailBySlug } from "@/lib/catalog";
import { IPhoneHero } from "./iphone-hero";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "iPhone 18 Pro — Di-SMART",
  description: "iPhone 18 Pro и Pro Max: дизайн, камеры и возможности. Знакомство с Pro в Di-SMART.",
  alternates: { canonical: "/iphone-18-pro" },
  openGraph: {
    title: "iPhone 18 Pro — Di-SMART",
    description: "Искусство быть Pro.",
    images: [{ url: "/media/iphone-18-pro/intro-end.jpg", width: 1280, height: 720 }],
  },
};

export default async function IPhone18ProPage({ searchParams }: { searchParams: Promise<{ model?: string }> }) {
  const { model } = await searchParams;
  const [pro, proMax] = await Promise.all([
    getProductDetailBySlug("iphone-18-pro"),
    getProductDetailBySlug("iphone-18-pro-max"),
  ]);
  if (!pro || !proMax) notFound();
  const crossSell = await getCrossSellProducts(pro);
  return <IPhoneHero pro={pro} proMax={proMax} crossSell={crossSell} initialModel={model === "pro-max" ? "pro-max" : "pro"} />;
}
