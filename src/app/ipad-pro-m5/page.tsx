import type { Metadata } from "next";
import { access } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { getProductDetailBySlug, getRelatedProducts } from "@/lib/catalog";
import { IpadProPage } from "./ipad-pro-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "iPad Pro 13″ M5 — Di-SMART",
  description: "iPad Pro 13″ с чипом M5, дисплеем Ultra Retina XDR и корпусом толщиной 5,1 мм. Сравните официальные покрытия Space Black и Silver.",
  alternates: { canonical: "/ipad-pro-m5" },
  openGraph: {
    title: "iPad Pro 13″ M5 — Di-SMART",
    description: "Большие идеи. Одно касание.",
    images: [{ url: "/media/ipad-pro-m5/hero-poster.webp", width: 1672, height: 939 }],
  },
};

export default async function Page() {
  let hasHeroVideo = false;
  try {
    await access(path.join(process.cwd(), "public/media/ipad-pro-m5/hero.mp4"));
    hasHeroVideo = true;
  } catch {
    // The generated poster remains the hero until the final film is supplied.
  }
  const product = await getProductDetailBySlug("ipad-pro-13");
  if (!product) notFound();
  const related = await getRelatedProducts(product.categorySlug, product.id);
  return <IpadProPage hasHeroVideo={hasHeroVideo} product={product} related={related} />;
}
