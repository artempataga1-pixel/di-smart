import type { Metadata } from "next";
import { connection } from "next/server";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { OrderShowcase } from "@/components/cart/OrderShowcase";
import { SITE } from "@/constants/content/site";

export const metadata: Metadata = {
  title: `Корзина — ${SITE.name}`,
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  await connection();
  const ordersEnabled = process.env.NODE_ENV !== "production" || process.env.ORDER_INTAKE_ENABLED === "true";
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <CheckoutForm ordersEnabled={ordersEnabled} />
      <OrderShowcase />
    </div>
  );
}
