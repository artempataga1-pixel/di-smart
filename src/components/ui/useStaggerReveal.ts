import { useRef, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

interface UseStaggerRevealOptions {
  /** Количество элементов, от которого зависит пересборка анимации. */
  count: number;
  y?: number;
  stagger?: number;
  duration?: number;
  ease?: string;
}

/** Построчный reveal для гридов (карточки товаров/категорий) — в отличие
 * от RevealOnScroll оборачивает не один блок, а стаггерит детей контейнера. */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>({
  count,
  y = 24,
  stagger = 0.06,
  duration = 0.7,
  ease = "power3.out",
}: UseStaggerRevealOptions): RefObject<T | null> {
  const containerRef = useRef<T>(null);

  useGSAP(
    () => {
      if (!containerRef.current || count === 0) return;
      const items = containerRef.current.querySelectorAll("[data-stagger-item]");
      if (items.length === 0) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(items, { opacity: 0, y });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: containerRef, dependencies: [count, y, stagger, duration, ease] }
  );

  return containerRef;
}
