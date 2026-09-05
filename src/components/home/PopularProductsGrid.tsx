"use client";

import { Children } from "react";
import { useStaggerReveal } from "@/components/ui/useStaggerReveal";

export function PopularProductsGrid({ children }: { children: React.ReactNode }) {
  const count = Children.count(children);
  const ref = useStaggerReveal<HTMLDivElement>({ count });

  return (
    <div ref={ref} className="mx-auto grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
      {children}
    </div>
  );
}
