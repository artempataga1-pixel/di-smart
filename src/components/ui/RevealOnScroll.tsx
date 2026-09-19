"use client";

import { useEffect, useRef } from "react";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  /** Стартовое размытие в px; 0 — без blur вообще. */
  blur?: number;
  ease?: string;
}

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  y = 40,
  duration = 0.8,
  blur = 8,
  ease = "power3.out",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const withBlur = blur > 0 && matchMedia("(min-width: 1024px)").matches;
    element.style.opacity = "0";
    element.style.transform = `translate3d(0, ${y}px, 0)`;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const animation = element.animate(
        [
          { opacity: 0, transform: `translate3d(0, ${y}px, 0)`, filter: withBlur ? `blur(${blur}px)` : "none" },
          { opacity: 1, transform: "translate3d(0, 0, 0)", filter: "none" },
        ],
        { duration: duration * 1000, delay: delay * 1000, easing: ease === "power3.out" ? "cubic-bezier(.22,1,.36,1)" : ease, fill: "forwards" },
      );
      animation.finished.finally(() => {
        element.style.removeProperty("opacity");
        element.style.removeProperty("transform");
      });
    }, { rootMargin: "0px 0px -15%" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay, y, duration, blur, ease]);

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  );
}
