"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/** GSAP добавляет высоту закреплённым флагманам уже после первого нативного
 * перехода по hash. Повторная прокрутка после refresh сохраняет точную
 * посадку на блоке категорий при возврате со страницы категории. */
export function HomeCategoryAnchor() {
  useEffect(() => {
    if (window.location.hash !== "#categories") return;

    const scrollToCategories = () => {
      document.getElementById("categories")?.scrollIntoView({ block: "start" });
    };

    ScrollTrigger.refresh();
    const frame = requestAnimationFrame(() => requestAnimationFrame(scrollToCategories));
    const finalCheck = window.setTimeout(scrollToCategories, 120);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(finalCheck);
    };
  }, []);

  return null;
}
