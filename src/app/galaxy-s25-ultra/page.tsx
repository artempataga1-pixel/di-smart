import type { Metadata } from "next";
import { GalaxyHero } from "./galaxy-hero";
import { getProductDetailBySlug } from "@/lib/catalog";
import { SITE } from "@/constants/content/site";

export const dynamic = "force-dynamic";

const PRODUCT_SLUG = "galaxy-s25-ultra";

export const metadata: Metadata = {
  title: `Samsung Galaxy S25 Ultra — ${SITE.name}`,
  description:
    "Galaxy S25 Ultra: титановый корпус, встроенный S Pen, камера 200 Мп и Galaxy AI. Экран 6.9\" 120 Гц, защита IP68.",
  openGraph: {
    title: `Samsung Galaxy S25 Ultra — ${SITE.name}`,
    description: "Титановый корпус, S Pen, камера 200 Мп и Galaxy AI.",
    url: "/galaxy-s25-ultra",
  },
};

export default async function GalaxyS25UltraPage() {
  const product = await getProductDetailBySlug(PRODUCT_SLUG);
  return <GalaxyHero product={product} />;
}
