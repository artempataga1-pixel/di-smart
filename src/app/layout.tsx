import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SITE } from "@/constants/content/site";
import "./globals.css";

const obrazec = localFont({
  src: "./fonts/Obrazec 2.0.otf",
  variable: "--font-obrazec-var",
  display: "swap",
});

const comfortaa = localFont({
  src: [
    { path: "./fonts/Comfortaa-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Comfortaa-Regular.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-comfortaa-var",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${obrazec.variable} ${comfortaa.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[var(--color-bg)] text-[var(--color-text)]">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
