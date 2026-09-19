import type { Metadata } from "next";
import { GalaxyTabUltraPage } from "./galaxy-tab-ultra-page";

export const metadata: Metadata = {
  title: "Samsung Galaxy Tab S11 Ultra — пространство для большого",
  description: "Galaxy Tab S11 Ultra с экраном 14,6 дюйма Dynamic AMOLED 2X, новым S Pen, Samsung DeX и аккумулятором 11 600 мА·ч.",
  openGraph: {
    title: "Samsung Galaxy Tab S11 Ultra",
    description: "14,6 дюйма для идей, работы и развлечений.",
    images: ["/media/galaxy-tab-s11-ultra/hero-poster.jpg"],
  },
};

export default function Page() {
  return <GalaxyTabUltraPage />;
}
