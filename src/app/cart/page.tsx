import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { OrderShowcase } from "@/components/cart/OrderShowcase";
import { SITE } from "@/constants/content/site";

export const metadata: Metadata = { title: `Корзина — ${SITE.name}` };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <OrderShowcase />
      <CheckoutForm />
    </div>
  );
}
