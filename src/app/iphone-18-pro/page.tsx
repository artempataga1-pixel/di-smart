import type { Metadata } from "next";
import { IPhoneHero } from "./iphone-hero";

export const metadata: Metadata = {
  title: "iPhone 18 Pro — Di-SMART",
  description: "iPhone 18 Pro и Pro Max: дизайн, камеры и возможности. Знакомство с Pro в Di-SMART.",
  openGraph: {
    title: "iPhone 18 Pro — Di-SMART",
    description: "Искусство быть Pro.",
    images: [{ url: "/media/iphone-18-pro/intro-end.jpg", width: 1280, height: 720 }],
  },
};

export default function IPhone18ProPage() {
  return <IPhoneHero />;
}
