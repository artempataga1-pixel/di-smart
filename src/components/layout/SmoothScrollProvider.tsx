"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useRef, useEffect } from "react";
import { useIsTouch } from "@/lib/useIsTouch";
import type { LenisRef } from "lenis/react";

export const lenisInstanceRef: { current: LenisRef["lenis"] | null } = { current: null };

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  // На таче Lenis не монтируется вовсе — нативный скролл вместо него
  const isTouch = useIsTouch();

  useEffect(() => {
    if (isTouch) return;
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, [isTouch]);

  // Пересчёт позиций ScrollTrigger после того, как раскладка устаканится
  // (шрифты/картинки могут сдвинуть высоты секций после первого рендера).
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    const timers = [requestAnimationFrame(refresh), window.setTimeout(refresh, 600)];
    return () => {
      window.removeEventListener("load", refresh);
      cancelAnimationFrame(timers[0]);
      window.clearTimeout(timers[1]);
    };
  }, []);

  useEffect(() => {
    if (isTouch) return;
    let raf = 0;
    let attached: LenisRef["lenis"] | null = null;
    const onScroll = () => ScrollTrigger.update();
    const attach = () => {
      const lenis = lenisRef.current?.lenis;
      if (lenis) {
        attached = lenis;
        lenisInstanceRef.current = lenis;
        lenis.on("scroll", onScroll);
      } else {
        raf = requestAnimationFrame(attach);
      }
    };
    attach();
    return () => {
      cancelAnimationFrame(raf);
      attached?.off("scroll", onScroll);
      lenisInstanceRef.current = null;
    };
  }, [isTouch]);

  if (isTouch) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, anchors: true }}>
      {children}
    </ReactLenis>
  );
}
