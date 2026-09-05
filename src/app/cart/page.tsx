import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { OrderShowcase } from "@/components/cart/OrderShowcase";
import { OrderVideoBackground } from "@/components/cart/OrderVideoBackground";

export const metadata: Metadata = { title: "Корзина — ЛУНА" };

export default function CartPage() {
  return (
    <div className="relative isolate">
      <OrderVideoBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <OrderShowcase />
        <CheckoutForm />
      </div>
    </div>
  );
}
