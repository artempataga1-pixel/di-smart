import type { Metadata } from "next";
import { XiaomiBookProPage } from "./xiaomi-book-pro-page";

export const metadata: Metadata = {
  title: "Xiaomi Book Pro 14 — лёгкость профессионального уровня",
  description: "Xiaomi Book Pro 14: корпус 1,08 кг, 14,6-дюймовый OLED-экран 3.1K 120 Гц и процессор до Intel Core Ultra X7.",
  openGraph: {
    title: "Xiaomi Book Pro 14",
    description: "Легче, чем кажется. Сильнее, чем ждёшь.",
    images: ["/media/xiaomi-book-pro-14/hero-poster.jpg"],
  },
};

export default function Page() {
  return <XiaomiBookProPage />;
}
