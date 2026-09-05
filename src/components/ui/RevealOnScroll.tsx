"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

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

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set(ref.current, { opacity: 1, y: 0 });
        return;
      }

      // blur() — дорогой для мобильного GPU compositing, на узких экранах
      // оставляем только fade/translate.
      const withBlur = blur > 0 && !window.matchMedia("(max-width: 1023px)").matches;

      const willChange = `opacity, transform${withBlur ? ", filter" : ""}`;
      gsap.set(ref.current, {
        opacity: 0,
        y,
        willChange,
        ...(withBlur && { filter: `blur(${blur}px)` }),
      });
      gsap.to(ref.current, {
        opacity: 1,
        y: 0,
        ...(withBlur && { filter: "blur(0px)" }),
        duration,
        delay,
        ease,
        onComplete: () => gsap.set(ref.current, { clearProps: "willChange" }),
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: ref, dependencies: [delay, y, duration, blur, ease] }
  );

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  );
}
