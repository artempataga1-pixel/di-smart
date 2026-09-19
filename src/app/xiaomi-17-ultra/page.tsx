import type { Metadata } from "next";
import { XiaomiUltraPage } from "./xiaomi-ultra-page";

export const metadata: Metadata = {
  title: "Xiaomi 17 Ultra — флагманская камера Leica",
  description: "Xiaomi 17 Ultra: 1-дюймовая камера Leica, оптический зум 75–100 мм, экран 6,9 дюйма и аккумулятор 6000 мА·ч.",
  openGraph: {
    title: "Xiaomi 17 Ultra",
    description: "Свет. Фокус. История. Флагман Xiaomi с камерой Leica.",
    images: ["/media/xiaomi-17-ultra/hero-poster.webp"],
  },
};

export default function Page() {
  return <XiaomiUltraPage />;
}
