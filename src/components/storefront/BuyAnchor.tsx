"use client";

import { scrollToId } from "@/lib/scroll";

/** Кнопка-якорь на страницах флагманов, возвращающая к блоку покупки (`#buy`). */
export function BuyAnchor({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <a
      className={className}
      href="#buy"
      onClick={(event) => {
        event.preventDefault();
        scrollToId("buy");
      }}
    >
      {children}
    </a>
  );
}
