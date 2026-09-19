import { useEffect, useRef, type RefObject } from "react";

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container || count === 0) return;
    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-stagger-item]"));
    if (!items.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    items.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = `translate3d(0, ${y}px, 0)`;
    });
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      items.forEach((item, index) => {
        item.animate(
          [
            { opacity: 0, transform: `translate3d(0, ${y}px, 0)` },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ],
          { duration: duration * 1000, delay: index * stagger * 1000, easing: ease === "power3.out" ? "cubic-bezier(.22,1,.36,1)" : ease, fill: "forwards" },
        ).finished.finally(() => {
          item.style.removeProperty("opacity");
          item.style.removeProperty("transform");
        });
      });
    }, { rootMargin: "0px 0px -15%" });
    observer.observe(container);
    return () => observer.disconnect();
  }, [count, y, stagger, duration, ease]);

  return containerRef;
}
