import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

interface MoonPhaseScrollRefs {
  sectionRef: React.RefObject<HTMLElement | null>;
  terminatorRef: React.RefObject<SVGCircleElement | null>;
  stageRef: React.RefObject<HTMLDivElement | null>;
  haloRef: React.RefObject<HTMLDivElement | null>;
}

/** Пока пользователь скроллит hero, серп луны "раскрывается" (терминатор
 * уезжает в сторону) — прямая метафора названия бренда. При выходе из
 * секции сцена мягко утекает вверх и уменьшается. */
export function useMoonPhaseScroll({
  sectionRef,
  terminatorRef,
  stageRef,
  haloRef,
}: MoonPhaseScrollRefs) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!sectionRef.current || !terminatorRef.current) return;

      // Стартуем на заметном растущем серпе (не пустом "новолунии" — на первом
      // экране до всякого скролла луна уже должна читаться), на скролле
      // серп раскрывается почти до полного диска.
      gsap.set(terminatorRef.current, { attr: { cx: 165 } });

      gsap.to(terminatorRef.current, {
        attr: { cx: 270 },
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=70%",
          scrub: 0.6,
        },
      });

      gsap.to(stageRef.current, {
        scale: 0.94,
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      gsap.to(haloRef.current, {
        opacity: 0.3,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    },
    { scope: sectionRef }
  );
}
