"use client";

import { scrollToId } from "@/lib/scroll";

/** Кнопка-якорь на страницах флагманов, возвращающая к блоку покупки (`#buy`). */
export function BuyAnchor({
  className,
  children,
  hideInMobileHero = false,
}: {
  className: string;
  children: React.ReactNode;
  hideInMobileHero?: boolean;
}) {
  return (
    <a
      className={className}
      data-mobile-hero-cta={hideInMobileHero ? "" : undefined}
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
